// import { NextRequest, NextResponse } from 'next/server';
// import { validatePokemon } from '@/lib/legality';
// import {
//   sendTradeRequest,
//   fetchTradeCodeFromDiscord,
//   fetchQueuePositionFromTradeChannel,
//   getDmChannelForGame,
//   getTargetChannel
// } from '@/lib/discord-api';
// import { getFirebaseDb } from '@/lib/firebase';
// import { 
//   doc, 
//   setDoc, 
//   collection, 
//   addDoc, 
//   serverTimestamp, 
//   query, 
//   getDocs, 
//   orderBy, 
//   arrayUnion, 
//   limit, 
//   updateDoc,
//   where
// } from 'firebase/firestore';

// async function syncTradeUpdateEverywhere(
//   db: any,
//   userId: string,
//   discordMessageId: string | undefined,
//   payload: Record<string, any>
// ) {
//   if (!discordMessageId || Object.keys(payload).length === 0) return;

//   try {
//     const globalTradesQ = query(
//       collection(db, 'trades'),
//       where('discordMessageId', '==', discordMessageId)
//     );
//     const globalTradesSnap = await getDocs(globalTradesQ);
//     for (const d of globalTradesSnap.docs) {
//       await updateDoc(d.ref, payload);
//     }

//     const userHistoryQ = query(
//       collection(db, 'users', userId, 'tradeHistory'),
//       where('discordMessageId', '==', discordMessageId)
//     );
//     const userHistorySnap = await getDocs(userHistoryQ);
//     for (const d of userHistorySnap.docs) {
//       await updateDoc(d.ref, payload);
//     }
//   } catch (e) {
//     console.error('Trade sync update error:', e);
//   }
// }

// // --- Firestore Save Logic ---
// async function internalSaveToFirestore(userId: string, tradeData: any) {
//   const db = getFirebaseDb();
//   if (!db || !userId) return;
//   try {
//     const historyRef = collection(db, 'users', userId, 'trades');
//     await addDoc(historyRef, {
//       ...tradeData,
//       createdAt: serverTimestamp(),
//     });
    
//     const userRef = doc(db, 'users', userId);
//     await setDoc(userRef, {
//       ownedPokemon: arrayUnion(tradeData.pokemonId?.toString()),
//       lastTrade: serverTimestamp()
//     }, { merge: true });
    
//     console.log("🔥 Firebase: Trade Saved with status:", tradeData.status);
//   } catch (err) {
//     console.error("Firebase Save Error:", err);
//   }
// }

// // --- POST: Start Trade (Initial Request) ---
// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { pokemon, userId } = body;
//     const effectiveUserId =
//       typeof userId === 'string' && userId.trim().length > 0
//         ? userId
//         : `guest_${Math.random().toString(36).slice(2, 11)}`;

//     if (!pokemon || !pokemon.pokemonId) {
//       return NextResponse.json({ success: false, error: 'Data incomplete' }, { status: 400 });
//     }

//     // 1. Legality Check
//     const validation = validatePokemon(pokemon as any);
//     if (!validation.isValid) {
//       return NextResponse.json({ success: false, error: validation.errors.join(' | ') }, { status: 400 });
//     }

//     // Bot DM karega, isliye shuruat mein code 'WAITING' hoga
//     const initialLinkCode = 'WAITING';
//     const queuePosition = null;

//     // 2. Discord Send (Bot ko command bhejna)
//     let discordSuccess = false;
//     let discordMessageId = null;
//     try {
//       const result = await sendTradeRequest(pokemon);
//       if (result.success) {
//         discordSuccess = true;
//         discordMessageId = result.messageId;
//       }
//     } catch (e) { 
//       console.error("Discord Send Error:", e); 
//     }

//     // 3. Save to Firebase
//     await internalSaveToFirestore(effectiveUserId, {
//       ...pokemon,
//       linkCode: initialLinkCode,
//       status: 'pending',
//       queuePosition,
//       discordMessageId: discordMessageId
//     });

