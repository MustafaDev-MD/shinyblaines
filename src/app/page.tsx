'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import PokemonCard from '@/components/PokemonCard';

import Link from 'next/link';
import { getPopularPokemon, getPokemonDetails, Pokemon } from '@/utils/pokemon';

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

  const gamePokemonIds: { [key: string]: number[] } = {
    all: [25, 6, 150, 94, 149, 448, 658, 887, 898, 248, 445, 143, 778, 4, 1, 94, 115, 131, 142, 181, 212, 214, 229, 248, 282, 303, 306, 308, 310, 354, 376, 384, 414, 426, 428, 445, 448, 460, 475, 479, 487, 497, 508, 521, 531, 534, 617],
    'legends-za': [25, 6, 150, 94, 149, 448, 658, 887, 898, 248, 445, 143, 778, 4, 1, 115, 131, 142, 181, 212, 214, 229, 282, 303, 306, 308, 310, 354, 376, 384, 414, 426, 428, 460, 475, 479, 487, 497, 508, 521, 531, 534, 617],
    'scarlet-violet': [25, 6, 150, 94, 149, 448, 658, 887, 898, 248, 445, 143, 778, 4, 1, 115, 131, 142, 181, 212, 214, 229, 282, 303, 306, 308, 310, 354, 376, 384, 414, 426, 428, 460, 475, 479, 487, 497, 508, 521, 531, 534, 617],
    'sword-shield': [25, 6, 150, 94, 149, 445, 143, 131, 212, 214, 229, 248, 282, 303, 306, 308, 310, 354, 376, 384, 414, 426, 428, 460, 475, 479, 487, 497, 508, 521, 531, 534, 617, 778, 4, 1, 115, 142, 181],
    'bdsp': [25, 6, 150, 94, 149, 445, 143, 4, 1, 131, 115, 142, 181, 212, 214, 229, 248, 282, 303, 306, 308, 310, 354, 376, 384, 414, 426, 428, 460, 475, 479, 487, 497, 508, 521, 531, 534, 617, 778],
    'legends-arceus': [25, 6, 150, 94, 149, 448, 898, 248, 445, 143, 778, 4, 1, 115, 131, 142, 181, 212, 214, 229, 248, 282, 303, 306, 308, 310, 354, 376, 384, 414, 426, 428, 460, 475, 479, 487, 497, 508, 521, 531, 534, 617],
    'lets-go': [25, 6, 150, 94, 143, 4, 1, 115, 131, 142, 181, 212, 214, 229, 248, 282, 303, 306, 308, 310, 354, 376, 384, 414, 426, 428, 460, 475, 479, 487, 497, 508, 521, 531, 534, 617, 778, 445, 149, 248]
  };

  const legendaryMythicalIds = [150, 151, 249, 250, 382, 383, 384, 385, 480, 481, 482, 483, 484, 485, 486, 487, 488, 489, 490, 491, 492, 493, 494, 495, 496, 497, 643, 644, 645, 646, 647, 648, 649, 716, 717, 718, 719, 720, 721, 772, 773, 774, 775, 778, 785, 786, 787, 788, 789, 790, 791, 792, 793, 794, 795, 796, 797, 798, 799, 800, 801, 802, 803, 804, 805, 806, 807, 808, 809, 810, 811, 812, 813, 814, 815, 816, 817, 818, 819, 820, 821, 822, 823, 824, 825, 826, 827, 828, 829, 830, 831, 832, 833, 834, 887, 888, 889, 890, 891, 892, 893, 894, 895, 896, 897, 898, 899, 900, 901, 902, 903, 904, 905, 906, 1008, 1009, 1010];

  const loadPokemon = async (startOffset: number = 0, append: boolean = false) => {
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
        // For demo purposes, we'll show a subset of Pokemon as "shiny"
        // In a real app, this would come from user data
        const shinyPokemonIds = [25, 6, 150, 94, 149, 448, 658, 887, 898, 248];
        allIds = allIds.filter(id => shinyPokemonIds.includes(id));
      }
      
      if (showOwnedOnly) {
        // For demo purposes, we'll show a subset of Pokemon as "owned"
        // In a real app, this would come from user's collection
        const ownedPokemonIds = [25, 6, 150, 1, 4, 7, 94, 143, 145, 146];
        allIds = allIds.filter(id => ownedPokemonIds.includes(id));
      }

      const idsToLoad = allIds.slice(startOffset, startOffset + 8);
      console.log('Loading Pokemon from offset', startOffset, 'IDs:', idsToLoad);
      
      const pokemonPromises = idsToLoad.map((id: number) => 
        getPokemonDetails(id).catch((err: any) => {
          console.error(`Failed to fetch Pokemon ${id}:`, err);
          return null;
        })
      );

      const pokemonResults = await Promise.all(pokemonPromises);
      let pokemon = pokemonResults.filter((p: any): p is Pokemon => p !== null);

      // Sort Pokemon
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
        console.log('Appended', pokemon.length, 'Pokemon. Total now:', popularPokemon.length + pokemon.length);
      } else {
        setPopularPokemon(pokemon);
        console.log('Loaded', pokemon.length, 'Pokemon');
      }

      const newOffset = startOffset + 8;
      setOffset(newOffset);
      const hasMorePokemon = newOffset < allIds.length;
      setHasMore(hasMorePokemon);
      console.log('Updated offset:', newOffset, 'Total available:', allIds.length, 'Has more:', hasMorePokemon);
    } catch (err) {
      console.error('Error fetching Pokemon:', err);
      setError('Failed to load Pokemon data');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setOffset(0); // Reset offset when filters change
    loadPokemon();
  }, [selectedGame, showLegendaryOnly, showShinyOnly, showOwnedOnly, sortBy]);

  useEffect(() => {
    const handleScroll = () => {
      // Reduced threshold for earlier trigger
      const threshold = 500;
      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const documentHeight = document.documentElement.offsetHeight;
      
      console.log('Scroll:', {
        position: scrollPosition,
        height: documentHeight,
        threshold: documentHeight - threshold,
        loading,
        loadingMore,
        hasMore,
        offset
      });
      
      if (
        scrollPosition >= documentHeight - threshold &&
        !loading && !loadingMore && hasMore
      ) {
        console.log('🚀 TRIGGER: Loading more Pokemon at offset:', offset);
        loadPokemon(offset, true);
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', handleScroll);
    
    // Initial check in case content is already short
    setTimeout(handleScroll, 1000);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, loadingMore, offset, hasMore, selectedGame, showLegendaryOnly, showShinyOnly, showOwnedOnly, sortBy]);
  const features = [
    {
      icon: '⚡',
      title: 'Create Pokémon',
      description: 'Design custom Pokémon with perfect IVs, EVs, movesets, and abilities',
      href: '/create',
      color: 'from-cyan-400 to-blue-500'
    },
    {
      icon: '🎁',
      title: 'Mystery Gifts',
      description: 'Get exclusive shiny legendaries, event items, and special distributions',
      href: '/mystery-gift',
      color: 'from-purple-400 to-pink-500'
    },
    {
      icon: '🔄',
      title: 'Cloning Service',
      description: 'Duplicate your favorite Pokémon and items safely and instantly',
      href: '/clone',
      color: 'from-green-400 to-emerald-500'
    },
    {
      icon: '💱',
      title: 'Trade System',
      description: 'Automated 24/7 trading with competitive teams and rare collections',
      href: '/trade',
      color: 'from-orange-400 to-red-500'
    }
  ];

  const stats = [
    { number: '1M+', label: 'Pokémon Created' },
    { number: '500K+', label: 'Successful Trades' },
    { number: '24/7', label: 'Bot Availability' },
    { number: '100%', label: 'Free Service' }
  ];

return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Header />

{/* Pokemon Showcase Section */}
        <section className="bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
         <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
{/* Controls Header */}
            <div className="py-3 sm:py-4">
               <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 items-start sm:items-center bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-3 sm:p-4 transition-colors duration-300">
                 
                 {/* Dropdowns Row */}
                 <div className="flex flex-wrap gap-3 sm:gap-4 w-full sm:w-auto">
                   {/* Game Dropdown */}
                   <div className="relative flex-1 sm:flex-none min-w-[140px]">
                     <select 
                       value={selectedGame}
                       onChange={(e) => {
                         setSelectedGame(e.target.value);
                         setOffset(0);
                       }}
                       className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 sm:px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer hover:bg-gray-100 transition-colors text-sm"
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
                       <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                   </div>

                   {/* Sort Dropdown */}
                   <div className="relative flex-1 sm:flex-none min-w-[120px]">
                     <select 
                       value={sortBy}
                       onChange={(e) => {
                         setSortBy(e.target.value);
                         setOffset(0);
                       }}
                       className="w-full appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-3 sm:px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent cursor-pointer hover:bg-gray-100 transition-colors text-sm"
                     >
                       <option value="id">Sort by ID</option>
                       <option value="name">Sort by Name</option>
                       <option value="stats">Sort by Stats</option>
                     </select>
                     <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                       <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                       </svg>
                     </div>
                   </div>
                 </div>

                 {/* Toggle Buttons Row */}
                 <div className="flex flex-wrap gap-3 sm:gap-4 items-center w-full sm:w-auto">
                   {/* Legendary Toggle */}
                   <div className="flex items-center space-x-2">
                     <button
                       onClick={() => {
                         setShowLegendaryOnly(!showLegendaryOnly);
                         setOffset(0);
                       }}
                       className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                         showLegendaryOnly 
                           ? 'bg-purple-600' 
                           : 'bg-gray-300'
                       }`}
                     >
                       <span
                         className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200 ${
                           showLegendaryOnly 
                             ? 'translate-x-4 sm:translate-x-6' 
                             : 'translate-x-1'
                         }`}
                       />
                     </button>
                     <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">Legendary & Mythical</span>
                   </div>

                   {/* Shiny Toggle */}
                   <div className="flex items-center space-x-2">
                     <button
                       onClick={() => {
                         setShowShinyOnly(!showShinyOnly);
                         setOffset(0);
                       }}
                       className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                         showShinyOnly 
                           ? 'bg-yellow-500' 
                           : 'bg-gray-300'
                       }`}
                     >
                       <span
                         className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200 ${
                           showShinyOnly 
                             ? 'translate-x-4 sm:translate-x-6' 
                             : 'translate-x-1'
                         }`}
                       />
                     </button>
                     <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                       ✨ Shiny
                     </span>
                   </div>

                   {/* Owned Toggle */}
                   <div className="flex items-center space-x-2">
                     <button
                       onClick={() => {
                         setShowOwnedOnly(!showOwnedOnly);
                         setOffset(0);
                       }}
                       className={`relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${
                         showOwnedOnly 
                           ? 'bg-green-600' 
                           : 'bg-gray-300'
                       }`}
                     >
                       <span
                         className={`inline-block h-3 w-3 sm:h-4 sm:w-4 transform rounded-full bg-white transition-transform duration-200 ${
                           showOwnedOnly 
                             ? 'translate-x-4 sm:translate-x-6' 
                             : 'translate-x-1'
                         }`}
                       />
                     </button>
                     <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                       📦 Owned
                     </span>
                   </div>
                 </div>
               </div>
           </div>
           
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
                {[...Array(8)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                      <div className="h-40 sm:h-48 md:h-52 lg:h-56 bg-gradient-to-br from-gray-100 to-gray-200"></div>
                      <div className="p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4">
                        <div className="h-6 sm:h-8 bg-gray-200 rounded-lg"></div>
                        <div className="flex gap-2">
                          <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded-full"></div>
                          <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-200 rounded-full"></div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                          <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
             <div className="text-center py-16">
               <div className="text-8xl mb-6">⚠️</div>
               <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to load Pokémon</h3>
               <p className="text-gray-600 mb-6">{error}</p>
               <button 
                 onClick={() => window.location.reload()}
                 className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
               >
                 Try Again
               </button>
             </div>
           ) : popularPokemon.length === 0 ? (
             <div className="text-center py-16">
               <div className="text-8xl mb-6">🔄</div>
               <h3 className="text-2xl font-bold text-gray-900 mb-3">Loading Pokémon...</h3>
               <p className="text-gray-600">Fetching data from PokéAPI</p>
             </div>
           ) : (
             <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4 mb-8 sm:mb-12">
                     {popularPokemon.map((pokemon) => (
                       <PokemonCard 
                         key={pokemon.id} 
                         pokemon={pokemon} 
                         showShiny={true}
                       />
                     ))}
                   </div>
               
{/* Load More Indicator */}
                <div className="text-center mt-8">
                  {loadingMore ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-gray-600">Loading more Pokémon...</span>
                    </div>
                  ) : hasMore ? (
                    <div className="flex flex-col items-center">
                      <div className="text-gray-500 mb-2">Scroll down for more Pokémon</div>
                      <div className="animate-bounce text-2xl">⬇️</div>
                      <button 
                        onClick={() => loadPokemon(offset, true)}
                        className="mt-4 px-6 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
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
