import { describe, it, expect } from 'vitest';
import { Validator } from '../src/core/validator.js';

describe('Validator Stress Test', () => {
    const v = new Validator();

    it('should handle contractions', () => {
        expect(v.check("I am", "I'm")).toBe(true);
        expect(v.check("don't", "do not")).toBe(true);
        expect(v.check("we'll", "we will")).toBe(true);
    });

    it('should handle normalization', () => {
        expect(v.check("  WORKING  ", "working.")).toBe(true);
    });

    it('should handle fuzzy matching', () => {
        expect(v.check("beautifull", "beautiful")).toBe(true);
        expect(v.check("tomorow", "tomorrow")).toBe(true);
    });

    it('should reject wrong answers', () => {
        expect(v.check("working", "worked")).toBe(false);
    });
});
