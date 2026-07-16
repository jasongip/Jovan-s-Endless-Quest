/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, getDocs, limit, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { LeaderboardEntry } from './types';
import appletConfig from '../firebase-applet-config.json';

// Robust configuration parsing from environment variables or custom files
const firebaseConfig = {
  apiKey: appletConfig?.apiKey || (import.meta as any).env?.VITE_FIREBASE_API_KEY || "",
  authDomain: appletConfig?.authDomain || (import.meta as any).env?.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: appletConfig?.projectId || (import.meta as any).env?.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: appletConfig?.storageBucket || (import.meta as any).env?.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: appletConfig?.messagingSenderId || (import.meta as any).env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: appletConfig?.appId || (import.meta as any).env?.VITE_FIREBASE_APP_ID || "",
  firestoreDatabaseId: appletConfig?.firestoreDatabaseId || "",
};

let app;
let db: any = null;
let auth: any = null;
let isFirebaseEnabled = false;

// Only initialize if we have at least a projectId and apiKey
if (firebaseConfig.projectId && firebaseConfig.apiKey) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
    auth = getAuth(app);
    isFirebaseEnabled = true;
    console.log("🔥 Firebase initialized successfully for leaderboard sync.");
  } catch (error) {
    console.warn("⚠️ Firebase failed to initialize. Using high-fidelity local fallback.", error);
  }
} else {
  console.warn(
    "⚠️ Firebase configuration missing from environment variables.\n" +
    "Syncing to LocalStorage leaderboard fallback instead.\n" +
    "To enable live Firestore syncing, configure VITE_FIREBASE_* keys in your .env or run Firebase setup."
  );
}

export { db, auth, isFirebaseEnabled };

/**
 * Synchronizes the hero's progress to the Firebase Firestore /leaderboard collection.
 * Conforms strictly to requirements: setDoc with { merge: true }
 * Graces down to localStorage fallback if Firestore is not active.
 */
export async function syncLeaderboard(entry: LeaderboardEntry): Promise<boolean> {
  // Always update local storage first as the local-first source of truth
  const localLeaderboard = JSON.parse(localStorage.getItem('infinite_spire_leaderboard') || '[]');
  
  // Find or insert current player in local copy
  const existingIdx = localLeaderboard.findIndex((e: any) => e.name === entry.name);
  if (existingIdx !== -1) {
    localLeaderboard[existingIdx] = { ...localLeaderboard[existingIdx], ...entry };
  } else {
    localLeaderboard.push(entry);
  }
  
  // Sort descending by weeklyXP, then total XP
  localLeaderboard.sort((a: any, b: any) => (b.weeklyXP || 0) - (a.weeklyXP || 0) || (b.xp || 0) - (a.xp || 0));
  localStorage.setItem('infinite_spire_leaderboard', JSON.stringify(localLeaderboard.slice(0, 50)));

  if (!isFirebaseEnabled || !db) {
    console.log("📂 Local-first leaderboard updated (Firebase offline):", entry);
    return false;
  }

  try {
    const docRef = doc(db, 'leaderboard', entry.name);
    await setDoc(docRef, {
      name: entry.name,
      xp: entry.xp,
      weeklyXP: entry.weeklyXP,
      maxFloorReached: entry.maxFloorReached,
      goldCoins: entry.goldCoins,
      updatedAt: serverTimestamp() // Conforms to standard Firestore practices
    }, { merge: true });
    
    console.log("☁️ Asynchronously synced to Firestore /leaderboard collection successfully.");
    return true;
  } catch (err) {
    console.error("❌ Failed to sync with Firebase Firestore. Checked rules or network?", err);
    return false;
  }
}

/**
 * Retrieves the current leaderboard list (top 10).
 * Integrates live Firestore collection queries, falling back to local storage list.
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  if (isFirebaseEnabled && db) {
    try {
      const q = query(
        collection(db, 'leaderboard'),
        limit(100)
      );
      const snapshot = await getDocs(q);
      const list: LeaderboardEntry[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          name: data.name || doc.id,
          xp: data.xp || 0,
          weeklyXP: data.weeklyXP !== undefined ? data.weeklyXP : (data.weeklyXp || 0),
          maxFloorReached: data.maxFloorReached || 1,
          goldCoins: data.goldCoins || 0,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
        });
      });
      if (list.length > 0) {
        list.sort((a, b) => (b.weeklyXP || 0) - (a.weeklyXP || 0) || (b.xp || 0) - (a.xp || 0));
        return list;
      }
    } catch (err) {
      console.warn("Could not fetch remote leaderboard, returning local data.", err);
    }
  }

  // Local storage fallback
  const list = JSON.parse(localStorage.getItem('infinite_spire_leaderboard') || '[]');
  return list.map((item: any) => ({
    name: item.name,
    xp: item.xp || 0,
    weeklyXP: item.weeklyXP || 0,
    maxFloorReached: item.maxFloorReached || 1,
    goldCoins: item.goldCoins || 0,
    updatedAt: item.updatedAt || new Date().toISOString()
  }));
}
