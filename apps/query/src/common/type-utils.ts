/**
 * Type utilities for the application
 *
 * This file now re-exports utilities from type-fest.
 * Custom implementations have been removed in favor of the industry-standard library.
 *
 * For migration guide, see: https://github.com/sindresorhus/type-fest
 */

// Re-export commonly used type-fest utilities
export type {
    SetOptional,   // Replaces PartialBy<T, K>
    SetRequired,   // Replaces RequiredBy<T, K>
    Simplify,      // Flattens intersections for better DX
    ReadonlyDeep,  // Makes all properties recursively readonly
    PartialDeep,   // Makes all properties recursively optional
} from 'type-fest';
