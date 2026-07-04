/**
 * Cliente: NO contiene logica de sorteo.
 * Solo pide tarjetas nuevas y envia la eleccion del jugador al servidor.
 * El contenido real de las 9 casillas se desconoce hasta que el
 * servidor responde en /api/ticket/:id/reveal.
 */

let ticketIdActual = null;
let yaEligio = false;

const gridEl = document.getElementById('grid');
const statusEl = document.getElementById('statusText');
const ticketIdEl = document.getElementById('ticketId');
const newCardBtn = document.getElementById('newCardBtn');

function setStatus(text, cls){
  statusEl.textContent = text;
  statusEl.className = 'status ' + (cls || 'hint');
}

async function nuevaTarjeta(){
  newCardBtn.disabled = true;
  setStatus('Generando tarjeta en el servidor...', 'hint');
  ticketIdEl.textContent = '#cargando...';
  gridEl.innerHTML = '';

  try{
    const res = await fetch('/api/ticket/new', { method:'POST' });
    if(!res.ok) throw new Error('No se pudo generar la tarjeta');
    const data = await res.json();

    ticketIdActual = data.ticketId;
    yaEligio = false;
    ticketIdEl.textContent = '#' + data.ticketId.slice(0,8);
    setStatus('Toca una casilla para descubrir tu resultado 👆', 'hint');
    renderGridVacia(data.totalCasillas);
  } catch(err){
    setStatus('Error de conexión con el servidor. Intenta de nuevo.', 'error');
  } finally {
    newCardBtn.disabled = false;
  }
}

function renderGridVacia(total){
  gridEl.innerHTML = '';
  for(let i=0; i<total; i++){
    const box = document.createElement('div');
    box.className = 'box';
    box.dataset.idx = i;
    box.innerHTML = `
      <div class="box-inner">
        <div class="box-face box-front"><div class="qmark">?</div></div>
        <div class="box-face box-back">
          <div class="emoji">⬜</div>
          <div class="label"></div>
        </div>
      </div>
    `;
    box.addEventListener('click', ()=> elegirCasilla(i));
    gridEl.appendChild(box);
  }
}

async function elegirCasilla(idx){
  if(yaEligio || !ticketIdActual) return;
  yaEligio = true;
  document.querySelectorAll('.box').forEach(b => b.classList.add('disabled'));

  try{
    const res = await fetch(`/api/ticket/${ticketIdActual}/reveal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: idx })
    });
    const data = await res.json();

    if(!res.ok){
      setStatus(data.error || 'Ocurrió un error.', 'error');
      yaEligio = false;
      document.querySelectorAll('.box').forEach(b => b.classList.remove('disabled'));
      return;
    }

    pintarResultado(data, idx);
  } catch(err){
    setStatus('Error de conexión con el servidor.', 'error');
    yaEligio = false;
    document.querySelectorAll('.box').forEach(b => b.classList.remove('disabled'));
  }
}

function pintarResultado(data, idxElegido){
  const boxes = document.querySelectorAll('.box');

  data.celdas.forEach((celda, i) => {
    const box = boxes[i];
    const emojiEl = box.querySelector('.emoji');
    const labelEl = box.querySelector('.label');
    emojiEl.textContent = celda.emoji;
    labelEl.textContent = celda.id === 'none' ? 'Sin premio' : celda.label;

    box.classList.add('flipped', 'locked');
    if(i === idxElegido){
      box.classList.add('chosen');
    } else {
      box.classList.add('dim');
    }
  });

  const elegida = data.elegida;
  if(elegida.id !== 'none'){
    setStatus('🎉 ¡Felicidades! Ganaste: ' + elegida.label, 'win');
  } else if(data.ganador){
    setStatus('😬 ¡Tan cerca! El premio (' + data.ganador.label + ') estaba en otra casilla.', 'lose');
  } else {
    setStatus('😅 Esta tarjeta no traía premio. ¡Suerte en la próxima!', 'lose');
  }
}

// ---------- Panel de probabilidades (datos reales del servidor) ----------
async function cargarProbabilidades(){
  try{
    const res = await fetch('/api/probabilidades');
    const data = await res.json();
    const table = document.getElementById('probsTable');
    let rows = `<tr><td>🎯 Tarjeta con premio real</td><td>${Math.round(data.probTarjetaConPremio*100)}%</td></tr>`;
    rows += data.premios.map(p => {
      const pct = (p.probabilidadSiHayPremio*100).toFixed(1);
      return `<tr><td>${p.emoji} ${p.label} (si hay premio)</td><td>${pct}%</td></tr>`;
    }).join('');
    table.innerHTML = rows;
  } catch(err){
    // silencioso, el panel simplemente no carga datos
  }
}

document.getElementById('newCardBtn').addEventListener('click', nuevaTarjeta);
document.getElementById('togglePanel').addEventListener('click', ()=>{
  const panel = document.getElementById('probsPanel');
  const visible = panel.style.display === 'block';
  panel.style.display = visible ? 'none' : 'block';
  document.getElementById('togglePanel').textContent = visible ? 'Ver tabla de probabilidades' : 'Ocultar tabla de probabilidades';
});

cargarProbabilidades();
nuevaTarjeta();
