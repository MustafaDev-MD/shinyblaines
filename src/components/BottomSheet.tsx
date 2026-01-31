'use client';

import { useState, useEffect } from 'react';
import { Pokemon, formatPokemonName, getPokemonTypeColor } from '@/utils/pokemon';
import { sysbotService, CustomPokemonData } from '@/utils/sysbot';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  pokemon: Pokemon;
}

const NATURES = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
];

const ITEMS = [
  'None', 'Life Orb', 'Choice Specs', 'Choice Scarf', 'Leftovers',
  'Focus Sash', 'Assault Vest', 'Expert Belt', 'Weakness Policy',
  'Master Ball', 'Ultra Ball', 'Great Ball', 'Poke Ball'
];

const LANGUAGES = [
  'English', 'Japanese', 'French', 'German', 'Spanish',
  'Italian', 'Korean', 'Chinese', 'Dutch', 'Portuguese'
];

const TAB_PRESETS = {
  basic: {
    name: 'Standard Build',
    nickname: '',
    nature: 'modest',
    level: 100,
    item: 'life orb',
    ability: 'overgrow',
    tid: '123456',
    sid: '6789',
    language: 'english',
    metLocation: 'Day Care',
    metDate: '01/01/2024',
    size: '128',
    ivs: { hp: 31, attack: 31, defense: 31, 'special-attack': 31, 'special-defense': 31, speed: 31 },
    evs: { hp: 4, attack: 0, defense: 0, 'special-attack': 252, 'special-defense': 0, speed: 252 },
    moves: ['Flamethrower', 'Solar Beam', 'Focus Blast', 'Protect'],
    shiny: false,
    alpha: false,
    maleTrainer: true,
    malePokemon: true
  },
  advanced: {
    name: 'Competitive Build',
    nickname: 'CHAMPION',
    nature: 'timid',
    level: 100,
    item: 'choice specs',
    ability: 'blaze',
    tid: '654321',
    sid: '9876',
    language: 'english',
    metLocation: 'Pokemon League',
    metDate: '12/25/2024',
    size: '255',
    ivs: { hp: 31, attack: 0, defense: 31, 'special-attack': 31, 'special-defense': 31, speed: 31 },
    evs: { hp: 0, attack: 0, defense: 4, 'special-attack': 252, 'special-defense': 0, speed: 252 },
    moves: ['Fire Blast', 'Solar Beam', 'Hidden Power', 'Protect'],
    shiny: true,
    alpha: false,
    maleTrainer: true,
    malePokemon: true
  },
  trade: {
    name: 'Trade Ready',
    nickname: 'TRADEME',
    nature: 'adamant',
    level: 50,
    item: 'master ball',
    ability: 'blaze',
    tid: '111111',
    sid: '2222',
    language: 'english',
    metLocation: 'Wonder Trade',
    metDate: '06/15/2024',
    size: '64',
    ivs: { hp: 31, attack: 31, defense: 31, 'special-attack': 31, 'special-defense': 31, speed: 31 },
    evs: { hp: 252, attack: 252, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 6 },
    moves: ['Flare Blitz', 'Thunder Punch', 'Earthquake', 'Swords Dance'],
    shiny: true,
    alpha: true,
    maleTrainer: false,
    malePokemon: false
  }
};

const COMPETITIVE_SETS = [
  { 
    name: 'Standard Sweeper', 
    role: 'Special Attacker',
    evs: { hp: 4, attack: 0, defense: 0, 'special-attack': 252, 'special-defense': 0, speed: 252 },
    nature: 'Timid',
    item: 'Life Orb',
    moves: ['Flamethrower', 'Solar Beam', 'Focus Blast', 'Protect']
  },
  { 
    name: 'Tank Build', 
    role: 'Special Tank',
    evs: { hp: 252, attack: 0, defense: 4, 'special-attack': 252, 'special-defense': 0, speed: 0 },
    nature: 'Modest',
    item: 'Leftovers',
    moves: ['Flamethrower', 'Solar Beam', 'Will-O-Wisp', 'Recover']
  }
];

