-- Crear la base de datos
CREATE DATABASE SIREDE;

-- Usar la base de datos creada
USE SIREDE;

-- Crear la tabla carrera
CREATE TABLE carreras (
    id_carrera INT PRIMARY KEY AUTO_INCREMENT, -- ID autoincrementable para la carrera
    nombre_programa VARCHAR(255) NOT NULL, -- Nombre del programa académico
    codigo_programa VARCHAR(255) NOT NULL UNIQUE, -- Código SNIES único
    tipo_programa ENUM('Tecnologia', 'Profesional') NOT NULL -- Tipo de programa
);

-- Crear la tabla estudiante con información general
CREATE TABLE estudiantes (
    id_estudiante INT PRIMARY KEY AUTO_INCREMENT, -- ID autoincrementable para el estudiante
    nombre VARCHAR(100) NOT NULL, -- Nombre del estudiante
    apellido VARCHAR(100) NOT NULL, -- Apellido del estudiante
    tipo_documento ENUM('CC', 'TI', 'CE','P'), -- Tipo de documento
    numero_documento VARCHAR(20) NOT NULL UNIQUE, -- Número de documento único (puede cambiar)
    fecha_nacimiento DATE, -- Fecha de nacimiento del estudiante
    sexo ENUM('M','F','O'), -- Sexo del estudiante
    correo_electronico VARCHAR(255) NOT NULL, -- Correo electrónico del estudiante
    celular VARCHAR(20) NOT NULL -- Número de contacto del estudiante
);

-- Crear la tabla intermedia estudiante_carrera
CREATE TABLE estudiantes_carreras (
    id_estudiante INT, -- Clave foránea que referencia a la tabla estudiante
    id_carrera INT, -- Clave foránea que referencia a la tabla carrera
    codigo_matricula INT NOT NULL UNIQUE, -- Código de matrícula del estudiante en esa carrera
    fecha_ingreso DATE NOT NULL, -- Fecha de matrícula en esa carrera
    periodo_inicio VARCHAR(20) NOT NULL, -- Periodo de inicio en esa carrera 
    periodo_reingreso VARCHAR(20), -- Periodo de inicio en esa carrera 
    fecha_graduacion DATE, -- Fecha de graduación, si aplica
    periodo_graduacion VARCHAR(20), -- Periodo de inicio en esa carrera 
    periodo_desercion VARCHAR(20), -- periodo de deserción, si aplica
    estado_academico ENUM('Activo', 'Inactivo', 'Graduado', 'Retenido', 'Desertor') NOT NULL, -- Estado del estudiante en esa carrera
    jornada ENUM('Diurna', 'Nocturna') NOT NULL, -- Jornada en esa carrera
    sede ENUM('Sede Principal', 'Sede Piedecuesta', 'Sede Barrancabermeja', 'Sede Velez', 'Sede San Gil', 'Sede San Jose de Cucuta', 'Principal', 'Piedecuesta', 'Barrancabermeja', 'Velez', 'San Gil', 'San Jose de Cucuta') NOT NULL, -- Sede en esa carrera
    id_carrera_relacionada INT, -- Si viene de una carrera relacionada
    periodo_cambio_relacionado VARCHAR(20), -- Periodo en el que ocurrió el cambio
    observacion_cambio TEXT, -- Campo para dejar constancia del cambio, opcional
    PRIMARY KEY (id_estudiante, id_carrera), -- Clave primaria compuesta
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante),
    FOREIGN KEY (id_carrera) REFERENCES carreras(id_carrera),
    FOREIGN KEY (id_carrera_relacionada) REFERENCES carreras(id_carrera)
);

-- Crear la tabla historico_estado
CREATE TABLE historico_estado (
    id_historial INT PRIMARY KEY AUTO_INCREMENT, -- Identificador único para cada cambio de estado
    id_estudiante INT, -- Clave foránea que referencia a la tabla estudiante
    id_carrera INT, -- Clave foránea que referencia a la tabla carrera
    estado_anterior VARCHAR(255), -- Estado previo del estudiante
    estado_nuevo VARCHAR(255), -- Estado nuevo del estudiante
    fecha_cambio DATE, -- Fecha del cambio de estado
    periodo_cambio VARCHAR(20) NOT NULL, -- Periodo de cambio de estado
    observacion VARCHAR(255), -- Motivo u observación del cambio
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante),
    FOREIGN KEY (id_carrera) REFERENCES carreras(id_carrera)
);

-- Crear la tabla historico_matriculas
CREATE TABLE historico_matriculas (
    id_historial_matricula INT PRIMARY KEY AUTO_INCREMENT, -- Identificador único para cada registro de matrícula
    id_estudiante INT, -- Clave foránea que referencia a la tabla estudiantes
    id_carrera INT, -- Clave foránea que referencia a la tabla carreras
    periodo_matricula VARCHAR(7) NOT NULL, -- Periodo académico en formato 'AAAA-1' o 'AAAA-2'
    promedio_semestral DECIMAL(4, 2), -- Promedio de notas en ese periodo
    promedio_general DECIMAL(4, 2), -- Promedio general del estudiante
    FOREIGN KEY (id_estudiante) REFERENCES estudiantes(id_estudiante),
    FOREIGN KEY (id_carrera) REFERENCES carreras(id_carrera)
);

-- Crear la tabla de relaciones_carreras
CREATE TABLE relaciones_carreras (
    id_relacion INT PRIMARY KEY AUTO_INCREMENT,
    id_carrera1 INT NOT NULL,
    id_carrera2 INT NOT NULL,
    combinacion_ids VARCHAR(50) GENERATED ALWAYS AS (
        CONCAT(LEAST(id_carrera1, id_carrera2), '-', GREATEST(id_carrera1, id_carrera2))
    ) STORED, -- Columna generada y almacenada
    CONSTRAINT fk_carrera1 FOREIGN KEY (id_carrera1) REFERENCES carreras(id_carrera),
    CONSTRAINT fk_carrera2 FOREIGN KEY (id_carrera2) REFERENCES carreras(id_carrera),
    CONSTRAINT unq_combinacion UNIQUE (combinacion_ids) -- Restricción de unicidad
);



-- Índices para mejorar la eficiencia de las consultas en las tablas grandes
CREATE INDEX idx_estudiantes_carrera_estudiante ON estudiantes_carreras (id_estudiante);
CREATE INDEX idx_estudiantes_carrera_carrera ON estudiantes_carreras (id_carrera);
CREATE INDEX idx_historico_matriculas_estudiante ON historico_matriculas (id_estudiante);
