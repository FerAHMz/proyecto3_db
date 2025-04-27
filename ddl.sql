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