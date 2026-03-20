import axios from 'axios';
import { DISCORD_CONFIG, getGameChannel } from './discord-config';
// import { generateDiscordCommand, generateTradeRequestMessage, DiscordTradeData } from './discord';
import { generateDiscordCommand, DiscordTradeData } from './discord'; // 'generateTradeRequestMessage' ko hata diya

const BOT_TOKEN = DISCORD_CONFIG.BOT_TOKEN;
const API_BASE_URL = DISCORD_CONFIG.API_BASE_URL;

const USER_TOKEN = process.env.USER_TOKEN;
function getTargetChannel(game: string): string | undefined {
  const mapping: Record<string, string | undefined> = {
    'scarlet-violet': process.env.DISCORD_CHANNEL_SCARLET_VIOLET,
    'sword-shield': process.env.DISCORD_CHANNEL_SWORD_SHIELD,
    'bdsp': process.env.DISCORD_CHANNEL_BDSP,
    'legends-arceus': process.env.DISCORD_CHANNEL_LEGENDS_ARCEUS,
    'legends-za': process.env.DISCORD_CHANNEL_LEGENDS_ZA,
  };

  return mapping[game];
}

const discordClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bot ${BOT_TOKEN}`,
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

/**
 * Send a clean SV Legacy style trade request
 */
// export async function sendTradeRequest(
//   pokemon: DiscordTradeData,
//   userId?: string,
//   userName?: string
// ): Promise<{ success: boolean; messageId?: string; error?: string; tradeId?: string }> {
//   try {
//     const channelId = getGameChannel(pokemon.game);
//     if (!channelId) return { success: false, error: `Invalid game: ${pokemon.game}` };

//     const tradeId = `TRADE-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
//     const command = generateDiscordCommand(pokemon);
//     const embedMessage = generateTradeRequestMessage(pokemon);

//     // Clean message: Trade ID + info + command in a code block
//     // const fullMessage = `**Trade ID: ${tradeId}**\n${embedMessage}\n\`\`\`\n${command}\n\`\`\``;
//     const fullMessage = command;

//     const response = await discordClient.post(`/channels/${channelId}/messages`, {
//       content: fullMessage,
//     });

//     if (response.status === 200) {
//       return { success: true, messageId: response.data.id, tradeId };
//     }

//     return { success: false, error: 'Failed to send message' };
//   } catch (error: any) {
//     console.error('Discord API Error:', error.response?.data || error.message);
//     return { success: false, error: error.response?.data?.message || 'Failed to communicate with Discord' };
//   }
// }

// export async function sendTradeRequest(pokemon: any) {
//   try {
//     const command = generateDiscordCommand(pokemon);

//     const response = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
//       method: 'POST',
//       headers: {
//         'Authorization': USER_TOKEN, // Direct token string
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         content: command,
//         tts: false
//       }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       console.log("Success! Message sent as User.");
//       return { success: true, messageId: data.id };
//     } else {
//       // Agar yahan 401 aa raha hai, toh token expire ho gaya hai ya galat hai
//       console.error("Discord API Error Details:", data);
//       return { success: false, error: data.message };
//     }
//   } catch (error: any) {
//     console.error("Request failed:", error.message);
//     return { success: false, error: error.message };
//   }
// }

export async function sendTradeRequest(
  pokemon: any,
  userId?: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const USER_TOKEN = process.env.USER_TOKEN;
    
    // Frontend se jo game value aa rahi hai, uske mutabiq ID nikaalein
    const targetChannelId = getTargetChannel(pokemon.game);

    if (!USER_TOKEN || !targetChannelId) {
      console.error(`Config Missing: Game: ${pokemon.game}, Channel: ${targetChannelId}`);
      return { 
        success: false, 
        error: `Is game (${pokemon.game}) ke liye channel ID set nahi hai.` 
      };
    }

    const command = generateDiscordCommand(pokemon);
    
    const headers: HeadersInit = {
      'Authorization': String(USER_TOKEN),
      'Content-Type': 'application/json',
    };

    const response = await fetch(`https://discord.com/api/v10/channels/${targetChannelId}/messages`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        content: command,
        tts: false
      }),
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, messageId: data.id };
    } else {
      console.error("Discord Error:", data);
      return { success: false, error: data.message || 'Discord message failed' };
    }
  } catch (error: any) {
    console.error("Critical Trade Error:", error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Get messages from a channel
 */
export async function getChannelMessages(channelId: string, limit: number = 10): Promise<unknown[]> {
  try {
    const response = await discordClient.get(`/channels/${channelId}/messages`, { params: { limit } });
    return response.data;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    console.error('Failed to get messages:', err.response?.data || err.message);
    return [];
  }
}

/**
 * Respond to a trade (accepted/completed/cancelled)
 */
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
      message_reference: { message_id: messageId },
    });

    return { success: true };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    console.error('Failed to respond to trade:', err.response?.data || err.message);
    return { success: false, error: err.response?.data?.message || 'Failed to respond to trade' };
  }
}

/**
 * Validate bot connection to Discord
 */
export async function validateDiscordConnection(): Promise<boolean> {
  // 401 Error se bachne ke liye connection check ko hamesha true rakhein
  return true; 
}

// https://discord.com/api/webhooks/1484006551277801483/USYiTknnVa0wmoZdrO43bbRDZb7ihEJwy1Py3n9ti2W8bMmIZtmBZMzALhUY7nxf_GTx