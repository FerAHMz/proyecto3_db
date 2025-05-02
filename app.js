document.addEventListener('DOMContentLoaded', function () {
    const hoy = new Date().toISOString().split('T')[0];
    const inputsFecha = document.querySelectorAll('input[type="date"]');
    inputsFecha.forEach(input => input.value = hoy);

    document.getElementById('btn-reservas').addEventListener('click', generarReporteReservas);
    document.getElementById('btn-ingresos').addEventListener('click', generarReporteIngresos);
    document.getElementById('btn-clientes').addEventListener('click', generarReporteClientes);
    document.getElementById('btn-disponibilidad').addEventListener('click', generarReporteDisponibilidad);
    document.getElementById('btn-cancelaciones').addEventListener('click', generarReporteCancelaciones);

    document.querySelectorAll('.chart-container').forEach(container => {
        container.style.height = '400px';
        container.style.margin = '20px 0';
    });

    cargarCanchas();
    cargarDeportes();
    cargarClientes();
});

let reservasChart = null;
let ingresosChart = null;
let clientesChart = null;
let disponibilidadChart = null;
let cancelacionesChart = null;

// ---------------------- CARGA DINÁMICA ----------------------

async function cargarCanchas() {
    try {
        const response = await fetch('http://localhost:3000/api/canchas');
        const canchas = await response.json();

        if (!Array.isArray(canchas)) throw new Error('Respuesta inválida de canchas');

        const selectIds = ['reserva-cancha', 'ingreso-cancha', 'cancelacion-cancha', 'disp-cancha'];
        selectIds.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;
            canchas.forEach(c => {
                const option = document.createElement('option');
                option.value = c.id;
                option.text = c.nombre;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error al cargar canchas:', error);
    }
}


async function cargarDeportes() {
    try {
        const response = await fetch('http://localhost:3000/api/deportes');
        const deportes = await response.json();

        if (!Array.isArray(deportes)) throw new Error('Respuesta inválida de deportes');

        const selectIds = ['ingreso-deporte', 'disp-deporte'];
        selectIds.forEach(id => {
            const select = document.getElementById(id);
            deportes.forEach(d => {
                const option = document.createElement('option');
                option.value = d.id;
                option.text = d.nombre;
                select.appendChild(option);
            });
        });
    } catch (error) {
        console.error('Error al cargar deportes:', error);
    }
}

async function cargarClientes() {
    try {
        const response = await fetch('http://localhost:3000/api/clientes');
        const clientes = await response.json();

        if (!Array.isArray(clientes)) throw new Error('Respuesta inválida de clientes');

        const select = document.getElementById('cancelacion-cliente');
        clientes.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.text = `${c.nombre} ${c.apellido}`;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar clientes:', error);
    }
}

// ---------------------- REPORTE DE RESERVAS ----------------------

async function generarReporteReservas() {
    const params = {
        fecha_inicio: document.getElementById('reserva-fecha-inicio').value,
        fecha_fin: document.getElementById('reserva-fecha-fin').value,
        id_cancha: document.getElementById('reserva-cancha').value || null,
        estado: document.getElementById('reserva-estado').value || null,
        monto_min: document.getElementById('reserva-monto-min').value || null,
        monto_max: document.getElementById('reserva-monto-max').value || null
    };

    try {
        const response = await fetch('http://localhost:3000/api/reportes/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const data = await response.json();
        actualizarTablaReservas(data);
        actualizarGraficaReservas(data);
    } catch (error) {
        console.error('Error al generar reporte de reservas:', error);
    }
}

function actualizarTablaReservas(data) {
    const tbody = document.querySelector('#tabla-reservas tbody');
    tbody.innerHTML = '';

    data.forEach(r => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${r.id}</td>
            <td>${r.cliente}</td>
            <td>${r.cancha}</td>
            <td>${r.fecha}</td>
            <td>${r.hora_inicio}</td>
            <td>${r.hora_fin}</td>
            <td>${r.estado}</td>
            <td>$${r.monto}</td>
        `;
        tbody.appendChild(fila);
    });
}

function actualizarGraficaReservas(data) {
    const fechas = {};
    data.forEach(r => {
        const fecha = r.fecha;
        fechas[fecha] = (fechas[fecha] || 0) + 1;
    });

    const labels = Object.keys(fechas);
    const valores = Object.values(fechas);

    if (reservasChart) reservasChart.destroy();

    const ctx = document.getElementById('grafica-reservas').getContext('2d');
    reservasChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Reservas por fecha',
                data: valores,
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Reservas por Fecha'
                }
            }
        }
    });
}

// ---------------------- REPORTE DE INGRESOS ----------------------

async function generarReporteIngresos() {
    const params = {
        fecha_inicio: document.getElementById('ingreso-fecha-inicio').value,
        fecha_fin: document.getElementById('ingreso-fecha-fin').value,
        id_cancha: document.getElementById('ingreso-cancha').value || null,
        id_deporte: document.getElementById('ingreso-deporte').value || null,
        metodo_pago: document.getElementById('ingreso-metodo').value || null
    };

    try {
        const response = await fetch('http://localhost:3000/api/reportes/ingresos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('Respuesta no válida del servidor:', data);
            alert('Error al generar reporte de ingresos. Consulta la consola.');
            return;
        }

        actualizarTablaIngresos(data);
        actualizarGraficaIngresos(data);
    } catch (error) {
        console.error('Error al generar reporte de ingresos:', error);
        alert('Error al generar reporte de ingresos. Consulta la consola.');
    }
}

function actualizarTablaIngresos(data) {
    const tbody = document.querySelector('#tabla-ingresos tbody');
    tbody.innerHTML = '';

    data.forEach(r => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${r.cancha}</td>
            <td>${r.deporte}</td>
            <td>${r.total_reservas}</td>
            <td>$${r.ingresos_totales}</td>
        `;
        tbody.appendChild(fila);
    });
}

function actualizarGraficaIngresos(data) {
    const labels = data.map(r => `${r.cancha} - ${r.deporte}`);
    const valores = data.map(r => Number(r.ingresos_totales));

    if (ingresosChart) ingresosChart.destroy();

    const ctx = document.getElementById('grafica-ingresos').getContext('2d');
    ingresosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Ingresos ($)',
                data: valores,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Ingresos por Cancha y Deporte'
                }
            }
        }
    });
}

