'use client';

import { useState } from 'react';
import { Pokemon, getPokemonImageUrl, formatPokemonName, getPokemonTypeColor } from '@/utils/pokemon';
import BottomSheet from './BottomSheet';

interface PokemonCardProps {
  pokemon: Pokemon;
  showShiny?: boolean;
}

export default function PokemonCard({ pokemon, showShiny = false }: PokemonCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isImageError, setIsImageError] = useState(false);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [ripples, setRipples] = useState<{ x: number; y: number; id: number }[]>([]);

  const imageUrl = getPokemonImageUrl(pokemon, showShiny && isHovered);
  const formattedName = formatPokemonName(pokemon.name);
  const totalStats = pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);

  const getStatBarWidth = (stat: number) => {
    const maxStat = 255;
    return (stat / maxStat) * 100;
  };

  const getStatColor = (statName: string) => {
    const colors: { [key: string]: string } = {
      hp: 'bg-red-500',
      attack: 'bg-orange-500',
      defense: 'bg-blue-500',
      'special-attack': 'bg-purple-500',
      'special-defense': 'bg-green-500',
      speed: 'bg-yellow-500'
    };
    return colors[statName] || 'bg-gray-500';
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
    
    setShowBottomSheet(true);
  };

  return (
    <>
      <div 
        className="group relative bg-[#fafaf8] dark:bg-gray-700 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#e2e8e0] dark:border-gray-600 hover:border-[#d4d4c8] dark:hover:border-gray-500 transform cursor-pointer hover:-translate-y-1"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
      {/* Shiny sparkles overlay */}
      {showShiny && isHovered && (
        <div className="absolute inset-0 pointer-events-none z-20">
          {/* Subtle sparkling effect */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-yellow-300 rounded-full animate-ping animation-duration-2000" />
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-yellow-200 rounded-full animate-ping animation-duration-3000 animation-delay-500" />
            <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-yellow-300 rounded-full animate-ping animation-duration-2500 animation-delay-1000" />
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-yellow-200 rounded-full animate-ping animation-duration-3500 animation-delay-1500" />
            <div className="absolute top-1/3 left-1/2 w-1 h-1 bg-yellow-400 rounded-full animate-ping animation-duration-2000 animation-delay-2000" />
          </div>
          <div className="absolute top-2 right-2 z-30">
            <span className="px-2 py-1 bg-black/20 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-sm">
              ✨ Shiny
            </span>
          </div>
        </div>
      )}
      
      {/* Pokemon ID Badge */}
      <div className="absolute top-3 left-3 z-10">
        <span className="px-3 py-1 bg-gradient-to-r from-gray-900 to-gray-700 text-white text-xs font-bold rounded-full shadow-md">
          #{String(pokemon.id).padStart(3, '0')}
        </span>
      </div>

       {/* Pokemon Image Container */}
       <div className="relative h-40 sm:h-48 md:h-52 lg:h-56 flex items-center justify-center bg-[#f5f5f0] dark:bg-gray-800 p-4">
        {!isImageError ? (
          <div className="relative">
            <img
              src={imageUrl}
              alt={formattedName}
              className={`w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 object-contain transition-all duration-300 ${
                isHovered ? 'scale-105' : 'scale-100'
              }`}
              onError={() => setIsImageError(true)}
            />
          </div>
        ) : (
          <div className="text-gray-400 dark:text-gray-500 text-center">
            <div className="text-4xl sm:text-5xl md:text-6xl mb-2">🎮</div>
            <p className="text-xs sm:text-sm">Image not available</p>
          </div>
        )}
      </div>

      {/* Pokemon Info */}
      <div className="p-3 sm:p-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100 text-center">
          {formattedName}
        </h3>
      </div>

      {/* Ripple Effects */}
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="absolute pointer-events-none animate-ping"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: '40px',
            height: '40px',
          }}
        >
          <div className="w-full h-full rounded-full bg-green-400/30 scale-100 animate-ping" />
        </div>
      ))}
    </div>

    {/* Bottom Sheet */}
    <BottomSheet 
      isOpen={showBottomSheet}
      onClose={() => setShowBottomSheet(false)}
      pokemon={pokemon}
    />
    </>
  );
}