// 'use client';

// import { useState, useEffect } from 'react';
// import {
//   Pokemon,
//   formatPokemonName,
//   getPokemonFullData,
//   getPokemonAbilities,
//   getPokemonMovesForGame,
// } from '@/utils/pokemon';
// import { validatePokemon, PokemonFormData } from '@/lib/legality';
// import { usePokedex } from '@/contexts/PokedexContext';
// import { useAuth } from '@/contexts/AuthContext';
// import { saveTradeToFirestore } from '@/lib/firebase-service';

// interface BottomSheetProps {
//   isOpen: boolean;
//   onClose: () => void;
//   pokemon: Pokemon;
// }

// const NATURES = [
//   'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
//   'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
//   'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
//   'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
//   'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky',
// ];

// const COMMON_ITEMS = [
//   'None', 'Leftovers', 'Life Orb', 'Choice Specs', 'Choice Scarf',
//   'Choice Band', 'Assault Vest', 'Focus Sash', 'Focus Band', 'Expert Belt',
//   'Weakness Policy', 'Eviolite', 'Rocky Helmet', 'Air Balloon',
// ];

// const COMMON_BALLS = [
//   'Poke Ball', 'Great Ball', 'Ultra Ball', 'Master Ball',
//   'Quick Ball', 'Dusk Ball', 'Heal Ball', 'Luxury Ball', 'Premier Ball',
//   'Timer Ball', 'Repeat Ball', 'Nest Ball', 'Net Ball', 'Dive Ball',
//   'Dream Ball', 'Beast Ball', 'Friend Ball', 'Level Ball', 'Moon Ball',
//   'Love Ball', 'Fast Ball', 'Heavy Ball', 'Lure Ball',
// ];

// const TERA_TYPES = [
//   'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting',
//   'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost',
//   'Dragon', 'Dark', 'Steel', 'Fairy', 'Stellar',
// ];

// export default function BottomSheet({ isOpen, onClose, pokemon }: BottomSheetProps) {
//   const [customData, setCustomData] = useState({
//     nickname: '',
//     ot: '',
//     tid: '',
//     sid: '',
//     nature: 'Modest',
//     level: 100,
//     item: 'None',
//     ability: '',
//     ball: 'Poke Ball',
//     teraType: 'Normal',
//     ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
//     evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
//     moves: ['', '', '', ''],
//     shiny: false,
//     alpha: false,
//   });

//   const [selectedGame, setSelectedGame] = useState('scarlet-violet');
//   const [showModal, setShowModal] = useState(false);
//   const [showValidateModal, setShowValidateModal] = useState(false);
//   const [modalContent, setModalContent] = useState<any>(null);

//   const [isLoading, setIsLoading] = useState(false);
//   const [availableAbilities, setAvailableAbilities] = useState<string[]>([]);
//   const [availableMoves, setAvailableMoves] = useState<string[]>([]);
//   const [isLoadingData, setIsLoadingData] = useState(false);

//   const { addOwnedPokemon, isOwned, addTradeToHistory } = usePokedex();
//   const { user } = useAuth();

//   const pokemonOwned = isOwned?.(pokemon.id) ?? false;

//   useEffect(() => {
//     if (!pokemon?.abilities?.length) return;
//     setCustomData((prev) => ({
//       ...prev,
//       ability: pokemon.abilities[0]?.ability?.name || '',
//     }));
//   }, [pokemon]);

//   useEffect(() => {
//     if (!isOpen) return;

//     let active = true;
//     setIsLoadingData(true);

//     (async () => {
//       try {
//         const data = await getPokemonFullData(pokemon.id);
//         if (!active) return;

//         setAvailableAbilities(getPokemonAbilities(data) || []);

//         const moves = await getPokemonMovesForGame(data, selectedGame);
//         setAvailableMoves(moves || []);
//       } catch (err) {
//         console.error('Failed to load Pokémon data', err);
//         setAvailableAbilities([]);
//         setAvailableMoves([]);
//       } finally {
//         if (active) setIsLoadingData(false);
//       }
//     })();

//     return () => {
//       active = false;
//     };
//   }, [pokemon.id, selectedGame, isOpen]);

//   const evTotal = Object.values(customData.evs).reduce((a, b) => a + b, 0);

//   // ────────────────────────────────────────────────
//   //                  Client-side checks
//   // ────────────────────────────────────────────────
//   const getClientErrors = (): string[] => {
//     const errs: string[] = [];

//     if (!Number.isInteger(customData.level) || customData.level < 1 || customData.level > 100) {
//       errs.push('Level must be 1–100');
//     }

//     (Object.keys(customData.ivs) as (keyof typeof customData.ivs)[]).forEach((k) => {
//       const v = customData.ivs[k];
//       if (!Number.isInteger(v) || v < 0 || v > 31) errs.push(`${k.toUpperCase()} IV: 0–31`);
//     });

//     if (evTotal > 510) errs.push(`EVs total > 510 (${evTotal})`);

//     customData.moves.forEach((m, i) => {
//       if (m && !availableMoves.includes(m)) {
//         errs.push(`Move ${i + 1} not available`);
//       }
//     });

//     if (customData.ability && !availableAbilities.includes(customData.ability)) {
//       errs.push('Invalid ability');
//     }

//     if (customData.tid && !/^\d{1,5}$/.test(customData.tid)) errs.push('TID should be 1–5 digits');
//     if (customData.sid && !/^\d{1,5}$/.test(customData.sid)) errs.push('SID should be 1–5 digits');

//     return errs;
//   };

//   const handleValidate = async (showModalFeedback = true) => {
//     const clientErrs = getClientErrors();
//     if (clientErrs.length > 0) {
//       if (showModalFeedback) {
//         setModalContent({
//           title: 'Invalid settings',
//           message: clientErrs.join('\n'),
//           isValid: false,
//           errors: clientErrs,
//         });
//         setShowValidateModal(true);
//       }
//       return false;
//     }

//     const form: PokemonFormData = {
//       id: pokemon.id,
//       name: pokemon.name,
//       species: pokemon.name,
//       level: customData.level,
//       shiny: customData.shiny,
//       alpha: customData.alpha,
//       moves: customData.moves.filter(Boolean),
//       ability: customData.ability,
//       nature: customData.nature,
//       ivs: customData.ivs,
//       evs: customData.evs,
//       item: customData.item,
//       game: selectedGame,
//     };

//     const result = await Promise.resolve(validatePokemon(form));

