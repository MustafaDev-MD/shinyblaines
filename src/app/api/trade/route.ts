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
    
    console.log("🔥 Firebase: Trade Saved with status:", tradeData.status);
  } catch (err) {
    console.error("Firebase Save Error:", err);
  }
}

// --- POST: Start Trade (Initial Request) ---
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pokemon, userId } = body;

    if (!pokemon || !pokemon.pokemonId) {
      return NextResponse.json({ success: false, error: 'Data incomplete' }, { status: 400 });
    }

    // 1. Legality Check
    const validation = validatePokemon(pokemon as any);
    if (!validation.isValid) {
      return NextResponse.json({ success: false, error: validation.errors.join(' | ') }, { status: 400 });
    }

    // Bot DM karega, isliye shuruat mein code 'WAITING' hoga
    const initialLinkCode = 'WAITING';
    const queuePosition = null;

    // 2. Discord Send (Bot ko command bhejna)
    let discordSuccess = false;
    let discordMessageId = null;
    try {
      const result = await sendTradeRequest(pokemon);
      if (result.success) {
        discordSuccess = true;
        discordMessageId = result.messageId;
      }
    } catch (e) { 
      console.error("Discord Send Error:", e); 
    }

    // 3. Save to Firebase
    if (userId) {
      await internalSaveToFirestore(userId, {
        ...pokemon,
        linkCode: initialLinkCode,
        status: 'pending',
        queuePosition,
        discordMessageId: discordMessageId
      });
    }

    return NextResponse.json({
      success: discordSuccess,
      messageId: discordMessageId,
      linkCode: initialLinkCode,
      queuePosition,
      message: discordSuccess ? 'Trade Started! Check Bot DM.' : 'Discord failed to send request.'
    });

  } catch (error: any) {
    console.error("POST Route Error:", error);
    return NextResponse.json({ success: false, error: 'Server Error' }, { status: 500 });
  }
}

// --- GET: Polling for Bot DM (Link Code Fetcher) ---
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  const discordUser = searchParams.get('discordUser');

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const db = getFirebaseDb();
  if (!db) return NextResponse.json({ error: "DB Error" }, { status: 500 });

  try {
    // 1. Firestore se latest 'pending' trade nikalein
    const tradesRef = collection(db, 'users', userId, 'trades');
    const q = query(tradesRef, orderBy('createdAt', 'desc'), limit(1));
    const snap = await getDocs(q);
    
    if (snap.empty) return NextResponse.json({ success: true, data: null });

    let latestTrade = { id: snap.docs[0].id, ...snap.docs[0].data() } as any;

    // 2. Agar code abhi bhi 'WAITING' hai, toh Bot ka Personal DM check karein
    if (latestTrade.linkCode === 'WAITING') {
      const game = String(latestTrade.game || '');
      const tradeChannelId = getTargetChannel(game);
      // Selected game ke hisab se DM channel choose karein
      const dmChannelId = getDmChannelForGame(game);
      const tradeDoc = doc(db, 'users', userId, 'trades', latestTrade.id);
      const updatePayload: Record<string, any> = {};

      // Queue position channel se aati hai (DM se nahi)
      if (tradeChannelId) {
        const queueResult = await fetchQueuePositionFromTradeChannel(tradeChannelId);
        if (queueResult.success && typeof queueResult.queuePosition === 'number') {
          updatePayload.queuePosition = queueResult.queuePosition;
          latestTrade.queuePosition = queueResult.queuePosition;
        }
      }
      
      if (dmChannelId) {
        // fetchTradeCodeFromDiscord ab DM channel check karega
        const discordResult = await fetchTradeCodeFromDiscord(dmChannelId, discordUser || '');

        if (discordResult.success) {
          if (discordResult.linkCode) {
            updatePayload.linkCode = discordResult.linkCode;
            updatePayload.status = 'ready';
            updatePayload.botIGN = discordResult.botIGN || 'Bot';

            latestTrade.linkCode = discordResult.linkCode;
            latestTrade.status = 'ready';
            latestTrade.botIGN = discordResult.botIGN;
          }

        }
      }

      if (Object.keys(updatePayload).length > 0) {
        await updateDoc(tradeDoc, updatePayload);
        await syncTradeUpdateEverywhere(
          db,
          userId,
          latestTrade.discordMessageId,
          updatePayload
        );
      }
    }

    return NextResponse.json({ success: true, data: latestTrade });

  } catch (err: any) {
    console.error("GET Route Polling Error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}