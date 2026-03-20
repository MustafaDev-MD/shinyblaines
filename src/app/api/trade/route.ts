import { NextRequest, NextResponse } from 'next/server';
import { validatePokemon, PokemonFormData } from '@/lib/legality';
import { generateDiscordCommand, } from '@/lib/discord';
import { sendTradeRequest, validateDiscordConnection } from '@/lib/discord-api';
import { randomInt } from 'crypto';

// function generateLinkCode(): string {
//   const numbers = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
//   return `${numbers.slice(0, 4)}-${numbers.slice(4)}`; 
// }

function generateLinkCode(): string {
  const numbers = Array.from({ length: 8 }, () => randomInt(0, 10)).join('');
  return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
}

// function generateQueueNumber(): number {
//   return Math.floor(Math.random() * 20) + 1; 
// }
let currentQueue = 0;

function generateQueueNumber(): number {
  currentQueue++;
  return currentQueue;
}

export async function POST(request: NextRequest) {
  console.log('[DEBUG STEP 1] API /trade called at:', new Date().toISOString());
  try {
    const body = await request.json();
    console.log('[DEBUG STEP 2] Request body:', JSON.stringify(body, null, 2));
    const { pokemon, userId, userName, customLinkCode } = body;

    // Basic request validation
    if (!pokemon || !pokemon.game || !pokemon.pokemonId) {
      return NextResponse.json(
        { success: false, error: 'Pokémon data aur game zaroori hai' },
        { status: 400 }
      );
    }

    // Prepare form data for legality check
    const formData: PokemonFormData = {
      id: pokemon.pokemonId,
      name: pokemon.pokemonName,
      species: pokemon.pokemonName,
      level: pokemon.level,
      shiny: pokemon.shiny,
      alpha: pokemon.alpha,
      moves: pokemon.moves || [],
      ability: pokemon.ability || '',
      nature: pokemon.nature,
      ivs: pokemon.ivs || {},
      evs: pokemon.evs || {},
      item: pokemon.item || 'None',
      game: pokemon.game,
    };

    // Run legality validation
    const validation = validatePokemon(formData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(' | ') },
        { status: 400 }
      );
    }

    // Link Code handling (custom ya random)
    let linkCode = customLinkCode && typeof customLinkCode === 'string' && /^\d{4}-\d{4}$/.test(customLinkCode.trim())
      ? customLinkCode.trim()
      : generateLinkCode();

    const queuePosition = generateQueueNumber();

    // console.log('[DEBUG STEP 3] Before Discord try block - channelId:', channelId); 

    // Try to send to Discord
    let discordSuccess = false;
    let discordMessageId: string | undefined;

    try {
      console.log('[DEBUG STEP 4] Importing discord-api...');
      // const { sendTradeRequest, validateDiscordConnection } = await import('@/lib/discord-api');

      console.log('[DEBUG STEP 5] Import successful');

      console.log('[DEBUG STEP 6] Checking connection...');
      // const isConnected = await validateDiscordConnection();
      // console.log('[DEBUG STEP 7] Connection result:', isConnected);
      // if (isConnected) {
      //   console.log('[DEBUG STEP 8] Sending trade request...');
      //   const result = await sendTradeRequest(pokemon, userId, userName);
      //   console.log('[DEBUG STEP 9] Send result:', result);
      //   if (result.success) {
      //     discordSuccess = true;
      //     discordMessageId = result.messageId;
      //   } else {
      //     console.error("Discord send failed:", result.error);
      //   }
      // }

      // const result = await sendTradeRequest(pokemon, userId, userName);
      const result = await sendTradeRequest(pokemon);
if (result.success) {
  discordSuccess = true;
  discordMessageId = result.messageId;
}
    } catch (discordError: any) {
      console.error('[Trade API] Discord failed:', discordError?.message || discordError);
      console.error('[DEBUG STEP 10] Discord block failed:', discordError?.message || discordError);
      console.error('[DEBUG STEP 10 Full error]', discordError);
      // Silent fail — user ko fallback denge
    }

    // Final response
    const response = {
      // success: true,
      success: discordSuccess,
      linkCode,
      queuePosition,
      discordConnected: discordSuccess,
      discordMessageId,
      warnings: validation.warnings || [],
      message: discordSuccess
        ? 'Trade request Discord pe post ho gaya! Channel check karo aur game mein code daalo.'
        : 'Trade ready hai! Discord connect nahi hua, lekin yeh code game mein use kar sakte ho.',
    };

    // Agar Discord fail hua to fallback command bhej do
    if (!discordSuccess) {
      (response as any).fallbackCommand = generateDiscordCommand(pokemon);
    }

    return NextResponse.json(response);

  } catch (error: any) {
    // console.error('[Trade API] Critical error:', error?.message || error);
    console.error('[Trade API] Critical error:', {
      message: error?.message,
      stack: error?.stack,
    });
    return NextResponse.json(
      { success: false, error: 'Server error — please try again later' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'running',
    timestamp: new Date().toISOString(),
    message: 'Trade API live hai!'
  });
}