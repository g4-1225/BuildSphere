// Small wrappers so a full or disabled browser storage never crashes the app.

export function readJSON(key, fallback = null, store = window.localStorage) {
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

/** Returns true when the value was saved, false if storage is full or blocked. */
export function writeJSON(key, value, store = window.localStorage) {
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    // Storage may be full or blocked (private mode). The demo keeps working in memory.
    return false;
  }
}

export function removeKey(key, store = window.localStorage) {
  try {
    store.removeItem(key);
  } catch {
    // Ignore — nothing to clean up.
  }
}
