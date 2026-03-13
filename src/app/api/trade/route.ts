import { NextRequest, NextResponse } from 'next/server';
import { validatePokemon, PokemonFormData } from '@/lib/legality';
import { generateDiscordCommand } from '@/lib/discord';

function generateLinkCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function generateQueueNumber(): number {
  return Math.floor(Math.random() * 10) + 1;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pokemon, userId, userName } = body;

    if (!pokemon || !pokemon.game) {
      return NextResponse.json(
        { success: false, error: 'Invalid request: Pokemon data and game are required' },
        { status: 400 }
      );
    }

    const formData: PokemonFormData = {
      id: pokemon.pokemonId,
      name: pokemon.pokemonName,
      species: pokemon.pokemonName,
      level: pokemon.level,
      shiny: pokemon.shiny,
      alpha: pokemon.alpha,
      moves: pokemon.moves || [],
      ability: pokemon.ability,
      nature: pokemon.nature,
      ivs: pokemon.ivs || {},
      evs: pokemon.evs || {},
      item: pokemon.item || '',
      game: pokemon.game,
    };

    const validation = validatePokemon(formData);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.errors.join(' | ') },
        { status: 400 }
      );
    }

    const linkCode = generateLinkCode();
    const queuePosition = generateQueueNumber();

    try {
      const { sendTradeRequest, validateDiscordConnection } = await import('@/lib/discord-api');
      
      console.log('Checking Discord connection...');
      const isConnected = await validateDiscordConnection();
      console.log('Discord connected:', isConnected);
      
      if (isConnected) {
        console.log('Sending trade request to Discord for game:', pokemon.game);
        const result = await sendTradeRequest(pokemon, userId, userName);
        console.log('Discord result:', result);
        
        if (result.success) {
          return NextResponse.json({
            success: true,
            tradeId: result.tradeId,
            linkCode: linkCode,
            queuePosition: queuePosition,
            message: 'Trade request sent to Discord! Use link code in game.',
            discordConnected: true,
            warnings: validation.warnings
          });
        }
      }
    } catch (discordError) {
      console.log('Discord error:', discordError);
    }

    const command = generateDiscordCommand(pokemon);

    return NextResponse.json({
      success: true,
      linkCode: linkCode,
      queuePosition: queuePosition,
      message: 'Trade ready! Use link code in your game.',
      discordConnected: false,
      fallbackCommand: command,
      warnings: validation.warnings
    });

  } catch (error: unknown) {
    console.error('Trade API Error:', error);
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Trade API is running'
  });
}
