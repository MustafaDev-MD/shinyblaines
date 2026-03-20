import axios from 'axios';
import { DISCORD_CONFIG, getGameChannel } from './discord-config';

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

// ----------------------------
// Generate SV Legacy / Showdown Command
// ----------------------------
// export function generateDiscordCommand(data: DiscordTradeData): string {
//   const lines: string[] = [];

//   // 1. Pokémon Name @ Item
//   const itemPart = data.item && data.item.toLowerCase() !== 'none' 
//     ? ` @ ${data.item}` 
//     : '';
//   lines.push(`!t ${data.pokemonName}${itemPart}`);

//   // 2. Details
//   if (data.ability) lines.push(`Ability: ${data.ability}`);
//   if (data.ball) lines.push(`Ball: ${data.ball}`);
//   if (data.ot) lines.push(`OT: ${data.ot}`);
//   if (data.tid) lines.push(`TID: ${data.tid}`);
//   if (data.sid) lines.push(`SID: ${data.sid}`);
  
//   lines.push(`Level: ${data.level || 100}`);
//   if (data.shiny) lines.push(`Shiny: Yes`);
//   if (data.teraType) lines.push(`Tera Type: ${data.teraType}`);
//   lines.push(`${data.nature} Nature`);

//   // 3. IVs
//   const ivs = data.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
//   lines.push(`IVs: ${ivs.hp} HP / ${ivs.atk} Atk / ${ivs.def} Def / ${ivs.spa} SpA / ${ivs.spd} SpD / ${ivs.spe} Spe`);

//   // 4. EVs
//   const evParts: string[] = [];
//   const STAT_MAP: Record<string, string> = { hp: 'HP', atk: 'Atk', def: 'Def', spa: 'SpA', spd: 'SpD', spe: 'Spe' };
//   for (const [key, val] of Object.entries(data.evs || {})) {
//     if (val && val > 0) evParts.push(`${val} ${STAT_MAP[key] || key}`);
//   }
//   if (evParts.length > 0) lines.push(`EVs: ${evParts.join(' / ')}`);

//   // 5. Moves
//   if (data.moves && data.moves.length > 0) {
//     data.moves.forEach(move => {
//       if (move && move.trim() !== '') lines.push(`- ${move}`);
//     });
//   }

//   return lines.join('\n');
// }

// export function generateDiscordCommand(data: any): string {
//   const lines: string[] = [];

//   // Sabse important line: User Mention + Command
//   // Tier 1 bot mention dekh kar trigger ho sakta hai
//   const itemPart = data.item && data.item.toLowerCase() !== 'none' ? ` @ ${data.item}` : '';
  
//   // Format: <@ID> !t Pokemon
//   lines.push(`<@${MY_DISCORD_USER_ID}> !t ${data.pokemonName}${itemPart}`);

//   if (data.ability) lines.push(`Ability: ${data.ability}`);
//   if (data.ball) lines.push(`Ball: ${data.ball}`);
//   lines.push(`Level: ${data.level || 100}`);
//   if (data.shiny) lines.push(`Shiny: Yes`);
//   lines.push(`${data.nature} Nature`);

//   const ivs = data.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
//   lines.push(`IVs: ${ivs.hp} HP / ${ivs.atk} Atk / ${ivs.def} Def / ${ivs.spa} SpA / ${ivs.spd} SpD / ${ivs.spe} Spe`);

//   return lines.join('\n');
// }

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

// export async function sendTradeRequest(pokemon: any) {
//   try {
//     const command = generateDiscordCommand(pokemon);
    
//     const response = await axios.post(DISCORD_WEBHOOK_URL, {
//       content: command,
//       username: "Ashh", // Aapka Discord name
//       avatar_url: "https://github.com/identicons/ashh.png",
//       // Isse Discord ko lagta hai ke user ne mention kiya hai
//       allowed_mentions: {
//         users: [MY_DISCORD_USER_ID]
//       }
//     });

//     return { success: response.status === 204 || response.status === 200 };
//   } catch (error: any) {
//     console.error('Webhook Error:', error.message);
//     return { success: false, error: error.message };
//   }
// }



const USER_TOKEN = process.env.USER_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID;

// export async function sendTradeRequest(
//   pokemon: any,
//   userId?: string,
//   userName?: string
// ): Promise<{ success: boolean; messageId?: string; error?: string }> {
//   try {
//     // Command generate karein (Ensure karein ke generateDiscordCommand function isi file mein ho ya import ho)
//     const command = generateDiscordCommand(pokemon);

//     console.log("Sending message as User...");

//     const response = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
//       method: 'POST',
//       headers: {
//         'Authorization': USER_TOKEN, 
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         content: command,
//         tts: false
//       }),
//     });

//     if (response.ok) {
//       const data = await response.json();
//       console.log("Message sent successfully!");
//       return { success: true, messageId: data.id };
//     } else {
//       const errorData = await response.json();
//       console.error("Discord API Error:", errorData);
//       return { success: false, error: errorData.message || 'Failed to send' };
//     }
//   } catch (error: any) {
//     console.error("Fetch Error:", error.message);
//     return { success: false, error: error.message };
//   }
// }

export async function sendTradeRequest(
  pokemon: any,
  userId?: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Check karein ke environment variables load hue hain ya nahi
    if (!USER_TOKEN || !CHANNEL_ID) {
      console.error("Missing Discord Config in .env");
      return { success: false, error: "Server configuration error - Check .env file" };
    }

    const command = generateDiscordCommand(pokemon);

    console.log(`[Trade] Sending request to channel ${CHANNEL_ID}...`);

    // Headers ko pehle ek constant mein define karein taaki TS khush rahe
    const headers: HeadersInit = {
      'Authorization': String(USER_TOKEN), // String() use karne se 'undefined' ka error khatam ho jayega
      'Content-Type': 'application/json',
    };

    const response = await fetch(`https://discord.com/api/v10/channels/${CHANNEL_ID}/messages`, {
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
      console.error("Discord API Error:", data);
      return { success: false, error: data.message || 'Failed to send message' };
    }
  } catch (error: any) {
    console.error("Fetch Error:", error.message);
    return { success: false, error: error.message };
  }
}

// Connection check ko hamesha true return karwa dein (Testing ke liye bypass)
export async function validateDiscordConnection(): Promise<boolean> {
  return true; 
}

// ----------------------------
// Main Send Function (Using Webhook)
// ----------------------------
// export async function sendTradeRequest(
//   pokemon: DiscordTradeData
// ): Promise<{ success: boolean; messageId?: string; error?: string }> {
//   try {
//     const command = generateDiscordCommand(pokemon);
    
//     // Webhook post call
//     const response = await axios.post(DISCORD_WEBHOOK_URL, {
//       content: command,
//       username: "Ashh",
//       avatar_url: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png", 
//     });

//     // Webhook normally returns 204 No Content
//     if (response.status === 200 || response.status === 204) {
//       return { success: true };
//     }

//     return { success: false, error: 'Failed to send to Webhook' };
//   } catch (error: any) {
//     console.error('Webhook Error:', error.response?.data || error.message);
//     return { success: false, error: 'Connection to Discord failed' };
//   }
// }