'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getPokemonDetails, Pokemon } from '@/utils/pokemon';

interface TradeResult {
  linkCode: string;
  queuePosition: number;
  discordConnected: boolean;
}

export default function PokedexPage() {
  const [selectedGame, setSelectedGame] = useState<string>('');
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [filteredList, setFilteredList] = useState<Pokemon[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedPokemonIds, setSelectedPokemonIds] = useState<number[]>([]);
  const [trainerName, setTrainerName] = useState('');
  const [ot, setOt] = useState('');
  const [tid, setTid] = useState('');
  const [sid, setSid] = useState('');
  const [customLinkCode, setCustomLinkCode] = useState('');

  const [isStartingTrade, setIsStartingTrade] = useState(false);
  const [tradeResult, setTradeResult] = useState<TradeResult | null>(null);

  // Different ID ranges per game so list visibly changes when switching games
  const gamePokemonIds: Record<string, number[]> = {
    'legends-za': Array.from({ length: 200 }, (_, i) => i + 1),           // 1-200
    'scarlet-violet': Array.from({ length: 200 }, (_, i) => i + 201),     // 201-400
    'sword-shield': Array.from({ length: 200 }, (_, i) => i + 401),       // 401-600
    bdsp: Array.from({ length: 200 }, (_, i) => i + 601),                 // 601-800
    'legends-arceus': Array.from({ length: 200 }, (_, i) => i + 801),    // 801-1000
  };

  // Load Pokémon when game changes
  useEffect(() => {
    if (!selectedGame) {
      setLoading(false);
      setPokemonList([]);
      setFilteredList([]);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        setPokemonList([]);
        setFilteredList([]);
        setSelectedPokemonIds([]);
        setTradeResult(null);

        const ids = gamePokemonIds[selectedGame] ?? [];
        const promises = ids.map(id => getPokemonDetails(id).catch(() => null));
        const results = await Promise.all(promises);
        if (cancelled) return;
        const valid = results.filter((p): p is Pokemon => p !== null);
        valid.sort((a, b) => a.name.localeCompare(b.name));
        setPokemonList(valid);
        setFilteredList(valid);
      } catch {
        if (!cancelled) setError('Failed to load Pokémon data');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [selectedGame]);

  // Filter by search
  useEffect(() => {
    if (!search.trim()) {
      setFilteredList(pokemonList);
      return;
    }
    const q = search.trim().toLowerCase();
    setFilteredList(
      pokemonList.filter(p => p.name.toLowerCase().includes(q)),
    );
  }, [search, pokemonList]);

  const toggleSelectPokemon = (id: number) => {
    setSelectedPokemonIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      // Free users: limit 3; premium: 8 (for now we hard‑limit 3)
      if (prev.length >= 3) return prev; // adjust to 8 later for premium
      return [...prev, id];
    });
  };

  const canStartTrade = trainerName.trim().length > 0 && selectedPokemonIds.length > 0;

  const handleStartTrade = async () => {
    if (!canStartTrade) return;
    setIsStartingTrade(true);
    setTradeResult(null);

    try {
      // For now send first selected Pokémon only (can be extended to multi)
      const firstId = selectedPokemonIds[0];
      const selected = pokemonList.find(p => p.id === firstId);
      if (!selected) {
        setIsStartingTrade(false);
        return;
      }

      const response = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemon: {
            pokemonName: selected.name,
            pokemonId: selected.id,
            shiny: false,
            alpha: false,
            level: 100,
            nature: 'modest',
            ability: '',
            moves: [],
            ivs: {},
            evs: {},
            item: 'none',
            game: selectedGame,
            trainerName: trainerName || ot,
          },
          userId: undefined,
          userName: trainerName,
          customLinkCode,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || 'Trade failed. Please check your details and try again.');
        setIsStartingTrade(false);
        return;
      }

      setTradeResult({
        linkCode: data.linkCode,
        queuePosition: data.queuePosition,
        discordConnected: !!data.discordConnected,
      });
    } catch {
      alert('Unable to start trade right now. Please try again later.');
    } finally {
      setIsStartingTrade(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Step 1 + Step 2 header */}
        <section className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-green-900 dark:text-white mb-4 text-center">
            🎁 All Pokémon Trades
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 space-y-4">
              {/* Step 1: Game */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-sm font-bold">
                    1
                  </span>
                  <h2 className="text-sm font-semibold text-green-900 dark:text-white">
                    Select Your Game
                  </h2>
                </div>
                <select
                  value={selectedGame}
                  onChange={e => setSelectedGame(e.target.value)}
                  className="w-full max-w-xs px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-green-900 dark:text-white"
                >
                  <option value="">Select Game</option>
                  <option value="legends-za">Legends: Z-A</option>
                  <option value="scarlet-violet">Scarlet / Violet</option>
                  <option value="sword-shield">Sword / Shield</option>
                  <option value="bdsp">Brilliant Diamond / Shining Pearl</option>
                  <option value="legends-arceus">Legends Arceus</option>
                </select>
              </div>

              {/* Step 2: Pokémon grid */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-[#e2e8e0] dark:border-gray-700 p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-sm font-bold">
                      2
                    </span>
                    <div>
                      <h3 className="text-sm font-semibold text-green-900 dark:text-white">
                        Choose Your Pokémon
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        Click to select up to 3 Pokémon for free users (8 for premium).
                      </p>
                    </div>
                  </div>
                  <div className="w-full md:w-64">
                    <input
                      type="text"
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      placeholder="Search by name..."
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-green-900 dark:text-white"
                    />
                  </div>
                </div>

                {!selectedGame ? (
                  <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    Please select a game above to see available Pokémon.
                  </div>
                ) : loading ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {[...Array(8)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-[#fafaf8] rounded-xl border border-[#e2e8e0] h-24" />
                      </div>
                    ))}
                  </div>
                ) : error ? (
                  <div className="py-8 text-center text-sm text-red-600 dark:text-red-400">
                    {error}
                  </div>
                ) : filteredList.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                    No Pokémon match your search.
                  </div>
                ) : (
                  <div key={selectedGame} className="max-h-[420px] overflow-y-auto pr-1">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                      {filteredList.map(p => {
                        const selected = selectedPokemonIds.includes(p.id);
                        const sprite =
                          p.sprites.other?.['official-artwork']?.front_default ||
                          p.sprites.front_default;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => toggleSelectPokemon(p.id)}
                            className={`text-xs rounded-lg border px-2 py-2 text-left transition-all ${
                              selected
                                ? 'border-green-600 bg-green-50 dark:bg-green-900/40'
                                : 'border-gray-200 dark:border-gray-700 bg-[#fafaf8] dark:bg-gray-800'
                            }`}
                          >
                            <div className="flex flex-col items-center gap-1">
                              {sprite && (
                                <img
                                  src={sprite}
                                  alt={p.name}
                                  className="w-14 h-14 object-contain"
                                />
                              )}
                              <div className="font-semibold text-green-900 dark:text-green-100 truncate w-full text-center">
                                {p.name}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Trainer details + Start Trade */}
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-[#e2e8e0] dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-green-900 dark:text-white mb-3">
                  Start Trade
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Your In-Game Name *
                    </label>
                    <input
                      type="text"
                      value={trainerName}
                      onChange={e => setTrainerName(e.target.value)}
                      placeholder="Maximum 12 characters"
                      maxLength={12}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-green-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      OT (Original Trainer)
                    </label>
                    <input
                      type="text"
                      value={ot}
                      onChange={e => setOt(e.target.value)}
                      placeholder="Optional - Max 12 characters"
                      maxLength={12}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-green-900 dark:text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                        TID (Trainer ID)
                      </label>
                      <input
                        type="number"
                        value={tid}
                        onChange={e => setTid(e.target.value)}
                        placeholder="Optional - Max 6 digits"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-green-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                        SID (Secret ID)
                      </label>
                      <input
                        type="number"
                        value={sid}
                        onChange={e => setSid(e.target.value)}
                        placeholder="Optional - Max 4 digits"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-green-900 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Custom Link Code
                    </label>
                    <input
                      type="text"
                      value={customLinkCode}
                      onChange={e => setCustomLinkCode(e.target.value)}
                      placeholder="Optional - digits only"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs text-green-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleStartTrade}
                  disabled={!canStartTrade || isStartingTrade}
                  className={`mt-4 w-full py-2.5 rounded-lg text-xs font-bold text-white transition-colors ${
                    canStartTrade && !isStartingTrade
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isStartingTrade ? 'Starting Trade...' : 'Start Trade'}
                </button>

                {tradeResult && (
                  <div className="mt-4 border border-green-200 dark:border-green-700 rounded-lg p-3 text-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">✨</span>
                      <span className="font-semibold text-green-900 dark:text-green-100">
                        Trade successfully started!
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      Refresh the page to start a new trade.
                    </p>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span>🔗</span>
                          <span className="font-semibold text-green-900 dark:text-green-100">
                            Your Link Code
                          </span>
                        </div>
                        <div className="text-xl font-mono font-bold text-green-700 dark:text-green-300">
                          {tradeResult.linkCode}
                        </div>
                      </div>
                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span>📊</span>
                          <span className="font-semibold text-green-900 dark:text-green-100">
                            Trade Status
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-200 mb-1">
                          Successfully queued custom Pokémon trade!
                        </p>
                        <p className="text-gray-700 dark:text-gray-200">
                          Queue Position{' '}
                          <span className="font-semibold">
                            #{tradeResult.queuePosition}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl shadow-lg p-4 text-white text-xs">
                <h3 className="text-sm font-semibold mb-1">Premium Users</h3>
                <p className="mb-2">
                  Premium users can select up to 8 Pokémon at once for trades instead of 3!
                </p>
                <a
                  href="/premium"
                  className="inline-flex items-center justify-center w-full px-3 py-2 rounded-lg bg-black/20 hover:bg-black/30 font-bold transition-colors"
                >
                  ⭐ Upgrade Here
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}