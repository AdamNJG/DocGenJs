import Config from '../Config/config';
import { Feature, InstructionTree, Page, UseCase } from './types';
import * as path from 'path';
import * as fs from 'fs';
import { parse } from '@babel/parser';
import * as t from '@babel/types';
import _traverse, { NodePath } from '@babel/traverse';
//@ts-expect-error this is a workaround for getting babel working with multiple exports
const traverse =  typeof _traverse === 'function' ? _traverse : _traverse.default;

export default class TreeBuilder {
  static build (config: Config): InstructionTree {
    const pages: Page[] = config.files.map((f: string) => {
      return {
        name: this.getPageName(f, config.testSuffixToRemove ?? ''),
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

    const features: Feature[] = [];

    traverse(ast, {
      CallExpression (path: NodePath<t.CallExpression>) {
        const callee = path.node.callee;
        
        if (t.isIdentifier(callee) && callee.name === (config.describeFunctionName)) {
          const args = path.node.arguments;
          if (t.isStringLiteral(args[0])) {
            const featureName = args[0].value;

            if (t.isFunctionExpression(args[1]) || t.isArrowFunctionExpression(args[1])) {
              const describeBody = t.isBlockStatement(args[1].body) ? args[1].body.body : '';
              const useCases: UseCase[] = TreeBuilder.getUseCases(describeBody, content, config);

              features.push({ name: featureName, useCases: useCases });
            }
          }
        } 
        
        if (t.isIdentifier(callee) && callee.name === (config.testFunctionName) && !path.findParent(p => p.isCallExpression() && p.node.callee.type === 'Identifier' && p.node.callee.name === config.describeFunctionName)) {
          const pageName = TreeBuilder.getPageName(filePath, config.testSuffixToRemove ?? '');
          const args = path.node.arguments;

          if (args.length >= 2 && t.isStringLiteral(args[0]) && (t.isFunctionExpression(args[1]) || t.isArrowFunctionExpression(args[1])) && t.isBlockStatement(args[1].body) && (args[1].body.start && args[1].body.end)) {
            const useCases: UseCase[] = [{
              name: args[0].value,
              codeExample: content.slice(args[1].body.start + 1,
                args[1].body.end - 1)
            }];

            const alreadyFeature = features.find(f => f.name === pageName);
            if (alreadyFeature) {
              alreadyFeature.useCases = [ ...alreadyFeature.useCases, ...useCases ];
              return;
            }

            features.push({ name: pageName, useCases: useCases });
          }
        }
      }
    });

    return features;
  }

  static getUseCases (describeBody: '' | t.Statement[], content: string, config: Config) {
    const useCases: UseCase[] = [];

    if (describeBody === '') return useCases;
    
    describeBody.forEach(statement => {    
      if (t.isExpressionStatement(statement) && 
        t.isCallExpression(statement.expression) &&
        t.isIdentifier(statement.expression.callee) &&
        statement.expression.callee.name === config.testFunctionName) {
        const args = statement.expression.arguments;

        if (args.length >= 2 && 
          t.isStringLiteral(args[0]) &&
          (t.isFunctionExpression(args[1]) || t.isArrowFunctionExpression(args[1])) 
          && t.isBlockStatement(args[1].body) && 
          (args[1].body.start && args[1].body.end)) {
          useCases.push({
            name: args[0].value,
            codeExample: content.slice(args[1].body.start + 1, args[1].body.end - 1)
          });
        }
      }
    });

    return useCases;
  }
}

