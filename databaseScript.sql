DROP PROCEDURE IF EXISTS sp_registrar_usuario;
DROP PROCEDURE IF EXISTS sp_iniciar_sesion;
DROP PROCEDURE IF EXISTS sp_obtener_encuesta_estres;
DROP PROCEDURE IF EXISTS sp_obtener_encuesta_ansiedad;
DROP PROCEDURE IF EXISTS sp_registrar_respuestas_y_calcular;
DROP PROCEDURE IF EXISTS sp_obtener_datos_usuario;

DROP TABLE IF EXISTS resultados;
DROP TABLE IF EXISTS respuestas_estres;
DROP TABLE IF EXISTS preguntas_estres;
DROP TABLE IF EXISTS respuestas_ansiedad;
DROP TABLE IF EXISTS preguntas_ansiedad;
DROP TABLE IF EXISTS usuarios;

CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100),
    correo VARCHAR(100) UNIQUE,
    contrasena VARCHAR(255),
    numero_control VARCHAR(8)
);

CREATE TABLE preguntas_estres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    texto VARCHAR(255)
);

CREATE TABLE respuestas_estres (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_pregunta INT,
    texto VARCHAR(255),
    valor INT,
    FOREIGN KEY (id_pregunta) REFERENCES preguntas_estres(id) ON DELETE CASCADE
);

CREATE TABLE preguntas_ansiedad (
    id INT PRIMARY KEY AUTO_INCREMENT,
    texto VARCHAR(255)
);

CREATE TABLE respuestas_ansiedad (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_pregunta INT,
    texto VARCHAR(255),
    valor INT,
    FOREIGN KEY (id_pregunta) REFERENCES preguntas_ansiedad(id) ON DELETE CASCADE
);

CREATE TABLE resultados (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_usuario INT,
    tipo_encuesta VARCHAR(20),
    puntuacion INT,
    nivel VARCHAR(50),
    fecha_realizacion DATE,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id)
);

DELIMITER //

CREATE PROCEDURE sp_registrar_usuario(
    IN p_nombre VARCHAR(100),
    IN p_correo VARCHAR(100),
    IN p_contrasena VARCHAR(255),
    IN p_numero_control VARCHAR(8)
)
BEGIN
    INSERT INTO usuarios (nombre, correo, contrasena, numero_control)
    VALUES (p_nombre, p_correo, p_contrasena, p_numero_control);
END //

CREATE PROCEDURE sp_iniciar_sesion(IN p_correo VARCHAR(100))
BEGIN
    SELECT id, nombre, contrasena, numero_control
    FROM usuarios
    WHERE correo = p_correo;
END //

CREATE PROCEDURE sp_obtener_encuesta_estres()
BEGIN
    SELECT 
        p.id,
        p.texto,
        (
            SELECT JSON_ARRAYAGG(JSON_OBJECT('texto', r.texto, 'valor', r.valor))
            FROM respuestas_estres r
            WHERE r.id_pregunta = p.id
        ) AS respuestas
    FROM preguntas_estres p;
END //

CREATE PROCEDURE sp_obtener_encuesta_ansiedad()
BEGIN
    SELECT 
        p.id,
        p.texto,
        (
            SELECT JSON_ARRAYAGG(JSON_OBJECT('texto', r.texto, 'valor', r.valor))
            FROM respuestas_ansiedad r
            WHERE r.id_pregunta = p.id
        ) AS respuestas
    FROM preguntas_ansiedad p;
END //

DELIMITER ;
