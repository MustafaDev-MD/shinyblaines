import axios from 'axios';
import { DiscordTradeData } from './discord';
import { saveTradeToFirestore } from './firebase-service';

// --- CONFIG ---
const USER_TOKEN = process.env.USER_TOKEN;

function buildAuthHeader(token: string, useBotPrefix: boolean) {
  return useBotPrefix ? `Bot ${token}` : token;
}

async function fetchDiscordWithAuthRetry(url: string, init: RequestInit) {
  if (!USER_TOKEN) return { response: null as Response | null, data: null as any };

  let response = await fetch(url, {
    ...init,
    headers: {
      ...(init.headers || {}),
      Authorization: buildAuthHeader(USER_TOKEN, false),
    },
    cache: 'no-store',
  });

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // If token likely needs bot prefix, retry once.
  if (response.status === 401 && !String(USER_TOKEN).startsWith('Bot ')) {
    response = await fetch(url, {
      ...init,
      headers: {
        ...(init.headers || {}),
        Authorization: buildAuthHeader(USER_TOKEN, true),
      },
      cache: 'no-store',
    });
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  return { response, data };
}

function extractCodeFromText(text: string): string | null {
  if (!text) return null;
  const match = text.match(/\b(\d{4})[\s-]?(\d{4})\b/);
  if (!match) return null;
  return `${match[1]} ${match[2]}`;
}

function extractQueuePositionFromText(text: string): number | null {
  if (!text) return null;
  const patterns = [
    /current\s*position\s*[:#-]?\s*(\d{1,4})/i,
    /queue\s*(?:position)?\s*[:#-]?\s*(\d{1,4})/i,
    /position\s*(?:in)?\s*queue\s*[:#-]?\s*(\d{1,4})/i,
    /#\s*(\d{1,4})\s*(?:in\s*)?queue/i,
  ];

  for (const re of patterns) {
    const match = text.match(re);
    if (match?.[1]) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

function extractCodeFromMessage(msg: any): string | null {
  const fromContent = extractCodeFromText(String(msg?.content || ''));
  if (fromContent) return fromContent;

  const embeds = Array.isArray(msg?.embeds) ? msg.embeds : [];
  for (const embed of embeds) {
    const titleCode = extractCodeFromText(String(embed?.title || ''));
    if (titleCode) return titleCode;
    const descCode = extractCodeFromText(String(embed?.description || ''));
    if (descCode) return descCode;

    const fields = Array.isArray(embed?.fields) ? embed.fields : [];
    for (const field of fields) {
      const fieldCode = extractCodeFromText(
        `${String(field?.name || '')}\n${String(field?.value || '')}`
      );
      if (fieldCode) return fieldCode;
    }
  }

  return null;
}

function extractQueuePositionFromMessage(msg: any): number | null {
  const contentPos = extractQueuePositionFromText(String(msg?.content || ''));
  if (contentPos) return contentPos;

  const embeds = Array.isArray(msg?.embeds) ? msg.embeds : [];
  for (const embed of embeds) {
    const titlePos = extractQueuePositionFromText(String(embed?.title || ''));
    if (titlePos) return titlePos;
    const descPos = extractQueuePositionFromText(String(embed?.description || ''));
    if (descPos) return descPos;

    const fields = Array.isArray(embed?.fields) ? embed.fields : [];
    for (const field of fields) {
      const fieldPos = extractQueuePositionFromText(
        `${String(field?.name || '')}\n${String(field?.value || '')}`
      );
      if (fieldPos) return fieldPos;
    }
  }
  return null;
}

// --- HELPERS ---
// Ensure karein ke aapke .env mein yehi naam hain
export function getTargetChannel(game: string): string | undefined {
  const mapping: Record<string, string | undefined> = {
    'scarlet-violet': process.env.DISCORD_CHANNEL_SCARLET_VIOLET,
    'sword-shield': process.env.DISCORD_CHANNEL_SWORD_SHIELD,
    'bdsp': process.env.DISCORD_CHANNEL_BDSP,
    'legends-arceus': process.env.DISCORD_CHANNEL_LEGENDS_ARCEUS,
    'legends-za': process.env.DISCORD_CHANNEL_LEGENDS_ZA,
  };

  // Agar specific game na mile toh default channel (optional)
  return mapping[game] || process.env.DISCORD_CHANNEL_ID;
}

// Game-wise DM channels (bot-specific link code inbox)
export function getDmChannelForGame(game: string): string | undefined {
  const mapping: Record<string, string | undefined> = {
    // Preferred explicit DM keys
    'scarlet-violet': process.env.DISCORD_DM_CHANNEL_SCARLET_VIOLET,
    'sword-shield': process.env.DISCORD_DM_CHANNEL_SWORD_SHIELD,
    'bdsp': process.env.DISCORD_DM_CHANNEL_BDSP,
    'legends-arceus': process.env.DISCORD_DM_CHANNEL_LEGENDS_ARCEUS,
    'legends-za': process.env.DISCORD_DM_CHANNEL_LEGENDS_ZA,
  };

  // Backward-compatible fallback for your current .env.local naming
  const legacyMapping: Record<string, string | undefined> = {
    'scarlet-violet': process.env.SCARLET_VIOLET,
    'sword-shield': process.env.SWORD_SHIELD,
    'bdsp': process.env.BDSP,
    'legends-arceus': process.env.LEGENDS_ARCEUS || process.env.LEGENDS_ARCEU,
    'legends-za': process.env.LEGENDS_ZA,
  };

  return (
    mapping[game] ||
    legacyMapping[game] ||
    process.env.DISCORD_DM_CHANNEL_ID
  );
}

export function generateDiscordCommand(data: any): string {
  const lines: string[] = [`!t ${data.pokemonName}`];
  if (data.nickname) lines.push(`Nickname: ${data.nickname}`);
  if (data.ot) lines.push(`OT: ${data.ot}`);
  if (data.tid) lines.push(`TID: ${data.tid}`);
  if (data.sid) lines.push(`SID: ${data.sid}`);
  if (data.ability) lines.push(`Ability: ${data.ability}`);
  if (data.ball) lines.push(`Ball: ${data.ball}`);
  if (data.item && data.item !== 'None') lines.push(`Held Item: ${data.item}`);
  lines.push(`Level: ${data.level || 100}`);
  if (data.teraType) lines.push(`Tera Type: ${data.teraType}`);
  if (data.shiny) lines.push(`Shiny: Yes`);
  lines.push(`${data.nature} Nature`);
  if (Array.isArray(data.moves)) {
    data.moves.filter(Boolean).forEach((m: string) => lines.push(`Move: ${m}`));
  }
  
  const ivs = data.ivs || { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
  lines.push(`IVs: ${ivs.hp} HP / ${ivs.atk} Atk / ${ivs.def} Def / ${ivs.spa} SpA / ${ivs.spd} SpD / ${ivs.spe} Spe`);
  
  return lines.join('\n');
}

// --- MAIN FUNCTIONS ---

// 1. Send Request to Discord
export async function sendTradeRequest(
  pokemon: any,
  userId?: string,
  userName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const targetChannelId = getTargetChannel(pokemon.game);

    if (!USER_TOKEN || !targetChannelId) {
      console.error("❌ Config Missing:", { game: pokemon.game, channel: targetChannelId });
      return { success: false, error: "Discord Channel ID or User Token is missing in .env" };
    }

    const command = generateDiscordCommand(pokemon);

    const { response, data } = await fetchDiscordWithAuthRetry(
      `https://discord.com/api/v10/channels/${targetChannelId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: command }),
      }
    );

    if (!response) {
      return { success: false, error: 'USER_TOKEN missing' };
    }

    if (response.ok) {
      // Background mein save karein
      const finalUserId = userId || "guest_" + Math.random().toString(36).substring(7);
      saveTradeToFirestore(finalUserId, {
        ...pokemon,
        userName: userName || "Guest Trainer",
        discordMessageId: data.id,
        status: 'pending'
      }).catch(console.error);

      return { success: true, messageId: data.id };
    } else {
      return { success: false, error: data.message || "Discord API Error" };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// 2. Fetch Link Code from DM
export async function fetchTradeCodeFromDiscord(
  dmChannelId: string,
  discordUser: string,
  createdAfterIso?: string
) {
  try {
    const { response, data } = await fetchDiscordWithAuthRetry(
      `https://discord.com/api/v10/channels/${dmChannelId}/messages?limit=50`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
      }
    );

    if (!response?.ok) {
      console.error('Discord DM fetch failed:', response?.status, data);
      return { success: false, error: data?.message || 'Discord DM fetch failed' };
    }

    const messages = data;
    if (!Array.isArray(messages)) return { success: false };

    // Newest first messages: pick latest queue and first valid code
    let latestQueuePosition: number | null = null;
    for (const msg of messages) {
      if (createdAfterIso) {
        const msgMs = Date.parse(String(msg?.timestamp || ''));
        const minMs = Date.parse(createdAfterIso);
        if (Number.isFinite(msgMs) && Number.isFinite(minMs) && msgMs < minMs) {
          continue;
        }
      }
      if (latestQueuePosition === null) {
        latestQueuePosition = extractQueuePositionFromMessage(msg);
      }
      const code = extractCodeFromMessage(msg);
      if (code) {
        return {
          success: true,
          linkCode: code,
          queuePosition: latestQueuePosition ?? undefined,
          botIGN: String(msg?.author?.username || 'Bot')
        };
      }
    }

    if (latestQueuePosition !== null) {
      return {
        success: true,
        queuePosition: latestQueuePosition,
      };
    }

    return { success: false };
  } catch (err) {
    console.error('fetchTradeCodeFromDiscord error:', err);
    return { success: false };
  }
}

// 3. Fetch queue position from trade channel (not DM)
export async function fetchQueuePositionFromTradeChannel(channelId: string) {
  try {
    const { response, data } = await fetchDiscordWithAuthRetry(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=50`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response?.ok) {
      console.error('Discord trade-channel fetch failed:', response?.status, data);
      return { success: false };
    }

    if (!Array.isArray(data)) return { success: false };

    for (const msg of data) {
      const queuePosition = extractQueuePositionFromMessage(msg);
      if (typeof queuePosition === 'number') {
        return { success: true, queuePosition };
      }
    }

    return { success: false };
  } catch (err) {
    console.error('fetchQueuePositionFromTradeChannel error:', err);
    return { success: false };
  }
}

export async function validateDiscordConnection(): Promise<boolean> {
  return !!USER_TOKEN;
}