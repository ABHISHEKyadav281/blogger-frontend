/**
 * Centralized configuration for the application.
 * Values are pulled from environment variables.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
