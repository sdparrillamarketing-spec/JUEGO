const express = require("express");
const fs = require("fs");
const path = require("path");
const config = require("./config");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "participantes.json");

// ---------------------------------------------------------------------
// Almacenamiento simple en archivo JSON.
// NOTA IMPORTANTE PARA PRODUCCIÓN:
// En el plan gratuito de Render, el disco es efímero: si el servicio
// se reinicia o se vuelve a desplegar, este archivo se borra. Para un
// evento de un solo día esto normalmente es aceptable, pero si el juego
// va a usarse por varios días o necesitas garantizar que el historial
// nunca se pierda, lo ideal es migrar este archivo a una base de datos
// (por ejemplo, un Render Postgres gratuito) o exportar el archivo al
// final de cada día del evento usando GET /admin/exportar.
// ---------------------------------------------------------------------

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf-8");
}

function readParticipants() {
  ensureDataFile();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
  } catch (e) {
    return [];
  }
}

function saveParticipants(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf-8");
}

function normalizeContact(contact) {
  return String(contact || "").trim().toLowerCase();
}

// ---------------------------------------------------------------------
// Selección de premio ponderada (weighted random)
// ---------------------------------------------------------------------
function pickPrize() {
  const entries = config.prizes.map((p) => ({
    id: p.id,
    label: p.label,
    icon: p.icon,
    weight: p.weight
  }));

  entries.push({
    id: "sin_premio",
    label: config.noPrizeLabel,
    icon: config.noPrizeIcon,
    weight: config.noPrizeWeight
  });

  const totalWeight = entries.reduce((sum, e) => sum + e.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const entry of entries) {
    if (roll < entry.weight) return entry;
    roll -= entry.weight;
  }
  return entries[entries.length - 1];
}

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ---------------------------------------------------------------------
// GET /api/config -> datos públicos para pintar el frontend
// ---------------------------------------------------------------------
app.get("/api/config", (req, res) => {
  res.json({
    eventName: config.eventName,
    prizeLabels: config.prizes.map((p) => p.label)
  });
});

// ---------------------------------------------------------------------
// POST /api/play
// body: { name: string, contact: string }
// Reglas:
//  - Un mismo contacto (correo o teléfono) solo puede jugar una vez.
//  - El premio se calcula en el servidor (el cliente nunca decide el premio).
// ---------------------------------------------------------------------
app.post("/api/play", (req, res) => {
  const { name, contact } = req.body || {};

  if (!name || !contact || !String(name).trim() || !String(contact).trim()) {
    return res.status(400).json({ error: "Faltan datos: nombre y correo o teléfono son obligatorios." });
  }

  const normalized = normalizeContact(contact);
  const participants = readParticipants();

  const already = participants.find((p) => p.contactKey === normalized);
  if (already) {
    return res.status(409).json({
      error: "Este correo/teléfono ya participó. Solo se permite una jugada por persona.",
      previousResult: already.prizeLabel
    });
  }

  const prize = pickPrize();

  const record = {
    name: String(name).trim(),
    contact: String(contact).trim(),
    contactKey: normalized,
    prizeId: prize.id,
    prizeLabel: prize.label,
    won: prize.id !== "sin_premio",
    timestamp: new Date().toISOString()
  };

  participants.push(record);
  saveParticipants(participants);

  res.json({
    won: record.won,
    prize: { label: prize.label, icon: prize.icon }
  });
});

// ---------------------------------------------------------------------
// GET /admin/exportar?clave=TU_CLAVE
// Lista simple de participantes en JSON, protegida por una clave básica
// definida en la variable de entorno ADMIN_KEY (ver README).
// ---------------------------------------------------------------------
app.get("/admin/exportar", (req, res) => {
  const adminKey = process.env.ADMIN_KEY || "";
  if (!adminKey || req.query.clave !== adminKey) {
    return res.status(403).json({ error: "No autorizado." });
  }
  const participants = readParticipants();
  res.json(participants);
});

app.listen(PORT, () => {
  console.log(`SD Imprexpo game corriendo en el puerto ${PORT}`);
});
