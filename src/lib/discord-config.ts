export const DISCORD_CONFIG = {
  BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
  SERVER_ID: process.env.DISCORD_SERVER_ID,
  CHANNELS: {
    'legends-za': process.env.DISCORD_CHANNEL_LEGENDS_ZA,
    'scarlet-violet': process.env.DISCORD_CHANNEL_SCARLET_VIOLET,
    'sword-shield': process.env.DISCORD_CHANNEL_SWORD_SHIELD,
    'bdsp': process.env.DISCORD_CHANNEL_BDSP,
    'legends-arceus': process.env.DISCORD_CHANNEL_LEGENDS_ARCEUS,
    // 'trade-request': process.env.DISCORD_CHANNEL_ID,
  } as Record<string, string>,
  API_BASE_URL: 'https://discord.com/api/v10',
};

export function getGameChannel(game: string): string | undefined {
  return DISCORD_CONFIG.CHANNELS[game];
}

export function getAllGameChannels(): { game: string; channelId: string }[] {
  return Object.entries(DISCORD_CONFIG.CHANNELS).map(([game, channelId]) => ({
    game,
    channelId,
  }));
}
