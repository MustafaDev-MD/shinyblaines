// 'use client';

// import { useState, useEffect } from 'react';
// import Header from '@/components/Header';
// import Footer from '@/components/Footer';
// import PokemonCard from '@/components/PokemonCard';

// import Link from 'next/link';
// import { getPopularPokemon, getPokemonDetails, Pokemon } from '@/utils/pokemon';
// import { usePokedex } from '@/contexts/PokedexContext';

// export default function Home() {
//   const [popularPokemon, setPopularPokemon] = useState<Pokemon[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [loadingMore, setLoadingMore] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [offset, setOffset] = useState(0);
//   const [hasMore, setHasMore] = useState(true);
//   const [selectedGame, setSelectedGame] = useState('all');
//   const [showLegendaryOnly, setShowLegendaryOnly] = useState(false);
//   const [showShinyOnly, setShowShinyOnly] = useState(false);
//   const [showOwnedOnly, setShowOwnedOnly] = useState(false);
//   const [sortBy, setSortBy] = useState('id');
//   const [searchQuery, setSearchQuery] = useState('');
//   const { ownedPokemon } = usePokedex();

//   // Generate all Pokemon IDs from 1 to 1025
//   const allPokemonIds = Array.from({ length: 1025 }, (_, i) => i + 1);

//   const gamePokemonIds: { [key: string]: number[] } = {
//     all: allPokemonIds,
//     'legends-za': allPokemonIds,
//     'scarlet-violet': allPokemonIds,
//     'sword-shield': allPokemonIds,
//     'bdsp': allPokemonIds,
//     'legends-arceus': allPokemonIds,
//     'lets-go': allPokemonIds
//   };

//   const legendaryMythicalIds = [
//     // Generation 1
//     144, 145, 146, 150, 151,
//     // Generation 2  
//     243, 244, 245, 249, 250, 251,
//     // Generation 3
//     377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
//     // Generation 4
//     480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494,
//     // Generation 5
//     638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
//     // Generation 6
//     716, 717, 718, 719, 720, 721,
//     // Generation 7
//     772, 773, 774, 775, 778, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806, 807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817, 818, 819, 820, 821, 822, 823, 824, 825, 826, 827, 828, 829, 830, 831, 832, 833, 834,
//     // Generation 8
//     887, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
//     // Generation 9
//     899, 900, 901, 902, 903, 904, 905, 906, 1008, 1009, 1010,
//     // Paradox Pokemon (considered legendary-like)
//     983, 984, 985, 986, 987, 988, 989, 990, 991, 992, 993, 994, 995, 996,
//     // Ultra Beasts (legendary-like)
//     794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804
//   ];

//   const loadPokemon = async (startOffset: number = 0, append: boolean = false) => {
//     try {
//       if (startOffset === 0) {
//         setLoading(true);
//       } else {
//         setLoadingMore(true);
//       }

//       let allIds = gamePokemonIds[selectedGame] || gamePokemonIds.all;

//       if (showLegendaryOnly) {
//         allIds = allIds.filter(id => legendaryMythicalIds.includes(id));
//       }

//       if (showShinyOnly) {
//         // For demo purposes, show some popular Pokemon as "shiny available"
//         // In a real app, this would come from user data or API
//         const shinyAvailablePokemonIds = [25, 6, 150, 94, 149, 448, 658, 887, 898, 248, 445, 143, 778, 4, 1, 115, 131, 142, 181, 212, 214, 229, 282, 303, 306, 308, 310, 354, 376, 384, 414, 426, 428, 445, 460, 475, 479, 487, 497, 508, 521, 531, 534, 617, 718, 720, 773, 785, 788, 791, 794, 797, 800, 803, 806, 809, 812, 815, 818, 821, 824, 827, 830, 833, 888, 891, 894, 897, 900, 903, 906];
//         allIds = allIds.filter(id => shinyAvailablePokemonIds.includes(id));
//       }

//       if (showOwnedOnly) {
//         const ownedIds = ownedPokemon.map(p => p.id);
//         allIds = allIds.filter(id => ownedIds.includes(id));
//       }

//       if (searchQuery.trim()) {
//         const q = searchQuery.trim().toLowerCase();
//         allIds = allIds.filter((id) => String(id).includes(q));
//       }

//       const idsToLoad = allIds.slice(startOffset, startOffset + 40);
//       console.log('Loading Pokemon from offset', startOffset, 'IDs:', idsToLoad);

