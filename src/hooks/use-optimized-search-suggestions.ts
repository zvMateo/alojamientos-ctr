import { useMemo } from "react";
import type { Accommodation } from "@/lib/schemas/accommodation.schema";

interface SearchSuggestion {
  id: string;
  nombre: string;
  localidad: string;
  region: string | null;
  clase: string;
  score: number;
}

// Estructura de datos Trie para búsqueda eficiente
class SearchTrie {
  private root: TrieNode = new TrieNode();

  insert(accommodation: Accommodation) {
    const searchableText = this.getSearchableText(accommodation);
    const words = searchableText
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    words.forEach((word) => {
      this.insertWord(word, accommodation);
    });
  }

  private insertWord(word: string, accommodation: Accommodation) {
    let node = this.root;

    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, new TrieNode());
      }
      node = node.children.get(char)!;
    }

    if (!node.accommodations) {
      node.accommodations = new Set();
    }
    node.accommodations.add(accommodation);
  }

  search(query: string, maxResults: number = 7): SearchSuggestion[] {
    if (query.length < 2) return [];

    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/).filter((word) => word.length > 0);

    // Buscar coincidencias para cada palabra
    const matches = new Map<string, Accommodation>();

    words.forEach((word) => {
      const wordMatches = this.searchWord(word);
      wordMatches.forEach((accommodation) => {
        const key = accommodation.id;
        if (!matches.has(key)) {
          matches.set(key, accommodation);
        }
      });
    });

    // Convertir a sugerencias y calcular scores
    const suggestions: SearchSuggestion[] = Array.from(matches.values())
      .map((accommodation) => ({
        id: accommodation.id,
        nombre: accommodation.nombre,
        localidad: accommodation.localidad,
        region: accommodation.region,
        clase: `Tipo ${accommodation.tipo}`,
        score: this.calculateScore(accommodation, queryLower),
      }))
      .filter((suggestion) => suggestion.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);

    return suggestions;
  }

  private searchWord(word: string): Accommodation[] {
    let node = this.root;

    // Navegar por el trie
    for (const char of word) {
      if (!node.children.has(char)) {
        return [];
      }
      node = node.children.get(char)!;
    }

    // Recopilar todos los alojamientos desde este nodo y sus descendientes
    const accommodations: Accommodation[] = [];
    this.collectAccommodations(node, accommodations);

    return accommodations;
  }

  private collectAccommodations(
    node: TrieNode,
    accommodations: Accommodation[]
  ) {
    if (node.accommodations) {
      node.accommodations.forEach((accommodation) => {
        accommodations.push(accommodation);
      });
    }

    node.children.forEach((childNode) => {
      this.collectAccommodations(childNode, accommodations);
    });
  }

  private getSearchableText(accommodation: Accommodation): string {
    return [
      accommodation.nombre || "",
      accommodation.localidad || "",
      accommodation.region || "",
      `Tipo ${accommodation.tipo}`,
    ].join(" ");
  }

  private calculateScore(accommodation: Accommodation, query: string): number {
    const nombre = (accommodation.nombre || "").toLowerCase();
    const localidad = (accommodation.localidad || "").toLowerCase();
    const region = (accommodation.region || "").toLowerCase();
    const clase = `Tipo ${accommodation.tipo}`.toLowerCase();

    let score = 0;

    // Buscar coincidencias exactas en el nombre (mayor prioridad)
    if (nombre.includes(query)) {
      score += 100;
      // Bonus si empieza con el término
      if (nombre.startsWith(query)) {
        score += 50;
      }
      // Bonus adicional si es una coincidencia exacta
      if (nombre === query) {
        score += 200;
      }
    }

    // Buscar coincidencias de palabras individuales
    const words = query.split(/\s+/).filter((word) => word.length > 0);
    words.forEach((word) => {
      if (nombre.includes(word)) {
        score += 30;
        if (nombre.startsWith(word)) {
          score += 20;
        }
      }
      if (localidad.includes(word)) {
        score += 15;
        // Bonus si la localidad empieza con la palabra
        if (localidad.startsWith(word)) {
          score += 10;
        }
      }
      if (region?.includes(word)) {
        // Usar optional chaining para region
        score += 10;
        // Bonus si la región empieza con la palabra
        if (region.startsWith(word)) {
          score += 5;
        }
      }
      if (clase.includes(word)) {
        score += 5;
      }
    });

    return score;
  }
}

class TrieNode {
  children: Map<string, TrieNode> = new Map();
  accommodations?: Set<Accommodation>;
}

// Hook optimizado para búsqueda de sugerencias
export const useOptimizedSearchSuggestions = (
  accommodations: Accommodation[] | undefined,
  searchTerm: string,
  maxResults: number = 7
) => {
  // Crear índice de búsqueda memoizado
  const searchIndex = useMemo(() => {
    if (!accommodations) return new SearchTrie();

    const index = new SearchTrie();
    accommodations.forEach((accommodation) => {
      // Solo indexar alojamientos con datos válidos
      if (
        accommodation.nombre &&
        accommodation.localidad &&
        accommodation.region
      ) {
        index.insert(accommodation);
      }
    });

    return index;
  }, [accommodations]);

  // Generar sugerencias memoizadas
  const suggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    return searchIndex.search(searchTerm, maxResults);
  }, [searchIndex, searchTerm, maxResults]);

  return {
    suggestions,
    hasResults: suggestions.length > 0,
  };
};
