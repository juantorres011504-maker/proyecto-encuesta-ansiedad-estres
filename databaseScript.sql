create database if not exists encuesta_ansiedad;
use encuesta_ansiedad;

-- Tabla de usuarios
create table if not exists usuarios (
	id			int primary key auto_increment,
    nombre		varchar(100),
    correo		varchar(100) unique,
    contrasena	varchar(255)
);

-- Tablas para preguntas y respuestas de estrés
create table if not exists preguntas_estres (
	id			int primary key auto_increment,
    texto 		varchar(255)
);

create table if not exists respuestas_estres (
	id				int primary key auto_increment,
    id_pregunta		int,
    texto			varchar(255),
    valor			int,
    foreign key (id_pregunta) references preguntas_estres(id) on delete cascade
);

-- Tablas para preguntas y respuestas de ansiedad
create table if not exists preguntas_ansiedad (
	id			int primary key auto_increment,
    texto 		varchar(255)
);

create table if not exists respuestas_ansiedad (
	id				int primary key auto_increment,
    id_pregunta		int,
    texto			varchar(255),
    valor			int,
    foreign key (id_pregunta) references preguntas_ansiedad(id) on delete cascade
);

-- Tabla de resultados
create table if not exists resultados (
	id					int primary key auto_increment,
    id_usuario			int,
    puntuacion			int,
    nivel				varchar(50),
    fecha_realizacion	date,
    foreign key (id_usuario) references usuarios(id)
);

-- ==============================
-- Procedimientos almacenados
-- ==============================

delimiter //

-- Registrar usuario
create procedure sp_registrar_usuario (
	in p_nombre 		varchar(100),
    in p_correo			varchar(100),
    in p_contrasena		varchar(255),
    in p_numero_control varchar(8)
)
begin
	insert into usuarios (nombre, correo, contrasena, numero_control)
    values (p_nombre, p_correo, p_contrasena, p_numero_control);
end //

-- iniciar sesión
create procedure sp_iniciar_sesion (
  in p_correo varchar(100)
)
begin
  select id, nombre, contrasena 
  from usuarios 
  where correo = p_correo;
end //

-- Obtener preguntas y respuestas de estrés
create procedure sp_obtener_encuesta_estres()
begin
  select 
    p.id,
    p.texto,
    json_arrayagg(
      json_object('texto', r.texto, 'valor', r.valor)
    ) as respuestas
  from preguntas_estres p
  left join respuestas_estres r on p.id = r.id_pregunta
  group by p.id, p.texto;
end //

-- Obtener preguntas y respuestas de ansiedad
create procedure sp_obtener_encuesta_ansiedad()
begin
  select 
    p.id,
    p.texto,
    json_arrayagg(
      json_object('texto', r.texto, 'valor', r.valor)
    ) as respuestas
  from preguntas_ansiedad p
  left join respuestas_ansiedad r on p.id = r.id_pregunta
  group by p.id, p.texto;
end //

-- Registrar respuestas y calcular resultado
create procedure sp_registrar_respuestas_y_calcular(
    in p_id_usuario int,
    in p_preguntas json,
    in p_tipo_encuesta varchar(50)
)
begin
    declare total_puntuacion int default 0;
    declare i int default 0;
    declare n int;
    declare nivel varchar(50);
    declare fecha_actual date;

    set fecha_actual = curdate();
    set n = json_length(p_preguntas);

    if (select count(*) from resultados where id_usuario = p_id_usuario and tipo_encuesta = p_tipo_encuesta and datediff(fecha_actual, fecha_realizacion) < 14) > 0 then
        signal sqlstate '45000' set message_text = 'Ya completaste esta encuesta en los últimos 14 días';
    else
        while i < n do
            set total_puntuacion = total_puntuacion + json_extract(p_preguntas, concat('$[', i, '].valor'));
            set i = i + 1;
        end while;

        if total_puntuacion <= 4 then
            set nivel = 'Bajo';
        elseif total_puntuacion <= 9 then
            set nivel = 'Medio';
        else
            set nivel = 'Alto';
        end if;

        insert into resultados (id_usuario, tipo_encuesta, puntuacion, nivel, fecha_realizacion)
        values (p_id_usuario, p_tipo_encuesta, total_puntuacion, nivel, fecha_actual);
    end if;
end //

-- Obtener datos de usuario y estadísticas
create procedure sp_obtener_datos_usuario(in userId int)
begin
    select nombre, correo, numero_control from usuarios where id = userId;

    select 
        count(*) as totalEncuestas,
        sum(tipo_encuesta = 'estres') as estresEncuestas,
        sum(tipo_encuesta = 'ansiedad') as ansiedadEncuestas
    from resultados 
    where id_usuario = userId;

    select puntuacion, nivel, fecha_realizacion
    from resultados
    where id_usuario = userId and tipo_encuesta = 'estres'
    order by fecha_realizacion desc
    limit 1;

    select puntuacion, nivel, fecha_realizacion
    from resultados
    where id_usuario = userId and tipo_encuesta = 'ansiedad'
    order by fecha_realizacion desc
    limit 1;
end //

delimiter ;

-- ==============================
-- Comandos de prueba y modificaciones (final)
-- ==============================

-- Consultas de prueba
select * from preguntas_estres;
select * from preguntas_ansiedad;
select * from resultados;
select * from usuarios;
select * from preguntas_ansiedad order by id;
select count(*) from preguntas;

-- Mostrar procedimientos
show procedure status where db = 'encuesta_ansiedad';

-- Llamada de prueba
call sp_borrar_preguntas_respuestas();

-- Eliminar procedimiento si existe
drop procedure if exists sp_borrar_preguntas_respuestas;
drop procedure if exists sp_obtener_datos_usuario;

-- Alteraciones posteriores
alter table usuarios add numero_control varchar(8) not null;
alter table resultados add column tipo_encuesta varchar(50) not null after id_usuario;

-- Borrar datos de tablas
delete from resultados;
delete from usuarios;