//     if (showModalFeedback || !result.isValid) {
//       setModalContent({
//         title: result.isValid ? (result.warnings?.length ? 'Valid (with warnings)' : 'Valid!') : 'Validation failed',
//         message: result.isValid
//           ? (result.warnings?.length ? result.warnings.join('\n') : 'Legal Pokémon ✓')
//           : result.errors?.join('\n') || 'Unknown error',
//         isValid: result.isValid,
//         errors: result.errors,
//         warnings: result.warnings,
//       });
//       setShowValidateModal(true);
//     }
//     return result.isValid;
//   };

// // BottomSheet.tsx ke handleTrade function ke andar ye object replace karein:

// const handleTrade = async () => {
//   const valid = await handleValidate(false);
//   if (!valid) return;

//   // Prevent overlap where validation modal stays open behind trade modal.
//   setShowValidateModal(false);

//   setIsLoading(true);

//   // Saara data ek variable mein nikaal lein taaki reuse ho sake
//   const tradePayload = {
//     pokemonName: formatPokemonName(pokemon.name),
//     pokemonId: pokemon.id,
//     shiny: customData.shiny,
//     alpha: customData.alpha,
//     level: customData.level,
//     nature: customData.nature,
//     ability: customData.ability,
//     moves: customData.moves.filter(m => m && m.trim() !== ''),
//     ivs: customData.ivs,
//     evs: customData.evs,
//     item: customData.item,
//     ball: customData.ball,
//     teraType: customData.teraType,
//     game: selectedGame,
//     ot: customData.ot,
//     tid: customData.tid,
//     sid: customData.sid,
//     nickname: customData.nickname,
//   };

//   try {
//     const resp = await fetch('/api/trade', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         pokemon: tradePayload,
//         userId: user?.uid || null, // Agar user nahi hai toh null bhej rahe hain
//         userName: user?.displayName || 'Guest Trainer',
//       }),
//     });

//     let data: {
//       success?: boolean;
//       error?: string;
//       linkCode?: string;
//       queuePosition?: number;
//       messageId?: string;
//       userId?: string;
//     };
//     try {
//       const text = await resp.text();
//       data = text ? JSON.parse(text) : {};
//     } catch {
//       alert(
//         `Server ne valid JSON nahi diya (status ${resp.status}). ` +
//           `Kya \`npm run dev\` chal raha hai aur URL sahi hai?`
//       );
//       return;
//     }

//     if (!resp.ok) {
//       alert(data.error || `Request failed (${resp.status})`);
//       return;
//     }

//     if (data.success) {
//       const finalUserId = data.userId || user?.uid || `guest_${Math.random().toString(36).substr(2, 9)}`;

//       try {
//         await saveTradeToFirestore(finalUserId, {
//           ...tradePayload,
//           discordMessageId: data.messageId,
//           linkCode: data.linkCode || 'WAITING',
//         });
//       } catch (fsErr) {
//         console.error('Firestore save (client) after trade:', fsErr);
//         // API / Discord already succeeded; Firestore rules ya network alag issue ho sakta hai
//       }

//       setModalContent({
//         title: 'Trade Started!',
//         message: `Your trade is in queue. Link Code will be sent to Discord.`,
//         linkCode: data.linkCode || 'WAITING', // Ensure this matches the UI variable
//         queuePosition: data.queuePosition || '?',
//         pollUserId: finalUserId,
//         isValid: true
//       });
//       setShowModal(true);

//       // Pokedex Context update (Agar user login hai)
//       if (user?.uid) {
//         addTradeToHistory?.({
//           userId: user.uid,
//           pokemonId: pokemon.id,
//           pokemonName: pokemon.name,
//           linkCode: data.linkCode || 'PENDING',
//           status: 'pending',
//           game: selectedGame,
//         });
//       }
//     } else {
//       alert(data.error || 'Bot error: Could not start trade');
//     }
//   } catch (err) {
//     console.error("Trade Error:", err);
//     alert(
//       'Network error – page refresh karke phir try karein. Agar static hosting use ho rahi ho to API routes deploy par kaam nahi karte.'
//     );
//   } finally {
//     setIsLoading(false);
//   }
// };

//   const updateIV = (stat: keyof typeof customData.ivs, value: string) => {
//     const num = Number(value);
//     setCustomData((p) => ({
//       ...p,
//       ivs: { ...p.ivs, [stat]: Number.isNaN(num) ? 31 : Math.min(31, Math.max(0, num)) },
//     }));
//   };

//   const updateEV = (stat: keyof typeof customData.evs, value: string) => {
//     const num = Number(value);
//     setCustomData((p) => ({
//       ...p,
//       evs: { ...p.evs, [stat]: Number.isNaN(num) ? 0 : Math.min(252, Math.max(0, num)) },
//     }));
//   };

//   // Simple Showdown export (you can expand it later)
//   const showdownText = `${formatPokemonName(pokemon.name)}${customData.nickname ? ` (${customData.nickname})` : ''} @ ${customData.item}
// Ability: ${customData.ability || '—'}
// Level: ${customData.level}
// ${customData.shiny ? 'Shiny: Yes\n' : ''}${customData.teraType ? `Tera Type: ${customData.teraType}\n` : ''}Ball: ${customData.ball}
// EVs: ${Object.entries(customData.evs)
//   .filter(([,v]) => v > 0)
//   .map(([k,v]) => `${v} ${k.toUpperCase()}`)
//   .join(' / ') || '—'}
// ${customData.nature} Nature
// IVs: ${Object.values(customData.ivs).join('/')}${customData.moves.some(Boolean) ? '\n' : ''}
// ${customData.moves.map(m => `- ${m || '(None)'}`).join('\n')}`;

// // Custom format export with empty field check
// const generateCommandText = () => {
//   const lines = [
//     `!t ${formatPokemonName(pokemon.name)}`,
//     customData.nickname ? `Nickname: ${customData.nickname}` : '',
//     customData.shiny ? `Shiny: Yes` : '',
//     customData.ability ? `Ability: ${customData.ability}` : '',
//     customData.ball ? `Ball: ${customData.ball}` : '',
//     `Language: English`, // Default as per your format
//     customData.ot ? `OT: ${customData.ot}` : '',
//     customData.tid ? `TID: ${customData.tid}` : '',
//     customData.sid ? `SID: ${customData.sid}` : '',
//     `Level: ${customData.level}`,
//     customData.teraType ? `Tera Type: ${customData.teraType}` : '',
//     `${customData.nature} Nature`,
//     ...customData.moves.filter(Boolean).map((m) => `Move: ${m}`),
//     // IVs line
//     `IVs: ${customData.ivs.hp} HP / ${customData.ivs.atk} atk / ${customData.ivs.def} def / ${customData.ivs.spa} spa / ${customData.ivs.spd} spd / ${customData.ivs.spe} spe`
//   ];

