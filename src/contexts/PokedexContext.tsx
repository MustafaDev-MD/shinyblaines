'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

export interface OwnedPokemon {
  id: number;
  name: string;
  shiny: boolean;
  obtainedAt: Date;
  game: string;
}

export interface TradeHistory {
  id?: string;
  userId: string;
  pokemonId: number;
  pokemonName: string;
  linkCode: string;
  status: 'pending' | 'completed' | 'failed';
  game: string;
  createdAt: Date;
}

interface PokedexContextType {
  ownedPokemon: OwnedPokemon[];
  tradeHistory: TradeHistory[];
  isLoading: boolean;
  addOwnedPokemon: (pokemon: Omit<OwnedPokemon, 'obtainedAt'>) => Promise<void>;
  removeOwnedPokemon: (pokemonId: number) => void;
  isOwned: (pokemonId: number) => boolean;
  clearPokedex: () => void;
  addTradeToHistory: (trade: Omit<TradeHistory, 'id' | 'createdAt'>) => Promise<void>;
  updateTradeStatus: (tradeId: string, status: 'pending' | 'completed' | 'failed') => Promise<void>;
}

const PokedexContext = createContext<PokedexContextType | undefined>(undefined);

export function PokedexProvider({ children }: { children: ReactNode }) {
  const [ownedPokemon, setOwnedPokemon] = useState<OwnedPokemon[]>([]);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadUserData();
    } else {
      loadLocalData();
    }
  }, [user]);

  const loadLocalData = () => {
    const saved = localStorage.getItem('shinyblaines_pokedex');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setOwnedPokemon(parsed.map((p: any) => ({
          ...p,
          obtainedAt: new Date(p.obtainedAt)
        })));
      } catch {
        localStorage.removeItem('shinyblaines_pokedex');
      }
    }
    setIsLoading(false);
  };

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const db = getFirebaseDb();
      if (!db) {
        loadLocalData();
        return;
      }

      const pokedexRef = doc(db, 'users', user.uid, 'pokedex', 'owned');
      const pokedexSnap = await getDoc(pokedexRef);
      
      if (pokedexSnap.exists()) {
        const data = pokedexSnap.data();
        setOwnedPokemon(data.pokemon || []);
      }

      const tradesQuery = query(
        collection(db, 'users', user.uid, 'trades'),
        orderBy('createdAt', 'desc')
      );
      const tradesSnap = await getDocs(tradesQuery);
      const trades: TradeHistory[] = [];
      tradesSnap.forEach(doc => {
        trades.push({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate() } as TradeHistory);
      });
      setTradeHistory(trades);

    } catch (error) {
      console.error('Error loading user data, falling back to local:', error);
      loadLocalData();
    }
    setIsLoading(false);
  };

  const saveToLocalStorage = (pokemon: OwnedPokemon[]) => {
    localStorage.setItem('shinyblaines_pokedex', JSON.stringify(pokemon));
  };

  const saveToFirebase = async (pokemon: OwnedPokemon[]) => {
    if (!user) return;
    
    try {
      const db = getFirebaseDb();
      if (!db) {
        console.warn('Firebase not available, saving to local only');
        saveToLocalStorage(pokemon);
        return;
      }
      
      await setDoc(doc(db, 'users', user.uid, 'pokedex', 'owned'), {
        pokemon,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error saving to Firebase:', error);
      saveToLocalStorage(pokemon);
    }
  };

  const addOwnedPokemon = async (pokemon: Omit<OwnedPokemon, 'obtainedAt'>) => {
    const newPokemon: OwnedPokemon = { ...pokemon, obtainedAt: new Date() };
    
    setOwnedPokemon(prev => {
      const exists = prev.some(p => p.id === pokemon.id);
      if (exists) return prev;
      
      const updated = [...prev, newPokemon];
      
      if (user) {
        saveToFirebase(updated).catch(() => {
          saveToLocalStorage(updated);
        });
      } else {
        saveToLocalStorage(updated);
      }
      
      return updated;
    });
  };

  const removeOwnedPokemon = (pokemonId: number) => {
    setOwnedPokemon(prev => {
      const updated = prev.filter(p => p.id !== pokemonId);
      
      if (user) {
        saveToFirebase(updated);
      } else {
        saveToLocalStorage(updated);
      }
      
      return updated;
    });
  };

  const isOwned = (pokemonId: number) => {
    return ownedPokemon.some(p => p.id === pokemonId);
  };

  const clearPokedex = () => {
    setOwnedPokemon([]);
    localStorage.removeItem('shinyblaines_pokedex');
    
    if (user) {
      saveToFirebase([]);
    }
  };

  const addTradeToHistory = async (trade: Omit<TradeHistory, 'id' | 'createdAt'>) => {
    const newTrade: TradeHistory = {
      ...trade,
      createdAt: new Date()
    };

    if (user) {
      try {
        const db = getFirebaseDb();
        if (!db) return;
        
        const docRef = await addDoc(collection(db, 'users', user.uid, 'trades'), {
          ...newTrade,
          createdAt: new Date()
        });
        newTrade.id = docRef.id;
      } catch (error) {
        console.error('Error adding trade to Firebase:', error);
      }
    }

    setTradeHistory(prev => [newTrade, ...prev]);
  };

  const updateTradeStatus = async (tradeId: string, status: 'pending' | 'completed' | 'failed') => {
    setTradeHistory(prev => 
      prev.map(t => t.id === tradeId ? { ...t, status } : t)
    );
  };

  return (
    <PokedexContext.Provider value={{
      ownedPokemon,
      tradeHistory,
      isLoading,
      addOwnedPokemon,
      removeOwnedPokemon,
      isOwned,
      clearPokedex,
      addTradeToHistory,
      updateTradeStatus
    }}>
      {children}
    </PokedexContext.Provider>
  );
}

export function usePokedex() {
  const context = useContext(PokedexContext);
  if (!context) {
    throw new Error('usePokedex must be used within PokedexProvider');
  }
  return context;
}
