/**
 * @deprecated Use type-fest instead
 * Import: import type { SetOptional } from 'type-fest'
 *
 * Makes Partial only specified keys.
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * @deprecated Use type-fest instead
 * Custom implementation - no direct type-fest equivalent
 *
 * Makes required only specified keys. Other will be optional or Partial
 */
export type RequiredOnly<T, K extends keyof T> = Partial<Omit<T, K>> & Required<Pick<T, K>>;

/**
 * @deprecated Use type-fest instead
 * Import: import type { SetRequired } from 'type-fest'
 *
 * Makes required only specified keys.
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Re-export type-fest utilities for migration
export type { SetOptional, SetRequired } from 'type-fest';
