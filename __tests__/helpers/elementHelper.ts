import { expect } from 'vitest';

export function testElement (element: Element | undefined | null, 
  tagName: string, 
  attributes: Record<string, string>,
  textContext?: string) {
  expect(element).not.toBeNull();

  expect(element?.tagName.toLocaleLowerCase()).toBe(tagName.toLowerCase());

  Object.entries(attributes).forEach(([key, value]) => {
    expect(element?.getAttribute(key), `Expected element <${tagName}> attribute "${key}" to be "${value}", but found "${element?.getAttribute(key)}"`)
      .toBe(value);
  });

  if (textContext) {
    expect(element?.textContent).toBe(textContext);
  }
}