//       const pokemonPromises = idsToLoad.map((id: number) => 
//         getPokemonDetails(id).catch((err: any) => {
//           console.error(`Failed to fetch Pokemon ${id}:`, err);
//           return null;
//         })
//       );

//       const pokemonResults = await Promise.all(pokemonPromises);
//       let pokemon = pokemonResults.filter((p: any): p is Pokemon => p !== null);

//       // Sort Pokemon
//       pokemon = pokemon.sort((a, b) => {
//         if (sortBy === 'id') return a.id - b.id;
//         if (sortBy === 'name') return a.name.localeCompare(b.name);
//         if (sortBy === 'stats') {
//           const aTotal = a.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
//           const bTotal = b.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
//           return bTotal - aTotal;
//         }
//         return 0;
//       });

//       if (append) {
//         setPopularPokemon(prev => [...prev, ...pokemon]);
//         console.log('Appended', pokemon.length, 'Pokemon. Total now:', popularPokemon.length + pokemon.length);
//       } else {
//         setPopularPokemon(pokemon);
//         console.log('Loaded', pokemon.length, 'Pokemon');
//       }

//       const newOffset = startOffset + 40;
//       setOffset(newOffset);
//       const hasMorePokemon = newOffset < allIds.length;
//       setHasMore(hasMorePokemon);
//       console.log('Updated offset:', newOffset, 'Total available:', allIds.length, 'Has more:', hasMorePokemon);
//     } catch (err) {
//       console.error('Error fetching Pokemon:', err);
//       setError('Failed to load Pokemon data');
//     } finally {
//       setLoading(false);
//       setLoadingMore(false);
//     }
//   };

//   useEffect(() => {
//     setOffset(0); // Reset offset when filters change
//     loadPokemon();
//   }, [selectedGame, showLegendaryOnly, showShinyOnly, showOwnedOnly, sortBy, searchQuery]);

//   useEffect(() => {
//     const handleScroll = () => {
//       // Reduced threshold for earlier trigger
//       const threshold = 500;
//       const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
//       const documentHeight = document.documentElement.offsetHeight;

//       console.log('Scroll:', {
//         position: scrollPosition,
//         height: documentHeight,
//         threshold: documentHeight - threshold,
//         loading,
//         loadingMore,
//         hasMore,
//         offset
//       });

//       if (
//         scrollPosition >= documentHeight - threshold &&
//         !loading && !loadingMore && hasMore
//       ) {
//         console.log('🚀 TRIGGER: Loading more Pokemon at offset:', offset);
//         loadPokemon(offset, true);
//       }
//     };

//     // Add scroll listener
//     window.addEventListener('scroll', handleScroll);

//     // Initial check in case content is already short
//     setTimeout(handleScroll, 1000);

//     return () => window.removeEventListener('scroll', handleScroll);
//   }, [loading, loadingMore, offset, hasMore, selectedGame, showLegendaryOnly, showShinyOnly, showOwnedOnly, sortBy]);
//   const features = [
//     {
//       icon: '⚡',
//       title: 'Create Pokémon',
//       description: 'Design custom Pokémon with perfect IVs, EVs, movesets, and abilities',
//       href: '/create',
//       color: 'from-cyan-400 to-blue-500'
//     },
//     {
//       icon: '🎁',
//       title: 'Mystery Gifts',
//       description: 'Get exclusive shiny legendaries, event items, and special distributions',
//       href: '/mystery-gift',
//       color: 'from-purple-400 to-pink-500'
//     },
//     {
//       icon: '🔄',
//       title: 'Cloning Service',
//       description: 'Duplicate your favorite Pokémon and items safely and instantly',
//       href: '/clone',
//       color: 'from-green-400 to-emerald-500'
//     },
//     {
//       icon: '💱',
//       title: 'Trade System',
//       description: 'Automated 24/7 trading with competitive teams and rare collections',
//       href: '/trade',
//       color: 'from-orange-400 to-red-500'
//     }
//   ];

//   const stats = [
//     { number: '1M+', label: 'Pokémon Created' },
//     { number: '500K+', label: 'Successful Trades' },
//     { number: '24/7', label: 'Bot Availability' },
//     { number: '100%', label: 'Free Service' }
//   ];

// return (
//       <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
//         <Header />

