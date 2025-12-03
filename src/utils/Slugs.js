
export function toSlug(s) {
  return (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[^a-z0-9]+/g, " ")     // Reemplazar caracteres especiales por espacios
    .trim()
    .split(" ")[0];                   // Tomar solo la primera palabra
}