// ---------------------- REPORTE DE CLIENTES FRECUENTES ----------------------

async function generarReporteClientes() {
    const params = {
      fecha_inicio: document.getElementById('cliente-fecha-inicio')?.value || null,
      fecha_fin: document.getElementById('cliente-fecha-fin')?.value || null,
      min_reservas: parseInt(document.getElementById('cliente-min-reservas')?.value || 0),
      min_gasto: parseFloat(document.getElementById('cliente-min-monto')?.value || 0),
      antiguedad: document.getElementById('cliente-antiguedad')?.value || null
    };
  
    try {
      const response = await fetch('http://localhost:3000/api/reportes/clientes-frecuentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
  
      const data = await response.json();
  
      if (!Array.isArray(data)) {
        console.error('Respuesta inválida del servidor:', data);
        return;
      }
  
      actualizarTablaClientes(data);
      actualizarGraficaClientes(data);
    } catch (error) {
      console.error('Error al generar reporte de clientes frecuentes:', error);
    }
  }

function actualizarTablaClientes(data) {
    const tbody = document.querySelector('#tabla-clientes tbody');
    tbody.innerHTML = '';

    data.forEach(c => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${c.nombre} ${c.apellido}</td>
            <td>${c.email}</td>
            <td>${c.total_reservas}</td>
            <td>$${Number(c.total_gastado).toFixed(2)}</td>
            <td>${c.primera_reserva ? c.primera_reserva.split('T')[0] : 'N/A'}</td>
        `;
        tbody.appendChild(fila);
    });
}

function actualizarGraficaClientes(data) {
    const labels = data.map(c => `${c.nombre} ${c.apellido}`);
    const valores = data.map(c => Number(c.total_reservas));

    if (clientesChart) clientesChart.destroy();

    const ctx = document.getElementById('grafica-clientes').getContext('2d');
    clientesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Reservas por Cliente',
                data: valores,
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                borderColor: 'rgba(255, 159, 64, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Clientes con más reservas'
                }
            }
        }
    });
}

// ---------------------- REPORTE DE DISPONIBILIDAD ----------------------

async function generarReporteDisponibilidad() {
    const params = {
        fecha: document.getElementById('disp-fecha').value,
        id_deporte: document.getElementById('disp-deporte').value || null,
        id_cancha: document.getElementById('disp-cancha').value || null,
        capacidad_min: document.getElementById('disp-capacidad').value || null
    };

    try {
        const response = await fetch('http://localhost:3000/api/reportes/disponibilidad', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('Respuesta inválida del servidor:', data);
            return;
        }

        actualizarTablaDisponibilidad(data);
        actualizarGraficaDisponibilidad(data);
    } catch (error) {
        console.error('Error al generar reporte de disponibilidad:', error);
    }
}

function actualizarTablaDisponibilidad(data) {
    const tbody = document.querySelector('#tabla-disponibilidad tbody');
    tbody.innerHTML = '';

    data.forEach(item => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.cancha_nombre}</td>
            <td>${item.deporte_nombre || 'N/A'}</td>
            <td>${item.hora_inicio} - ${item.hora_fin}</td>
            <td>${item.estado}</td>
            <td>${item.capacidad}</td>
        `;
        tbody.appendChild(fila);
    });
}