//   // Filter out empty strings so they don't appear in clipboard
//   return lines.filter(line => line !== '').join('\n');
// };

// const commandText = generateCommandText();

// useEffect(() => {
//   let interval: NodeJS.Timeout;

//   // Sirf tabhi check karein agar modal khula hai aur code 'WAITING' hai
//   if (isOpen && modalContent?.linkCode === 'WAITING' && modalContent?.pollUserId) {
    
//     interval = setInterval(async () => {
//       try {
//         // 'yourDiscordName' ki jagah wo name use karein jo bot ko gaya hai (e.g., customData.ot)
//         const discordName = customData.ot || user?.displayName || 'Guest';
        
//         const res = await fetch(
//           `/api/trade?userId=${encodeURIComponent(modalContent.pollUserId)}&discordUser=${encodeURIComponent(discordName)}`
//         );
//         const result = await res.json();

//         if (result.success && result.data) {
//           setModalContent((prev: typeof modalContent) => {
//             if (!prev) return prev;

//             const next = {
//               ...prev,
//               queuePosition: result.data.queuePosition ?? prev.queuePosition ?? '?',
//             } as any;

//             if (result.data.linkCode && result.data.linkCode !== 'WAITING') {
//               next.linkCode = result.data.linkCode;
//               next.title = 'Trade Ready!';
//               next.message = `Bot is ready! IGN: ${result.data.botIGN || 'Bot'}`;
//               next.isValid = true;
//             }

//             return next;
//           });

//           if (result.data.linkCode && result.data.linkCode !== 'WAITING') {
//             clearInterval(interval);
//           }
//         }
//       } catch (err) {
//         console.error("Polling error:", err);
//       }
//     }, 5000); // 5 seconds interval
//   }

//   return () => {
//     if (interval) clearInterval(interval);
//   };
// }, [isOpen, modalContent?.linkCode, modalContent?.pollUserId, user?.displayName, customData.ot]);

//   if (!isOpen) return null;
  

//   return (
//     <>
//       <div
//         className={`fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
//           isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
//         }`}
//       >
//         <div
//           className={`bg-white dark:bg-gray-900 w-full max-h-[92vh] overflow-hidden rounded-t-3xl shadow-2xl transform transition-transform duration-300 ${
//             isOpen ? 'translate-y-0' : 'translate-y-full'
//           }`}
//         >
//           {/* Header */}
//           <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-4 flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="relative">
//                 <img
//                   src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
//                   alt={pokemon.name}
//                   className="w-14 h-14 sm:w-16 sm:h-16 bg-white/90 rounded-full p-1"
//                 />
//                 {customData.shiny && (
//                   <div className="absolute -top-1 -right-1 bg-white/80 rounded-full p-1 shadow">
//                     <img src="/masklicon.png" alt="Shiny" className="w-5 h-5" />
//                   </div>
//                 )}
//               </div>

//               <div>
//                 <h3 className="text-white font-bold text-xl">
//                   {formatPokemonName(pokemon.name)}
//                 </h3>
//                 <div className="flex items-center gap-2 text-sm text-blue-100">
//                   <span>#{String(pokemon.id).padStart(4, '0')}</span>
//                   {pokemon.types?.map((t: any) => (
//                     <span
//                       key={t.type.name}
//                       className="px-2 py-0.5 text-xs rounded-full bg-white/20"
//                     >
//                       {t.type.name}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>

//             <button
//               onClick={onClose}
//               className="text-white hover:bg-white/20 p-2 rounded-full transition"
//             >
//               <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
//                 <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
//               </svg>
//             </button>
//           </div>

//           {/* Main content */}
//           <div className="p-5 overflow-y-auto max-h-[calc(92vh-80px)]">
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

//               {/* 1. Basic Info */}
//               <div className="space-y-4">
//                 <h4 className="font-semibold text-lg border-b pb-1">Basic</h4>

//                 <div className="space-y-3">
//                   <div>
//                     <label className="block text-sm mb-1 font-medium">Nickname</label>
//                     <input
//                       maxLength={12}
//                       value={customData.nickname}
//                       onChange={(e) => setCustomData((p) => ({ ...p, nickname: e.target.value }))}
//                       className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
//                     />
//                   </div>

//                   <div className="grid grid-cols-3 gap-2">
//                     <div>
//                       <label className="block text-xs mb-1">OT</label>
//                       <input
//                         value={customData.ot}
//                         onChange={(e) => setCustomData((p) => ({ ...p, ot: e.target.value.slice(0,12) }))}
//                         className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700"
//                         maxLength={12}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs mb-1">TID</label>
//                       <input
//                         value={customData.tid}
//                         onChange={(e) => setCustomData((p) => ({ ...p, tid: e.target.value.replace(/\D/g,'').slice(0,5) }))}
//                         className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700"
//                         maxLength={5}
//                       />
//                     </div>
//                     <div>
//                       <label className="block text-xs mb-1">SID</label>
//                       <input
//                         value={customData.sid}
//                         onChange={(e) => setCustomData((p) => ({ ...p, sid: e.target.value.replace(/\D/g,'').slice(0,5) }))}
//                         className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700"
//                         maxLength={5}
//                       />
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm mb-1 font-medium">Nature</label>
//                     <select
//                       value={customData.nature}
//                       onChange={(e) => setCustomData((p) => ({ ...p, nature: e.target.value }))}
//                       className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
//                     >
//                       {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
//                     </select>
//                   </div>

//                   <div className="grid grid-cols-2 gap-3">
//                     <div>
//                       <label className="block text-sm mb-1 font-medium">Level</label>
//                       <input
//                         type="number"
//                         min={1}
//                         max={100}
//                         value={customData.level}
//                         onChange={(e) => {
//                           const v = Number(e.target.value);
//                           setCustomData((p) => ({ ...p, level: Number.isNaN(v) ? 50 : Math.min(100, Math.max(1, v)) }));
//                         }}
//                         className="w-full border rounded-lg px-3 py-2 text-center dark:bg-gray-800 dark:border-gray-700"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm mb-1 font-medium">Item</label>
//                       <select
//                         value={customData.item}
//                         onChange={(e) => setCustomData((p) => ({ ...p, item: e.target.value }))}
//                         className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
//                       >
//                         {COMMON_ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
//                       </select>
//                     </div>
//                   </div>

