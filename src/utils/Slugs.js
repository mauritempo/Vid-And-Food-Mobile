
export function toSlug(s) {
  return (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9]+/g, " ")     
    .trim()
    .split(" ")[0];                  
}