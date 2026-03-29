import { doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore'
import { db, firebaseEnabled } from './firebase'

// Writes data to a Firestore document (debounced)
const writeTimers = {}
export function syncWrite(collection, docId, data) {
  if (!firebaseEnabled) return
  const key = `${collection}/${docId}`
  clearTimeout(writeTimers[key])
  writeTimers[key] = setTimeout(() => {
    setDoc(doc(db, collection, docId), data).catch(console.error)
  }, 500)
}

// Loads initial data from Firestore (once)
export async function syncRead(collection, docId) {
  if (!firebaseEnabled) return null
  try {
    const snap = await getDoc(doc(db, collection, docId))
    return snap.exists() ? snap.data() : null
  } catch {
    return null
  }
}

// Subscribes to real-time changes from Firestore
export function syncSubscribe(collection, docId, callback) {
  if (!firebaseEnabled) return () => {}
  return onSnapshot(doc(db, collection, docId), (snap) => {
    if (snap.exists()) callback(snap.data())
  })
}
