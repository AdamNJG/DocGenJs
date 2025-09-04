#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import runSiteBuilder from './Cli/runSiteBuilder';

async function main () {
  await startDom();

  runSiteBuilder();
}

main();

async function startDom () { 
  const { default: PageNav } = await import('./WebBuilder/Components/index/pageNav.js');
  const { default: FeatureComponent } = await import('./WebBuilder/Components/pages/feature.js');
  const { default: ModuleComponent } = await import('./WebBuilder/Components/pages/module.js');
  const { default: UseCaseComponent } = await import('./WebBuilder/Components/pages/useCase.js');

  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

  globalThis.window = dom.window as any;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.Element = dom.window.Element;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.Event = dom.window.Event;
  globalThis.customElements = dom.window.customElements;

  declareComponents({ 'page-nav': PageNav, 'feature-component': FeatureComponent, 'module-component' : ModuleComponent, 'use-case-component': UseCaseComponent });
}

function declareComponents (components: Record<string, CustomElementConstructor>) {
  Object.entries(components).forEach(([key, value]) => {
    customElements.define(key, value);
  });
}