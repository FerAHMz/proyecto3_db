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

-- Trigger para mantener el historial de reservas del cliente
CREATE OR REPLACE FUNCTION actualizar_historial_cliente() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO Clientes_historial (id_cliente, id_reserva, fecha_reserva, monto)
  VALUES (NEW.id_cliente, NEW.id, NEW.fecha_inicio, (SELECT monto FROM Pagos WHERE id_reserva = NEW.id));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_historial_cliente
AFTER INSERT ON Reservas
FOR EACH ROW
EXECUTE FUNCTION actualizar_historial_cliente();