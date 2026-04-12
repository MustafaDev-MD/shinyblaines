import axios from 'axios';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

/* =========================
   TYPES
========================= */

export interface Pokemon {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    front_shiny: string;
    other: {
      'official-artwork': {
        front_default: string;
        front_shiny: string;
      };
      dream_world: {
        front_default: string;
      };
    };
  };
  types: Array<{ type: { name: string } }>;
  height: number;
  weight: number;
  stats: Array<{
    base_stat: number;
    stat: { name: string };
  }>;
  abilities: Array<{
    ability: { name: string };
    is_hidden: boolean;
  }>;
  species: { url: string };
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Array<{
    name: string;
    url: string;
  }>;
}

export interface PokemonFullData extends Pokemon {
  abilities: Array<{
    ability: { name: string; url: string };
    is_hidden: boolean;
    slot: number;
  }>;
  moves: any[];
}

/* =========================
   API: BASIC FETCH
========================= */

export async function getPokemonList(limit = 20, offset = 0) {
  const res = await axios.get<PokemonListResponse>(
    `${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`
  );
  return res.data;
}

export async function getPokemonDetails(nameOrId: string | number) {
  const res = await axios.get<Pokemon>(
    `${POKEAPI_BASE_URL}/pokemon/${nameOrId}`
  );
  return res.data;
}

/* =========================
   🔥 FIX: GET ALL POKEMON
========================= */

export async function getAllPokemon() {
  let all: PokemonListResponse['results'] = [];
  let url: string | null = `${POKEAPI_BASE_URL}/pokemon?limit=100&offset=0`;

  try {
    while (url) {
      const res: { data: PokemonListResponse } = await axios.get(url);
      all = [...all, ...res.data.results];
      url = res.data.next;
    }

    return all;
  } catch (err) {
    console.error('Error fetching all Pokemon:', err);
    throw err;
  }
}

/* =========================
   POPULAR POKEMON
========================= */

const POPULAR_IDS = [
  25, 6, 150, 94, 149, 448,
  658, 887, 898, 248, 445, 143
];

export async function getPopularPokemon(limit = 12): Promise<Pokemon[]> {
  try {
    const results = await Promise.all(
      POPULAR_IDS.slice(0, limit).map(id =>
        getPokemonDetails(id).catch(err => {
          console.error(`Failed Pokémon ${id}`, err);
          return null;
        })
      )
    );

    return results.filter(Boolean) as Pokemon[];
  } catch (err) {
    console.error('Error fetching popular Pokemon:', err);
    throw err;
  }
}

/* =========================
   IMAGE HELPER
========================= */

export function getPokemonImageUrl(
  pokemon: Pokemon,
  isShiny = false
): string {
  const official =
    pokemon.sprites.other['official-artwork'];

  return isShiny
    ? official.front_shiny || pokemon.sprites.front_shiny
    : official.front_default || pokemon.sprites.front_default;
}

/* =========================
   UTILS
========================= */

// export function formatPokemonName(name: string) {
//   return name.charAt(0).toUpperCase() + name.slice(1);
// }

export function formatPokemonName(name: string) {
  return name
    .replace(/-/g, ' ') // dash → space
    .replace(/\b\w/g, (char) => char.toUpperCase()); // har word capital
}

export const getPokemonForms = async (id: number) => {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`);
    const data = await res.json();

    const forms = data.varieties.map((v: any) => v.pokemon.name);

    return forms; // ["articuno", "articuno-galar"]
  } catch (err) {
    console.error('Failed to fetch forms', err);
    return [];
  }
};

export function formatPokemonNameForCommand(name: string): string {
  return name
    .trim()
    // multiple spaces → single space
    .replace(/\s+/g, ' ')
    // space → hyphen
    .replace(/ /g, '-');
}

export function getPokemonTypeColor(type: string) {
  const colors: Record<string, string> = {
    normal: 'bg-gray-400',
    fire: 'bg-red-500',
    water: 'bg-blue-500',
    electric: 'bg-yellow-400',
    grass: 'bg-green-500',
    ice: 'bg-cyan-400',
    fighting: 'bg-orange-600',
    poison: 'bg-purple-500',
    ground: 'bg-yellow-600',
    flying: 'bg-indigo-400',
    psychic: 'bg-pink-500',
    bug: 'bg-lime-500',
    rock: 'bg-yellow-800',
    ghost: 'bg-purple-700',
    dragon: 'bg-indigo-600',
    dark: 'bg-gray-800',
    steel: 'bg-gray-500',
    fairy: 'bg-pink-400'
  };

  return colors[type] || 'bg-gray-400';
}

/* =========================
   FULL DATA CACHE
========================= */

const cache = new Map<number, PokemonFullData>();

export async function getPokemonFullData(nameOrId: string | number) {
  const id = Number(nameOrId);

  if (cache.has(id)) return cache.get(id)!;

  const res = await axios.get<PokemonFullData>(
    `${POKEAPI_BASE_URL}/pokemon/${nameOrId}`
  );

  cache.set(id, res.data);
  return res.data;
}

/* =========================
   ABILITIES
========================= */

export function getPokemonAbilities(pokemon: PokemonFullData) {
  return pokemon.abilities.map(a =>
    a.ability.name
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
  );
}

/* =========================
   MOVES FILTER (GAME BASED)
========================= */

const GAME_VERSION_GROUPS: Record<string, string[]> = {
  'scarlet-violet': ['scarlet-violet'],
  'sword-shield': ['sword-shield'],
  bdsp: ['brilliant-diamond-shining-pearl'],
  'legends-arceus': ['legends-arceus']
};

export function getPokemonMovesForGame(
  pokemon: PokemonFullData,
  game: string
) {
  const valid = GAME_VERSION_GROUPS[game] || ['scarlet-violet'];
  const moves = new Set<string>();

  for (const move of pokemon.moves) {
    for (const v of move.version_group_details || []) {
      if (valid.includes(v.version_group.name)) {
        moves.add(
          move.move.name
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase())
        );
        break;
      }
    }
  }

  return Array.from(moves).sort();
}