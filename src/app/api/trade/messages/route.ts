// import { NextRequest, NextResponse } from 'next/server';
// import { getDmChannelForGame, getTargetChannel } from '@/lib/discord-api';

// interface LiveMessage {
//   id: string;
//   content: string;
//   author: string;
//   timestamp: string;
//   isBot: boolean;
// }

// const USER_TOKEN = process.env.USER_TOKEN;

// // ✅ Only recent messages
// function isRecentMessage(timestamp: string, maxAgeMinutes = 3): boolean {
//   const msgTime = new Date(timestamp).getTime();
//   const now = Date.now();
//   return (now - msgTime) / 1000 / 60 <= maxAgeMinutes;
// }

// // ✅ Fetch messages
// async function fetchChannelMessages(channelId: string, limit = 20): Promise<any[]> {
//   if (!USER_TOKEN || !channelId) return [];

//   const res = await fetch(
//     `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
//     {
//       headers: { Authorization: USER_TOKEN },
//       cache: 'no-store',
//     }
//   );

//   if (!res.ok) return [];
//   const data = await res.json();
//   return Array.isArray(data) ? data : [];
// }

// // ✅ Extract text
// function extractMessageText(msg: any): string {
//   const parts: string[] = [];

//   if (msg?.content) parts.push(msg.content);

//   if (Array.isArray(msg?.embeds)) {
//     for (const e of msg.embeds) {
//       if (e?.title) parts.push(e.title);
//       if (e?.description) parts.push(e.description);
//       if (Array.isArray(e?.fields)) {
//         for (const f of e.fields) {
//           parts.push(`${f.name}: ${f.value}`);
//         }
//       }
//     }
//   }

//   return parts.join('\n').trim();
// }

// // ✅ Extract link code
// function extractLinkCode(text: string): string | null {
//   const m = text.match(/\b(\d{4})[\s\-]?(\d{4})\b/);
//   return m ? `${m[1]} ${m[2]}` : null;
// }

// // ✅ Extract queue
// function extractQueuePosition(text: string): number | null {
//     const match = text.match(/position:\s*(\d+)/i);
//     return match ? Number(match[1]) : null;
//   }

// // ✅ Detect error
// function isErrorMessage(text: string): boolean {
//   const t = text.toLowerCase();
//   return (
//     t.includes('oops') ||
//     t.includes('error') ||
//     t.includes('failed') ||
//     t.includes('invalid') ||
//     t.includes('not available') ||
//     t.includes('unavailable') ||
//     t.includes('unable') ||
//     t.includes('canceled') ||
//     t.includes("wasn't able")
//   );
// }

// // ─────────────────────────────────────────
// // 🚀 MAIN API
// // ─────────────────────────────────────────
// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const game = searchParams.get('game') || 'scarlet-violet';

//   const dmChannelId = getDmChannelForGame(game);
//   const tradeChannelId = getTargetChannel(game);

//   let latestMessage: LiveMessage | null = null;
//   let isError = false;
//   let queuePosition: number | null = null;
//   let linkCode: string | null = null;

//   // 🔥 1. CHECK TRADE CHANNEL (MAIN SOURCE)
//   if (tradeChannelId) {
//     const messages = await fetchChannelMessages(tradeChannelId, 20);

//     for (const msg of messages) {
//         if (!msg.author?.bot) continue;
//         if (!isRecentMessage(msg.timestamp)) continue;
      
//         const content = extractMessageText(msg);
      
//         // always update latest message (UI ke liye)
//         if (!latestMessage) {
//           latestMessage = {
//             id: msg.id,
//             content,
//             author: msg.author.username,
//             timestamp: msg.timestamp,
//             isBot: true,
//           };
//         }
      
//         // 🎯 extract queue
//         if (!queuePosition) {
//           const q = extractQueuePosition(content);
//           if (q) queuePosition = q;
//         }
      
//         // 🎯 extract link code
//         if (!linkCode) {
//           const code = extractLinkCode(content);
//           if (code) linkCode = code;
//         }
      
