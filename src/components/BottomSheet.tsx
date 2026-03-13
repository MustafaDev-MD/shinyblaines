'use client';

import { useState, useEffect } from 'react';
import { Pokemon, formatPokemonName, getPokemonFullData, getPokemonAbilities, getPokemonMovesForGame } from '@/utils/pokemon';
import { validatePokemon, PokemonFormData } from '@/lib/legality';
import { usePokedex } from '@/contexts/PokedexContext';
import { useAuth } from '@/contexts/AuthContext';

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

export default function BottomSheet({ isOpen, onClose, pokemon }: BottomSheetProps) {
  const [customData, setCustomData] = useState({
    nickname: '',
    nature: 'modest',
    level: 100,
    item: '',
    ability: '',
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

  const [selectedGame, setSelectedGame] = useState('scarlet-violet');
  const [showModal, setShowModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [modalContent, setModalContent] = useState<{ title: string; message: string; command: string; queuePosition?: number; warnings?: string[]; isValid?: boolean; errors?: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [availableAbilities, setAvailableAbilities] = useState<string[]>([]);
  const [availableMoves, setAvailableMoves] = useState<string[]>([]);
  const [isLoadingMoves, setIsLoadingMoves] = useState(false);
  
  const { addOwnedPokemon, isOwned, addTradeToHistory } = usePokedex();
  const { user } = useAuth();
  const isPokemonOwned = isOwned(pokemon.id);

  useEffect(() => {
    setCustomData(prev => ({
      ...prev,
      ability: pokemon.abilities?.[0]?.ability?.name || ''
    }));
  }, [pokemon]);

  useEffect(() => {
    const fetchAbilitiesAndMoves = async () => {
      try {
        const fullData = await getPokemonFullData(pokemon.id);
        const abilities = getPokemonAbilities(fullData);
        setAvailableAbilities(abilities);
        
        setIsLoadingMoves(true);
        const moves = getPokemonMovesForGame(fullData, selectedGame);
        setAvailableMoves(moves);
        setIsLoadingMoves(false);
      } catch (error) {
        console.error('Error fetching Pokemon data:', error);
        setAvailableAbilities([]);
        setAvailableMoves([]);
        setIsLoadingMoves(false);
      }
    };
    
    fetchAbilitiesAndMoves();
  }, [pokemon.id, selectedGame]);

  const validatePokemonForm = () => {
    const formData: PokemonFormData = {
      id: pokemon.id,
      name: pokemon.name,
      species: pokemon.name,
      level: customData.level,
      shiny: customData.shiny,
      alpha: customData.alpha,
      moves: customData.moves.filter(m => m !== ''),
      ability: customData.ability,
      nature: customData.nature,
      ivs: customData.ivs,
      evs: customData.evs,
      item: customData.item,
      game: selectedGame
    };

    const result = validatePokemon(formData);
    
    if (!result.isValid) {
      setModalContent({
        title: 'Validation Failed',
        message: result.errors.join('\n'),
        command: '',
        isValid: false,
        errors: result.errors
      });
      setShowValidateModal(true);
      return false;
    }

    setModalContent({
      title: result.warnings.length > 0 ? 'Pokemon Valid (with warnings)' : 'Pokemon Valid!',
      message: result.warnings.length > 0 ? result.warnings.join('\n') : `${formatPokemonName(pokemon.name)} is legal and ready to trade!`,
      command: '',
      isValid: true,
      warnings: result.warnings
    });
    setShowValidateModal(true);
    return true;
  };

  const handleTradeOnSite = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemon: {
            pokemonName: formatPokemonName(pokemon.name),
            pokemonId: pokemon.id,
            shiny: customData.shiny,
            alpha: customData.alpha,
            level: customData.level,
            nature: customData.nature,
            ability: customData.ability,
            moves: customData.moves.filter(m => m !== ''),
            ivs: customData.ivs,
            evs: customData.evs,
            item: customData.item,
            game: selectedGame,
          },
          userId: user?.uid,
          userName: user?.displayName || 'Anonymous'
        }),
      });
      
      const data = await response.json();
      
      if (data.success || data.fallback) {
        const linkCode = data.linkCode || Math.random().toString(36).substring(2, 8).toUpperCase();
        const queuePosition = data.queuePosition || Math.floor(Math.random() * 10) + 1;
        
        if (user) {
          addTradeToHistory({
            userId: user.uid,
            pokemonId: pokemon.id,
            pokemonName: pokemon.name,
            linkCode: linkCode,
            status: 'pending',
            game: selectedGame
          });
        }
        
        setModalContent({
          title: 'Trade Initiated!',
          message: '',
          command: linkCode,
          queuePosition: queuePosition,
          warnings: data.warnings || []
        });
        setShowModal(true);
      } else {
        alert(data.error || 'Trade failed. Please try again.');
      }
    } catch (error) {
      alert('Failed to submit trade. Please try again.');
    } finally {
      setIsLoading(false);
    }
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

  const getEVTotal = () => Object.values(customData.evs).reduce((sum, ev) => sum + ev, 0);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className={`bg-white dark:bg-gray-900 w-full max-h-[90vh] overflow-hidden rounded-t-3xl shadow-2xl transform transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                alt={pokemon.name}
                className="w-12 h-12 sm:w-16 sm:h-16"
              />
              <div className="absolute -top-1 -right-1 flex gap-1">
                {customData.shiny && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm">
                    <img src="/masklicon.png" alt="Shiny" className="w-5 h-5" />
                  </div>
                )}
                {customData.alpha && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-full p-0.5 shadow-sm">
                    <img src="/masklicon.png" alt="Alpha" className="w-5 h-5" />
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg sm:text-xl">
                {formatPokemonName(pokemon.name)}
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-blue-200 text-sm">#{String(pokemon.id).padStart(3, '0')}</span>
                <div className="flex space-x-1">
                  {pokemon.types?.map((typeInfo: any, index: number) => (
                    <span
                      key={index}
                      className={`px-2 py-0.5 text-xs font-bold rounded text-white ${
                        typeInfo.type.name === 'fire' ? 'bg-red-500' :
                        typeInfo.type.name === 'water' ? 'bg-blue-500' :
                        typeInfo.type.name === 'grass' ? 'bg-green-500' :
                        typeInfo.type.name === 'electric' ? 'bg-yellow-400' :
                        typeInfo.type.name === 'psychic' ? 'bg-pink-500' :
                        typeInfo.type.name === 'ghost' ? 'bg-purple-700' :
                        typeInfo.type.name === 'dragon' ? 'bg-indigo-600' :
                        'bg-gray-400'
                      }`}
                    >
                      {typeInfo.type.name.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-3 rounded-lg">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[75vh]">
          <div className="flex flex-col sm:flex-row gap-4 p-5">
            
            {/* Column 1: Basic */}
            <div className="w-full sm:w-64 space-y-4">
              <h4 className="text-base font-semibold text-green-900 dark:text-white mb-3">Basic</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nickname
                  </label>
                  <input
                    type="text"
                    value={customData.nickname}
                    onChange={(e) => setCustomData(prev => ({ ...prev, nickname: e.target.value }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-green-900 dark:text-white"
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
                    className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-green-900 dark:text-white"
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
                      className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-green-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Item
                    </label>
                    <select
                      value={customData.item}
                      onChange={(e) => setCustomData(prev => ({ ...prev, item: e.target.value }))}
                      className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-green-900 dark:text-white"
                    >
                      {ITEMS.map(item => (
                        <option key={item} value={item.toLowerCase()}>{item}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ability
                  </label>
                  <select
                    value={customData.ability}
                    onChange={(e) => setCustomData(prev => ({ ...prev, ability: e.target.value }))}
                    className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-green-900 dark:text-white"
                  >
                    <option value="">Select Ability</option>
                    {availableAbilities.map(ability => (
                      <option key={ability} value={ability.toLowerCase().replace(/ /g, '-')}>{ability}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={customData.shiny}
                      onChange={(e) => setCustomData(prev => ({ ...prev, shiny: e.target.checked }))}
                      className="rounded text-yellow-500"
                    />
                    <span><img src="/masklicon.png" alt="Shiny" className="w-5 h-5 inline mr-1" /> Shiny</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={customData.alpha}
                      onChange={(e) => setCustomData(prev => ({ ...prev, alpha: e.target.checked }))}
                      className="rounded text-purple-500"
                    />
                    <span><img src="/masklicon.png" alt="Alpha" className="w-5 h-5 inline mr-1" /> Alpha</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Column 2: Stats */}
            <div className="w-full sm:w-80 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-semibold text-green-900 dark:text-white">Stats</h4>
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
                      className="w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-green-900 dark:text-white"
                      placeholder="IV"
                    />
                    <input
                      type="number"
                      min="0"
                      max="252"
                      step="4"
                      value={customData.evs[stat as keyof typeof customData.evs]}
                      onChange={(e) => updateEV(stat, parseInt(e.target.value) || 0)}
                      className="w-full px-2 py-1 text-sm text-center border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-green-900 dark:text-white"
                      placeholder="EV"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Moves */}
            <div className="w-full sm:w-64 space-y-4">
              <h4 className="text-base font-semibold text-green-900 dark:text-white">
                Moves {isLoadingMoves && <span className="text-xs font-normal text-gray-500">(Loading...)</span>}
              </h4>
              
              <div className="space-y-3">
                {[0, 1, 2, 3].map((slot) => (
                  <select
                    key={slot}
                    value={customData.moves[slot]}
                    onChange={(e) => {
                      const newMoves = [...customData.moves];
                      newMoves[slot] = e.target.value;
                      setCustomData(prev => ({ ...prev, moves: newMoves }));
                    }}
                    className="w-full px-3 py-2 text-base border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-green-900 dark:text-white"
                  >
                    <option value="">Move {slot + 1}</option>
                    {availableMoves.map(move => (
                      <option key={move} value={move}>{move}</option>
                    ))}
                  </select>
                ))}
              </div>
            </div>

            {/* Column 4: Game & Buttons */}
            <div className="w-full sm:w-56 space-y-4">
              {/* Game Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Game
                </label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-green-900 dark:text-white"
                >
                  <option value="scarlet-violet">Scarlet & Violet</option>
                  <option value="sword-shield">Sword & Shield</option>
                  <option value="bdsp">Brilliant Diamond</option>
                  <option value="legends-arceus">Legends: Arceus</option>
                  <option value="legends-za">Legends: Z-A</option>
                </select>
              </div>

              {/* Owned Status */}
              {isPokemonOwned && (
                <div className="px-3 py-2 bg-green-100 dark:bg-green-900/30 rounded-lg text-center">
                  <span className="text-green-700 dark:text-green-300 text-sm font-medium">✓ Already Owned</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {/* Button 1: Join Discord */}
                <a
                  href="https://discord.gg/blaines"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full block text-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-lg text-sm font-bold hover:from-indigo-600 hover:to-purple-700 transition-all"
                >
                  💬 Join Discord
                </a>

                {/* Button 2: Validate */}
                <button
                  onClick={validatePokemonForm}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 px-4 rounded-lg text-sm font-bold hover:from-blue-600 hover:to-cyan-700 disabled:opacity-50 transition-all"
                >
                  ✅ Validate Pokemon
                </button>

                {/* Button 3: Trade */}
                <button
                  onClick={handleTradeOnSite}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg text-sm font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 transition-all"
                >
                  {isLoading ? 'Processing...' : '🔄 Start Trade'}
                </button>
              </div>

              {/* Pokemon Preview */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <h4 className="text-base font-semibold text-green-900 dark:text-white mb-3 text-center">
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

        {/* Trade Modal */}
        {showModal && modalContent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
            <div className="bg-gradient-to-b from-green-600 to-green-700 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-green-400/30">
              {/* Header - Green */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 py-4 px-6 text-center">
                <div className="text-3xl mb-1">✅</div>
                <h2 className="text-xl font-bold text-white">Trade Initiated!</h2>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Pokemon Info */}
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center space-x-3 mb-2">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                      alt={pokemon.name}
                      className="w-16 h-16"
                    />
                    <div className="text-left">
                      <div className="text-white font-bold">{formatPokemonName(pokemon.name)}</div>
                      <div className="text-green-200 text-sm">Level {customData.level} {customData.shiny ? '✨ Shiny' : ''}</div>
                    </div>
                  </div>
                </div>

                {/* Link Code */}
                <div className="bg-gray-800/60 rounded-xl p-4 border border-gray-700 text-center">
                  <div className="text-gray-300 text-sm mb-1">Your Trade Link Code</div>
                  <div className="text-4xl font-bold text-green-400 tracking-widest">{modalContent.command}</div>
                </div>

                {/* Queue Position */}
                <div className="flex items-center justify-between bg-white/10 rounded-xl p-4">
                  <div className="text-white">Queue Position</div>
                  <div className="text-green-300 font-bold text-xl">#{modalContent.queuePosition || 1}</div>
                </div>

                {/* Warnings if any */}
                {modalContent.warnings && modalContent.warnings.length > 0 && (
                  <div className="bg-yellow-500/20 rounded-xl p-3 text-yellow-200 text-sm">
                    {modalContent.warnings.join(', ')}
                  </div>
                )}

                {/* Mark as Obtained Button */}
                {!isPokemonOwned && (
                  <button
                    onClick={async () => {
                      await addOwnedPokemon({ 
                        id: pokemon.id, 
                        name: pokemon.name, 
                        shiny: customData.shiny,
                        game: selectedGame
                      });
                      alert('Pokemon added to your Pokedex!');
                    }}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-700 transition-all"
                  >
                    ✅ Mark as Obtained
                  </button>
                )}

                {/* Premium Button */}
                <button
                  onClick={() => {
                    window.location.href = '/last-premium';
                  }}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 px-4 rounded-xl font-bold hover:from-purple-600 hover:to-pink-700 transition-all"
                >
                  ⭐ Join Premium
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowModal(false);
                  }}
                  className="w-full bg-white/20 text-white py-3 px-4 rounded-xl font-bold hover:bg-white/30 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Validation Modal */}
        {showValidateModal && modalContent && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
            <div className={`rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border ${
              modalContent.isValid 
                ? 'bg-gradient-to-b from-green-600 to-green-700 border-green-400/30' 
                : 'bg-gradient-to-b from-red-600 to-red-700 border-red-400/30'
            }`}>
              {/* Header */}
              <div className={`py-4 px-6 text-center ${
                modalContent.isValid 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                  : 'bg-gradient-to-r from-red-500 to-orange-600'
              }`}>
                <div className="text-3xl mb-1">{modalContent.isValid ? '✅' : '❌'}</div>
                <h2 className="text-xl font-bold text-white">{modalContent.title}</h2>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                {/* Pokemon Info */}
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center space-x-3">
                    <img
                      src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                      alt={pokemon.name}
                      className="w-12 h-12"
                    />
                    <div className="text-left">
                      <div className="text-white font-bold">{formatPokemonName(pokemon.name)}</div>
                      <div className="text-green-200 text-sm">Level {customData.level} {customData.shiny ? '✨ Shiny' : ''}</div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div className={`rounded-xl p-4 text-center ${
                  modalContent.isValid ? 'bg-green-500/20' : 'bg-red-500/20'
                }`}>
                  <p className={`text-sm ${modalContent.isValid ? 'text-green-200' : 'text-red-200'}`}>
                    {modalContent.message}
                  </p>
                </div>

                {/* Errors if invalid */}
                {modalContent.errors && modalContent.errors.length > 0 && (
                  <div className="bg-red-500/20 rounded-xl p-3 text-red-200 text-sm max-h-32 overflow-y-auto">
                    {modalContent.errors.map((err, i) => (
                      <div key={i} className="mb-1">• {err}</div>
                    ))}
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={() => {
                    setShowValidateModal(false);
                  }}
                  className="w-full bg-white/20 text-white py-3 px-4 rounded-xl font-bold hover:bg-white/30 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
