import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { getFirebaseDb } from './firebase'; // Apna firebase config path check karein

export async function saveTradeToFirestore(userId: string, tradeData: any) {
  const db = getFirebaseDb();
  if (!db) return;

  try {
    // Firestore undefined values accept nahi karta
    const sanitizedTradeData = Object.fromEntries(
      Object.entries(tradeData || {}).filter(([, value]) => value !== undefined)
    );

    // 1. Ek main 'trades' collection jahan har request save hogi (Monitoring ke liye)
    const tradesRef = collection(db, 'trades');
    const newTrade = {
      ...sanitizedTradeData,
      userId: userId,
      status: 'pending',
      timestamp: serverTimestamp(),
    };
    
    await addDoc(tradesRef, newTrade);

    // 2. Agar user login hai (starts with 'guest_' nahi hai), 
    // toh uske personal profile mein bhi history save karein
    if (!userId.startsWith('guest_')) {
      const userHistoryRef = collection(db, 'users', userId, 'tradeHistory');
      await addDoc(userHistoryRef, newTrade);
    }

    console.log("✅ Trade data saved to Firestore");
  } catch (error) {
    console.error("❌ Firestore Save Error:", error);
    throw error;
  }
}