//         // 🎯 error detect
//         if (isErrorMessage(content)) {
//           isError = true;
//         }
      
//         // 🚀 stop if everything mil gaya
//         if (linkCode && queuePosition) break;
//       }
//   }

//   // 🔥 2. DM fallback (only if no channel message)
//   if (!latestMessage && dmChannelId) {
//     const messages = await fetchChannelMessages(dmChannelId, 10);

//     for (const msg of messages) {
//       if (!isRecentMessage(msg.timestamp)) continue;

//       const content = extractMessageText(msg);

//       latestMessage = {
//         id: msg.id,
//         content,
//         author: msg.author?.username || 'Bot',
//         timestamp: msg.timestamp,
//         isBot: !!msg.author?.bot,
//       };

//       linkCode = extractLinkCode(content);
//       queuePosition = extractQueuePosition(content);

//       break;
//     }
//   }

//   return NextResponse.json({
//     success: true,
//     message: latestMessage,
//     linkCode,
//     queuePosition,
//     botIGN: latestMessage?.author || null,
//     isError,
//   });
// }



// import { NextRequest, NextResponse } from 'next/server';
// import { getDmChannelForGame, getTargetChannel } from '@/lib/discord-api';

// interface LiveMessage {
//   id: string;
//   content: string;
//   author: string;
//   timestamp: string;
//   isBot: boolean;
// }

// const USER_TOKEN = process.env.USER_TOKEN;

// // ✅ Only recent messages (3 min)
// function isRecentMessage(timestamp: string, maxAgeMinutes = 3): boolean {
//   const msgTime = new Date(timestamp).getTime();
//   const now = Date.now();
//   return (now - msgTime) / 1000 / 60 <= maxAgeMinutes;
// }

// // ✅ Fetch messages
// async function fetchChannelMessages(channelId: string, limit = 20): Promise<any[]> {
//   if (!USER_TOKEN || !channelId) return [];

//   const res = await fetch(
//     `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
//     {
//       headers: { Authorization: USER_TOKEN },
//       cache: 'no-store',
//     }
//   );

//   if (!res.ok) return [];
//   const data = await res.json();
//   return Array.isArray(data) ? data : [];
// }

// // ✅ Extract all readable text
// function extractMessageText(msg: any): string {
//   const parts: string[] = [];

//   if (msg?.content) parts.push(msg.content);

//   if (Array.isArray(msg?.embeds)) {
//     for (const e of msg.embeds) {
//       if (e?.title) parts.push(e.title);
//       if (e?.description) parts.push(e.description);
//       if (Array.isArray(e?.fields)) {
//         for (const f of e.fields) {
//           parts.push(`${f.name}: ${f.value}`);
//         }
//       }
//     }
//   }

//   return parts.join('\n').trim();
// }

// // ✅ Extract link code (1234 5678)
// function extractLinkCode(text: string): string | null {
//   const m = text.match(/\b(\d{4})[\s\-]?(\d{4})\b/);
//   return m ? `${m[1]} ${m[2]}` : null;
// }

// // ✅ Extract queue ONLY from "Position"
// function extractQueuePosition(text: string): number | null {
//   const match = text.match(/position:\s*(\d+)/i);
//   return match ? Number(match[1]) : null;
// }

// // ✅ Detect errors
// function isErrorMessage(text: string): boolean {
//   const t = text.toLowerCase();
//   return (
//     t.includes('oops') ||
//     t.includes('error') ||
//     t.includes('failed') ||
//     t.includes('invalid') ||
//     t.includes('not available') ||
//     t.includes('unavailable') ||
//     t.includes('unable') ||
//     t.includes('canceled') ||
//     t.includes("wasn't able")
//   );
// }

// // ─────────────────────────────────────────
// // 🚀 MAIN API
// // ─────────────────────────────────────────
// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);

//   const game = searchParams.get('game') || 'scarlet-violet';
//   const discordUser = searchParams.get('discordUser')?.toLowerCase() || '';

