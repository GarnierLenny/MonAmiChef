/**
 * Random word collections for Claude-like dynamic text variation
 */

// Synonyms for "exquisite" - elegant, sophisticated adjectives
export const exquisiteAdjectives = [
  'exquisite',
  'delicious',
  'magnificent',
  'delightful',
  'exceptional',
  'remarkable',
  'wonderful',
  'fantastic',
  'amazing',
  'outstanding',
  'brilliant',
  'superb',
  'marvelous',
  'fabulous',
  'splendid',
  'divine',
  'heavenly',
  'incredible',
  'spectacular'
] as const;


/**
 * Get a random word from an array
 */
function getRandomWord<T extends readonly string[]>(words: T): T[number] {
  return words[Math.floor(Math.random() * words.length)];
}

/**
 * Get a random exquisite-like adjective
 */
export function getRandomExquisiteAdjective(): string {
  return getRandomWord(exquisiteAdjectives);
}


/**
 * Generate dynamic loading text with highlighted adjective
 */
export function getRandomLoadingText(): { text: string; adjective: string } {
  const adjective = getRandomExquisiteAdjective();
  return {
    text: `Generating ${adjective} recipe...`,
    adjective: adjective
  };
}

