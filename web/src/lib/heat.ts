// Rampa de 10 clases, verde (baja) a rojo (alta). leaflet.heat no lee
// variables CSS, por eso se duplica en hex; debe coincidir con --heat-N
// de globals.css.
export const HEAT_RAMP = [
  "#2e9e4f",
  "#6cb64a",
  "#a5c640",
  "#d6cf3a",
  "#f2c230",
  "#f5a02a",
  "#f27a26",
  "#e9541f",
  "#d9341d",
  "#b81c1c",
] as const;