// {/* Pokemon Showcase Section */}
//         <section className="bg-white dark:bg-black transition-colors duration-300">
//          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#d1fae5] dark:border-gray-700 transition-colors duration-300">
// {/* Controls Header */}
//             <div className="py-3 sm:py-4">
//                 <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 items-start sm:items-center bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#d1fae5] dark:border-gray-700 p-3 sm:p-4 transition-colors duration-300">

//                  {/* Dropdowns Row */}
//                  <div className="flex flex-wrap gap-3 sm:gap-4 w-full sm:w-auto">
//                     {/* Game Dropdown */}
//                     <div className="relative flex-1 sm:flex-none min-w-[140px]">
//                        <select 
//                          value={selectedGame}
//                          onChange={(e) => {
//                            setSelectedGame(e.target.value);
//                            setOffset(0);
//                          }}
//                          className="w-full appearance-none bg-[#f5f5f0] dark:bg-gray-800 border border-[#e2e8e0] dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 sm:px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer hover:bg-[#e8e8e3] dark:hover:bg-gray-700 transition-colors text-sm"
//                        >
//                        <option value="all">All Games</option>
//                        <option value="legends-za">Legends Z-A</option>
//                        <option value="scarlet-violet">Scarlet & Violet</option>
//                        <option value="sword-shield">Sword & Shield</option>
//                        <option value="bdsp">Brilliant Diamond</option>
//                        <option value="legends-arceus">Legends Arceus</option>
//                        <option value="lets-go">Let's Go</option>
//                      </select>
//                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                        </svg>
//                      </div>
//                    </div>

//                     {/* Sort Dropdown */}
//                     <div className="relative flex-1 sm:flex-none min-w-[120px]">
//                        <select 
//                          value={sortBy}
//                          onChange={(e) => {
//                            setSortBy(e.target.value);
//                            setOffset(0);
//                          }}
//                          className="w-full appearance-none bg-[#f5f5f0] dark:bg-gray-800 border border-[#e2e8e0] dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 sm:px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer hover:bg-[#e8e8e3] dark:hover:bg-gray-700 transition-colors text-sm"
//                        >
//                        <option value="id">Sort by ID</option>
//                        <option value="name">Sort by Name</option>
//                        <option value="stats">Sort by Stats</option>
//                      </select>
//                      <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
//                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                        </svg>
//                      </div>
//                    </div>
//                  </div>

//                  {/* Toggle Buttons Row */}
//                  <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full sm:w-auto">
//                    {/* Legendary Toggle */}
//                    <div className="flex items-center space-x-2">
//                      <button
//                        onClick={() => {
//                          setShowLegendaryOnly(!showLegendaryOnly);
//                          setOffset(0);
//                        }}
//                         className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
//                           showLegendaryOnly 
//                             ? 'bg-purple-600' 
//                             : 'bg-gray-400'
//                         }`}
//                      >
//                        <span
//                          className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200 ${
//                            showLegendaryOnly 
//                              ? 'translate-x-4 sm:translate-x-6' 
//                              : 'translate-x-1'
//                          }`}
//                        />
//                      </button>
//                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Legendary & Mythical</span>
//                    </div>

//                    {/* Shiny Toggle */}
//                    <div className="flex items-center space-x-2">
//                      <button
//                        onClick={() => {
//                          setShowShinyOnly(!showShinyOnly);
//                          setOffset(0);
//                        }}
//                         className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
//                           showShinyOnly 
//                             ? 'bg-yellow-500' 
//                             : 'bg-gray-400'
//                         }`}
//                      >
//                        <span
//                          className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200 ${
//                            showShinyOnly 
//                              ? 'translate-x-4 sm:translate-x-6' 
//                              : 'translate-x-1'
//                          }`}
//                        />
//                      </button>
//                       <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
//                         <img src="/masklicon.png" alt="Shiny" className="w-5 h-5 sm:w-6 sm:h-6 mr-1" /> Shiny
//                       </span>
//                    </div>

//                    {/* Owned Toggle */}
//                    <div className="flex items-center space-x-2">
//                      <button
//                        onClick={() => {
//                          setShowOwnedOnly(!showOwnedOnly);
//                          setOffset(0);
//                        }}
//                         className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
//                           showOwnedOnly 
//                             ? 'bg-green-600' 
//                             : 'bg-gray-400'
//                         }`}
//                      >
//                        <span
//                          className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200 ${
//                            showOwnedOnly 
//                              ? 'translate-x-4 sm:translate-x-6' 
//                              : 'translate-x-1'
//                          }`}
//                        />
//                      </button>
//                      <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
//                        📦 Owned
//                      </span>
//                    </div>
//                  </div>
//                </div>
//            </div>

