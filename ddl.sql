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