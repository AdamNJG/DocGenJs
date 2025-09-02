#!/usr/bin/env node

import { JSDOM } from 'jsdom';
import type { TestConfig } from './Config/types.js';

startDom();

main();

async function main () {
  const { default: PageNav } = await import('./WebBuilder/Components/index/pageNav.js');
  const { default: FeatureComponent } = await import('./WebBuilder/Components/pages/feature.js');
  const { default: ModuleComponent } = await import('./WebBuilder/Components/pages/module.js');
  const { default: UseCaseComponent } = await import('./WebBuilder/Components/pages/useCase.js');
  const { default: SiteBuilder } = await import('./WebBuilder/SiteBuilder/siteBuilder.js');

  const config: TestConfig = {
    includes: ['__tests__'],
    describeFunctionNameOverride: 'describe',
    testFunctionNameOverride: 'test'
  };

  declareComponents({ 'page-nav': PageNav, 'feature-component': FeatureComponent, 'module-component' : ModuleComponent, 'use-case-component': UseCaseComponent });

  const siteBuilder = new SiteBuilder(config);
  siteBuilder.buildSite();
}

function startDom () { 

  const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');

  globalThis.window = dom.window as any;
  globalThis.document = dom.window.document;
  globalThis.HTMLElement = dom.window.HTMLElement;
  globalThis.Node = dom.window.Node;
  globalThis.Element = dom.window.Element;
  globalThis.CustomEvent = dom.window.CustomEvent;
  globalThis.Event = dom.window.Event;
  globalThis.customElements = dom.window.customElements;
}

function declareComponents (components: Record<string, CustomElementConstructor>) {
  Object.entries(components).forEach(([key, value]) => {
    customElements.define(key, value);
  });
}