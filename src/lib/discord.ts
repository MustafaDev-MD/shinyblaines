import axios from 'axios';
import { DISCORD_CONFIG, getGameChannel } from './discord-config';
import { saveTradeToFirestore } from './firebase-service';

// ----------------------------
// Interfaces
// ----------------------------
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
  ball?: string;
  ot?: string;
  tid?: string;
  sid?: string;
}

const MY_DISCORD_USER_ID = "1421631145338081411";

// 1. WEBHOOK URL (Priority)
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1484208780144279693/CNlG5msycIWRVkzaH_TvGN438_rXkLYc1D9nK2-T6EUkI6iBK6FmgAFHFdpB66sKEfNp';

export function generateDiscordCommand(data: any): string {
  const lines: string[] = [];
  
  // Direct command (Bina kisi mention ke, kyunki aapke account se ja raha hai)
  lines.push(`!t ${data.pokemonName}`);

  if (data.ability) lines.push(`Ability: ${data.ability}`);
  if (data.item && data.item !== 'None') lines.push(`Held Item: ${data.item}`);
  lines.push(`Level: ${data.level || 100}`);
  if (data.shiny) lines.push(`Shiny: Yes`);
  lines.push(`${data.nature} Nature`);

  const ivs = data.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
  lines.push(`IVs: ${ivs.hp} HP / ${ivs.atk} Atk / ${ivs.def} Def / ${ivs.spa} SpA / ${ivs.spd} SpD / ${ivs.spe} Spe`);

  return lines.join('\n');
}

const USER_TOKEN = process.env.USER_TOKEN;
function getTargetChannel(game: string): string | undefined {
  const mapping: Record<string, string | undefined> = {
    'scarlet-violet': process.env.CHANNEL_ID_SV,
    'sword-shield': process.env.CHANNEL_ID_SWSH,
    'bdsp': process.env.CHANNEL_ID_BDSP,
    'legends-arceus': process.env.CHANNEL_ID_PLA,
    'legends-za': process.env.CHANNEL_ID_LZA,
  };

  // Agar game match ho toh wo ID return kare, warna default CHANNEL_ID use kare
  return mapping[game] || process.env.CHANNEL_ID;
}

// export async function sendTradeRequest(
//   pokemon: any,
//   userId?: string,
//   userName?: string
// ): Promise<{ success: boolean; messageId?: string; error?: string }> {
//   try {
//     // 1. Sahi Channel ID uthayein
//     const targetChannelId = getTargetChannel(pokemon.game);

//     if (!USER_TOKEN || !targetChannelId) {
//       console.error("Config Error:", { game: pokemon.game, hasToken: !!USER_TOKEN });
//       return { success: false, error: "Server configuration error - Missing Channel ID" };
//     }

//     const command = generateDiscordCommand(pokemon);

//     console.log(`[Trade] Sending ${pokemon.game} request to channel ${targetChannelId}...`);

//     const headers: HeadersInit = {
//       'Authorization': String(USER_TOKEN),
//       'Content-Type': 'application/json',
//     };

//     const response = await fetch(`https://discord.com/api/v10/channels/${targetChannelId}/messages`, {
//       method: 'POST',
//       headers: headers,
//       body: JSON.stringify({
//         content: command,
//         tts: false
//       }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       return { success: true, messageId: data.id };
//     } else {
//       console.error("Discord API Error:", data);
//       return { success: false, error: data.message || 'Failed to send message' };
//     }
//   } catch (error: any) {
//     console.error("Fetch Error:", error.message);
//     return { success: false, error: error.message };
//   }
// }

// export async function sendTradeRequest(
//   pokemon: any,
//   userId?: string, // Ye aapke paas useAuth() se aayega
//   userName?: string
// ): Promise<{ success: boolean; messageId?: string; error?: string }> {
//   try {
//     const targetChannelId = getTargetChannel(pokemon.game);
//     const command = generateDiscordCommand(pokemon);

//     const response = await fetch(`https://discord.com/api/v10/channels/${targetChannelId}/messages`, {
//       method: 'POST',
//       headers: {
//         'Authorization': String(process.env.USER_TOKEN),
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ content: command }),
//     });

//     const data = await response.json();

//     if (response.ok) {
//       // ✅ SUCCESS: Agar user logged in hai, toh database mein save karein
//       if (userId) {
//         // Background mein save karein, user ko wait na karwayein
//         saveTradeToFirestore(userId, pokemon).catch(console.error);
//       }
//       return { success: true, messageId: data.id };
//     } 
    
//     return { success: false, error: data.message };
//   } catch (error: any) {
//     return { success: false, error: error.message };
//   }
// }

export async function sendTradeRequest(
  pokemon: any,
  userId?: string, // Ye optional hai (null ho sakta hai agar guest hai)
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const targetChannelId = getTargetChannel(pokemon.game);
    const command = generateDiscordCommand(pokemon);

    // Discord API Call
    const response = await fetch(`https://discord.com/api/v10/channels/${targetChannelId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': String(process.env.USER_TOKEN),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: command }),
    });

    const data = await response.json();

    if (response.ok) {
      // ✅ SUCCESS: Data hamesha save karein
      // Agar userId nahi hai, toh "guest" pass karein
      const finalUserId = userId || "guest_" + Math.random().toString(36).substring(7);
      
      saveTradeToFirestore(finalUserId, {
        ...pokemon,
        isGuest: !userId, // Flag taaki pata chale ye guest trade hai
        userName: userName || "Guest Trainer",
        discordMessageId: data.id
      }).catch(console.error);

      return { success: true, messageId: data.id };
    } 
    
    return { success: false, error: data.message };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function validateDiscordConnection(): Promise<boolean> {
  return true; 
}
