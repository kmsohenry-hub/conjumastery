export function loadState(key) {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(`Failed to load state for key: ${key}`, e);
  }
  return null;
}

export function saveState(key, state) {
  try {
    localStorage.setItem(key, JSON.stringify(state));
  } catch (e) {
    console.error(`Failed to save state for key: ${key}`, e);
  }
}
