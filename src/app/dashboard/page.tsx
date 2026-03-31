'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';
import { usePokedex } from '@/contexts/PokedexContext';

const gameLabel: Record<string, string> = {
  'scarlet-violet': 'Scarlet / Violet',
  'sword-shield': 'Sword / Shield',
  bdsp: 'BDSP',
  'legends-arceus': 'Legends Arceus',
  'legends-za': 'Legends Z-A',
};

export default function DashboardPage() {
  const { user, isLoading: authLoading, signIn } = useAuth();
  const { ownedPokemon, tradeHistory, isLoading } = usePokedex();
  const [search, setSearch] = useState('');

  const normalizedOwned = useMemo(
    () =>
      ownedPokemon.map((p: any) => ({
        id: Number(p.id),
        name: String(p.name || `Pokemon #${p.id}`),
        shiny: Boolean(p.shiny),
        game: String(p.game || 'unknown'),
      })),
    [ownedPokemon]
  );

  const filteredOwned = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return normalizedOwned;
    return normalizedOwned.filter(
      (p) => p.name.toLowerCase().includes(q) || String(p.id).includes(q)
    );
  }, [normalizedOwned, search]);

  const completedTrades = tradeHistory.filter((t) => {
    const s = String(t.status || '');
    return s === 'ready' || s === 'completed';
  }).length;
  const pendingTrades = tradeHistory.filter((t) => String(t.status || '') === 'pending').length;
  const shinyOwned = normalizedOwned.filter((p) => p.shiny).length;

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-green-900 dark:text-white">Trainer Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mt-1">
            View your account details, trade stats, and owned Pokemon in one place.
          </p>
        </div>

        {!authLoading && !user ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#d1fae5] dark:border-gray-700 p-6 text-center shadow-sm">
            <div className="text-4xl mb-3">🔐</div>
            <h2 className="text-xl font-semibold text-green-900 dark:text-white">Sign in required</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2 mb-4">
              Sign in with your Google account to access your dashboard.
            </p>
            <button
              onClick={signIn}
              className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
            >
              Sign In
            </button>
          </div>
        ) : (
          <>
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard title="Owned Pokemon" value={String(normalizedOwned.length)} icon="📦" />
              <StatCard title="Shiny Owned" value={String(shinyOwned)} icon="✨" />
              <StatCard title="Completed Trades" value={String(completedTrades)} icon="✅" />
              <StatCard title="Pending Trades" value={String(pendingTrades)} icon="⏳" />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1 bg-white dark:bg-gray-900 rounded-2xl border border-[#d1fae5] dark:border-gray-700 p-5 shadow-sm">
                <h2 className="text-lg font-semibold text-green-900 dark:text-white mb-4">Profile</h2>
                <div className="flex items-center gap-3">
                  <img
                    src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.uid || 'guest'}`}
                    alt={user?.displayName || 'Trainer'}
                    className="w-14 h-14 rounded-full border-2 border-green-300"
                  />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{user?.displayName || 'Trainer'}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 break-all">{user?.email || '-'}</div>
                  </div>
                </div>
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-300">
                  <div className="mb-1"><span className="font-medium">UID:</span> {user?.uid}</div>
                </div>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl border border-[#d1fae5] dark:border-gray-700 p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-green-900 dark:text-white">Owned Pokemon</h2>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or id..."
                    className="w-full sm:w-64 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
                  />
                </div>

                {isLoading ? (
                  <p className="text-gray-600 dark:text-gray-300">Loading owned Pokemon...</p>
                ) : filteredOwned.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-300">No owned Pokemon found.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
                    {filteredOwned.map((pokemon) => (
                      <div
                        key={`${pokemon.id}-${pokemon.name}`}
                        className="rounded-xl border border-gray-200 dark:border-gray-700 bg-[#f8fffc] dark:bg-gray-800 p-3 text-center"
                      >
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                          alt={pokemon.name}
                          className="w-16 h-16 mx-auto"
                        />
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {pokemon.name}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          #{pokemon.id} {pokemon.shiny ? '• ✨' : ''}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-[#d1fae5] dark:border-gray-700 p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-green-900 dark:text-white mb-4">Recent Trades</h2>
              {tradeHistory.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-300">No trade history yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                        <th className="py-2 pr-4">Pokemon</th>
                        <th className="py-2 pr-4">Game</th>
                        <th className="py-2 pr-4">Link Code</th>
                        <th className="py-2 pr-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tradeHistory.slice(0, 20).map((trade, idx) => (
                        <tr key={trade.id || idx} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 pr-4 text-gray-900 dark:text-white">{trade.pokemonName}</td>
                          <td className="py-2 pr-4 text-gray-700 dark:text-gray-300">
                            {gameLabel[trade.game] || trade.game || '-'}
                          </td>
                          <td className="py-2 pr-4 text-gray-700 dark:text-gray-300 font-mono">{trade.linkCode || '-'}</td>
                          <td className="py-2 pr-4">
                            <span className="px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-200">
                              {trade.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-[#d1fae5] dark:border-gray-700 p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-600 dark:text-gray-300">{title}</div>
          <div className="text-2xl font-bold text-green-900 dark:text-white">{value}</div>
        </div>
        <div className="text-2xl">{icon}</div>
      </div>
    </div>
  );
}
