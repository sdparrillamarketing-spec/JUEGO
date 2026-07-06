// -----------------------------------------------------------------------
// Configuración de premios y probabilidades del juego SD · Imprexpo
// Edita este archivo para cambiar premios, textos o probabilidades.
// Los "weight" (pesos) NO necesitan sumar 100: se normalizan solos.
// -----------------------------------------------------------------------

module.exports = {
  // Nombre del evento, se muestra en la interfaz
  eventName: "Imprexpo 2026",

  // Premios disponibles. "id" debe ser único y no debe cambiarse una vez
  // que el juego esté en producción (se usa para guardar el historial).
  prizes: [
    {
      id: "mochila_laptop",
      label: "Mochila para laptop",
      icon: "🎒",
      weight: 10
    },
    {
      id: "smartwatch",
      label: "Smart watch",
      icon: "⌚",
      weight: 15
    },
    {
      id: "bocinas_bt",
      label: "Bocinas bluetooth",
      icon: "🔊",
      weight: 30
    },
    {
      id: "power_bank",
      label: "Power bank",
      icon: "🔋",
      weight: 30
    }
  ],

  // Probabilidad de no ganar nada ("sigue participando").
  // Ejemplo: 15 significa 15% de las jugadas no ganan premio.
  noPrizeWeight: 15,

  noPrizeLabel: "¡Sigue participando!",
  noPrizeIcon: "🖨️"
};