//                   <div>
//                     <label className="block text-sm mb-1 font-medium flex items-center gap-2">
//                       Ability
//                       {isLoadingData && <span className="text-xs text-gray-500">(loading…)</span>}
//                     </label>
//                     <select
//                       value={customData.ability}
//                       onChange={(e) => setCustomData((p) => ({ ...p, ability: e.target.value }))}
//                       disabled={isLoadingData || availableAbilities.length === 0}
//                       className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
//                     >
//                       <option value="">— Select —</option>
//                       {availableAbilities.map(a => (
//                         <option key={a} value={a}>{a}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div className="flex flex-col gap-2 pt-1">
//                     <label className="flex items-center gap-2">
//                       <input
//                         type="checkbox"
//                         checked={customData.shiny}
//                         onChange={e => setCustomData(p => ({ ...p, shiny: e.target.checked }))}
//                         className="rounded text-yellow-500"
//                       />
//                       <span>Shiny</span>
//                     </label>

//                     <label className="flex items-center gap-2">
//                       <input
//                         type="checkbox"
//                         checked={customData.alpha}
//                         onChange={e => setCustomData(p => ({ ...p, alpha: e.target.checked }))}
//                         className="rounded text-purple-600"
//                       />
//                       <span>Alpha (Legends: Arceus)</span>
//                     </label>
//                   </div>
//                 </div>
//               </div>

//               {/* 2. Stats */}
//               <div className="space-y-4">
//                 <div className="flex justify-between items-center">
//                   <h4 className="font-semibold text-lg border-b pb-1">Stats</h4>
//                   <div className="text-sm text-gray-600 dark:text-gray-400">
//                     EVs {evTotal} / 510
//                   </div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-3">
//                   {['hp','atk','def','spa','spd','spe'].map(stat => (
//                     <div key={stat} className="space-y-2">
//                       <div className="text-center text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
//                         {stat}
//                       </div>
//                       <input
//                         type="number"
//                         min={0}
//                         max={31}
//                         value={customData.ivs[stat as keyof typeof customData.ivs]}
//                         onChange={e => updateIV(stat as any, e.target.value)}
//                         className="w-full text-center border rounded py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700"
//                         placeholder="IV"
//                       />
//                       <input
//                         type="number"
//                         min={0}
//                         max={252}
//                         step={4}
//                         value={customData.evs[stat as keyof typeof customData.evs]}
//                         onChange={e => updateEV(stat as any, e.target.value)}
//                         className="w-full text-center border rounded py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700"
//                         placeholder="EV"
//                       />
//                     </div>
//                   ))}
//                 </div>
//               </div>

//               {/* 3. Moves + Tera + Ball */}
//               <div className="space-y-4">
//                 <h4 className="font-semibold text-lg border-b pb-1 flex items-center gap-2">
//                   Moves
//                   {isLoadingData && <span className="text-xs text-gray-500">(loading…)</span>}
//                 </h4>

//                 <div className="space-y-2">
//                   {[0,1,2,3].map(i => (
//                     <select
//                       key={i}
//                       value={customData.moves[i]}
//                       onChange={e => {
//                         const copy = [...customData.moves];
//                         copy[i] = e.target.value;
//                         setCustomData(p => ({ ...p, moves: copy }));
//                       }}
//                       disabled={isLoadingData}
//                       className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
//                     >
//                       <option value="">Move {i+1} — empty</option>
//                       {availableMoves.map(m => (
//                         <option key={m} value={m}>{m}</option>
//                       ))}
//                     </select>
//                   ))}
//                 </div>

//                 <div>
//                   <label className="block text-sm mb-1 font-medium">Tera Type</label>
//                   <select
//                     value={customData.teraType}
//                     onChange={e => setCustomData(p => ({ ...p, teraType: e.target.value }))}
//                     className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
//                   >
//                     {TERA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
//                   </select>
//                 </div>

//                 <div>
//                   <label className="block text-sm mb-1 font-medium">Poké Ball</label>
//                   <select
//                     value={customData.ball}
//                     onChange={e => setCustomData(p => ({ ...p, ball: e.target.value }))}
//                     className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
//                   >
//                     {COMMON_BALLS.map(b => <option key={b} value={b}>{b}</option>)}
//                   </select>
//                 </div>
//               </div>

//               {/* 4. Game + Actions + Export */}
//               <div className="space-y-5">
//                 <div>
//                   <label className="block text-sm mb-1 font-medium">Game</label>
//                   <select
//                     value={selectedGame}
//                     onChange={e => setSelectedGame(e.target.value)}
//                     className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
//                   >
//                     <option value="scarlet-violet">Scarlet / Violet</option>
//                     <option value="sword-shield">Sword / Shield</option>
//                     <option value="bdsp">BDSP</option>
//                     <option value="legends-arceus">Legends: Arceus</option>
//                     <option value="legends-za">Legends: Z-A</option>
//                   </select>
//                 </div>

//                 {pokemonOwned && (
//                   <div className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-center text-sm font-medium">
//                     ✓ Already in your Pokédex
//                   </div>
//                 )}

//                 <div className="space-y-3">
//                   <a
//                     href="https://discord.gg/blaines"
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="block text-center py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg font-semibold hover:brightness-110 transition"
//                   >
//                     💬 Join Discord
//                   </a>

//                   <button
//                     onClick={() => {
//                       void handleValidate(true);
//                     }}
//                     disabled={isLoading || isLoadingData}
//                     className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold disabled:opacity-60 hover:brightness-110 transition"
//                   >
//                     ✅ Validate
//                   </button>

//                   <button
//                     onClick={handleTrade}
//                     disabled={isLoading || isLoadingData}
//                     className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg font-semibold disabled:opacity-60 hover:brightness-110 transition"
//                   >
//                     {isLoading ? 'Sending…' : '🔄 Start Trade'}
//                   </button>
//                 </div>

//                 {/* Showdown Export Preview */}
//                 {/* Showdown Export Preview Section */}
// <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap border border-gray-200 dark:border-gray-700">
//   <div className="font-semibold mb-2 text-base">Trade Command Preview</div>
//   {commandText}
//   <button
//     onClick={() => navigator.clipboard.writeText(commandText)}
//     className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline block"
//   >
//     Copy to clipboard
//   </button>
// </div>
//               </div>

//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Validation Modal */}
//       {showValidateModal && modalContent && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
//           <div className={`rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border ${
//             modalContent.isValid
//               ? 'bg-gradient-to-b from-green-700 to-green-900 border-green-400/40'
//               : 'bg-gradient-to-b from-red-700 to-red-900 border-red-400/40'
//           }`}>
//             <div className={`py-6 px-6 text-center ${
//               modalContent.isValid
//                 ? 'bg-gradient-to-r from-green-600 to-emerald-700'
//                 : 'bg-gradient-to-r from-red-600 to-rose-700'
//             }`}>
//               <div className="text-5xl mb-3">{modalContent.isValid ? '✅' : '⚠️'}</div>
//               <h2 className="text-2xl font-bold text-white">{modalContent.title}</h2>
//             </div>

