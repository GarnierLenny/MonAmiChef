/**
 * AI Model Configuration Constants
 * Centralized configuration for AI models used throughout the application
 */

/**
 * Google Gemini model identifier
 * Used for chat, recipe generation, and transcription services
 *
 * Available models:
 * - gemini-2.5-flash: Latest Flash model (requires @google/genai v1.20+)
 * - gemini-2.0-flash: Second generation Flash model
 * - gemini-1.5-flash: First generation Flash model (legacy)
 * - gemini-1.5-pro: More powerful first generation model
 */
export const GEMINI_MODEL = 'gemini-2.5-flash';
