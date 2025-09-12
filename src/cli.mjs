#!/usr/bin/env node
import { JSDOM } from 'jsdom';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function main () {
  await startDom();
 
  const runSiteBuilder = require('./Cli/runSiteBuilder.cjs');
  await runSiteBuilder.default();
}

async function startDom () {
  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.Element = dom.window.Element;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.Event = dom.window.Event;
  globalThis.customElements = dom.window.customElements;
}

main();