//             {loading ? (
//               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
//                 {[...Array(8)].map((_, index) => (
//                   <div key={index} className="animate-pulse">
//                     <div className="bg-[#fafaf8] rounded-2xl shadow-lg border border-[#e2e8e0] overflow-hidden">
//                       <div className="h-40 sm:h-48 md:h-52 lg:h-56 bg-gradient-to-br from-[#f5f5f0] to-[#e8e8e3]"></div>
//                       <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
//                         <div className="h-6 sm:h-8 bg-gray-200 rounded-lg"></div>
//                         <div className="flex gap-2">
//                           <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded-full"></div>
//                           <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded-full"></div>
//                         </div>
//                         <div className="space-y-2">
//                           <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
//                           <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Search */}
//                     <div className="relative flex-1 sm:flex-none min-w-[170px]">
//                       <input
//                         value={searchQuery}
//                         onChange={(e) => {
//                           setSearchQuery(e.target.value);
//                           setOffset(0);
//                         }}
//                         placeholder="Search by Pokemon ID..."
//                         className="w-full bg-[#f5f5f0] dark:bg-gray-800 border border-[#e2e8e0] dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 sm:px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : error ? (
//              <div className="text-center py-16">
//                <div className="text-8xl mb-6">⚠️</div>
//                <h3 className="text-2xl font-bold text-green-900 mb-3">Unable to load Pokémon</h3>
//                <p className="text-gray-600 mb-6">{error}</p>
//                 <button 
//                   onClick={() => window.location.reload()}
//                   className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                 >
//                  Try Again
//                </button>
//              </div>
//            ) : popularPokemon.length === 0 ? (
//              <div className="text-center py-16">
//                <div className="text-8xl mb-6">🔄</div>
//                <h3 className="text-2xl font-bold text-green-900 mb-3">Loading Pokémon...</h3>
//                <p className="text-gray-600">Fetching data from PokéAPI</p>
//              </div>
//            ) : (
//              <>
// <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 mb-8 sm:mb-12">
//                       {[...new Map(popularPokemon.map(p => [p.id, p])).values()].map((pokemon) => (
//                         <PokemonCard 
//                           key={pokemon.id} 
//                           pokemon={pokemon} 
//                           showShiny={showShinyOnly}
//                         />
//                       ))}
//                     </div>

// {/* Load More Indicator */}
//                 <div className="text-center mt-8">
//                   {loadingMore ? (
//                     <div className="flex items-center justify-center space-x-2">
//                        <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
//                       <span className="text-gray-600">Loading more Pokémon...</span>
//                     </div>
//                   ) : hasMore ? (
//                     <div className="flex flex-col items-center">
//                       <div className="text-gray-500 mb-2">Scroll down for more Pokémon</div>
//                       <div className="animate-bounce text-2xl">⬇️</div>
//                        <button 
//                          onClick={() => loadPokemon(offset, true)}
//                          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
//                        >
//                         Load More
//                       </button>
//                     </div>
//                   ) : (
//                     <div className="text-gray-500">
//                       <div className="text-lg font-semibold mb-2">🎉 All Pokémon loaded!</div>
//                       <div>Total: {popularPokemon.length} Pokémon</div>
//                     </div>
//                   )}
//                 </div>
//              </>
//            )}


//          </div>
// </section>

//        <Footer />
//      </div>
//    );
//  }

'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PokemonCard from '@/components/PokemonCard';

import Link from 'next/link';
import { getPopularPokemon, getPokemonDetails, Pokemon } from '@/utils/pokemon';
import { usePokedex } from '@/contexts/PokedexContext';