//             <div className="p-6 space-y-5 text-center">
//               <p className="whitespace-pre-line text-gray-200 text-sm leading-relaxed">
//                 {modalContent.message}
//               </p>

//               {modalContent.errors?.length > 0 && (
//                 <div className="bg-black/30 rounded-lg p-4 text-left text-red-200 text-sm max-h-60 overflow-y-auto">
//                   {modalContent.errors.map((err: string, i: number) => (
//                     <div key={i}>• {err}</div>
//                   ))}
//                 </div>
//               )}

//               {modalContent.warnings?.length > 0 && (
//                 <div className="bg-yellow-900/40 rounded-lg p-4 text-yellow-200 text-sm">
//                   {modalContent.warnings.join('\n')}
//                 </div>
//               )}

//               <button
//                 onClick={() => setShowValidateModal(false)}
//                 className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Trade Success Modal */}
//       {showModal && modalContent && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
//           <div className="bg-gradient-to-b from-green-700 to-green-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-green-400/40">
//             <div className="bg-gradient-to-r from-green-600 to-emerald-700 py-6 px-6 text-center">
//               <div className="text-5xl mb-3">✅</div>
//               <h2 className="text-2xl font-bold text-white">Trade Started!</h2>
//             </div>

//             <div className="p-6 space-y-6">
//               <div className="bg-white/10 rounded-xl p-4 text-center">
//                 <div className="font-bold text-lg mb-1">{formatPokemonName(pokemon.name)}</div>
//                 <div className="text-green-200 text-sm">
//                   Lv. {customData.level} • {customData.shiny ? 'Shiny ✨' : 'Normal'}
//                 </div>
//               </div>

//               <div className="bg-gray-900/60 rounded-xl p-5 text-center border border-gray-700">
//                 <div className="text-gray-300 text-sm mb-2">Link Code</div>
//                 <div className="text-5xl font-bold font-mono tracking-widest text-green-400">
//                   {modalContent.linkCode}
//                 </div>
//               </div>

//               <div className="flex justify-between bg-white/10 rounded-xl p-4">
//                 <span>Position in queue</span>
//                 <span className="font-bold text-xl text-green-300">#{modalContent.queuePosition}</span>
//               </div>

//               <button
//                 onClick={() => setShowModal(false)}
//                 className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition"
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

'use client';

import { useState, useEffect } from 'react';
import {
  Pokemon,
  formatPokemonName,
  getPokemonFullData,
  getPokemonAbilities,
  getPokemonMovesForGame,
} from '@/utils/pokemon';
import { validatePokemon, PokemonFormData } from '@/lib/legality';
import { usePokedex } from '@/contexts/PokedexContext';
import { useAuth } from '@/contexts/AuthContext';
import { saveTradeToFirestore } from '@/lib/firebase-service';

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
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky',
];

const COMMON_ITEMS = [
  'None', 'Leftovers', 'Life Orb', 'Choice Specs', 'Choice Scarf',
  'Choice Band', 'Assault Vest', 'Focus Sash', 'Focus Band', 'Expert Belt',
  'Weakness Policy', 'Eviolite', 'Rocky Helmet', 'Air Balloon',
];

const COMMON_BALLS = [
  'Poke Ball', 'Great Ball', 'Ultra Ball', 'Master Ball',
  'Quick Ball', 'Dusk Ball', 'Heal Ball', 'Luxury Ball', 'Premier Ball',
  'Timer Ball', 'Repeat Ball', 'Nest Ball', 'Net Ball', 'Dive Ball',
  'Dream Ball', 'Beast Ball', 'Friend Ball', 'Level Ball', 'Moon Ball',
  'Love Ball', 'Fast Ball', 'Heavy Ball', 'Lure Ball',
];

const TERA_TYPES = [
  'Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting',
  'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost',
  'Dragon', 'Dark', 'Steel', 'Fairy', 'Stellar',
];

