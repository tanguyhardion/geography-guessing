/**
 * Utility functions for improved random selection in games
 */

/**
 * Select a random item from an array, avoiding the previously selected item if possible
 * @param items - Array of items to select from
 * @param previousItem - Previously selected item to avoid (if possible)
 * @returns Random item from the array
 */
export function selectRandomItem<T>(items: T[], previousItem?: T): T {
  if (items.length === 0) {
    throw new Error("Cannot select from empty array");
  }

  // If only one item available, return it
  if (items.length === 1) {
    return items[0];
  }

  // If no previous item or previous item not in current array, select normally
  if (!previousItem || !items.includes(previousItem)) {
    return items[Math.floor(Math.random() * items.length)];
  }

  // If we have multiple items and want to avoid the previous one
  const availableItems = items.filter(item => item !== previousItem);
  
  // If filtering left us with no items (shouldn't happen), fall back to full array
  if (availableItems.length === 0) {
    return items[Math.floor(Math.random() * items.length)];
  }

  return availableItems[Math.floor(Math.random() * availableItems.length)];
}

/**
 * Generate a better shuffled array using Fisher-Yates shuffle algorithm
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
}

/**
 * Select a random item using weighted distribution for better randomness
 * @param items - Array of items to select from
 * @param previousItem - Previously selected item to reduce weight for
 * @returns Random item from the array
 */
export function selectRandomItemWeighted<T>(items: T[], previousItem?: T): T {
  if (items.length === 0) {
    throw new Error("Cannot select from empty array");
  }

  if (items.length === 1) {
    return items[0];
  }

  // Create weights - reduce weight for previous item
  const weights = items.map(item => {
    if (previousItem && item === previousItem) {
      // Give previous item 10% of normal weight
      return 0.1;
    }
    return 1.0;
  });

  // Calculate total weight
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  // Generate random number between 0 and totalWeight
  let random = Math.random() * totalWeight;

  // Find the selected item based on weights
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }

  // Fallback (shouldn't reach here)
  return items[items.length - 1];
}
