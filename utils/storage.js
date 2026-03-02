import AsyncStorage from "@react-native-async-storage/async-storage";

const FAVORITES_KEY = "@wiki_random_favorites";

export async function loadFavorites() {
  try {
    const json = await AsyncStorage.getItem(FAVORITES_KEY);
    if (json) {
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (err) {
    console.error("Failed to load favorites", err);
  }
  return [];
}

export async function saveFavorites(favorites) {
  try {
    await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch (err) {
    console.error("Failed to save favorites", err);
  }
}

export async function addFavorite(item) {
  const existing = await loadFavorites();
  // avoid duplicates
  if (!existing.find((f) => f.id === item.id)) {
    existing.push(item);
    await saveFavorites(existing);
  }
}

export async function removeFavorite(id) {
  let existing = await loadFavorites();
  existing = existing.filter((f) => f.id !== id);
  await saveFavorites(existing);
}

// -----------------------------------------------------------------------------
// Article limit/settings persistence
// We keep this separate from the favorites list since it is a simple number.
// Consumers should call `loadArticleLimit()` to retrieve the current value and
// `saveArticleLimit()` to update it.

const ARTICLE_LIMIT_KEY = "@wiki_random_article_limit";
const SETTINGS_CHANGED_KEY = "@wiki_random_settings_changed";

/**
 * Load the stored article limit, defaulting to `15` if nothing is saved or on
 * error.
 */
export async function loadArticleLimit() {
  try {
    const value = await AsyncStorage.getItem(ARTICLE_LIMIT_KEY);
    if (value !== null) {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) {
        // clamp between 1 and 15 just in case
        return Math.min(15, Math.max(1, parsed));
      }
    }
  } catch (err) {
    console.error("Failed to load article limit", err);
  }
  return 15;
}

/**
 * Save a new article limit.  The value will be clamped to the allowed range
 * (1–15) before persisting.
 */
export async function saveArticleLimit(limit) {
  try {
    const clamped = Math.min(15, Math.max(1, limit));
    await AsyncStorage.setItem(ARTICLE_LIMIT_KEY, String(clamped));
  } catch (err) {
    console.error("Failed to save article limit", err);
  }
}

/**
 * Mark that settings have changed and articles should be refreshed
 */
export async function markSettingsChanged() {
  try {
    await AsyncStorage.setItem(SETTINGS_CHANGED_KEY, "true");
  } catch (err) {
    console.error("Failed to mark settings changed", err);
  }
}

/**
 * Check if settings have changed since last article refresh
 */
export async function hasSettingsChanged() {
  try {
    const value = await AsyncStorage.getItem(SETTINGS_CHANGED_KEY);
    return value === "true";
  } catch (err) {
    console.error("Failed to check settings changed", err);
    return false;
  }
}

/**
 * Clear the settings changed flag (called after articles are refreshed)
 */
export async function clearSettingsChanged() {
  try {
    await AsyncStorage.removeItem(SETTINGS_CHANGED_KEY);
  } catch (err) {
    console.error("Failed to clear settings changed", err);
  }
}
