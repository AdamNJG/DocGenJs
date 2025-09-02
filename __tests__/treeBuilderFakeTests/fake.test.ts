import { describe, test, expect } from 'vitest';

describe('this is a fake description', () => {
  test('this is a fake test', () => {
    const a = 1;
    const b = 2;
    expect(a + b).toBe(3);
  });
});