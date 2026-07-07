import { describe, it, expect } from 'vitest';
import { CATEGORIES } from '@/lib/categories';

describe('CATEGORIES', () => {
  it('should contain at least one category', () => {
    expect(CATEGORIES.length).toBeGreaterThan(0);
  });

  it('should have unique slugs', () => {
    const slugs = CATEGORIES.map((c) => c.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('should have non-empty names', () => {
    CATEGORIES.forEach((c) => {
      expect(c.name).toBeTruthy();
      expect(c.name.length).toBeGreaterThan(2);
    });
  });

  it('should declare an icon for every entry', () => {
    CATEGORIES.forEach((c) => {
      expect(c.icon).toBeTruthy();
    });
  });
});
