-- Crear la tabla de Usuarios
CREATE TABLE Usuarios (
  id SERIAL PRIMARY KEY NOT NULL,
  rol VARCHAR(20) NOT NULL CHECK (rol IN ('Administrador', 'Cliente'))
);

-- Crear la tabla de Clientes
CREATE TABLE Clientes (
  id SERIAL PRIMARY KEY NOT NULL,
  id_usuario INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  telefono VARCHAR(14) NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id) ON DELETE CASCADE
);

-- Crear la tabla de Administrativos
CREATE TABLE Administrativos (
  id SERIAL PRIMARY KEY NOT NULL,
  id_usuario INT NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  apellido VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  telefono VARCHAR(14) NOT NULL,
  FOREIGN KEY (id_usuario) REFERENCES Usuarios(id) ON DELETE CASCADE
);

-- Crear la tabla de Deportes
CREATE TABLE Deportes (
  id SERIAL PRIMARY KEY NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT
);

-- Crear la tabla de Canchas
CREATE TABLE Canchas (
  id SERIAL PRIMARY KEY NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  ubicacion VARCHAR(255) NOT NULL,
  capacidad INT NOT NULL CHECK (capacidad > 0),
  descripcion TEXT,
  precio_hora DECIMAL(10,2) NOT NULL CHECK (precio_hora >= 0)
);

-- Crear la tabla de Cancha_deporte (relación N:M entre Canchas y Deportes)
CREATE TABLE Cancha_deporte (
  id SERIAL PRIMARY KEY NOT NULL,
  id_deporte INT NOT NULL,
  id_cancha INT NOT NULL,
  FOREIGN KEY (id_deporte) REFERENCES Deportes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_cancha) REFERENCES Canchas(id) ON DELETE CASCADE
);

-- Crear la tabla de Reservas
CREATE TABLE Reservas (
  id SERIAL PRIMARY KEY NOT NULL,
  id_cliente INT NOT NULL,
  id_cancha INT NOT NULL,
  fecha_inicio TIMESTAMP NOT NULL,
  fecha_fin TIMESTAMP NOT NULL,
  estado VARCHAR(20) NOT NULL CHECK (estado IN ('Pendiente', 'Confirmada', 'Cancelada')),
  FOREIGN KEY (id_cliente) REFERENCES Clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_cancha) REFERENCES Canchas(id) ON DELETE CASCADE
);

-- Crear la tabla de Pagos
CREATE TABLE Pagos (
  id SERIAL PRIMARY KEY NOT NULL,
  id_reserva INT NOT NULL,
  monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
  metodo_pago VARCHAR(20) NOT NULL CHECK (metodo_pago IN ('Tarjeta', 'Efectivo', 'Transferencia')),
  fecha_pago DATE NOT NULL,
  FOREIGN KEY (id_reserva) REFERENCES Reservas(id) ON DELETE CASCADE
);

-- Crear la tabla de Horarios
CREATE TABLE Horarios (
  id SERIAL PRIMARY KEY NOT NULL,
  id_cancha INT NOT NULL,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  FOREIGN KEY (id_cancha) REFERENCES Canchas(id) ON DELETE CASCADE
);

-- Crear la tabla de Cancelaciones
CREATE TABLE Cancelaciones (
  id SERIAL PRIMARY KEY NOT NULL,
  id_reserva INT NOT NULL,
  fecha_cancelacion TIMESTAMP NOT NULL,
  motivo TEXT,
  FOREIGN KEY (id_reserva) REFERENCES Reservas(id) ON DELETE CASCADE
);

-- Crear la tabla de Clientes_historial
CREATE TABLE Clientes_historial (
  id SERIAL PRIMARY KEY NOT NULL,
  id_cliente INT NOT NULL,
  id_reserva INT NOT NULL,
  fecha_reserva TIMESTAMP NOT NULL,
  monto DECIMAL(10,2) NOT NULL CHECK (monto >= 0),
  FOREIGN KEY (id_cliente) REFERENCES Clientes(id) ON DELETE CASCADE,
  FOREIGN KEY (id_reserva) REFERENCES Reservas(id) ON DELETE CASCADE
);

-- Crear la tabla de Reportes
CREATE TABLE Reportes (
  id SERIAL PRIMARY KEY NOT NULL,
  id_reserva INT NOT NULL,
  fecha_generacion TIMESTAMP NOT NULL,
  detalles TEXT,
  FOREIGN KEY (id_reserva) REFERENCES Reservas(id) ON DELETE CASCADE
);


-- Triggers

-- Trigger para actualizar el estado de la reserva a 'Confirmada' cuando se realice un pago
CREATE OR REPLACE FUNCTION actualizar_estado_reserva() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE Reservas 
  SET estado = 'Confirmada' 
  WHERE id = NEW.id_reserva;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_estado_reserva
AFTER INSERT ON Pagos
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_reserva();

-- Trigger para calcular el monto del pago basado en el precio por hora de la cancha
CREATE OR REPLACE FUNCTION calcular_monto_pago() 
RETURNS TRIGGER AS $$
BEGIN
  UPDATE Pagos
  SET monto = (SELECT precio_hora * EXTRACT(HOUR FROM (NEW.fecha_fin - NEW.fecha_inicio))
              FROM Canchas 
              WHERE Canchas.id = NEW.id_cancha)
  WHERE id = NEW.id_reserva;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calcular_monto_pago
AFTER INSERT ON Reservas
FOR EACH ROW
EXECUTE FUNCTION calcular_monto_pago();