//   const dmChannelId = getDmChannelForGame(game);
//   const tradeChannelId = getTargetChannel(game);

//   let latestMessage: LiveMessage | null = null;
//   let isError = false;
//   let queuePosition: number | null = null;
//   let linkCode: string | null = null;
//   let botMessage: LiveMessage | null = null;

//   // 🔥 1. CHECK TRADE CHANNEL (MAIN)
//   if (tradeChannelId) {
//     const messages = await fetchChannelMessages(tradeChannelId, 25);

//     for (const msg of messages) {
//       if (!msg.author?.bot) continue;
//       if (!isRecentMessage(msg.timestamp)) continue;

//       const content = extractMessageText(msg);

//       // ✅ FILTER: only current user messages
//       if (
//         discordUser &&
//         msg.author?.username &&
//         msg.author.username.toLowerCase() !== discordUser
//       ) {
//         continue;
//       }

//       // ✅ set latest message (only first time)
//       if (!latestMessage) {
//         latestMessage = {
//           id: msg.id,
//           content,
//           author: msg.author.username,
//           timestamp: msg.timestamp,
//           isBot: true,
//         };
        
//       }

//       // ✅ extract queue
//       if (!queuePosition) {
//         const q = extractQueuePosition(content);
//         if (q) queuePosition = q;
//       }

//       // ✅ extract link code
//       if (!linkCode) {
//         const code = extractLinkCode(content);
//         if (code) linkCode = code;
//       }

//       // ✅ error detection
//       if (isErrorMessage(content)) {
//         isError = true;
//         queuePosition = null;
//         linkCode = null;
//         break; // 🚀 IMPORTANT
//       }

//       // 🚀 stop if everything mil gaya
//       if (linkCode && queuePosition) break;
//     }
//   }

//   // 🔥 2. DM fallback (for link code mostly)
//   if ((!linkCode || !latestMessage) && dmChannelId) {
//     const messages = await fetchChannelMessages(dmChannelId, 15);

//     for (const msg of messages) {
//       if (!isRecentMessage(msg.timestamp)) continue;

//       const content = extractMessageText(msg);

//       if (!latestMessage) {
//         latestMessage = {
//           id: msg.id,
//           content,
//           author: msg.author?.username || 'Bot',
//           timestamp: msg.timestamp,
//           isBot: !!msg.author?.bot,
//         };
//       }

//       if (!linkCode) {
//         const code = extractLinkCode(content);
//         if (code) linkCode = code;
//       }

//       if (!queuePosition) {
//         const q = extractQueuePosition(content);
//         if (q) queuePosition = q;
//       }

//       if (isErrorMessage(content)) {
//         isError = true;
//       }

//       if (linkCode && queuePosition) break;
//     }
//   }

//   return NextResponse.json({
//     success: true,
//     message: latestMessage,
//     linkCode: isError ? null : linkCode, // ✅ prevent infinite loading
//     queuePosition,
//     botIGN: latestMessage?.author || null,
//     isError,
//   });
// }
import { NextRequest, NextResponse } from 'next/server';
import { getDmChannelForGame, getTargetChannel } from '@/lib/discord-api';

const USER_TOKEN = process.env.USER_TOKEN;

interface LiveMessage {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  source: 'dm' | 'channel';
}

