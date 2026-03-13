import axios from 'axios';
import { DISCORD_CONFIG, getGameChannel } from './discord-config';
import { generateDiscordCommand, generateTradeRequestMessage, DiscordTradeData } from './discord';

const BOT_TOKEN = DISCORD_CONFIG.BOT_TOKEN;
const API_BASE_URL = DISCORD_CONFIG.API_BASE_URL;

const discordClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Authorization': `Bot ${BOT_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export interface TradeRequest {
  id: string;
  userId?: string;
  userName?: string;
  pokemon: DiscordTradeData;
  channelId: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  createdAt: Date;
}

export async function sendTradeRequest(
  pokemon: DiscordTradeData,
  userId?: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string; tradeId?: string }> {
  try {
    const channelId = getGameChannel(pokemon.game);
    
    if (!channelId) {
      return { success: false, error: `Invalid game: ${pokemon.game}` };
    }

    const tradeId = `TRADE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const command = generateDiscordCommand(pokemon);
    const embedMessage = generateTradeRequestMessage(pokemon);
    
    const fullMessage = `**Trade ID: ${tradeId}**\n${embedMessage}\n__Bot Command:__\n\`${command}\``;

    const response = await discordClient.post(`/channels/${channelId}/messages`, {
      content: fullMessage,
      embeds: [
        {
          title: `🎮 Trade Request - ${pokemon.pokemonName}`,
          description: embedMessage,
          color: 0x00ff00,
          fields: [
            {
              name: '📋 Command',
              value: `\`${command}\``,
              inline: true,
            },
            {
              name: '🎮 Game',
              value: pokemon.game,
              inline: true,
            },
            {
              name: '👤 Requested By',
              value: userName || 'Anonymous',
              inline: true,
            },
          ],
          footer: {
            text: `Trade ID: ${tradeId}`,
          },
          timestamp: new Date().toISOString(),
        },
      ],
    });

    if (response.status === 200) {
      return {
        success: true,
        messageId: response.data.id,
        tradeId,
      };
    }

    return { success: false, error: 'Failed to send message' };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    console.error('Discord API Error:', err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to communicate with Discord',
    };
  }
}

export async function getChannelMessages(channelId: string, limit: number = 10): Promise<unknown[]> {
  try {
    const response = await discordClient.get(`/channels/${channelId}/messages`, {
      params: { limit },
    });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    console.error('Failed to get messages:', err.response?.data || err.message);
    return [];
  }
}

export async function respondToTrade(
  messageId: string,
  channelId: string,
  tradeResponse: 'accepted' | 'completed' | 'cancelled',
  customMessage?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const statusMessages = {
      accepted: '✅ Trade request accepted! The Pokémon is being prepared.',
      completed: '🎉 Trade completed! Check your game for the Pokémon.',
      cancelled: '❌ Trade was cancelled. You can submit a new request.',
    };

    const responseMessage = customMessage || statusMessages[tradeResponse];

    await discordClient.post(`/channels/${channelId}/messages`, {
      content: responseMessage,
      message_reference: {
        message_id: messageId,
      },
    });

    return { success: true };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    console.error('Failed to respond to trade:', err.response?.data || err.message);
    return {
      success: false,
      error: err.response?.data?.message || 'Failed to respond to trade',
    };
  }
}

export function validateDiscordConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    discordClient.get('/users/@me')
      .then(() => {
        console.log('Discord bot connected successfully');
        resolve(true);
      })
      .catch((error: unknown) => {
        const err = error as { message?: string };
        console.error('Discord bot connection failed:', err.message);
        resolve(false);
      });
  });
}
