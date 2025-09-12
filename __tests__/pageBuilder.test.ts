import { describe, test, expect } from 'vitest';
import { Page } from '../src/TreeBuilder/types';
import { defineComponents } from './helpers/componentHelper';
import { testElement } from './helpers/elementHelper';

import PageBuilder from '../src/WebBuilder/PageBuilder/pageBuilder';
import PageNav from '../src/WebBuilder/Components/pageNav';

describe('web builder', () => {
  defineComponents();

  test('pageBuilder is passed no pages, so no results', () => {
    const pageResult = PageBuilder.buildPages({ pages: [] }, '', './Templates');

    expect(Object.keys(pageResult)).toHaveLength(0);
  });

  test('page component does render if page with no features is set', () => {
    const page: Page = {
      name: 'Test Page',
      features: []
    };

    const htmlPages = PageBuilder.buildPages({ pages: [page] }, '', './Templates');
    expect(Object.keys(htmlPages)).toHaveLength(1);
    const doc = buildDocumentFromHtml(htmlPages[page.name]);

    const article = doc.querySelector('.module-component');
    testElement(article, 'article', { role: 'region', 'aria-labelledby': 'module-title' });

    const moduleTitle = article?.querySelector(`#module-title`);
    testElement(moduleTitle, 'h1', {}, page.name);

    const featuresSection = article?.querySelector('.features');
    testElement(featuresSection, 'section', { 'aria-label': 'Features' });

    const featureList = featuresSection?.querySelector('ul');
    testElement(featureList, 'ul', {});
    
    const noFeatures = featureList?.querySelector('.no-features');
    testElement(noFeatures, 'li', {}, 'No features yet');
  });

  test('page has nav element and data', () => {
    const page: Page = {
      name: 'Test Page',
      features: []
    };

    const navPages: Page[] = [
      page,
      { name: 'fake.test', features: [] },
      { name: 'more.fake.test', features: [] },
      { name: 'no.describe.fake.test', features: [] }
    ];

    const navComponent = new PageNav();
    navComponent.setup(navPages.map(p => p.name));

    const htmlPages = PageBuilder.buildPages({ pages: [page] }, navComponent.innerHTML, './Templates');
    expect(Object.keys(htmlPages)).toHaveLength(1);
    const doc = buildDocumentFromHtml(htmlPages[page.name]);

    expect(doc).not.toBeUndefined();
    const nav = doc.querySelector('.pages-nav');
    testElement(nav, 'nav', { 'aria-label': 'Pages navigation' });

    const ul = nav?.querySelector('ul');
    expect(ul).not.toBe(null);

    const links = Array.from(ul?.querySelectorAll('li > a') || []);

    expect(links[0].getAttribute('href')).toBe('./index.html');
    expect(links[0].textContent?.trim()).toBe('index');

    navPages.forEach(page => {
      const link = Array.from(ul?.querySelectorAll('li > a') || [])
        .find(a => a.getAttribute('href') === `./${page.name}.html`);

      expect(link).not.toBe(null);
      expect(link?.textContent?.trim()).toBe(page.name);
      const tabIndex = link?.getAttribute('tabindex');
      expect(tabIndex === null || Number(tabIndex) >= 0).toBe(true);
    });
  });

  test('page component renders features with no use cases', () => {
    const page: Page = {
      name: 'Test Page',
      features: [{
        name: 'Feature1',
        useCases: []
      }]
    };

    const htmlPages = PageBuilder.buildPages({ pages: [page] }, '', './Templates');
    expect(Object.keys(htmlPages)).toHaveLength(1);
    const doc = buildDocumentFromHtml(htmlPages[page.name]);

    const featuresSection = doc.querySelector('.features');
    testElement(featuresSection, 'section', { 'aria-label': 'Features' });

    const featureListItems = featuresSection?.querySelectorAll('ul li.feature-container') || [];
    expect(featureListItems).toHaveLength(1);

    const firstFeatureLi = featureListItems[0];
    expect(firstFeatureLi.getAttribute('id')).toBe('feature-1');

    const firstFeature = firstFeatureLi.querySelector('.feature-component')!;;
    testElement(firstFeature, 'article', { role: 'region', 'aria-labelledby': 'feature-1-title' });

    const featureTitle = firstFeature.querySelector('#feature-1-title');
    testElement(featureTitle, 'h2', {}, 'Feature1');

    const useCases = firstFeature.querySelector('.use-cases');
    testElement(useCases, 'ul', { 'aria-label': 'Use Cases' });

    const noUseCases = useCases?.querySelector('.no-use-cases');
    testElement(noUseCases, 'li', {}, 'No use cases yet');
  });

  test('page component with features and usecases renders', () => {
    const page: Page = {
      name: 'Test Page',
      features: [{
        name: 'Feature1',
        useCases: [{
          name: 'Use case 1',
          codeExample: `function greet(name) {
  return 'Hello, ' + name + '!';
}

console.log(greet('World'));`
        }]
      }]
    };

    const htmlPages = PageBuilder.buildPages({ pages: [page] }, '', './Templates');
    expect(Object.keys(htmlPages)).toHaveLength(1);
    const doc = buildDocumentFromHtml(htmlPages[page.name]);

    const featuresSection = doc.querySelector('.features');
    testElement(featuresSection, 'section', { 'aria-label': 'Features' });

    const featureArticles = featuresSection?.querySelectorAll('.feature-component') || [];
    expect(featureArticles).toHaveLength(1);

    const firstFeature = featureArticles[0];

    const useCaseList = firstFeature.querySelector('.use-cases');
    testElement(useCaseList, 'ul', { 'aria-label': 'Use Cases' });

    const useCases = useCaseList?.querySelectorAll('.use-case') || [];
    expect(useCases).toHaveLength(1);
    
    const useCase = useCases[0];
    testElement(useCase, 'li', { 'aria-labeledby': 'usecase-1-title' });

    const useCaseTitle = useCase.querySelector('#usecase-1-title');
    testElement(useCaseTitle, 'h3', {}, 'Use case 1');

    const useCasePre = useCase.querySelector('pre');
    testElement(useCasePre, 'pre', {});

    const useCaseCode = useCase.querySelector('.code-block');
    testElement(useCaseCode, 'pre', {}, page.features[0].useCases[0].codeExample);
  });
});

function buildDocumentFromHtml (html: string): Document {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}