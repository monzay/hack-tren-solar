-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `role` ENUM('CIUDADANO', 'OPERADOR_SALUD', 'OPERADOR_POLICIA', 'ANALISTA', 'ADMIN') NOT NULL,
    `organismo` ENUM('SALUD', 'POLICIA') NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `barrioId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_barrioId_idx`(`barrioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Barrio` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `localidad` VARCHAR(191) NOT NULL DEFAULT 'San Salvador de Jujuy',
    `poblacion` INTEGER NOT NULL,
    `poligono` JSON NOT NULL,
    `centroLat` DECIMAL(9, 6) NOT NULL,
    `centroLng` DECIMAL(9, 6) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Barrio_nombre_key`(`nombre`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoriaConfig` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria` ENUM('HOMICIDIO', 'LESIONES', 'VIOLENCIA_GENERO', 'VIOLENCIA_INTRAFAMILIAR', 'ABUSO_SEXUAL', 'ROBO', 'HURTO', 'HURTO_VEHICULO', 'ESTAFA_ONLINE') NOT NULL,
    `permiteAnonimo` BOOLEAN NOT NULL,
    `requiereContacto` BOOLEAN NOT NULL,
    `derivaSalud` BOOLEAN NOT NULL,
    `derivaPolicia` BOOLEAN NOT NULL,
    `recursosUrgencia` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `CategoriaConfig_categoria_key`(`categoria`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Incidente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria` ENUM('HOMICIDIO', 'LESIONES', 'VIOLENCIA_GENERO', 'VIOLENCIA_INTRAFAMILIAR', 'ABUSO_SEXUAL', 'ROBO', 'HURTO', 'HURTO_VEHICULO', 'ESTAFA_ONLINE') NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `franja` ENUM('MADRUGADA', 'MANANA', 'TARDE', 'NOCHE') NOT NULL,
    `lat` DECIMAL(9, 6) NOT NULL,
    `lng` DECIMAL(9, 6) NOT NULL,
    `barrioId` INTEGER NOT NULL,
    `fuente` VARCHAR(191) NOT NULL DEFAULT 'SNIC',
    `sintetico` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Incidente_categoria_fecha_idx`(`categoria`, `fecha`),
    INDEX `Incidente_barrioId_idx`(`barrioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria` ENUM('HOMICIDIO', 'LESIONES', 'VIOLENCIA_GENERO', 'VIOLENCIA_INTRAFAMILIAR', 'ABUSO_SEXUAL', 'ROBO', 'HURTO', 'HURTO_VEHICULO', 'ESTAFA_ONLINE') NOT NULL,
    `modo` ENUM('ANONIMO', 'CON_CONTACTO') NOT NULL,
    `rolReportante` ENUM('VICTIMA', 'TESTIGO') NOT NULL,
    `fecha` DATETIME(3) NOT NULL,
    `franja` ENUM('MADRUGADA', 'MANANA', 'TARDE', 'NOCHE') NOT NULL,
    `lat` DECIMAL(9, 6) NOT NULL,
    `lng` DECIMAL(9, 6) NOT NULL,
    `barrioId` INTEGER NOT NULL,
    `relato` TEXT NULL,
    `quiereDenunciar` BOOLEAN NOT NULL DEFAULT false,
    `declaracionAceptada` BOOLEAN NOT NULL DEFAULT false,
    `estado` ENUM('NUEVO', 'CONTACTADO', 'DERIVADO', 'CERRADO') NOT NULL DEFAULT 'NUEVO',
    `sintetico` BOOLEAN NOT NULL DEFAULT false,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Ticket_categoria_fecha_idx`(`categoria`, `fecha`),
    INDEX `Ticket_barrioId_idx`(`barrioId`),
    INDEX `Ticket_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TicketDerivacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `organismo` ENUM('SALUD', 'POLICIA') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `TicketDerivacion_organismo_idx`(`organismo`),
    UNIQUE INDEX `TicketDerivacion_ticketId_organismo_key`(`ticketId`, `organismo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactoTicket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `nombre` TEXT NULL,
    `telefono` TEXT NULL,
    `email` TEXT NULL,
    `horario` TEXT NULL,
    `deletedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ContactoTicket_ticketId_key`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NotaTicket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `autorId` INTEGER NOT NULL,
    `texto` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `NotaTicket_ticketId_idx`(`ticketId`),
    INDEX `NotaTicket_autorId_idx`(`autorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `HistorialEstado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `de` ENUM('NUEVO', 'CONTACTADO', 'DERIVADO', 'CERRADO') NOT NULL,
    `a` ENUM('NUEVO', 'CONTACTADO', 'DERIVADO', 'CERRADO') NOT NULL,
    `autorId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `HistorialEstado_ticketId_idx`(`ticketId`),
    INDEX `HistorialEstado_autorId_idx`(`autorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AccesoContacto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AccesoContacto_ticketId_idx`(`ticketId`),
    INDEX `AccesoContacto_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ServicioAsistencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `tipo` ENUM('COMISARIA', 'CENTRO_SALUD', 'CAV', 'LINEA') NOT NULL,
    `telefono` VARCHAR(191) NOT NULL,
    `lat` DECIMAL(9, 6) NULL,
    `lng` DECIMAL(9, 6) NULL,
    `barrioId` INTEGER NULL,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ServicioAsistencia_barrioId_idx`(`barrioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReglaRecomendacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `categoria` ENUM('HOMICIDIO', 'LESIONES', 'VIOLENCIA_GENERO', 'VIOLENCIA_INTRAFAMILIAR', 'ABUSO_SEXUAL', 'ROBO', 'HURTO', 'HURTO_VEHICULO', 'ESTAFA_ONLINE') NOT NULL,
    `franja` ENUM('MADRUGADA', 'MANANA', 'TARDE', 'NOCHE') NULL,
    `condicion` ENUM('TENDENCIA_SUBA', 'PICO', 'TASA_SUPERA') NOT NULL,
    `umbral` DECIMAL(10, 2) NULL,
    `texto` TEXT NOT NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RateLimit` (
    `clave` VARCHAR(191) NOT NULL,
    `ventanaInicio` DATETIME(3) NOT NULL,
    `contador` INTEGER NOT NULL,

    PRIMARY KEY (`clave`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_barrioId_fkey` FOREIGN KEY (`barrioId`) REFERENCES `Barrio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Incidente` ADD CONSTRAINT `Incidente_barrioId_fkey` FOREIGN KEY (`barrioId`) REFERENCES `Barrio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_barrioId_fkey` FOREIGN KEY (`barrioId`) REFERENCES `Barrio`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketDerivacion` ADD CONSTRAINT `TicketDerivacion_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContactoTicket` ADD CONSTRAINT `ContactoTicket_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotaTicket` ADD CONSTRAINT `NotaTicket_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NotaTicket` ADD CONSTRAINT `NotaTicket_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialEstado` ADD CONSTRAINT `HistorialEstado_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HistorialEstado` ADD CONSTRAINT `HistorialEstado_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccesoContacto` ADD CONSTRAINT `AccesoContacto_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AccesoContacto` ADD CONSTRAINT `AccesoContacto_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ServicioAsistencia` ADD CONSTRAINT `ServicioAsistencia_barrioId_fkey` FOREIGN KEY (`barrioId`) REFERENCES `Barrio`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