//     return NextResponse.json({
//       success: discordSuccess,
//       userId: effectiveUserId,
//       messageId: discordMessageId,
//       linkCode: initialLinkCode,
//       queuePosition,
//       message: discordSuccess ? 'Trade Started! Check Bot DM.' : 'Discord failed to send request.'
//     });

//   } catch (error: any) {
//     console.error("POST Route Error:", error);
//     return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
//   }
// }

// // --- GET: Polling for Bot DM (Link Code Fetcher) ---
// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const userId = searchParams.get('userId');
//   const discordUser = searchParams.get('discordUser');

//   if (!userId) {
//     return NextResponse.json({ error: "Missing userId" }, { status: 400 });
//   }

//   const db = getFirebaseDb();
//   if (!db) return NextResponse.json({ error: "DB Error" }, { status: 500 });

//   try {
//     // 1. Firestore se latest 'pending' trade nikalein
//     const tradesRef = collection(db, 'users', userId, 'trades');
//     const q = query(tradesRef, orderBy('createdAt', 'desc'), limit(1));
//     const snap = await getDocs(q);
    
//     if (snap.empty) return NextResponse.json({ success: true, data: null });

//     let latestTrade = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;

//     // 2. Agar code abhi bhi 'WAITING' hai, toh Bot ka Personal DM check karein
//     if (latestTrade.linkCode === 'WAITING') {
//       const game = String(latestTrade.game || '');
//       const tradeChannelId = getTargetChannel(game);
//       // Selected game ke hisab se DM channel choose karein
//       const dmChannelId = getDmChannelForGame(game);
//       const tradeDoc = doc(db, 'users', userId, 'trades', latestTrade.id);
//       const updatePayload: Record<string, any> = {};

//       // Queue position channel se aati hai (DM se nahi)
//       if (tradeChannelId) {
//         const queueResult = await fetchQueuePositionFromTradeChannel(tradeChannelId);
//         if (queueResult.success && typeof queueResult.queuePosition === 'number') {
//           updatePayload.queuePosition = queueResult.queuePosition;
//           latestTrade.queuePosition = queueResult.queuePosition;
//         }
//       }
      
//       if (dmChannelId) {
//         // fetchTradeCodeFromDiscord ab DM channel check karega
//         const createdAtIso =
//           typeof latestTrade.createdAt?.toDate === 'function'
//             ? latestTrade.createdAt.toDate().toISOString()
//             : undefined;
//         const discordResult = await fetchTradeCodeFromDiscord(
//           dmChannelId,
//           discordUser || '',
//           createdAtIso
//         );

//         if (discordResult.success) {
//           if (discordResult.linkCode) {
//             updatePayload.linkCode = discordResult.linkCode;
//             updatePayload.status = 'ready';
//             updatePayload.botIGN = discordResult.botIGN || 'Bot';

//             latestTrade.linkCode = discordResult.linkCode;
//             latestTrade.status = 'ready';
//             latestTrade.botIGN = discordResult.botIGN;
//           }

//         }
//       }

//       if (Object.keys(updatePayload).length > 0) {
//         await updateDoc(tradeDoc, updatePayload);
//         await syncTradeUpdateEverywhere(
//           db,
//           userId,
//           latestTrade.discordMessageId,
//           updatePayload
//         );
//       }
//     }

//     return NextResponse.json({ success: true, data: latestTrade });

//   } catch (err: any) {
//     console.error("GET Route Polling Error:", err);
//     return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { validatePokemon } from '@/lib/legality';
import {
  sendTradeRequest,
  fetchTradeCodeFromDiscord,
  fetchQueuePositionFromTradeChannel,
  getDmChannelForGame,
  getTargetChannel
} from '@/lib/discord-api';
import { getFirebaseDb } from '@/lib/firebase';
import {
  doc,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  getDocs,
  orderBy,
  arrayUnion,
  limit,
  updateDoc,
  where
} from 'firebase/firestore';

