import Config from '../Config/config';
import { Feature, InstructionTree, Page, UseCase } from './types';
import * as path from 'path';
import * as fs from 'fs';
import { parse } from '@babel/parser';
import _traverse from '@babel/traverse';
//@ts-expect-error this is a workaround for getting babel working with multiple exports
const traverse =  typeof _traverse === 'function' ? _traverse : _traverse.default;

export default class TreeBuilder {
  static build (config: Config): InstructionTree {
    const pages: Page[] = config.files.map((f: string) => {
      return {
        name: this.getPageName(f, config.testSuffixToRemove),
        features: this.getFeatures(f, config)
      };
    });

    return {
      pages: pages
    };
  }

  static getPageName (filePath: string, testSuffix: string): string {
    const parsed = path.parse(filePath).name;
    return testSuffix ? parsed.replace(new RegExp(`\\.${testSuffix}$`), '') : parsed;
  }
  
  static getFeatures (filePath: string, config: Config): Feature[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ast = parse(content, { sourceType: 'module', plugins: ['typescript'] });

    const features = [];

    traverse(ast, {
      CallExpression (path) {
        const callee = path.node.callee;
        
        if (callee.type === 'Identifier' && callee.name === (config.describeFunctionName)) {
          const featureName = path.node.arguments[0].value;
          
          const describeBody = path.node.arguments[1].body.body;
          const useCases: UseCase[] = TreeBuilder.getUseCases(describeBody, content, config);

          features.push({ name: featureName, useCases: useCases });
        } 
        
        if (callee.type === 'Identifier' && callee.name === (config.testFunctionName) && !path.findParent(p => p.isCallExpression() && p.node.callee.type === 'Identifier' && p.node.callee.name === config.describeFunctionName)) {
          const pageName = TreeBuilder.getPageName(filePath, config.testSuffixToRemove);
          
          const useCases: UseCase[] = [{
            name: path.node.arguments[0].value,
            codeExample: content.slice(path.node.arguments[1].body.start + 1,
              path.node.arguments[1].body.end - 1)
          }];

          const alreadyFeature = features.find(f => f.name === pageName);
          if (alreadyFeature) {
            alreadyFeature.useCases = [ ...alreadyFeature.useCases, ...useCases ];
            return;
          }

          features.push({ name: pageName, useCases: useCases });
        }
      }
    });

    return features;
  }

  static getUseCases (describeBody, content: string, config: Config) {
    const useCases: UseCase[] = [];

    describeBody.forEach(statement => {
      if (statement.type === 'ExpressionStatement' && 
              statement.expression.callee.name === (config.testFunctionName)) {
        const testNode = statement.expression;

        useCases.push({
          name: testNode.arguments[0].value,
          codeExample: content.slice(testNode.arguments[1].body.start + 1, testNode.arguments[1].body.end - 1)
        });
      }
    });

    return useCases;
  }
}

