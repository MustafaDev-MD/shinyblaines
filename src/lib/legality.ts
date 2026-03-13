export interface LegalityResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PokemonFormData {
  id: number;
  name: string;
  species: string;
  form?: string;
  level: number;
  shiny: boolean;
  alpha: boolean;
  moves: string[];
  ability: string;
  nature: string;
  ivs: Record<string, number>;
  evs: Record<string, number>;
  item: string;
  game: string;
}

const EVENT_ONLY_POKEMON = [
  151, 251, 385, 386, 487, 493, 647, 648, 649, 721, 772, 773, 774, 775, 776, 777, 778,
  785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801,
  802, 803, 804, 805, 806, 807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817, 818,
  819, 820, 821, 822, 823, 824, 825, 826, 827, 828, 829, 830, 831, 832, 833, 834,
  838, 839, 840, 841, 842, 843, 844, 845, 846, 847, 848, 849, 850, 851, 852, 853,
  854, 855, 856, 857, 858, 859, 860, 861, 862, 863, 864, 865, 866, 867, 868, 869,
  870, 871, 872, 873, 874, 875, 876, 877, 878, 879, 880, 881, 882, 883, 884, 885,
  886, 887, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899, 900, 901,
  902, 903, 904, 905, 906, 1008, 1009, 1010, 1011, 1012, 1013, 1014, 1015, 1016,
  1017, 1018, 1019, 1020, 1021, 1022, 1023, 1024, 1025
];

const SHINY_LOCKED_POKEMON = [
  150, 151, 243, 244, 245, 249, 250, 251, 377, 378, 379, 380, 381, 382, 383, 384, 385,
  386, 487, 493, 638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649, 716, 717,
  718, 719, 720, 721, 772, 773, 774, 775, 776, 777, 778, 785, 786, 787, 788, 789,
  790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805,
  806, 807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817, 818, 819, 820, 821,
  822, 823, 824, 825, 826, 827, 828, 829, 830, 831, 832, 833, 834, 838, 839, 840,
  841, 842, 843, 844, 845, 846, 847, 848, 849, 850, 851, 852, 853, 854, 855, 856,
  857, 858, 859, 860, 861, 862, 863, 864, 865, 866, 867, 868, 869, 870, 871, 872,
  873, 874, 875, 876, 877, 878, 879, 880, 881, 882, 883, 884, 885, 886, 887, 888,
  889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899, 900, 901, 902, 903, 904,
  905, 906, 1008, 1009, 1010
];

const ALPHA_ONLY_POKEMON = [
  889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899, 900, 901, 902, 983, 984,
  985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996
];

const ILLEGAL_MOVE_COMBINATIONS: Record<number, string[]> = {
  150: ['Present', 'Hypnosis'],
  151: ['Present', 'Hypnosis', 'Psywave'],
};