async function syncTradeUpdateEverywhere(
  db: any,
  userId: string,
  discordMessageId: string | undefined,
  payload: Record<string, any>
) {
  if (!discordMessageId || Object.keys(payload).length === 0) return;

  try {
    const globalTradesQ = query(
      collection(db, 'trades'),
      where('discordMessageId', '==', discordMessageId)
    );
    const globalTradesSnap = await getDocs(globalTradesQ);
    for (const d of globalTradesSnap.docs) {
      await updateDoc(d.ref, payload);
    }

    const userHistoryQ = query(
      collection(db, 'users', userId, 'tradeHistory'),
      where('discordMessageId', '==', discordMessageId)
    );
    const userHistorySnap = await getDocs(userHistoryQ);
    for (const d of userHistorySnap.docs) {
      await updateDoc(d.ref, payload);
    }
  } catch (e) {
    console.error('Trade sync update error:', e);
  }
}

// --- Firestore Save Logic ---
async function internalSaveToFirestore(userId: string, tradeData: any) {
  const db = getFirebaseDb();
  if (!db || !userId) return;
  try {
    const historyRef = collection(db, 'users', userId, 'trades');
    await addDoc(historyRef, {
      ...tradeData,
      createdAt: serverTimestamp(),
    });

    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ownedPokemon: arrayUnion(tradeData.pokemonId?.toString()),
      lastTrade: serverTimestamp()
    }, { merge: true });

    console.log('🔥 Firebase: Trade Saved with status:', tradeData.status);
  } catch (err) {
    console.error('Firebase Save Error:', err);
  }
}

// ─── Build the Discord bot command string ─────────────────────────────────────
// All optional fields (ability, OT, TID, SID, nickname, moves, ball, teraType)
// are only appended when they have a non-empty value.
function buildBotCommand(pokemon: any): string {
  const lines: string[] = [];

  // Mandatory first line
  lines.push(`!t ${pokemon.pokemonName}`);

  // Optional identity fields
  if (pokemon.nickname?.trim())  lines.push(`Nickname: ${pokemon.nickname.trim()}`);
  if (pokemon.shiny)             lines.push(`Shiny: Yes`);

  // ✅ Ability is OPTIONAL — omit entirely if empty so bot picks default
  if (pokemon.ability?.trim())   lines.push(`Ability: ${pokemon.ability.trim()}`);

  if (pokemon.ball?.trim())      lines.push(`Ball: ${pokemon.ball.trim()}`);

  lines.push(`Language: English`);

  if (pokemon.ot?.trim())        lines.push(`OT: ${pokemon.ot.trim()}`);
  if (pokemon.tid?.trim())       lines.push(`TID: ${pokemon.tid.trim()}`);
  if (pokemon.sid?.trim())       lines.push(`SID: ${pokemon.sid.trim()}`);

  lines.push(`Level: ${pokemon.level ?? 100}`);

  if (pokemon.teraType?.trim())  lines.push(`Tera Type: ${pokemon.teraType.trim()}`);

  lines.push(`${pokemon.nature ?? 'Modest'} Nature`);

  // Moves — only non-empty entries
  const moves: string[] = (pokemon.moves ?? []).filter((m: string) => m?.trim());
  moves.forEach(m => lines.push(`Move: ${m.trim()}`));

  // IVs — always included
  const ivs = pokemon.ivs ?? { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };
  lines.push(
    `IVs: ${ivs.hp} HP / ${ivs.atk} atk / ${ivs.def} def / ${ivs.spa} spa / ${ivs.spd} spd / ${ivs.spe} spe`
  );

  return lines.join('\n');
}

