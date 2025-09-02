import { describe } from 'node:test';
import { expect, test } from 'vitest';

describe('non orphaned fake tests',  () => {
  test('this is a non orphaned fake test', () => {
    const a = 1;
    const b = 2;
    expect(a + b).toBe(3);
  });

});

test('this is a fake test', () => {
  const a = 1;
  const b = 2;
  expect(a + b).toBe(3);
});

test('this is another fake test', () => {
  const a = 1;
  const b = 2;
  expect(a + b).toBe(3);
});

describe('more non orphaned fake tests',  () => {
  test('this is another non orphaned fake test', () => {
    const a = 1;
    const b = 2;
    expect(a + b).toBe(3);
  });

});