export default function BottomSheet({ isOpen, onClose, pokemon }: BottomSheetProps) {
  const [customData, setCustomData] = useState({
    name: pokemon.name,
    nickname: '',
    nature: 'modest',
    level: 100,
    item: '',
    ability: pokemon.abilities?.[0]?.ability?.name || '',
    tid: '',
    sid: '',
    language: 'english',
    metLocation: '',
    metDate: '',
    size: '',
    ivs: { hp: 31, attack: 31, defense: 31, 'special-attack': 31, 'special-defense': 31, speed: 31 },
    evs: { hp: 0, attack: 0, defense: 0, 'special-attack': 0, 'special-defense': 0, speed: 0 },
    moves: ['', '', '', ''],
    shiny: false,
    alpha: false,
    maleTrainer: true,
    malePokemon: true
  });

  const [selectedSet, setSelectedSet] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [availableMoves, setAvailableMoves] = useState<string[]>([]);
  

  useEffect(() => {
    fetchAvailableMoves();
  }, [pokemon.id]);

  const fetchAvailableMoves = async () => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemon.id}`);
      const data = await response.json();
      const moves = data.moves.map((move: any) => move.move.name.replace('-', ' ').toUpperCase());
      setAvailableMoves(moves);
    } catch (error) {
      console.error('Error fetching moves:', error);
    }
  };

  const applyCompetitiveSet = (set: typeof COMPETITIVE_SETS[0]) => {
    setCustomData(prev => ({
      ...prev,
      evs: set.evs,
      nature: set.nature.toLowerCase(),
      item: set.item.toLowerCase(),
      moves: set.moves
    }));
    setSelectedSet(set.name);
  };

  const validateWithALM = async () => {
    setValidationErrors([]);
    
    try {
      const pokemonData: CustomPokemonData = {
        id: pokemon.id,
        name: pokemon.name,
        ivs: customData.ivs,
        evs: customData.evs,
        nature: customData.nature,
        ability: customData.ability,
        moves: customData.moves.filter(move => move !== ''),
        shiny: customData.shiny,
        level: customData.level,
        item: customData.item
      };

      const validation = await sysbotService.validatePokemon(pokemonData);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('ALM Validation error:', error);
      setValidationErrors(['Validation failed - Please try again']);
      return false;
    }
  };

  const handleCopyPokemon = async () => {
    setIsGenerating(true);
    try {
      const pokemonData: CustomPokemonData = {
        id: pokemon.id,
        name: pokemon.name,
        ivs: customData.ivs,
        evs: customData.evs,
        nature: customData.nature,
        ability: customData.ability,
        moves: customData.moves.filter(move => move !== ''),
        shiny: customData.shiny,
        level: customData.level,
        item: customData.item
      };

      const pkmBlob = await sysbotService.generatePKMFile(pokemonData);
      const url = URL.createObjectURL(pkmBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${pokemon.name}_${pokemon.id}.pkm`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PKM file:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleValidateAndCopy = async () => {
    const isValid = await validateWithALM();
    if (isValid) {
      await handleCopyPokemon();
    }
  };

  const getEVTotal = () => Object.values(customData.evs).reduce((sum, ev) => sum + ev, 0);

  const applyTabPreset = (tabKey: 'basic' | 'advanced' | 'trade') => {
    const preset = TAB_PRESETS[tabKey];
    setCustomData(prev => ({
      ...prev,
      ...preset
    }));
  };

  const updateIV = (stat: string, value: number) => {
    setCustomData(prev => ({
      ...prev,
      ivs: { ...prev.ivs, [stat]: Math.min(31, Math.max(0, value)) }
    }));
  };

  const updateEV = (stat: string, value: number) => {
    setCustomData(prev => ({
      ...prev,
      evs: { ...prev.evs, [stat]: Math.min(252, Math.max(0, value)) }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-h-[90vh] overflow-hidden rounded-t-3xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                alt={pokemon.name}
                className="w-12 h-12 sm:w-16 sm:h-16"
              />
              {customData.shiny && (
                <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1">
                  <span className="text-xs">✨</span>
                </div>
              )}
            </div>
            <div>
              <h3 className="text-white font-bold text-lg sm:text-xl">
                {formatPokemonName(pokemon.name)}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-blue-200 text-sm">#{String(pokemon.id).padStart(3, '0')}</span>
                <div className="flex space-x-1">
                  {pokemon.types.map((typeInfo, index) => (
                    <span
                      key={index}
                      className={`px-2 py-0.5 text-xs font-bold rounded text-white ${getPokemonTypeColor(typeInfo.type.name)}`}
                    >
                      {typeInfo.type.name.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-3 sm:p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>



        {/* Content */}
        <div className="overflow-y-auto max-h-[75vh]">
          <div className="flex flex-col sm:flex-row gap-4 p-5 sm:min-w-max">
            {/* Column 1: Sets */}
            <div className="w-full sm:w-56 space-y-4">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Sets</h4>
              <div className="space-y-3">
                {COMPETITIVE_SETS.map((set) => (
                  <button
                    key={set.name}
                    onClick={() => applyCompetitiveSet(set)}
                    className={`w-full p-3 rounded-lg border text-left transition-all ${
                      selectedSet === set.name
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-900 dark:text-white">{set.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{set.role}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Column 2: Basic */}
            <div className="w-full sm:w-64 space-y-4">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Basic</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={customData.nickname}
                    onChange={(e) => setCustomData(prev => ({ ...prev, nickname: e.target.value }))}
                    className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={formatPokemonName(pokemon.name)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nature
                  </label>
                  <select
                    value={customData.nature}
                    onChange={(e) => setCustomData(prev => ({ ...prev, nature: e.target.value }))}
                    className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    {NATURES.map(nature => (
                      <option key={nature} value={nature.toLowerCase()}>{nature}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Level
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={customData.level}
                      onChange={(e) => setCustomData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Item
                    </label>
                    <select
                      value={customData.item}
                      onChange={(e) => setCustomData(prev => ({ ...prev, item: e.target.value }))}
                      className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      {ITEMS.map(item => (
                        <option key={item} value={item.toLowerCase()}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={customData.shiny}
                      onChange={(e) => setCustomData(prev => ({ ...prev, shiny: e.target.checked }))}
                      className="rounded text-blue-600"
                    />
                    <span>✨ Shiny</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={customData.alpha}
                      onChange={(e) => setCustomData(prev => ({ ...prev, alpha: e.target.checked }))}
                      className="rounded text-blue-600"
                    />
                    <span>🌟 Alpha</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Column 3: Stats */}
            <div className="w-full sm:w-80 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white">Stats</h4>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  EVs: {getEVTotal()}/510
                </div>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'].map((stat) => (
                  <div key={stat} className="space-y-2">
                    <div className="text-center text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {stat.replace('-', '').slice(0, 3)}
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="31"
                      value={customData.ivs[stat as keyof typeof customData.ivs]}
                      onChange={(e) => updateIV(stat, parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="IV"
                    />
                    <input
                      type="number"
                      min="0"
                      max="252"
                      step="4"
                      value={customData.evs[stat as keyof typeof customData.evs]}
                      onChange={(e) => updateEV(stat, parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="EV"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 4: Moves */}
            <div className="w-full sm:w-64 space-y-4">
              <h4 className="text-base font-semibold text-gray-900 dark:text-white">Moves</h4>
              
              <div className="space-y-3">
                {[0, 1, 2, 3].map((slot) => (
                  <input
                    key={slot}
                    type="text"
                    value={customData.moves[slot]}
                    onChange={(e) => {
                      const newMoves = [...customData.moves];
                      newMoves[slot] = e.target.value;
                      setCustomData(prev => ({ ...prev, moves: newMoves }));
                    }}
                    className="w-full px-3 py-3 sm:py-2 text-base sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder={`Move ${slot + 1}`}
                    list={`moves-${slot}`}
                  />
                ))}
              </div>
            </div>

            {/* Column 5: Buttons & Preview */}
            <div className="w-full sm:w-56 space-y-4">
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  className="w-full bg-purple-600 text-white py-4 sm:py-3 px-4 rounded-lg text-base sm:text-sm font-medium hover:bg-purple-700 transition-colors flex items-center justify-center"
                >
                  💬 Join Discord (Optional)
                </button>
                
                <button
                  onClick={handleCopyPokemon}
                  disabled={isGenerating}
                  className="w-full bg-green-600 text-white py-4 sm:py-3 px-4 rounded-lg text-base sm:text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  📋 Copy Pokemon
                </button>
                
                <button
                  onClick={handleValidateAndCopy}
                  disabled={isGenerating}
                  className="w-full bg-orange-600 text-white py-4 sm:py-3 px-4 rounded-lg text-base sm:text-sm font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center transition-colors"
                >
                  {isGenerating ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : null}
                  ✅ Validate & Copy Pokemon
                </button>
              </div>

              {/* Pokemon Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-base font-semibold text-gray-900 dark:text-white mb-3 text-center">
                  Preview
                </h4>
                <div className="flex justify-center space-x-4">
                  <div className="text-center">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                      alt={pokemon.name}
                      className="w-20 h-20 mx-auto"
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Normal</div>
                  </div>
                  <div className="text-center">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`}
                      alt={`${pokemon.name} shiny`}
                      className="w-20 h-20 mx-auto"
                    />
                    <div className="text-sm text-gray-600 dark:text-gray-400">Shiny</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
            <h4 className="text-red-800 dark:text-red-200 font-medium mb-2">Validation Errors:</h4>
            <ul className="list-disc list-inside text-red-700 dark:text-red-300 text-sm space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}