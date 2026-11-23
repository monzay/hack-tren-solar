// Seed de demo, idempotente. Todo es sintético (sintetico = true). Reproducible: PRNG con semilla fija.
// Uso: npm run seed

import { PrismaClient, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { clavesSeed } from "../src/lib/auth/claves-seed";
import { cifrar } from "../src/lib/crypto";
import type { Categoria, EstadoTicket, Franja } from "../src/lib/dominio";
import { BARRIOS } from "./datos/barrios";
import { CATEGORIAS_CONFIG, REGLAS, SERVICIOS } from "./datos/catalogos";

if (!process.env.DATABASE_URL || !process.env.ENCRYPTION_KEY) {
  try {
    process.loadEnvFile?.(".env");
  } catch {
    // sin .env: se usa el entorno
  }
}

const prisma = new PrismaClient();

// ───────── PRNG (mulberry32) ─────────
let estado = 20260101;
function rnd(): number {
  estado = (estado + 0x6d2b79f5) | 0;
  let t = Math.imul(estado ^ (estado >>> 15), 1 | estado);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const entre = (a: number, b: number) => a + rnd() * (b - a);
const entero = (a: number, b: number) => Math.floor(entre(a, b + 1));
function elegir<T>(xs: readonly T[]): T {
  return xs[Math.floor(rnd() * xs.length)];
}
function ponderado<T>(items: readonly (readonly [T, number])[]): T {
  const total = items.reduce((s, [, p]) => s + p, 0);
  let x = rnd() * total;
  for (const [v, p] of items) {
    x -= p;
    if (x <= 0) return v;
  }
  return items[items.length - 1][0];
}
const r6 = (n: number) => Number(n.toFixed(6));

const DIA = 86_400_000;
const AHORA = Date.now();

type BarrioSeed = (typeof BARRIOS)[number];

/** Punto uniforme dentro del círculo inscrito (0,85 del radio): siempre cae dentro del octógono. */
function puntoEn(b: BarrioSeed) {
  const ang = rnd() * 2 * Math.PI;
  const d = Math.sqrt(rnd()) * b.radioM * 0.85;
  const lat = b.centroLat + (d * Math.sin(ang)) / 111320;
  const lng = b.centroLng + (d * Math.cos(ang)) / (111320 * Math.cos((b.centroLat * Math.PI) / 180));
  return { lat: r6(lat), lng: r6(lng) };
}

const PESO_CATEGORIA: [Categoria, number][] = [
  ["HURTO", 28],
  ["ROBO", 22],
  ["LESIONES", 14],
  ["VIOLENCIA_INTRAFAMILIAR", 10],
  ["HURTO_VEHICULO", 8],
  ["VIOLENCIA_GENERO", 7],
  ["ESTAFA_ONLINE", 7],
  ["ABUSO_SEXUAL", 3],
  ["HOMICIDIO", 1],
];

const PESO_FRANJA: Record<Categoria, [Franja, number][]> = {
  ROBO: [["NOCHE", 45], ["TARDE", 25], ["MANANA", 15], ["MADRUGADA", 15]],
  HURTO: [["MANANA", 30], ["TARDE", 40], ["NOCHE", 25], ["MADRUGADA", 5]],
  LESIONES: [["MADRUGADA", 35], ["NOCHE", 35], ["TARDE", 20], ["MANANA", 10]],
  HURTO_VEHICULO: [["NOCHE", 35], ["MADRUGADA", 30], ["TARDE", 20], ["MANANA", 15]],
  HOMICIDIO: [["NOCHE", 40], ["MADRUGADA", 35], ["TARDE", 15], ["MANANA", 10]],
  VIOLENCIA_GENERO: [["NOCHE", 40], ["TARDE", 25], ["MADRUGADA", 20], ["MANANA", 15]],
  VIOLENCIA_INTRAFAMILIAR: [["NOCHE", 40], ["TARDE", 25], ["MADRUGADA", 20], ["MANANA", 15]],
  ABUSO_SEXUAL: [["NOCHE", 30], ["TARDE", 30], ["MADRUGADA", 20], ["MANANA", 20]],
  ESTAFA_ONLINE: [["MANANA", 30], ["TARDE", 35], ["NOCHE", 30], ["MADRUGADA", 5]],
};

function fechaEnFranja(base: number, franja: Franja): Date {
  const rangos: Record<Franja, [number, number]> = {
    MADRUGADA: [0, 5],
    MANANA: [6, 11],
    TARDE: [12, 17],
    NOCHE: [18, 23],
  };
  const [h0, h1] = rangos[franja];
  const d = new Date(base);
  d.setHours(entero(h0, h1), entero(0, 59), entero(0, 59), 0);
  return d;
}

async function limpiar() {
  await prisma.accesoContacto.deleteMany();
  await prisma.historialEstado.deleteMany();
  await prisma.notaTicket.deleteMany();
  await prisma.contactoTicket.deleteMany();
  await prisma.ticketDerivacion.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.incidente.deleteMany();
  await prisma.servicioAsistencia.deleteMany();
  await prisma.reglaRecomendacion.deleteMany();
  await prisma.categoriaConfig.deleteMany();
  await prisma.user.deleteMany();
  await prisma.barrio.deleteMany();
}

const NOMBRES = [
  "Lucía Ficticia",
  "Martín Demo",
  "Sofía Prueba",
  "Carlos Ejemplo",
  "Valentina Simulada",
  "Diego Muestra",
  "Camila Falsa",
  "Nicolás Test",
  "Julieta Inventada",
  "Tomás Sintético",
];
const HORARIOS = ["Mañana", "Tarde", "Noche", "Cualquier horario", "De 9 a 13 h"];
const RELATOS: Record<Categoria, string[]> = {
  ROBO: [
    "Me sacaron el celular en la parada cuando volvía del trabajo.",
    "Vi que le arrebataron la cartera a una señora en la esquina.",
  ],
  HURTO: [
    "Me sacaron la billetera en el colectivo sin que me diera cuenta.",
    "Faltaba una mochila que dejé un momento en la plaza.",
  ],
  LESIONES: [
    "Hubo una pelea en la puerta de un local y una persona terminó lastimada.",
    "Me golpearon en la calle y necesité atención médica.",
  ],
  HOMICIDIO: ["Escuché disparos y vi a una persona herida en la vereda."],
  VIOLENCIA_GENERO: [
    "Situación de violencia de pareja que se repite en mi cuadra.",
    "Necesito orientación para asistir a una persona cercana.",
  ],
  VIOLENCIA_INTRAFAMILIAR: [
    "Se escuchan gritos y golpes en la casa de al lado todas las noches.",
    "Hay un conflicto familiar con violencia en mi domicilio.",
  ],
  ABUSO_SEXUAL: [
    "Quiero reportar una situación de abuso y recibir orientación.",
    "Fui testigo de una situación de acoso grave cerca de una escuela.",
  ],
  HURTO_VEHICULO: [
    "Se llevaron una moto que estaba estacionada frente a mi casa.",
    "Faltaba mi auto cuando salí de trabajar.",
  ],
  ESTAFA_ONLINE: [
    "Me estafaron comprando por una red social, no entregaron el producto.",
    "Recibí un mensaje falso del banco y me vaciaron la cuenta.",
  ],
};
const NOTAS = [
  "Se intentó el primer contacto, queda a la espera de respuesta.",
  "Se brindó orientación sobre recursos de asistencia.",
  "Se coordinó la derivación con el organismo correspondiente.",
  "La persona confirmó que desea avanzar con la denuncia.",
  "Caso en seguimiento, sin novedades.",
];

async function main() {
  // Antes de borrar nada: si falta una contraseña, se corta acá.
  const claves = clavesSeed(process.env);

  console.log("Limpiando datos previos...");
  await limpiar();

  // Barrios
  await prisma.barrio.createMany({
    data: BARRIOS.map((b) => ({
      nombre: b.nombre,
      poblacion: b.poblacion,
      poligono: b.poligono as unknown as Prisma.InputJsonValue,
      centroLat: b.centroLat,
      centroLng: b.centroLng,
    })),
  });
  const barriosDb = await prisma.barrio.findMany();
  const idBarrio = new Map(barriosDb.map((b) => [b.nombre, b.id]));
  const idDe = (nombre: string) => idBarrio.get(nombre)!;

  // Catálogos
  await prisma.categoriaConfig.createMany({
    data: CATEGORIAS_CONFIG.map((c) => ({
      ...c,
      recursosUrgencia: c.recursosUrgencia as unknown as Prisma.InputJsonValue,
    })),
  });
  await prisma.servicioAsistencia.createMany({
    data: SERVICIOS.map((s) => ({
      nombre: s.nombre,
      tipo: s.tipo,
      telefono: s.telefono,
      lat: s.lat,
      lng: s.lng,
      barrioId: s.barrio ? idDe(s.barrio) : null,
    })),
  });
  await prisma.reglaRecomendacion.createMany({ data: REGLAS });

  // Usuarios
  const hash = await bcrypt.hash(claves.demo, 10);
  const hashAdmin = await bcrypt.hash(claves.admin, 10);
  const demo: { email: string; nombre: string; role: Prisma.UserCreateManyInput["role"]; organismo?: "SALUD" | "POLICIA" }[] = [
    { email: "admin@demo.ar", nombre: "Admin Demo", role: "ADMIN" },
    { email: "salud@demo.ar", nombre: "Operador Salud Demo", role: "OPERADOR_SALUD", organismo: "SALUD" },
    { email: "policia@demo.ar", nombre: "Operador Policía Demo", role: "OPERADOR_POLICIA", organismo: "POLICIA" },
    { email: "analista@demo.ar", nombre: "Analista Demo", role: "ANALISTA" },
    { email: "ciudadano@demo.ar", nombre: "Ciudadano Demo", role: "CIUDADANO" },
  ];
  await prisma.user.createMany({
    data: demo.map((u) => ({ ...u, passwordHash: u.role === "ADMIN" ? hashAdmin : hash })),
  });
  const usuarios = await prisma.user.findMany();
  const uPorEmail = new Map(usuarios.map((u) => [u.email, u]));

  // Incidentes (~2000)
  const pesosBarrio: [BarrioSeed, number][] = BARRIOS.map((b) => [b, b.peso]);
  const incidentes: Prisma.IncidenteCreateManyInput[] = [];
  const nuevoIncidente = (cat: Categoria, b: BarrioSeed, base: number) => {
    const franja = ponderado(PESO_FRANJA[cat]);
    const { lat, lng } = puntoEn(b);
    incidentes.push({
      categoria: cat,
      fecha: fechaEnFranja(base, franja),
      franja,
      lat,
      lng,
      barrioId: idDe(b.nombre),
      fuente: "SNIC",
      sintetico: true,
    });
  };
  for (let i = 0; i < 1880; i++) {
    nuevoIncidente(ponderado(PESO_CATEGORIA), ponderado(pesosBarrio), AHORA - rnd() * 365 * DIA);
  }
  // Suba de ROBO en Alto Comedero en los últimos 2 meses
  const altoComedero = BARRIOS.find((b) => b.nombre === "Alto Comedero")!;
  for (let i = 0; i < 120; i++) {
    nuevoIncidente("ROBO", altoComedero, AHORA - rnd() * 60 * DIA);
  }
  await prisma.incidente.createMany({ data: incidentes });

  // Tickets (~150)
  const configPorCat = new Map(CATEGORIAS_CONFIG.map((c) => [c.categoria, c]));
  const tickets: Prisma.TicketCreateManyInput[] = [];
  const conContacto: boolean[] = [];
  const estadosFinales: EstadoTicket[] = [];
  const catsTicket: [Categoria, number][] = [
    ["ROBO", 20],
    ["HURTO", 20],
    ["LESIONES", 10],
    ["VIOLENCIA_GENERO", 14],
    ["VIOLENCIA_INTRAFAMILIAR", 14],
    ["ABUSO_SEXUAL", 8],
    ["HURTO_VEHICULO", 7],
    ["ESTAFA_ONLINE", 6],
    ["HOMICIDIO", 1],
  ];
  const pesosEstado: [EstadoTicket, number][] = [
    ["NUEVO", 35],
    ["CONTACTADO", 25],
    ["DERIVADO", 20],
    ["CERRADO", 20],
  ];
  for (let i = 0; i < 150; i++) {
    const cat = ponderado(catsTicket);
    const cfg = configPorCat.get(cat)!;
    const b = ponderado(pesosBarrio);
    const anonimo = cfg.permiteAnonimo && rnd() < 0.5;
    const franja = ponderado(PESO_FRANJA[cat]);
    const { lat, lng } = puntoEn(b);
    const fecha = fechaEnFranja(AHORA - rnd() * 90 * DIA, franja);
    const est = ponderado(pesosEstado);
    const quiere = !anonimo && rnd() < 0.5;
    tickets.push({
      categoria: cat,
      modo: anonimo ? "ANONIMO" : "CON_CONTACTO",
      rolReportante: rnd() < 0.65 ? "VICTIMA" : "TESTIGO",
      fecha,
      franja,
      lat,
      lng,
      barrioId: idDe(b.nombre),
      relato: rnd() < 0.85 ? elegir(RELATOS[cat]) : null,
      quiereDenunciar: quiere,
      declaracionAceptada: quiere,
      estado: est,
      sintetico: true,
      createdAt: new Date(Math.min(fecha.getTime() + entero(10, 240) * 60_000, AHORA)),
    });
    conContacto.push(!anonimo && rnd() < 0.8);
    estadosFinales.push(est);
  }
  await prisma.ticket.createMany({ data: tickets });
  const ticketsDb = await prisma.ticket.findMany({ orderBy: { id: "asc" } });

  const derivaciones: Prisma.TicketDerivacionCreateManyInput[] = [];
  const contactos: Prisma.ContactoTicketCreateManyInput[] = [];
  const notas: Prisma.NotaTicketCreateManyInput[] = [];
  const historial: Prisma.HistorialEstadoCreateManyInput[] = [];
  const operadores = [uPorEmail.get("salud@demo.ar")!, uPorEmail.get("policia@demo.ar")!];
  const cadena: EstadoTicket[] = ["NUEVO", "CONTACTADO", "DERIVADO", "CERRADO"];

  ticketsDb.forEach((t, i) => {
    const cfg = configPorCat.get(t.categoria)!;
    if (cfg.derivaSalud) derivaciones.push({ ticketId: t.id, organismo: "SALUD" });
    if (cfg.derivaPolicia) derivaciones.push({ ticketId: t.id, organismo: "POLICIA" });

    if (conContacto[i]) {
      contactos.push({
        ticketId: t.id,
        nombre: cifrar(NOMBRES[i % NOMBRES.length]),
        telefono: cifrar(`388 555-${String(1000 + i).slice(-4)}`),
        email: rnd() < 0.5 ? cifrar(`demo${i}@ejemplo.invalid`) : null,
        horario: cifrar(elegir(HORARIOS)),
      });
    }

    const pasos = cadena.indexOf(estadosFinales[i]);
    let t0 = t.createdAt.getTime();
    for (let p = 1; p <= pasos; p++) {
      t0 += entero(1, 48) * 3_600_000;
      historial.push({
        ticketId: t.id,
        de: cadena[p - 1],
        a: cadena[p],
        autorId: elegir(operadores).id,
        fecha: new Date(Math.min(t0, AHORA)),
      });
    }
    if (pasos > 0 && rnd() < 0.6) {
      notas.push({
        ticketId: t.id,
        autorId: elegir(operadores).id,
        texto: elegir(NOTAS),
        createdAt: new Date(Math.min(t0, AHORA)),
      });
    }
  });

  await prisma.ticketDerivacion.createMany({ data: derivaciones });
  await prisma.contactoTicket.createMany({ data: contactos });
  await prisma.notaTicket.createMany({ data: notas });
  await prisma.historialEstado.createMany({ data: historial });

  console.log("Seed completo:");
  console.log(`  barrios: ${BARRIOS.length}`);
  console.log(
    `  categorias: ${CATEGORIAS_CONFIG.length}, servicios: ${SERVICIOS.length}, reglas: ${REGLAS.length}`,
  );
  console.log(`  usuarios: ${usuarios.length}`);
  console.log(`  incidentes: ${incidentes.length}`);
  console.log(
    `  tickets: ${ticketsDb.length} (contactos: ${contactos.length}, derivaciones: ${derivaciones.length}, notas: ${notas.length}, historial: ${historial.length})`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
