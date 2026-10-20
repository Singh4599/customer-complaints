// firebase-config.js — LV Spices Customer Complaint Register
import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import { getFirestore, collection, doc, setDoc, getDocs, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCfD0cujd7GUW_i9slmcR5Sog7vlmMiRdE",
  authDomain: "customercomplain.firebaseapp.com",
  projectId: "customercomplain",
  storageBucket: "customercomplain.firebasestorage.app",
  messagingSenderId: "44914514843",
  appId: "1:44914514843:web:068cecc88428d7196b5f3e"
};

export const COLLECTION_NAME = "complaint_register";
let db = null;

export function updateCloudBadge(connected) {
  const badge = document.getElementById('cloud-status-badge');
  const text  = document.getElementById('cloud-status-text');
  if (!badge) return;
  badge.className = connected ? 'cloud-badge connected' : 'cloud-badge offline';
  if (text) text.textContent = connected ? 'Cloud Synced' : 'Local / Offline';
}

export function initFirebase() {
  if (db) return db;
  try {
    const app = getApps().find(a => a.name === 'complaints') || initializeApp(firebaseConfig, 'complaints');
    db = getFirestore(app);
    updateCloudBadge(true);
    return db;
  } catch (err) { updateCloudBadge(false); return null; }
}

export async function saveComplaint(id, data) {
  const database = initFirebase();
  if (!database) return false;
  try {
    await setDoc(doc(database, COLLECTION_NAME, id), { ...data, updatedAt: Date.now() }, { merge: true });
    updateCloudBadge(true); return true;
  } catch (err) { updateCloudBadge(false); return false; }
}

export async function loadAllComplaints() {
  const database = initFirebase();
  if (!database) return [];
  try {
    const q = query(collection(database, COLLECTION_NAME), orderBy("date", "desc"), limit(500));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch { return []; }
}

try { initFirebase(); } catch (e) {}
