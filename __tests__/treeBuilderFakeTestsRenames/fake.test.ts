import { describe as describeProxy, test as testProxy, expect } from 'vitest';

describeProxy('this is a fake description', () => {
  testProxy('this is a fake test', () => {
    const a = 1;
    const b = 2;
    expect(a + b).toBe(3);
  });
});