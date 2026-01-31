import axios from 'axios';

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2';

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
  types: Array<{
    type: {
      name: string;
    };
  }>;
  height: number;
  weight: number;
  stats: Array<{
    base_stat: number;
    stat: {
      name: string;
    };
  }>;
  abilities: Array<{
    ability: {
      name: string;
    };
    is_hidden: boolean;
  }>;
  species: {
    url: string;
  };
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

export async function getPokemonList(limit: number = 20, offset: number = 0): Promise<PokemonListResponse> {
  try {
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    throw error;
  }
}

export async function getPokemonDetails(nameOrId: string | number): Promise<Pokemon> {
  try {
    const response = await axios.get(`${POKEAPI_BASE_URL}/pokemon/${nameOrId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Pokemon details:', error);
    throw error;
  }
}

export async function getPopularPokemon(limit: number = 12): Promise<Pokemon[]> {
  const popularPokemonIds = [
    25,  // Pikachu
    6,   // Charizard
    150, // Mewtwo
    94,  // Gengar
    149, // Dragonite
    448, // Lucario
    658, // Greninja
    887, // Dragapult
    898, // Calyrex
    248, // Tyranitar
    445, // Garchomp
    143  // Snorlax
  ];

  console.log('Fetching Pokemon IDs:', popularPokemonIds.slice(0, limit));
  
  const pokemonPromises = popularPokemonIds.slice(0, limit).map(id => 
    getPokemonDetails(id).catch(err => {
      console.error(`Failed to fetch Pokemon ${id}:`, err);
      return null;
    })
  );

  try {
    const pokemonResults = await Promise.all(pokemonPromises);
    const pokemon = pokemonResults.filter(p => p !== null) as Pokemon[];
    console.log('Successfully fetched Pokemon:', pokemon.length);
    return pokemon;
  } catch (error) {
    console.error('Error fetching popular Pokemon:', error);
    throw error;
  }
}

export function getPokemonImageUrl(pokemon: Pokemon, isShiny: boolean = false): string {
  if (isShiny) {
    return pokemon.sprites.other['official-artwork'].front_shiny || pokemon.sprites.front_shiny;
  }
  return pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
}

export function formatPokemonName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getPokemonTypeColor(type: string): string {
  const typeColors: { [key: string]: string } = {
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
  
  return typeColors[type] || 'bg-gray-400';
}