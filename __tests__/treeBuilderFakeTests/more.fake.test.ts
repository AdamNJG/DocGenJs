import { describe, test, expect } from 'vitest';

describe('this is a fake description', () => {
  test('this is a fake test', () => {
    const a = 1;
    const b = 2;
    expect(a + b).toBe(3);
  });
});

describe('this is another fake description', () => {
  test('this is a fake test in another fake description', () => {
    const a = 1;
    const b = 2;
    expect(a + b).toBe(3);
  });

  test('this is another fake test in another fake description', () => {
    const a = 1;
    const b = 2;
    expect(a + b).toBe(3);
  });

  /*
    for mutation catching and ensuring that random function calls and expressions dont break things
  */ 

  const shouldBeIgnored = 42; 

  notTest(shouldBeIgnored); 
});

const fake = {
  describe: (description: string) => {
    console.log(description);
  }
};

fake.describe('this should not be a test'/* This should NOT be counted as a test*/);

function notTest (input: number) :void {
  console.log(input);
}
