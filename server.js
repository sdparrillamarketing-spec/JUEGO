/**
 * SD® - Rasca y Gana / Elige tu Casilla
 * Backend en Node + Express
 *
 * TODA la logica de sorteo vive aqui. El cliente (navegador) NUNCA
 * recibe la posicion ni el contenido de las 9 casillas hasta que
 * el jugador elige una y el servidor responde con el resultado.
 *
 * Esto evita que alguien inspeccione el HTML/JS y "haga trampa"
 * viendo donde esta el premio antes de jugar.
 */

const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------------------------------------------------
// CONFIGURACION DE PREMIOS
// ---------------------------------------------------------------
const PRIZES = [
  { id: 'powerbank', label: 'Power Bank',          sub: 'Bateria portatil',   emoji: '🔋', weight: 40 },
  { id: 'bocinas',   label: 'Bocinas Bluetooth',   sub: 'Sonido inalambrico', emoji: '🔊', weight: 32 },
  { id: 'watch',     label: 'Smart Watch',         sub: 'Reloj inteligente',  emoji: '⌚', weight: 20 },
  { id: 'mochila',   label: 'Mochila para Laptop', sub: '¡Premio mayor!',     emoji: '🎒', weight: 8  },
];
const NO_PRIZE = { id: 'none', label: 'Sin premio', sub: 'Sigue participando', emoji: '🙂' };

// Probabilidad de que UNA TARJETA traiga premio real escondido entre las 9 casillas
const PROB_DE_GANAR = 0.35;

// Cuanto dura una tarjeta sin jugarse antes de expirar (limpieza de memoria)
const TICKET_TTL_MS = 1000 * 60 * 30; // 30 minutos

// ---------------------------------------------------------------
// "BASE DE DATOS" EN MEMORIA (para produccion real usar Redis/DB)
// ---------------------------------------------------------------
const tickets = new Map(); // ticketId -> { celdas, ganador, jugado, creado }
let lastPrizeId = null;    // evita que el mismo premio salga 2 veces seguidas

function limpiarTicketsExpirados() {
  const ahora = Date.now();
  for (const [id, t] of tickets.entries()) {
    if (ahora - t.creado > TICKET_TTL_MS) tickets.delete(id);
  }
}
setInterval(limpiarTicketsExpirados, 1000 * 60 * 5);

// ---------------------------------------------------------------
// LOGICA DE SORTEO (se ejecuta SOLO en el servidor)
// ---------------------------------------------------------------
function sortearPremioGanador() {
  if (Math.random() > PROB_DE_GANAR) return null; // esta tarjeta no trae premio real

  let pool = PRIZES.filter(p => p.id !== lastPrizeId);
  if (pool.length === 0) pool = PRIZES;

  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  let r = Math.random() * totalWeight;
  for (const p of pool) {
    if (r < p.weight) return p;
    r -= p.weight;
  }
  return pool[pool.length - 1];
}

function generarCuadricula() {
  const ganador = sortearPremioGanador();
  const celdas = new Array(9).fill(null).map(() => ({ ...NO_PRIZE }));

  if (ganador) {
    const posicion = crypto.randomInt(0, 9); // posicion aleatoria criptograficamente segura
    celdas[posicion] = { ...ganador };
  }
  return { celdas, ganador };
}

// ---------------------------------------------------------------
// ENDPOINTS
// ---------------------------------------------------------------

// Crear una tarjeta nueva. El cliente solo recibe un ticketId,
// NUNCA el contenido de las celdas.
app.post('/api/ticket/new', (req, res) => {
  const ticketId = crypto.randomUUID();
  const { celdas, ganador } = generarCuadricula();

  tickets.set(ticketId, {
    celdas,
    ganador,
    jugado: false,
    creado: Date.now(),
  });

  res.json({
    ticketId,
    totalCasillas: celdas.length,
  });
});

// El jugador elige UNA casilla. El servidor valida, marca la tarjeta
// como jugada y responde con el resultado completo (para mostrar
// que habia en las otras 8 casillas tambien).
app.post('/api/ticket/:id/reveal', (req, res) => {
  const { id } = req.params;
  const { index } = req.body;

  const ticket = tickets.get(id);
  if (!ticket) {
    return res.status(404).json({ error: 'Tarjeta no encontrada o expirada. Pide una nueva.' });
  }
  if (ticket.jugado) {
    return res.status(400).json({ error: 'Esta tarjeta ya fue jugada.' });
  }
  if (typeof index !== 'number' || index < 0 || index > 8 || !Number.isInteger(index)) {
    return res.status(400).json({ error: 'Indice de casilla invalido.' });
  }

  ticket.jugado = true;
  const elegida = ticket.celdas[index];

  if (elegida.id !== 'none') {
    lastPrizeId = elegida.id;
  }

  res.json({
    indexElegido: index,
    elegida,
    ganador: ticket.ganador, // null si esta tarjeta no traia premio
    celdas: ticket.celdas,   // ahora si se revelan todas, ya jugada
  });
});

// Tabla de probabilidades, calculada en servidor (informativa para el panel del front)
app.get('/api/probabilidades', (req, res) => {
  const totalWeight = PRIZES.reduce((s, p) => s + p.weight, 0);
  res.json({
    probTarjetaConPremio: PROB_DE_GANAR,
    premios: PRIZES.map(p => ({
      ...p,
      probabilidadSiHayPremio: p.weight / totalWeight,
    })),
  });
});

app.listen(PORT, () => {
  console.log(`SD Rasca y Gana corriendo en http://localhost:${PORT}`);
});
