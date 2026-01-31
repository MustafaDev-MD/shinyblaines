// SysBot and ALM validation service
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  pokemonData?: any;
}

export interface CustomPokemonData {
  id: number;
  name: string;
  ivs: { [key: string]: number };
  evs: { [key: string]: number };
  nature: string;
  ability: string;
  moves: string[];
  shiny: boolean;
  level: number;
  item?: string;
}

class SysbotValidationService {
  private readonly BASE_URL = process.env.NEXT_PUBLIC_SYSBOT_URL || 'ws://localhost:9000';
  private socket: WebSocket | null = null;

  // Initialize WebSocket connection to SysBot
  async connect(): Promise<boolean> {
    try {
      this.socket = new WebSocket(this.BASE_URL);
      
      return new Promise((resolve) => {
        this.socket!.onopen = () => {
          console.log('Connected to SysBot ALM service');
          resolve(true);
        };
        
        this.socket!.onerror = () => {
          console.error('Failed to connect to SysBot');
          resolve(false);
        };
      });
    } catch (error) {
      console.error('SysBot connection error:', error);
      return false;
    }
  }

  // Validate Pokemon using ALM (Advanced Link Manager)
  async validatePokemon(pokemon: CustomPokemonData): Promise<ValidationResult> {
    try {
      // First, perform local validation
      const localValidation = this.performLocalValidation(pokemon);
      if (!localValidation.isValid) {
        return localValidation;
      }

      // If SysBot is available, perform remote validation
      if (this.socket?.readyState === WebSocket.OPEN) {
        return await this.performALMValidation(pokemon);
      } else {
        // Fallback to mock validation when SysBot is not available
        return await this.performMockValidation(pokemon);
      }
    } catch (error) {
      console.error('Validation error:', error);
      return {
        isValid: false,
        errors: ['Validation service unavailable'],
        warnings: []
      };
    }
  }

  // Local validation rules
  private performLocalValidation(pokemon: CustomPokemonData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // EV validation
    const evTotal = Object.values(pokemon.evs).reduce((sum, ev) => sum + ev, 0);
    if (evTotal > 510) {
      errors.push('Total EVs cannot exceed 510');
    }

    Object.entries(pokemon.evs).forEach(([stat, value]) => {
      if (value > 252) {
        errors.push(`${stat.replace('-', ' ')} EVs cannot exceed 252`);
      }
      if (value < 0 || value % 4 !== 0) {
        warnings.push(`${stat.replace('-', ' ')} EVs should be divisible by 4 for optimal distribution`);
      }
    });

    // IV validation
    Object.entries(pokemon.ivs).forEach(([stat, value]) => {
      if (value < 0 || value > 31) {
        errors.push(`${stat.replace('-', ' ')} IVs must be between 0 and 31`);
      }
    });

    // Level validation
    if (pokemon.level < 1 || pokemon.level > 100) {
      errors.push('Level must be between 1 and 100');
    }

    // Moves validation
    if (pokemon.moves.length > 4) {
      errors.push('Pokemon can only have 4 moves');
    }

    const validMoves = pokemon.moves.filter(move => move && move.trim() !== '');
    if (validMoves.length !== pokemon.moves.length) {
      warnings.push('Some move slots are empty');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Mock ALM validation when SysBot is not available
  private async performMockValidation(pokemon: CustomPokemonData): Promise<ValidationResult> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const warnings: string[] = [];

    // Add some mock warnings based on common competitive guidelines
    const ivTotal = Object.values(pokemon.ivs).reduce((sum, iv) => sum + iv, 0);
    if (ivTotal < 186) {
      warnings.push('Consider using max IVs for competitive play');
    }

    const evTotal = Object.values(pokemon.evs).reduce((sum, ev) => sum + ev, 0);
    if (evTotal < 508) {
      warnings.push('Consider using full EV spread for competitive play');
    }

    // Random chance of validation failure for demo purposes
    if (Math.random() < 0.05) {
      return {
        isValid: false,
        errors: ['Pokemon configuration rejected - Invalid combination detected'],
        warnings
      };
    }

    return {
      isValid: true,
      errors: [],
      warnings,
      pokemonData: this.generatePKMData(pokemon)
    };
  }

  // Real ALM validation with SysBot
  private async performALMValidation(pokemon: CustomPokemonData): Promise<ValidationResult> {
    return new Promise((resolve) => {
      const request = {
        type: 'validate_pokemon',
        data: this.convertToPK8Format(pokemon)
      };

      this.socket!.send(JSON.stringify(request));

      const timeout = setTimeout(() => {
        resolve({
          isValid: false,
          errors: ['Validation timeout'],
          warnings: []
        });
      }, 10000);

      this.socket!.onmessage = (event) => {
        clearTimeout(timeout);
        try {
          const response = JSON.parse(event.data);
          if (response.type === 'validation_result') {
            resolve({
              isValid: response.valid,
              errors: response.errors || [],
              warnings: response.warnings || [],
              pokemonData: response.pokemonData
            });
          }
        } catch (error) {
          resolve({
            isValid: false,
            errors: ['Invalid response from SysBot'],
            warnings: []
          });
        }
      };
    });
  }

  // Convert Pokemon data to PK8 format for SysBot
  private convertToPK8Format(pokemon: CustomPokemonData): any {
    // This is a simplified version - actual PK8 format is much more complex
    return {
      species: pokemon.id,
      nickname: pokemon.name.toUpperCase(),
      level: pokemon.level,
      nature: pokemon.nature,
      ability: pokemon.ability,
      item: pokemon.item || 'NONE',
      shiny: pokemon.shiny,
      ivs: {
        hp: pokemon.ivs.hp,
        atk: pokemon.ivs.attack,
        def: pokemon.ivs.defense,
        spa: pokemon.ivs['special-attack'],
        spd: pokemon.ivs['special-defense'],
        spe: pokemon.ivs.speed
      },
      evs: {
        hp: pokemon.evs.hp,
        atk: pokemon.evs.attack,
        def: pokemon.evs.defense,
        spa: pokemon.evs['special-attack'],
        spd: pokemon.evs['special-defense'],
        spe: pokemon.evs.speed
      },
      moves: pokemon.moves.filter(move => move && move.trim() !== '')
    };
  }

  // Generate PKM data file
  private generatePKMData(pokemon: CustomPokemonData): any {
    return {
      format: 'PK8',
      data: this.convertToPK8Format(pokemon),
      checksum: this.calculateChecksum(pokemon)
    };
  }

  // Calculate checksum for PKM file
  private calculateChecksum(pokemon: CustomPokemonData): string {
    // Simple checksum for demo - actual implementation would be more complex
    const data = `${pokemon.id}${pokemon.level}${JSON.stringify(pokemon.ivs)}${JSON.stringify(pokemon.evs)}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16).toUpperCase();
  }

  // Generate PKM file for download
  async generatePKMFile(pokemon: CustomPokemonData): Promise<Blob> {
    const validation = await this.validatePokemon(pokemon);
    if (!validation.isValid) {
      throw new Error('Cannot generate PKM file: Validation failed');
    }

    const pkmData = validation.pokemonData || this.generatePKMData(pokemon);
    const jsonString = JSON.stringify(pkmData, null, 2);
    
    return new Blob([jsonString], { type: 'application/json' });
  }

  // Disconnect from SysBot
  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const sysbotService = new SysbotValidationService();