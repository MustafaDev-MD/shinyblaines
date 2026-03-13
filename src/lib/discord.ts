export interface DiscordTradeData {
  pokemonName: string;
  pokemonId: number;
  shiny: boolean;
  alpha: boolean;
  level: number;
  nature: string;
  ability: string;
  moves: string[];
  ivs: Record<string, number>;
  evs: Record<string, number>;
  item: string;
  game: string;
  trainerName?: string;
  teraType?: string;
}

export function generateDiscordCommand(data: DiscordTradeData): string {
  const lines: string[] = [];
  
  const item = data.item && data.item !== 'none' ? ` @ ${data.item}` : '';
  lines.push(`!t ${data.pokemonName}${item}`);

  if (data.alpha) {
    lines.push('.Scale=255');
  }
  
  if (data.ability) {
    const formattedAbility = data.ability
      .toLowerCase()
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    lines.push(`Ability: ${formattedAbility}`);
  }
  
  lines.push('Ball: Poke Ball');
  lines.push('Language: English');
  
  const otName = data.trainerName || 'Blaines';
  lines.push(`OT: ${otName}`);
  
  lines.push('TID: 00000');
  lines.push('SID: 00000');
  
  if (data.shiny) {
    lines.push('Shiny: Yes');
  }
  
  lines.push(`Level: ${data.level}`);
  
  const teraType = data.teraType || 'Stellar';
  lines.push(`Tera Type: ${teraType}`);
  
  const evParts: string[] = [];
  const evMap: Record<string, string> = {
    hp: 'HP',
    attack: 'Atk',
    defense: 'Def',
    'special-attack': 'SpA',
    'special-defense': 'SpD',
    speed: 'Spe'
  };
  
  for (const [stat, value] of Object.entries(data.evs || {})) {
    if (value > 0) {
      evParts.push(`${value} ${evMap[stat] || stat}`);
    }
  }
  
  if (evParts.length > 0) {
    lines.push(`EVs: ${evParts.join(' / ')}`);
  }
  
  if (data.nature) {
    const formattedNature = data.nature
      .toLowerCase()
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    lines.push(`${formattedNature} Nature`);
  }
  
  const ivParts: string[] = [];
  for (const [stat, value] of Object.entries(data.ivs || {})) {
    ivParts.push(`${value} ${evMap[stat] || stat}`);
  }
  
  if (ivParts.length > 0) {
    lines.push(`IVs: ${ivParts.join(' / ')}`);
  }
  
  for (const move of data.moves.slice(0, 4)) {
    if (move) {
      const formattedMove = move
        .toLowerCase()
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('-');
      lines.push(`-${formattedMove}`);
    }
  }
  
  return lines.join('\n');
}

export function parseDiscordCommand(command: string): DiscordTradeData | null {
  try {
    const match = command.match(/!t\s+(.+?)#(\d+)/);
    if (!match) return null;
    
    return {
      pokemonName: match[1],
      pokemonId: parseInt(match[2]),
      shiny: command.toLowerCase().includes('shiny'),
      alpha: command.toLowerCase().includes('alpha'),
      level: 100,
      nature: 'modest',
      ability: '',
      moves: [],
      ivs: {},
      evs: {},
      item: '',
      game: 'scarlet-violet'
    };
  } catch {
    return null;
  }
}

export function generateTradeRequestMessage(data: DiscordTradeData): string {
  let message = `**Trade Request**\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  message += `📦 **Pokémon:** ${data.pokemonName} #${data.pokemonId}\n`;
  
  if (data.shiny) message += `✨ Shiny\n`;
  if (data.alpha) message += `🌟 Alpha\n`;
  
  message += `📊 **Level:** ${data.level}\n`;
  message += `🎯 **Nature:** ${data.nature}\n`;
  message += `💪 **Ability:** ${data.ability}\n`;
  
  if (data.moves.length > 0) {
    message += `🔥 **Moves:** ${data.moves.join(', ')}\n`;
  }
  
  if (data.item && data.item !== 'none') {
    message += `🎒 **Item:** ${data.item}\n`;
  }
  
  message += `🎮 **Game:** ${data.game}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━\n`;
  
  return message;
}

export function generateTradeStatusMessage(status: 'pending' | 'accepted' | 'completed' | 'cancelled'): string {
  const messages: Record<string, string> = {
    pending: '⏳ Your trade request is pending...',
    accepted: '✅ Trade request accepted! Preparing your Pokémon...',
    completed: '🎉 Trade completed! Check your game for the Pokémon.',
    cancelled: '❌ Trade was cancelled. You can submit a new request.'
  };
  return messages[status] || '';
}