export default function BottomSheet({ isOpen, onClose, pokemon }: BottomSheetProps) {
  const [customData, setCustomData] = useState({
    nickname: '',
    ot: '',
    tid: '',
    sid: '',
    nature: 'Modest',
    level: 100,
    item: 'None',
    ability: '',
    ball: 'Poke Ball',
    teraType: 'Normal',
    ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
    evs: { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 },
    moves: ['', '', '', ''],
    shiny: false,
    alpha: false,
  });

  const [selectedGame, setSelectedGame] = useState('scarlet-violet');
  const [showModal, setShowModal] = useState(false);
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [modalContent, setModalContent] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [availableAbilities, setAvailableAbilities] = useState<string[]>([]);
  const [availableMoves, setAvailableMoves] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const { addOwnedPokemon, isOwned, addTradeToHistory } = usePokedex();
  const { user } = useAuth();

  const pokemonOwned = isOwned?.(pokemon.id) ?? false;

  useEffect(() => {
    if (!pokemon?.abilities?.length) return;
    setCustomData((prev) => ({
      ...prev,
      ability: pokemon.abilities[0]?.ability?.name || '',
    }));
  }, [pokemon]);

  useEffect(() => {
    if (!isOpen) return;

    let active = true;
    setIsLoadingData(true);

    (async () => {
      try {
        const data = await getPokemonFullData(pokemon.id);
        if (!active) return;

        setAvailableAbilities(getPokemonAbilities(data) || []);

        const moves = await getPokemonMovesForGame(data, selectedGame);
        setAvailableMoves(moves || []);
      } catch (err) {
        console.error('Failed to load Pokémon data', err);
        setAvailableAbilities([]);
        setAvailableMoves([]);
      } finally {
        if (active) setIsLoadingData(false);
      }
    })();

    return () => { active = false; };
  }, [pokemon.id, selectedGame, isOpen]);

  const evTotal = Object.values(customData.evs).reduce((a, b) => a + b, 0);

  // ────────────────────────────────────────────────
  //  Client-side validation
  //  NOTE: ability is OPTIONAL — empty string is allowed
  // ────────────────────────────────────────────────
  const getClientErrors = (): string[] => {
    const errs: string[] = [];

    if (!Number.isInteger(customData.level) || customData.level < 1 || customData.level > 100) {
      errs.push('Level must be 1–100');
    }

    (Object.keys(customData.ivs) as (keyof typeof customData.ivs)[]).forEach((k) => {
      const v = customData.ivs[k];
      if (!Number.isInteger(v) || v < 0 || v > 31) errs.push(`${k.toUpperCase()} IV: 0–31`);
    });

    if (evTotal > 510) errs.push(`EVs total > 510 (${evTotal})`);

    customData.moves.forEach((m, i) => {
      if (m && !availableMoves.includes(m)) {
        errs.push(`Move ${i + 1} not available`);
      }
    });

    // ✅ Ability is OPTIONAL — only validate if a value is provided AND abilities are loaded
    if (
      customData.ability &&
      availableAbilities.length > 0 &&
      !availableAbilities.includes(customData.ability)
    ) {
      errs.push('Invalid ability selected');
    }

    if (customData.tid && !/^\d{1,5}$/.test(customData.tid)) errs.push('TID should be 1–5 digits');
    if (customData.sid && !/^\d{1,5}$/.test(customData.sid)) errs.push('SID should be 1–5 digits');

    return errs;
  };

  // ────────────────────────────────────────────────
  //  handleValidate — returns { valid, hasErrors }
  //  showModalFeedback=true  → always show modal
  //  showModalFeedback=false → only show modal on error (used by Start Trade)
  // ────────────────────────────────────────────────
  const handleValidate = async (showModalFeedback = true): Promise<boolean> => {
    const clientErrs = getClientErrors();
    if (clientErrs.length > 0) {
      // ✅ ALWAYS show error modal — even when called silently from handleTrade
      setModalContent({
        title: 'Invalid settings',
        message: clientErrs.join('\n'),
        isValid: false,
        errors: clientErrs,
      });
      setShowValidateModal(true);
      return false;
    }

    const form: PokemonFormData = {
      id: pokemon.id,
      name: pokemon.name,
      species: pokemon.name,
      level: customData.level,
      shiny: customData.shiny,
      alpha: customData.alpha,
      moves: customData.moves.filter(Boolean),
      ability: customData.ability,   // may be empty — legality lib handles it
      nature: customData.nature,
      ivs: customData.ivs,
      evs: customData.evs,
      item: customData.item,
      game: selectedGame,
    };

    const result = await Promise.resolve(validatePokemon(form));

    if (showModalFeedback || !result.isValid) {
      setModalContent({
        title: result.isValid
          ? (result.warnings?.length ? 'Valid (with warnings)' : 'Valid!')
          : 'Validation failed',
        message: result.isValid
          ? (result.warnings?.length ? result.warnings.join('\n') : 'Legal Pokémon ✓')
          : result.errors?.join('\n') || 'Unknown error',
        isValid: result.isValid,
        errors: result.errors,
        warnings: result.warnings,
      });
      setShowValidateModal(true);
    }
    return result.isValid;
  };

  // ────────────────────────────────────────────────
  //  handleTrade
  //  → Validate first; if errors → error modal shows (from handleValidate)
  //  → Only proceed to trade on success
  // ────────────────────────────────────────────────
  const handleTrade = async () => {
    // Run silent validation — but errors will STILL show modal (see handleValidate above)
    const valid = await handleValidate(false);
    if (!valid) return;   // Error modal is already visible; stop here

    // No validation errors — close any open validate modal and proceed
    setShowValidateModal(false);

    setIsLoading(true);

    const tradePayload = {
      pokemonName: formatPokemonName(pokemon.name),
      pokemonId: pokemon.id,
      shiny: customData.shiny,
      alpha: customData.alpha,
      level: customData.level,
      nature: customData.nature,
      ability: customData.ability,       // empty string = bot picks default
      moves: customData.moves.filter(m => m && m.trim() !== ''),
      ivs: customData.ivs,
      evs: customData.evs,
      item: customData.item,
      ball: customData.ball,
      teraType: customData.teraType,
      game: selectedGame,
      ot: customData.ot,
      tid: customData.tid,
      sid: customData.sid,
      nickname: customData.nickname,
    };

    try {
      const resp = await fetch('/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pokemon: tradePayload,
          userId: user?.uid || null,
          userName: user?.displayName || 'Guest Trainer',
        }),
      });

      let data: {
        success?: boolean;
        error?: string;
        linkCode?: string;
        queuePosition?: number;
        messageId?: string;
        userId?: string;
      };
      try {
        const text = await resp.text();
        data = text ? JSON.parse(text) : {};
      } catch {
        // ✅ Show error in modal instead of alert
        setModalContent({
          title: 'Server Error',
          message: `Server ne valid response nahi diya (status ${resp.status}).\nKya npm run dev chal raha hai?`,
          isValid: false,
          errors: [`HTTP ${resp.status}`],
        });
        setShowValidateModal(true);
        return;
      }

      if (!resp.ok) {
        // ✅ Show error in modal
        setModalContent({
          title: 'Trade Failed',
          message: data.error || `Request failed (${resp.status})`,
          isValid: false,
          errors: [data.error || `HTTP ${resp.status}`],
        });
        setShowValidateModal(true);
        return;
      }

      if (data.success) {
        const finalUserId = data.userId || user?.uid || `guest_${Math.random().toString(36).substr(2, 9)}`;

        try {
          await saveTradeToFirestore(finalUserId, {
            ...tradePayload,
            discordMessageId: data.messageId,
            linkCode: data.linkCode || 'WAITING',
          });
        } catch (fsErr) {
          console.error('Firestore save (client) after trade:', fsErr);
        }

        setModalContent({
          title: 'Trade Started!',
          message: `Your trade is in queue. Link Code will be sent to Discord.`,
          linkCode: data.linkCode || 'WAITING',
          queuePosition: data.queuePosition || '?',
          pollUserId: finalUserId,
          isValid: true,
        });
        setShowModal(true);

        if (user?.uid) {
          addTradeToHistory?.({
            userId: user.uid,
            pokemonId: pokemon.id,
            pokemonName: pokemon.name,
            linkCode: data.linkCode || 'PENDING',
            status: 'pending',
            game: selectedGame,
          });
        }
      } else {
        // ✅ Show error in modal
        setModalContent({
          title: 'Trade Failed',
          message: data.error || 'Bot error: Could not start trade',
          isValid: false,
          errors: [data.error || 'Unknown bot error'],
        });
        setShowValidateModal(true);
      }
    } catch (err) {
      console.error('Trade Error:', err);
      // ✅ Show network error in modal
      setModalContent({
        title: 'Network Error',
        message: 'Connection failed. Page refresh karke phir try karein.\n\nAgar static hosting use ho rahi ho to API routes deploy par kaam nahi karte.',
        isValid: false,
        errors: ['Network / connection error'],
      });
      setShowValidateModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const updateIV = (stat: keyof typeof customData.ivs, value: string) => {
    const num = Number(value);
    setCustomData((p) => ({
      ...p,
      ivs: { ...p.ivs, [stat]: Number.isNaN(num) ? 31 : Math.min(31, Math.max(0, num)) },
    }));
  };

  const updateEV = (stat: keyof typeof customData.evs, value: string) => {
    const num = Number(value);
    setCustomData((p) => ({
      ...p,
      evs: { ...p.evs, [stat]: Number.isNaN(num) ? 0 : Math.min(252, Math.max(0, num)) },
    }));
  };

  const generateCommandText = () => {
    const lines = [
      `!t ${formatPokemonName(pokemon.name)}`,
      customData.nickname ? `Nickname: ${customData.nickname}` : '',
      customData.shiny ? `Shiny: Yes` : '',
      customData.ability ? `Ability: ${customData.ability}` : '',
      customData.ball ? `Ball: ${customData.ball}` : '',
      `Language: English`,
      customData.ot ? `OT: ${customData.ot}` : '',
      customData.tid ? `TID: ${customData.tid}` : '',
      customData.sid ? `SID: ${customData.sid}` : '',
      `Level: ${customData.level}`,
      customData.teraType ? `Tera Type: ${customData.teraType}` : '',
      `${customData.nature} Nature`,
      ...customData.moves.filter(Boolean).map((m) => `Move: ${m}`),
      `IVs: ${customData.ivs.hp} HP / ${customData.ivs.atk} atk / ${customData.ivs.def} def / ${customData.ivs.spa} spa / ${customData.ivs.spd} spd / ${customData.ivs.spe} spe`,
    ];
    return lines.filter(line => line !== '').join('\n');
  };

  const commandText = generateCommandText();

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isOpen && modalContent?.linkCode === 'WAITING' && modalContent?.pollUserId) {
      interval = setInterval(async () => {
        try {
          const discordName = customData.ot || user?.displayName || 'Guest';
          const res = await fetch(
            `/api/trade?userId=${encodeURIComponent(modalContent.pollUserId)}&discordUser=${encodeURIComponent(discordName)}`
          );
          const result = await res.json();

          if (result.success && result.data) {
            setModalContent((prev: typeof modalContent) => {
              if (!prev) return prev;
              const next = {
                ...prev,
                queuePosition: result.data.queuePosition ?? prev.queuePosition ?? '?',
              } as any;

              if (result.data.linkCode && result.data.linkCode !== 'WAITING') {
                next.linkCode = result.data.linkCode;
                next.title = 'Trade Ready!';
                next.message = `Bot is ready! IGN: ${result.data.botIGN || 'Bot'}`;
                next.isValid = true;
              }
              return next;
            });

            if (result.data.linkCode && result.data.linkCode !== 'WAITING') {
              clearInterval(interval);
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 5000);
    }

    return () => { if (interval) clearInterval(interval); };
  }, [isOpen, modalContent?.linkCode, modalContent?.pollUserId, user?.displayName, customData.ot]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-50 flex items-end bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`bg-white dark:bg-gray-900 w-full max-h-[92vh] overflow-hidden rounded-t-3xl shadow-2xl transform transition-transform duration-300 ${
            isOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                  alt={pokemon.name}
                  className="w-14 h-14 sm:w-16 sm:h-16 bg-white/90 rounded-full p-1"
                />
                {customData.shiny && (
                  <div className="absolute -top-1 -right-1 bg-white/80 rounded-full p-1 shadow">
                    <img src="/masklicon.png" alt="Shiny" className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-white font-bold text-xl">
                  {formatPokemonName(pokemon.name)}
                </h3>
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <span>#{String(pokemon.id).padStart(4, '0')}</span>
                  {pokemon.types?.map((t: any) => (
                    <span key={t.type.name} className="px-2 py-0.5 text-xs rounded-full bg-white/20">
                      {t.type.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-full transition">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
              </svg>
            </button>
          </div>

          {/* Main content */}
          <div className="p-5 overflow-y-auto max-h-[calc(92vh-80px)]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* 1. Basic Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-1">Basic</h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm mb-1 font-medium">Nickname</label>
                    <input
                      maxLength={12}
                      value={customData.nickname}
                      onChange={(e) => setCustomData((p) => ({ ...p, nickname: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-xs mb-1">OT</label>
                      <input
                        value={customData.ot}
                        onChange={(e) => setCustomData((p) => ({ ...p, ot: e.target.value.slice(0, 12) }))}
                        className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700"
                        maxLength={12}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">TID</label>
                      <input
                        value={customData.tid}
                        onChange={(e) => setCustomData((p) => ({ ...p, tid: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                        className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700"
                        maxLength={5}
                        placeholder="optional"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">SID</label>
                      <input
                        value={customData.sid}
                        onChange={(e) => setCustomData((p) => ({ ...p, sid: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
                        className="w-full border rounded px-2 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700"
                        maxLength={5}
                        placeholder="optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1 font-medium">Nature</label>
                    <select
                      value={customData.nature}
                      onChange={(e) => setCustomData((p) => ({ ...p, nature: e.target.value }))}
                      className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                    >
                      {NATURES.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm mb-1 font-medium">Level</label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={customData.level}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          setCustomData((p) => ({ ...p, level: Number.isNaN(v) ? 50 : Math.min(100, Math.max(1, v)) }));
                        }}
                        className="w-full border rounded-lg px-3 py-2 text-center dark:bg-gray-800 dark:border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="block text-sm mb-1 font-medium">Item</label>
                      <select
                        value={customData.item}
                        onChange={(e) => setCustomData((p) => ({ ...p, item: e.target.value }))}
                        className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                      >
                        {COMMON_ITEMS.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-1 font-medium flex items-center gap-2">
                      Ability
                      <span className="text-xs text-gray-400 font-normal">(optional)</span>
                      {isLoadingData && <span className="text-xs text-gray-500">(loading…)</span>}
                    </label>
                    <select
                      value={customData.ability}
                      onChange={(e) => setCustomData((p) => ({ ...p, ability: e.target.value }))}
                      disabled={isLoadingData}
                      className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
                    >
                      {/* ✅ Empty option = bot picks default ability */}
                      <option value="">— Bot default —</option>
                      {availableAbilities.map(a => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 pt-1">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={customData.shiny}
                        onChange={e => setCustomData(p => ({ ...p, shiny: e.target.checked }))}
                        className="rounded text-yellow-500"
                      />
                      <span>Shiny</span>
                    </label>

                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={customData.alpha}
                        onChange={e => setCustomData(p => ({ ...p, alpha: e.target.checked }))}
                        className="rounded text-purple-600"
                      />
                      <span>Alpha (Legends: Arceus)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Stats */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg border-b pb-1">Stats</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    EVs {evTotal} / 510
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {['hp', 'atk', 'def', 'spa', 'spd', 'spe'].map(stat => (
                    <div key={stat} className="space-y-2">
                      <div className="text-center text-xs font-medium uppercase tracking-wide text-gray-600 dark:text-gray-400">
                        {stat}
                      </div>
                      <input
                        type="number"
                        min={0}
                        max={31}
                        value={customData.ivs[stat as keyof typeof customData.ivs]}
                        onChange={e => updateIV(stat as any, e.target.value)}
                        className="w-full text-center border rounded py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700"
                        placeholder="IV"
                      />
                      <input
                        type="number"
                        min={0}
                        max={252}
                        step={4}
                        value={customData.evs[stat as keyof typeof customData.evs]}
                        onChange={e => updateEV(stat as any, e.target.value)}
                        className="w-full text-center border rounded py-1.5 text-sm dark:bg-gray-800 dark:border-gray-700"
                        placeholder="EV"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Moves + Tera + Ball */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg border-b pb-1 flex items-center gap-2">
                  Moves
                  {isLoadingData && <span className="text-xs text-gray-500">(loading…)</span>}
                </h4>

                <div className="space-y-2">
                  {[0, 1, 2, 3].map(i => (
                    <select
                      key={i}
                      value={customData.moves[i]}
                      onChange={e => {
                        const copy = [...customData.moves];
                        copy[i] = e.target.value;
                        setCustomData(p => ({ ...p, moves: copy }));
                      }}
                      disabled={isLoadingData}
                      className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700 disabled:opacity-50"
                    >
                      <option value="">Move {i + 1} — empty</option>
                      {availableMoves.map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  ))}
                </div>

                <div>
                  <label className="block text-sm mb-1 font-medium">Tera Type</label>
                  <select
                    value={customData.teraType}
                    onChange={e => setCustomData(p => ({ ...p, teraType: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                  >
                    {TERA_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm mb-1 font-medium">Poké Ball</label>
                  <select
                    value={customData.ball}
                    onChange={e => setCustomData(p => ({ ...p, ball: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                  >
                    {COMMON_BALLS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>

              {/* 4. Game + Actions + Export */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm mb-1 font-medium">Game</label>
                  <select
                    value={selectedGame}
                    onChange={e => setSelectedGame(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                  >
                    <option value="scarlet-violet">Scarlet / Violet</option>
                    <option value="sword-shield">Sword / Shield</option>
                    <option value="bdsp">BDSP</option>
                    <option value="legends-arceus">Legends: Arceus</option>
                    <option value="legends-za">Legends: Z-A</option>
                  </select>
                </div>

                {pokemonOwned && (
                  <div className="bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 px-4 py-2 rounded-lg text-center text-sm font-medium">
                    ✓ Already in your Pokédex
                  </div>
                )}

                <div className="space-y-3">
                  <a
                    href="https://discord.gg/blaines"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-center py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg font-semibold hover:brightness-110 transition"
                  >
                    💬 Join Discord
                  </a>

                  <button
                    onClick={() => { void handleValidate(true); }}
                    disabled={isLoading || isLoadingData}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-semibold disabled:opacity-60 hover:brightness-110 transition"
                  >
                    ✅ Validate
                  </button>

                  <button
                    onClick={handleTrade}
                    disabled={isLoading || isLoadingData}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-lg font-semibold disabled:opacity-60 hover:brightness-110 transition"
                  >
                    {isLoading ? 'Sending…' : '🔄 Start Trade'}
                  </button>
                </div>

                {/* Trade Command Preview */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono whitespace-pre-wrap border border-gray-200 dark:border-gray-700">
                  <div className="font-semibold mb-2 text-base font-sans">Trade Command Preview</div>
                  {commandText}
                  <button
                    onClick={() => navigator.clipboard.writeText(commandText)}
                    className="mt-3 text-xs text-blue-600 dark:text-blue-400 hover:underline block"
                  >
                    Copy to clipboard
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ─── Validation / Error Modal ───────────────────────────────────── */}
      {showValidateModal && modalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div className={`rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border ${
            modalContent.isValid
              ? 'bg-gradient-to-b from-green-700 to-green-900 border-green-400/40'
              : 'bg-gradient-to-b from-red-700 to-red-900 border-red-400/40'
          }`}>
            <div className={`py-6 px-6 text-center ${
              modalContent.isValid
                ? 'bg-gradient-to-r from-green-600 to-emerald-700'
                : 'bg-gradient-to-r from-red-600 to-rose-700'
            }`}>
              <div className="text-5xl mb-3">{modalContent.isValid ? '✅' : '⚠️'}</div>
              <h2 className="text-2xl font-bold text-white">{modalContent.title}</h2>
            </div>

            <div className="p-6 space-y-5 text-center">
              <p className="whitespace-pre-line text-gray-200 text-sm leading-relaxed">
                {modalContent.message}
              </p>

              {modalContent.errors?.length > 0 && (
                <div className="bg-black/30 rounded-lg p-4 text-left text-red-200 text-sm max-h-60 overflow-y-auto">
                  {modalContent.errors.map((err: string, i: number) => (
                    <div key={i}>• {err}</div>
                  ))}
                </div>
              )}

              {modalContent.warnings?.length > 0 && (
                <div className="bg-yellow-900/40 rounded-lg p-4 text-yellow-200 text-sm">
                  {modalContent.warnings.join('\n')}
                </div>
              )}

              <button
                onClick={() => setShowValidateModal(false)}
                className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Trade Success Modal ─────────────────────────────────────────── */}
      {showModal && modalContent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4">
          <div className="bg-gradient-to-b from-green-700 to-green-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-green-400/40">
            <div className="bg-gradient-to-r from-green-600 to-emerald-700 py-6 px-6 text-center">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-2xl font-bold text-white">Trade Started!</h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-white/10 rounded-xl p-4 text-center">
                <div className="font-bold text-lg mb-1">{formatPokemonName(pokemon.name)}</div>
                <div className="text-green-200 text-sm">
                  Lv. {customData.level} • {customData.shiny ? 'Shiny ✨' : 'Normal'}
                </div>
              </div>

              <div className="bg-gray-900/60 rounded-xl p-5 text-center border border-gray-700">
                <div className="text-gray-300 text-sm mb-2">Link Code</div>
                <div className="text-5xl font-bold font-mono tracking-widest text-green-400">
                  {modalContent.linkCode}
                </div>
              </div>

              <div className="flex justify-between bg-white/10 rounded-xl p-4">
                <span>Position in queue</span>
                <span className="font-bold text-xl text-green-300">#{modalContent.queuePosition}</span>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}