// --- POST: Start Trade ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pokemon, userId } = body;

    const effectiveUserId =
      typeof userId === 'string' && userId.trim().length > 0
        ? userId
        : `guest_${Math.random().toString(36).slice(2, 11)}`;

    if (!pokemon || !pokemon.pokemonId) {
      return NextResponse.json({ success: false, error: 'Data incomplete' }, { status: 400 });
    }

    // 1. Legality Check (ability optional — pass through as-is)
    const validation = validatePokemon(pokemon as any);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(' | ') },
        { status: 400 }
      );
    }

    // 2. Build the bot command (with optional ability logic)
    const botCommand = buildBotCommand(pokemon);
    console.log('📤 Bot command:\n', botCommand);

    const initialLinkCode = 'WAITING';

    // 3. Send to Discord
    let discordSuccess = false;
    let discordMessageId = null;
    try {
      // Pass the pre-built command to sendTradeRequest
      // (assumes sendTradeRequest accepts either a pokemon object or a raw command string)
      const result = await sendTradeRequest(pokemon, botCommand);
      if (result.success) {
        discordSuccess = true;
        discordMessageId = result.messageId;
      }
    } catch (e) {
      console.error('Discord Send Error:', e);
    }

    // 4. Save to Firebase
    await internalSaveToFirestore(effectiveUserId, {
      ...pokemon,
      botCommand,
      linkCode: initialLinkCode,
      status: 'pending',
      queuePosition: null,
      discordMessageId,
    });

    return NextResponse.json({
      success: discordSuccess,
      userId: effectiveUserId,
      messageId: discordMessageId,
      linkCode: initialLinkCode,
      queuePosition: null,
      message: discordSuccess
        ? 'Trade Started! Check Bot DM.'
        : 'Discord failed to send request.',
    });

  } catch (error: any) {
    console.error('POST Route Error:', error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

// --- GET: Polling for Bot DM (Link Code Fetcher) ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const discordUser = searchParams.get('discordUser');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const db = getFirebaseDb();
  if (!db) return NextResponse.json({ error: 'DB Error' }, { status: 500 });

  try {
    const tradesRef = collection(db, 'users', userId, 'trades');
    const q = query(tradesRef, orderBy('createdAt', 'desc'), limit(1));
    const snap = await getDocs(q);

    if (snap.empty) return NextResponse.json({ success: true, data: null });

    let latestTrade = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;

    if (latestTrade.linkCode === 'WAITING') {
      const game = String(latestTrade.game || '');
      const tradeChannelId = getTargetChannel(game);
      const dmChannelId = getDmChannelForGame(game);
      const tradeDoc = doc(db, 'users', userId, 'trades', latestTrade.id);
      const updatePayload: Record<string, any> = {};

      if (tradeChannelId) {
        const queueResult = await fetchQueuePositionFromTradeChannel(tradeChannelId);
        if (queueResult.success && typeof queueResult.queuePosition === 'number') {
          updatePayload.queuePosition = queueResult.queuePosition;
          latestTrade.queuePosition = queueResult.queuePosition;
        }
      }

      if (dmChannelId) {
        const createdAtIso =
          typeof latestTrade.createdAt?.toDate === 'function'
            ? latestTrade.createdAt.toDate().toISOString()
            : undefined;

        const discordResult = await fetchTradeCodeFromDiscord(
          dmChannelId,
          discordUser || '',
          createdAtIso
        );

        if (discordResult.success && discordResult.linkCode) {
          updatePayload.linkCode = discordResult.linkCode;
          updatePayload.status = 'ready';
          updatePayload.botIGN = discordResult.botIGN || 'Bot';

          latestTrade.linkCode = discordResult.linkCode;
          latestTrade.status = 'ready';
          latestTrade.botIGN = discordResult.botIGN;
        }
      }

      if (Object.keys(updatePayload).length > 0) {
        await updateDoc(tradeDoc, updatePayload);
        await syncTradeUpdateEverywhere(db, userId, latestTrade.discordMessageId, updatePayload);
      }
    }

    return NextResponse.json({ success: true, data: latestTrade });

  } catch (err: any) {
    console.error('GET Route Polling Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}