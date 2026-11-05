export const CLIENT_COLORS = [
  { nombre: "Cereza", valor: "#8B1E2D", fondo: "#F7E0E2", texto: "#741824" },
  { nombre: "Rosa", valor: "#E64F88", fondo: "#FCE3ED", texto: "#9B2756" },
  { nombre: "Mantequilla", valor: "#B77B18", fondo: "#FFF1C8", texto: "#80530D" },
  { nombre: "Oliva", valor: "#607A35", fondo: "#EAF0DF", texto: "#455A24" },
  { nombre: "Chocolate", valor: "#594137", fondo: "#EFE6E1", texto: "#493329" },
  { nombre: "Verde", valor: "#4D7777", fondo: "#E2EEEE", texto: "#355A5A" },
  { nombre: "Lila", valor: "#80649A", fondo: "#EFE8F4", texto: "#624A7B" },
  { nombre: "Azul", valor: "#496A91", fondo: "#E5EDF5", texto: "#34516F" },
];

export function getClientColor(color) {
  const normalized = String(color || "").toLowerCase();
  return CLIENT_COLORS.find(option => option.valor.toLowerCase() === normalized) || CLIENT_COLORS[0];
}

export function getNextClientColor(clients = []) {
  const usedColors = new Set(clients.map(client => String(client.color || "").toLowerCase()));
  return CLIENT_COLORS.find(option => !usedColors.has(option.valor.toLowerCase())) || CLIENT_COLORS[clients.length % CLIENT_COLORS.length];
}