export function validatePokemon(data: PokemonFormData): LegalityResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (data.level < 1 || data.level > 100) {
    errors.push(`Invalid level: ${data.level}. Level must be 1-100.`);
  }

  if (data.shiny && SHINY_LOCKED_POKEMON.includes(data.id)) {
    errors.push(`${data.name} (#${data.id}) is shiny-locked. Cannot be shiny in any game.`);
  }

  if (data.alpha && !ALPHA_ONLY_POKEMON.includes(data.id)) {
    errors.push(`${data.name} (#${data.id}) cannot be Alpha in this game.`);
  }

  if (data.alpha && !['scarlet-violet', 'legends-arceus'].includes(data.game)) {
    errors.push('Alpha form is only available in Scarlet/Violet and Legends: Arceus.');
  }

  if (data.evs) {
    const evTotal = Object.values(data.evs).reduce((sum, val) => sum + val, 0);
    if (evTotal > 510) {
      errors.push(`Total EVs (${evTotal}) exceeds maximum of 510.`);
    }
  }

  if (data.ivs) {
    for (const [stat, value] of Object.entries(data.ivs)) {
      if (value < 0 || value > 31) {
        errors.push(`Invalid IV for ${stat}: ${value}. Must be 0-31.`);
      }
    }
  }

  if (data.moves.length > 4) {
    errors.push('Cannot have more than 4 moves.');
  }

  const illegalMoves = ILLEGAL_MOVE_COMBINATIONS[data.id];
  if (illegalMoves) {
    const hasIllegal = data.moves.some(move => 
      illegalMoves.some(illegal => move.toLowerCase().includes(illegal.toLowerCase()))
    );
    if (hasIllegal) {
      errors.push(`${data.name} cannot learn: ${illegalMoves.join(', ')}`);
    }
  }

  if (data.game === 'scarlet-violet' && data.level < 1) {
    warnings.push(' Scarlet/Violet requires level 1 minimum for traded Pokémon.');
  }

  if (data.ability) {
    const validAbilities = getValidAbilitiesForPokemon(data.id);
    if (validAbilities.length > 0) {
      const isValidAbility = validAbilities.some(valid => 
        data.ability.toLowerCase() === valid.toLowerCase()
      );
      if (!isValidAbility) {
        errors.push(`${data.name} cannot have ability '${data.ability}'. Valid abilities: ${validAbilities.join(', ')}`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

const ABILITY_DATABASE: Record<number, string[]> = {
  1: ['overgrow', 'chlorophyll'],
  2: ['overgrow', 'chlorophyll'],
  3: ['overgrow', 'chlorophyll'],
  4: ['blaze', 'solar-power'],
  5: ['blaze', 'solar-power'],
  6: ['blaze', 'solar-power'],
  25: ['static', 'lightning-rod'],
  26: ['static', 'lightning-rod'],
  39: ['cute-charm', 'friend-guard'],
  40: ['cute-charm', 'friend-guard'],
  52: ['pickup', 'unnerve', 'run-away'],
  53: ['pickup', 'unnerve', 'run-away'],
  54: ['damp', 'cloud-nine'],
  55: ['damp', 'cloud-nine'],
  94: ['levitate'],
  95: ['rock-head', 'sturdy'],
  150: ['pressure', 'unnerve'],
  151: ['pressure', 'unnerve'],
  257: ['blaze', 'speed-boost'],
  258: ['torrent', 'damp'],
  259: ['torrent', 'damp'],
  260: ['torrent', 'damp'],
  443: ['sand-veil', 'rough-skin'],
  444: ['sand-veil', 'rough-skin'],
  445: ['sand-veil', 'rough-skin'],
  448: ['steadfast', 'justified'],
  471: ['ice-body', 'snow-cloak'],
  485: ['levitate'],
  487: ['levitate'],
  493: ['multitype'],
  641: ['defiant', 'justified'],
  642: ['defiant', 'justified'],
  643: ['turbo-blaze', 'megasonic'],
  644: ['turboblaze', 'megasonic'],
  645: ['intimidate', 'repellent'],
  646: ['teravolt', 'turboblaze'],
  647: ['justified'],
  648: ['serene-grace', 'flower-veil'],
  649: ['download', 'adaptability'],
  700: ['cute-charm', 'pixilate', 'friend-guard'],
  716: ['fairy-aura', 'pixilate'],
  717: ['dark-aura', 'pixilate'],
  718: ['adaptability', 'protean', 'libero'],
  719: ['mineralization', 'clear-body'],
  720: ['wonder-guard', 'filter', 'technician'],
  721: ['pressure', 'unnerve'],
  724: ['overgrow', 'contrary'],
  725: ['blaze', 'contrary'],
  726: ['blaze', 'contrary'],
  727: ['blaze', 'contrary'],
  728: ['torrent', 'shell-armor'],
  729: ['torrent', 'shell-armor'],
  730: ['torrent', 'schooling'],
  800: ['prism-armor', 'neuroforce'],
  801: ['magnet-pull', 'stab-boost'],
  802: ['spectrator', 'technician'],
  803: ['beast-boost', 'protosynthesis'],
  804: ['beast-boost', 'protosynthesis'],
  805: ['beast-boost', 'protosynthesis'],
  806: ['beast-boost', 'protosynthesis'],
  807: ['beast-boost', 'protosynthesis'],
  808: ['beast-boost', 'protosynthesis'],
  809: ['beast-boost', 'protosynthesis'],
  810: ['beast-boost', 'protosynthesis'],
  811: ['beast-boost', 'protosynthesis'],
  812: ['beast-boost', 'protosynthesis'],
  813: ['beast-boost', 'protosynthesis'],
  814: ['beast-boost', 'protosynthesis'],
  815: ['beast-boost', 'protosynthesis'],
  816: ['beast-boost', 'protosynthesis'],
  817: ['beast-boost', 'protosynthesis'],
  818: ['beast-boost', 'protosynthesis'],
  819: ['beast-boost', 'protosynthesis'],
  820: ['beast-boost', 'protosynthesis'],
  821: ['beast-boost', 'protosynthesis'],
  822: ['beast-boost', 'protosynthesis'],
  823: ['beast-boost', 'protosynthesis'],
  824: ['beast-boost', 'protosynthesis'],
  825: ['beast-boost', 'protosynthesis'],
  826: ['beast-boost', 'protosynthesis'],
  827: ['beast-boost', 'protosynthesis'],
  828: ['beast-boost', 'protosynthesis'],
  1008: ['protosynthesis'],
  1009: ['protosynthesis'],
  1010: ['quark-drive'],
  1011: ['quark-drive'],
  1012: ['quark-drive'],
  1013: ['quark-drive'],
  1014: ['quark-drive'],
  1015: ['quark-drive'],
  1016: ['quark-drive'],
  1017: ['quark-drive'],
};

export function getValidAbilitiesForPokemon(pokemonId: number): string[] {
  return ABILITY_DATABASE[pokemonId] || [];
}

export function checkEventPokemon(pokemonId: number): { isEvent: boolean; note?: string } {
  if (EVENT_ONLY_POKEMON.includes(pokemonId)) {
    return {
      isEvent: true,
      note: 'This Pokémon is only available through events or special distributions.'
    };
  }
  return { isEvent: false };
}

export function getLegalityMessage(result: LegalityResult): string {
  if (result.isValid) {
    if (result.warnings.length > 0) {
      return `Valid with warnings: ${result.warnings.join(', ')}`;
    }
    return 'Pokemon is legal!';
  }
  return result.errors.join(' | ');
}

const GAME_MOVE_VALIDATION: Record<string, Record<number, string[]>> = {
  'scarlet-violet': {
    1008: ['Bitter Malace', 'Sappy Seed', 'Freezy Frost', 'Sticky Glow', 'Pop Pod', 'Shelter', 'Scaler'],
    1009: ['Bitter Malace', 'Sappy Seed', 'Freezy Frost', 'Sticky Glow', 'Pop Pod', 'Shelter', 'Scaler'],
  },
  'sword-shield': {},
  'bdsp': {},
  'legends-arceus': {
    1008: ['Bitter Malace', 'Sappy Seed', 'Freezy Frost', 'Sticky Glow', 'Pop Pod', 'Shelter', 'Scaler'],
    1009: ['Bitter Malace', 'Sappy Seed', 'Freezy Frost', 'Sticky Glow', 'Pop Pod', 'Shelter', 'Scaler'],
  },
  'legends-za': {},
};

export function validateGameMoves(pokemonId: number, moves: string[], game: string): string[] {
  const errors: string[] = [];
  const gameMoves = GAME_MOVE_VALIDATION[game];
  
  if (!gameMoves) return errors;
  
  const illegalMoves = gameMoves[pokemonId];
  if (illegalMoves) {
    moves.forEach(move => {
      if (illegalMoves.some(illegal => move.toLowerCase().includes(illegal.toLowerCase()))) {
        errors.push(`${move} is not available in ${game}`);
      }
    });
  }
  
  return errors;
}

export function validateAbility(ability: string, pokemonId: number, game: string): string[] {
  const errors: string[] = [];
  
  const abilitiesDB: Record<number, string[]> = {
    150: ['pressure', 'unnerve'],
    151: ['pressure', 'unnerve'],
    493: ['multitype'],
    647: ['justified'],
    648: ['serene grace', 'flower veil'],
    649: ['download', 'adaptability'],
    721: ['pressure', 'unnerve'],
    1008: ['protosynthesis'],
    1009: ['protosynthesis'],
    1010: ['quark drive'],
    1011: ['quark drive'],
  };
  
  const restrictedAbilities: Record<string, number[]> = {
    'scarlet-violet': [],
    'sword-shield': [],
    'bdsp': [],
    'legends-arceus': [],
    'legends-za': [],
  };
  
  if (abilitiesDB[pokemonId]) {
    if (!abilitiesDB[pokemonId].some(a => ability.toLowerCase().includes(a))) {
    }
  }
  
  return errors;
}

export function validateLevelForGame(level: number, game: string): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  const minLevels: Record<string, number> = {
    'scarlet-violet': 1,
    'sword-shield': 2,
    'bdsp': 1,
    'legends-arceus': 1,
    'legends-za': 1,
  };
  
  const minLevel = minLevels[game] || 1;
  if (level < minLevel) {
    errors.push(`Minimum level for ${game} is ${minLevel}`);
  }
  
  if (game === 'scarlet-violet' && level < 5) {
    warnings.push('Some features may not be available below level 5');
  }
  
  return { errors, warnings };
}