// ─────────────────────────────
// FETCH DISCORD MESSAGES
// ─────────────────────────────
async function fetchChannelMessages(channelId: string, limit = 25) {
  if (!USER_TOKEN || !channelId) return [];

  const res = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`,
    {
      headers: {
        Authorization: USER_TOKEN,
      },
      cache: 'no-store',
    }
  );

  if (!res.ok) return [];
  return await res.json();
}

// ─────────────────────────────
// TEXT EXTRACTOR
// ─────────────────────────────
function extractMessageText(msg: any): string {
  const parts: string[] = [];

  if (msg?.content) parts.push(msg.content);

  if (Array.isArray(msg?.embeds)) {
    for (const e of msg.embeds) {
      if (e?.title) parts.push(e.title);
      if (e?.description) parts.push(e.description);

      if (Array.isArray(e?.fields)) {
        for (const f of e.fields) {
          parts.push(`${f.name}: ${f.value}`);
        }
      }
    }
  }

  return parts.join('\n').trim();
}

// ─────────────────────────────
// LINK CODE
// ─────────────────────────────
function extractLinkCode(text: string): string | null {
  const m = text.match(/\b(\d{4})[\s\-]?(\d{4})\b/);
  return m ? `${m[1]} ${m[2]}` : null;
}

// ─────────────────────────────
// QUEUE POSITION
// ─────────────────────────────
function extractQueue(text: string): number | null {
  const m = text.match(/position:\s*(\d+)/i);
  return m ? Number(m[1]) : null;
}

// ─────────────────────────────
// ERROR DETECTOR (FUNCTION ONLY)
// ─────────────────────────────
function isErrorMessage(text: string): boolean {
  const t = text.toLowerCase();

  return (
    t.includes('error') ||
    t.includes('failed') ||
    t.includes('invalid') ||
    t.includes('unavailable') ||
    t.includes('unable') ||
    t.includes('oops') ||
    t.includes('canceled') ||
    t.includes("wasn't able")
  );
}

// ─────────────────────────────
// MAIN API
// ─────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const game = searchParams.get('game') || 'scarlet-violet';

  const dmChannelId = getDmChannelForGame(game);
  const tradeChannelId = getTargetChannel(game);

  let allMessages: LiveMessage[] = [];

  let queuePosition: number | null = null;
  let linkCode: string | null = null;

  // ✅ FIX: renamed variable (NO CONFLICT)
  let errorFound = false;

  // ─────────────────────────────
  // 1️⃣ CHANNEL MESSAGES
  // ─────────────────────────────
  if (tradeChannelId) {
    const channelMsgs = await fetchChannelMessages(tradeChannelId, 30);

    const formatted = channelMsgs.map((msg: any) => {
      const content = extractMessageText(msg);

      return {
        id: msg.id,
        content,
        author: msg.author?.username || 'Bot',
        timestamp: msg.timestamp,
        source: 'channel',
      };
    });

    allMessages.push(...formatted);
  }

  // ─────────────────────────────
  // 2️⃣ DM MESSAGES
  // ─────────────────────────────
  if (dmChannelId) {
    const dmMsgs = await fetchChannelMessages(dmChannelId, 30);

    const formatted = dmMsgs.map((msg: any) => {
      const content = extractMessageText(msg);

      return {
        id: msg.id,
        content,
        author: msg.author?.username || 'Bot',
        timestamp: msg.timestamp,
        source: 'dm',
      };
    });

    allMessages.push(...formatted);
  }

  // ─────────────────────────────
  // 3️⃣ SORT BY TIME
  // ─────────────────────────────
  allMessages.sort(
    (a, b) =>
      new Date(b.timestamp).getTime() -
      new Date(a.timestamp).getTime()
  );

  const latestMessage = allMessages[0] || null;

  // ─────────────────────────────
  // 4️⃣ PROCESS DATA
  // ─────────────────────────────
  for (const msg of allMessages) {
    const text = msg.content;

    if (!queuePosition) {
      queuePosition = extractQueue(text);
    }

    if (!linkCode) {
      linkCode = extractLinkCode(text);
    }

    // ✅ FIXED LINE (NO CONFLICT NOW)
    if (isErrorMessage(text)) {
      errorFound = true;
    }

    if (queuePosition && linkCode) break;
  }

  // ─────────────────────────────
  // 5️⃣ RESPONSE
  // ─────────────────────────────
  return NextResponse.json({
    success: true,

    messages: allMessages.slice(0, 10),
    message: latestMessage,

    queuePosition,
    linkCode: errorFound ? null : linkCode,

    isError: errorFound,
    botIGN: latestMessage?.author || null,
  });
}