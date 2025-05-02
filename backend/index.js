const express = require('express');
 const cors = require('cors');
 const { Pool } = require('pg');
 
 const app = express();
 app.use(cors());
 app.use(express.json());
 
 const pool = new Pool({
   user: process.env.PGUSER,
   host: process.env.PGHOST,
   database: process.env.PGDATABASE,
   password: process.env.PGPASSWORD,
   port: process.env.PGPORT,
 });
 
 // --------- ENDPOINTS BÁSICOS ---------
 
 app.get('/api/marco', (req, res) => {
   res.send({ message: 'polo' });
 });
 
 app.get('/api/canchas', async (req, res) => {
   try {
     const result = await pool.query('SELECT * FROM Canchas');
     res.json(result.rows);
   } catch (err) {
     console.error('Error al obtener canchas:', err);
     res.status(500).json({ error: 'Error al obtener canchas' });
   }
 });
 
 app.get('/api/deportes', async (req, res) => {
   try {
     const result = await pool.query('SELECT * FROM Deportes');
     res.json(result.rows);
   } catch (err) {
     console.error('Error al obtener deportes:', err);
     res.status(500).json({ error: 'Error al obtener deportes' });
   }
 });
 
 app.get('/api/clientes', async (req, res) => {
   try {
     const result = await pool.query('SELECT id, nombre, apellido FROM Clientes');
     res.json(result.rows);
   } catch (err) {
     console.error('Error al obtener clientes:', err);
     res.status(500).json({ error: 'Error al obtener clientes' });
   }
 });
 
 // --------- REPORTE DE RESERVAS ---------
 
 app.post('/api/reportes/reservas', async (req, res) => {
   const { fecha_inicio, fecha_fin, id_cancha, estado, monto_min, monto_max } = req.body;
 
   try {
     let query = `
       SELECT r.id, c.nombre AS cliente, ca.nombre AS cancha, 
              r.fecha_inicio::date AS fecha, r.fecha_inicio::time AS hora_inicio, 
              r.fecha_fin::time AS hora_fin, r.estado, p.monto
       FROM Reservas r
       JOIN Clientes c ON r.id_cliente = c.id
       JOIN Canchas ca ON r.id_cancha = ca.id
       JOIN Pagos p ON p.id_reserva = r.id
       WHERE r.fecha_inicio BETWEEN $1 AND $2
     `;
 
     const params = [fecha_inicio, fecha_fin];
     let i = 3;
 
     if (id_cancha) {
       query += ` AND ca.id = $${i++}`;
       params.push(id_cancha);
     }
     if (estado) {
       query += ` AND r.estado = $${i++}`;
       params.push(estado);
     }
     if (monto_min) {
       query += ` AND p.monto >= $${i++}`;
       params.push(monto_min);
     }
     if (monto_max) {
       query += ` AND p.monto <= $${i++}`;
       params.push(monto_max);
     }
 
     const result = await pool.query(query, params);
     res.json(result.rows);
   } catch (err) {
     console.error('Error al generar reporte de reservas:', err);
     res.status(500).json({ error: 'Error al generar reporte de reservas' });
   }
 });
 
 // --------- REPORTE DE INGRESOS ---------
 
 app.post('/api/reportes/ingresos', async (req, res) => {
   const { fecha_inicio, fecha_fin, id_cancha, id_deporte, metodo_pago } = req.body;
 
   try {
     const query = `
       SELECT ca.nombre AS cancha, d.nombre AS deporte,
              COUNT(*) AS total_reservas,
              SUM(p.monto)::numeric(10,2) AS ingresos_totales
       FROM Reservas r
       JOIN Canchas ca ON r.id_cancha = ca.id
       JOIN Cancha_deporte cd ON ca.id = cd.id_cancha
       JOIN Deportes d ON cd.id_deporte = d.id
       JOIN Pagos p ON p.id_reserva = r.id
       WHERE r.fecha_inicio::date BETWEEN $1 AND $2
         AND ($3::int IS NULL OR ca.id = $3)
         AND ($4::int IS NULL OR d.id = $4)
         AND ($5::text IS NULL OR p.metodo_pago = $5)
       GROUP BY ca.nombre, d.nombre
       ORDER BY ca.nombre, d.nombre
     `;
 
     const params = [fecha_inicio, fecha_fin, id_cancha || null, id_deporte || null, metodo_pago || null];
 
     const result = await pool.query(query, params);
     res.json(result.rows);
   } catch (err) {
     console.error('Error al generar reporte de ingresos:', err);
     res.status(500).json({ error: 'Error al generar reporte de ingresos' });
   }
 });
 
 // --------- REPORTE DE CLIENTES FRECUENTES ---------
 
 app.post('/api/reportes/clientes-frecuentes', async (req, res) => {
    const { fecha_inicio, fecha_fin, min_reservas, min_gasto } = req.body;
  
    try {
      let query = `
        SELECT c.id, c.nombre, c.apellido, c.email,
               COUNT(r.id) AS total_reservas,
               COALESCE(SUM(p.monto), 0)::numeric(10,2) AS total_gastado,
               MIN(r.fecha_inicio)::date AS primera_reserva
        FROM Reservas r
        JOIN Clientes c ON r.id_cliente = c.id
        LEFT JOIN Pagos p ON p.id_reserva = r.id
        WHERE r.fecha_inicio BETWEEN $1 AND $2
        GROUP BY c.id, c.nombre, c.apellido, c.email
      `;
  
      const params = [fecha_inicio, fecha_fin];
      const havingClauses = [];
      let i = 3;
  
      if (min_reservas) {
        havingClauses.push(`COUNT(r.id) >= $${i}`);
        params.push(min_reservas);
        i++;
      }
  
      if (min_gasto) {
        havingClauses.push(`SUM(p.monto) >= $${i}`);
        params.push(min_gasto);
        i++;
      }
  
      if (havingClauses.length > 0) {
        query += ` HAVING ` + havingClauses.join(' AND ');
      }
  
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error('Error real en clientes frecuentes:', err.stack);
      res.status(500).json({ error: 'Error al generar reporte de clientes frecuentes' });
    }
  });
  
 
 // --------- REPORTE DE DISPONIBILIDAD DE CANCHAS ---------
 
 app.post('/api/reportes/disponibilidad', async (req, res) => {
     const { fecha, id_deporte, id_cancha, capacidad_min } = req.body;
   
     try {
       let query = `
         SELECT ca.nombre AS cancha_nombre, d.nombre AS deporte_nombre,
                h.hora_inicio, h.hora_fin, ca.capacidad, 'Disponible' AS estado
         FROM Horarios h
         JOIN Canchas ca ON h.id_cancha = ca.id
         LEFT JOIN Cancha_deporte cd ON cd.id_cancha = ca.id
         LEFT JOIN Deportes d ON cd.id_deporte = d.id
         WHERE h.fecha = $1
       `;
       const params = [fecha];
       let i = 2;
   
       if (id_deporte) {
         query += ` AND d.id = $${i++}`;
         params.push(id_deporte);
       }
   
       if (id_cancha) {
         query += ` AND ca.id = $${i++}`;
         params.push(id_cancha);
       }
   
       if (capacidad_min) {
         query += ` AND ca.capacidad >= $${i++}`;
         params.push(capacidad_min);
       }
   
       const result = await pool.query(query, params);
       res.json(result.rows);
     } catch (err) {
       console.error('Error al generar reporte de disponibilidad:', err.message);
       res.status(500).json({ error: 'Error al generar reporte de disponibilidad' });
     }
   });
 
 // --------- REPORTE DE CANCELACIONES ---------
 app.post('/api/reportes/cancelaciones', async (req, res) => {
    const { fecha_inicio, fecha_fin, id_cancha, id_cliente, horas_anticipacion } = req.body;
  
    try {
      let query = `
        SELECT r.id, c.nombre AS cliente, ca.nombre AS cancha,
               r.fecha_inicio, can.fecha_cancelacion,
               COALESCE(p.monto, 0)::numeric(10,2) AS monto_perdido
        FROM Cancelaciones can
        JOIN Reservas r ON can.id_reserva = r.id
        JOIN Clientes c ON r.id_cliente = c.id
        JOIN Canchas ca ON r.id_cancha = ca.id
        LEFT JOIN Pagos p ON p.id_reserva = r.id
        WHERE can.fecha_cancelacion BETWEEN $1 AND $2
      `;
  
      const params = [fecha_inicio, fecha_fin];
      let i = 3;
  
      if (id_cancha) {
        query += ` AND ca.id = $${i++}`;
        params.push(id_cancha);
      }
  
      if (id_cliente) {
        query += ` AND c.id = $${i++}`;
        params.push(id_cliente);
      }
  
      if (horas_anticipacion) {
        query += ` AND EXTRACT(EPOCH FROM (r.fecha_inicio - can.fecha_cancelacion))/3600 <= $${i++}`;
        params.push(horas_anticipacion);
      }
  
      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      console.error('Error real en cancelaciones:', err.stack);
      res.status(500).json({ error: 'Error al generar reporte de cancelaciones' });
    }
  });  
 
 // --------- INICIAR SERVIDOR ---------
 
 app.listen(3000, () => {
   console.log('Backend corriendo en http://localhost:3000');
 });