function actualizarGraficaDisponibilidad(data) {
    const conteoPorCancha = {};
    data.forEach(item => {
        conteoPorCancha[item.cancha_nombre] = (conteoPorCancha[item.cancha_nombre] || 0) + 1;
    });

    const labels = Object.keys(conteoPorCancha);
    const valores = Object.values(conteoPorCancha);

    if (disponibilidadChart) disponibilidadChart.destroy();

    const ctx = document.getElementById('grafica-disponibilidad').getContext('2d');
    disponibilidadChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Horarios disponibles',
                data: valores,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Disponibilidad de Canchas'
                }
            }
        }
    });
}

// ---------------------- REPORTE DE CANCELACIONES ----------------------

async function generarReporteCancelaciones() {
    const params = {
        fecha_inicio: document.getElementById('cancelacion-fecha-inicio').value,
        fecha_fin: document.getElementById('cancelacion-fecha-fin').value,
        id_cancha: document.getElementById('cancelacion-cancha').value || null,
        id_cliente: document.getElementById('cancelacion-cliente').value || null,
        horas_anticipacion: document.getElementById('cancelacion-anticipacion').value || null
    };

    try {
        const response = await fetch('http://localhost:3000/api/reportes/cancelaciones', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(params)
        });

        const data = await response.json();

        if (!Array.isArray(data)) {
            console.error('Respuesta inválida del servidor:', data);
            return;
        }

        actualizarTablaCancelaciones(data);
        actualizarGraficaCancelaciones(data); 
    } catch (error) {
        console.error('Error al generar reporte de cancelaciones:', error);
    }
}

function actualizarTablaCancelaciones(data) {
    const tbody = document.querySelector('#tabla-cancelaciones tbody');
    tbody.innerHTML = '';

    data.forEach(item => {
        const fila = document.createElement('tr');
        fila.innerHTML = `
            <td>${item.id}</td>
            <td>${item.cliente}</td>
            <td>${item.cancha}</td>
            <td>${item.fecha_reserva?.split('T')[0] || ''}</td>
            <td>${item.fecha_cancelacion?.split('T')[0] || ''}</td>
            <td>$${Number(item.monto_perdido).toFixed(2)}</td>
        `;
        tbody.appendChild(fila);
    });
}

function actualizarGraficaCancelaciones(data) {
    const conteoPorCancha = {};

    data.forEach(item => {
        conteoPorCancha[item.cancha] = (conteoPorCancha[item.cancha] || 0) + 1;
    });

    const labels = Object.keys(conteoPorCancha);
    const valores = Object.values(conteoPorCancha);

    if (cancelacionesChart) cancelacionesChart.destroy();

    const ctx = document.getElementById('grafica-cancelaciones').getContext('2d');
    cancelacionesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Cancelaciones por cancha',
                data: valores,
                backgroundColor: 'rgba(255, 99, 132, 0.6)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Cancelaciones por Cancha'
                }
            }
        }
    });
}

// ---------------------- REPORTES PENDIENTES ----------------------

function exportarPDF(tipo) {
    alert(`Exportar ${tipo} a PDF (simulado)`);
}

function exportarExcel(tipo) {
    alert(`Exportar ${tipo} a Excel (simulado)`);
}
