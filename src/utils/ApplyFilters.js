// src/utils/ApplyFilters.js
// Utilidad para aplicar filtros a los vinos

import { toSlug } from './Slugs';

function applyFilters(wines, filters = {}) {
  return wines.filter((wine) => {
    // Filtro por precio
    if (filters.price) {
      const { min, max } = filters.price;
      const price = wine.precio_promedio ?? 0;
      if (price < min || price > max) {
        return false;
      }
    }

    // Filtro por rating
    if (filters.rating) {
      if (wine.rating < filters.rating) {
        return false;
      }
    }

    // Filtro por bodega/marca
    if (filters.brand?.length) {
      const brandSlug = toSlug(wine.bodega);
      if (!filters.brand.includes(brandSlug)) return false;
    }

    // Filtro por tipo de vino
    if (filters.type?.length) {
      const typeSlug = toSlug(wine.tipo || wine.type);
      if (!filters.type.includes(typeSlug)) return false;
    }

    // Filtro por región
    if (filters.region?.length) {
      const regionSlug = toSlug(wine.region);
      if (!filters.region.includes(regionSlug)) return false;
    }

    return true;
  });
}

export default applyFilters;