export default function Home() {
  const [popularPokemon, setPopularPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [selectedGame, setSelectedGame] = useState('all');
  const [showLegendaryOnly, setShowLegendaryOnly] = useState(false);
  const [showShinyOnly, setShowShinyOnly] = useState(false);
  const [showOwnedOnly, setShowOwnedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('id');
  const [searchQuery, setSearchQuery] = useState('');
  const { ownedPokemon } = usePokedex();
  const [allPokemonList, setAllPokemonList] = useState<{ name: string; url: string }[]>([]);

  useEffect(() => {
    const fetchAllPokemonNames = async () => {
      try {
        const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=11000');
        const data = await res.json();
        setAllPokemonList(data.results);
      } catch (err) {
        console.error('Failed to load pokemon names', err);
      }
    };

    fetchAllPokemonNames();
  }, []);

  // const allPokemonIds = Array.from({ length: 1025 }, (_, i) => i + 1);

  const allPokemonIds = allPokemonList.map(p =>
    Number(p.url.split('/').filter(Boolean).pop())
  );

  const gamePokemonIds: { [key: string]: number[] } = {
    all: allPokemonIds,
    'legends-za': allPokemonIds,
    'scarlet-violet': allPokemonIds,
    'sword-shield': allPokemonIds,
    'bdsp': allPokemonIds,
    'legends-arceus': allPokemonIds,
    'lets-go': allPokemonIds
  };

  // const gamePokemonIds: { [key: string]: number[] } = {
  //   all: allPokemonIds,
  //   'legends-za': allPokemonIds,
  //   'scarlet-violet': allPokemonIds,
  //   'sword-shield': allPokemonIds,
  //   'bdsp': allPokemonIds,
  //   'legends-arceus': allPokemonIds,
  //   'lets-go': allPokemonIds
  // };

  const legendaryMythicalIds = [
    144, 145, 146, 150, 151,
    243, 244, 245, 249, 250, 251,
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386,
    480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494,
    638, 639, 640, 641, 642, 643, 644, 645, 646, 647, 648, 649,
    716, 717, 718, 719, 720, 721,
    772, 773, 785, 786, 787, 788, 789, 790, 791, 792, 800, 801, 802, 807, 808, 809,
    888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898,
    1008, 1009, 1010, 1007, 1014, 1015, 1016, 1017, 1024, 1025, 10169, 10000,
    // 794, 795, 796, 797, 798, 799, 803, 804
  ];

  const [pokemonNameCache, setPokemonNameCache] = useState<Record<number, string>>({});

  const loadPokemon = async (startOffset: number = 0, append: boolean = false) => {
    if (allPokemonList.length === 0) return; //
    try {
      if (startOffset === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      let allIds = gamePokemonIds[selectedGame] || gamePokemonIds.all;

      if (showLegendaryOnly) {
        allIds = allIds.filter(id => legendaryMythicalIds.includes(id));
      }

      if (showShinyOnly) {
        const shinyAvailablePokemonIds = [25, 6, 150, 94, 149, 448, 658, 887, 898, 248, 445, 143, 4, 1, 131, 384, 487, 497, 718, 800, 888, 894, 897];
        allIds = allIds.filter(id => shinyAvailablePokemonIds.includes(id));
      }

      if (showOwnedOnly) {
        const ownedIds = ownedPokemon.map(p => p.id);
        allIds = allIds.filter(id => ownedIds.includes(id));
      }

      // if (searchQuery.trim()) {
      //   const q = searchQuery.trim().toLowerCase();

      //   const idMatches = allIds.filter(id =>
      //     String(id).includes(q)
      //   );

      //   const nameMatches = allPokemonList
      //     .filter(p => p.name.toLowerCase().includes(q))
      //     .map(p => Number(p.url.split('/').filter(Boolean).pop()))
      //     .filter(id => allIds.includes(id));

      //   const combined = [...new Set([...idMatches, ...nameMatches])];

      //   allIds = combined.length > 0 ? combined : allIds.filter(id =>
      //     String(id).includes(q)
      //   );
      // }

      if (searchQuery.trim()) {
        const normalize = (str: string) =>
          str.toLowerCase().replace(/[-\s]/g, '');

        const q = normalize(searchQuery);

        const idMatches = allIds.filter(id =>
          String(id).includes(q)
        );

        const nameMatches = allPokemonList
          .filter(p => normalize(p.name).includes(q))
          .map(p => Number(p.url.split('/').filter(Boolean).pop()))
          .filter(id => allIds.includes(id));

        const combined = [...new Set([...idMatches, ...nameMatches])];

        allIds = combined;
      }

      const idsToLoad = allIds.slice(startOffset, startOffset + 40);

      const pokemonPromises = idsToLoad.map((id: number) =>
        getPokemonDetails(id).catch((err: any) => {
          console.error(`Failed to fetch Pokemon ${id}:`, err);
          return null;
        })
      );

      const pokemonResults = await Promise.all(pokemonPromises);
      let pokemon = pokemonResults.filter((p: any): p is Pokemon => p !== null);

      pokemon.forEach(p => {
        if (!pokemonNameCache[p.id]) {
          setPokemonNameCache(prev => ({ ...prev, [p.id]: p.name }));
        }
      });

      pokemon = pokemon.sort((a, b) => {
        if (sortBy === 'id') return a.id - b.id;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'stats') {
          const aTotal = a.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
          const bTotal = b.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
          return bTotal - aTotal;
        }
        return 0;
      });

      if (append) {
        setPopularPokemon(prev => [...prev, ...pokemon]);
      } else {
        setPopularPokemon(pokemon);
      }

      const newOffset = startOffset + 40;
      setOffset(newOffset);
      setHasMore(newOffset < allIds.length);
    } catch (err) {
      console.error('Error fetching Pokemon:', err);
      setError('Failed to load Pokemon data');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // useEffect(() => {
  //   setOffset(0);
  //   loadPokemon();
  // }, [selectedGame, showLegendaryOnly, showShinyOnly, showOwnedOnly, sortBy, searchQuery]);

  useEffect(() => {
    if (allPokemonList.length === 0) return; // 🔥 IMPORTANT

    setOffset(0);
    loadPokemon();
  }, [
    allPokemonList, // 🔥 add this
    selectedGame,
    showLegendaryOnly,
    showShinyOnly,
    showOwnedOnly,
    sortBy,
    searchQuery
  ]);

  useEffect(() => {
    const handleScroll = () => {
      const threshold = 500;
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const documentHeight = document.documentElement.offsetHeight;

      if (
        scrollPosition >= documentHeight - threshold &&
        !loading && !loadingMore && hasMore
      ) {
        loadPokemon(offset, true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // setTimeout(handleScroll, 1000);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, offset, hasMore, selectedGame, showLegendaryOnly, showShinyOnly, showOwnedOnly, sortBy]);

  const groupBySpecies = (pokemonList: Pokemon[]) => {
    const map = new Map();

    pokemonList.forEach(p => {
      const baseName = p.name.replace(/-.*$/, ''); // simple grouping

      if (!map.has(baseName)) {
        map.set(baseName, []);
      }

      map.get(baseName).push(p);
    });

    return Array.from(map.entries()).map(([name, forms]) => ({
      name,
      forms
    }));
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors duration-300">
      <Header />

      <section className="bg-white dark:bg-black transition-colors duration-300">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#d1fae5] dark:border-gray-700 transition-colors duration-300">

          {/* Controls Header */}
          <div className="py-3 sm:py-4">
            <div className="flex flex-col gap-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-[#d1fae5] dark:border-gray-700 p-3 sm:p-4 transition-colors duration-300">

              {/* ─── Single Row: Search + Dropdowns + Toggles ─────────────────── */}
              <div className="flex flex-col sm:flex-row flex-wrap justify-between gap-3 items-start sm:items-center">

                {/* Left group: Search + Game + Sort */}
                <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto items-center">

                  {/* ── Search bar — compact, fits inline ── */}
                  <div className="relative flex-1 sm:flex-none sm:w-44">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                      </svg>
                    </div>
                    <input
                      value={searchQuery}
                      onChange={(e) => { setSearchQuery(e.target.value); setOffset(0); }}
                      placeholder="Name or ID…"
                      className="w-full bg-[#f5f5f0] dark:bg-gray-800 border border-[#e2e8e0] dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 pl-8 pr-6 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-sm"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => { setSearchQuery(''); setOffset(0); }}
                        className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Game Dropdown */}
                  <div className="relative flex-1 sm:flex-none min-w-[130px]">
                    <select
                      value={selectedGame}
                      onChange={(e) => { setSelectedGame(e.target.value); setOffset(0); }}
                      className="w-full appearance-none bg-[#f5f5f0] dark:bg-gray-800 border border-[#e2e8e0] dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 pr-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer hover:bg-[#e8e8e3] dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      <option value="all">All Games</option>
                      <option value="legends-za">Legends Z-A</option>
                      <option value="scarlet-violet">Scarlet & Violet</option>
                      <option value="sword-shield">Sword & Shield</option>
                      <option value="bdsp">Brilliant Diamond</option>
                      <option value="legends-arceus">Legends Arceus</option>
                      <option value="lets-go">Let's Go</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Sort Dropdown */}
                  <div className="relative flex-1 sm:flex-none min-w-[110px]">
                    <select
                      value={sortBy}
                      onChange={(e) => { setSortBy(e.target.value); setOffset(0); }}
                      className="w-full appearance-none bg-[#f5f5f0] dark:bg-gray-800 border border-[#e2e8e0] dark:border-gray-600 text-gray-700 dark:text-gray-200 py-2 px-3 pr-7 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer hover:bg-[#e8e8e3] dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      <option value="id">Sort: ID</option>
                      <option value="name">Sort: Name</option>
                      <option value="stats">Sort: Stats</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                      <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Right group: Toggles */}
                <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full sm:w-auto">
                  {/* Legendary Toggle */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => { setShowLegendaryOnly(!showLegendaryOnly); setOffset(0); }}
                      className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${showLegendaryOnly ? 'bg-purple-600' : 'bg-gray-400'}`}
                    >
                      <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200 ${showLegendaryOnly ? 'translate-x-4 sm:translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Legendary</span>
                  </div>

                  {/* Shiny Toggle */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => { setShowShinyOnly(!showShinyOnly); setOffset(0); }}
                      className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${showShinyOnly ? 'bg-yellow-500' : 'bg-gray-400'}`}
                    >
                      <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200 ${showShinyOnly ? 'translate-x-4 sm:translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <img src="/masklicon.png" alt="Shiny" className="w-4 h-4 sm:w-5 sm:h-5 mr-1" /> Shiny
                    </span>
                  </div>

                  {/* Owned Toggle */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => { setShowOwnedOnly(!showOwnedOnly); setOffset(0); }}
                      className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${showOwnedOnly ? 'bg-green-600' : 'bg-gray-400'}`}
                    >
                      <span className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200 ${showOwnedOnly ? 'translate-x-4 sm:translate-x-6' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">📦 Owned</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-[#fafaf8] rounded-2xl shadow-lg border border-[#e2e8e0] overflow-hidden">
                    <div className="h-40 sm:h-48 md:h-52 lg:h-56 bg-gradient-to-br from-[#f5f5f0] to-[#e8e8e3]"></div>
                    <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                      <div className="h-6 sm:h-8 bg-gray-200 rounded-lg"></div>
                      <div className="flex gap-2">
                        <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded-full"></div>
                        <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">⚠️</div>
              <h3 className="text-2xl font-bold text-green-900 mb-3">Unable to load Pokémon</h3>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : popularPokemon.length === 0 ? (
            <div className="text-center py-16">
              {searchQuery ? (
                <>
                  <div className="text-8xl mb-6">🔍</div>
                  <h3 className="text-2xl font-bold text-green-900 mb-3">No results for "{searchQuery}"</h3>
                  <p className="text-gray-600 mb-4">Try searching by a different name or Pokédex number</p>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Clear Search
                  </button>
                </>
              ) : (
                <>
                  <div className="text-8xl mb-6">🔄</div>
                  <h3 className="text-2xl font-bold text-green-900 mb-3">Loading Pokémon...</h3>
                  <p className="text-gray-600">Fetching data from PokéAPI</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 mb-8 sm:mb-12">
                {[...new Map(popularPokemon.map(p => [p.id, p])).values()].map((pokemon) => (
                  <PokemonCard
                    key={pokemon.id}
                    pokemon={pokemon}
                    showShiny={showShinyOnly}
                  />
                ))}
              </div>

              <div className="text-center mt-8 pb-8">
                {loadingMore ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600">Loading more Pokémon...</span>
                  </div>
                ) : hasMore ? (
                  <div className="flex flex-col items-center">
                    <div className="text-gray-500 mb-2">Scroll down for more Pokémon</div>
                    <div className="animate-bounce text-2xl">⬇️</div>
                    <button
                      onClick={() => loadPokemon(offset, true)}
                      className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Load More
                    </button>
                  </div>
                ) : (
                  <div className="text-gray-500">
                    <div className="text-lg font-semibold mb-2">🎉 All Pokémon loaded!</div>
                    <div>Total: {popularPokemon.length} Pokémon</div>
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </section>

      <Footer />
    </div>
  );
}