import { Symbol } from './compiler';
import { HtmlParser, getHtmlTagDefinition } from '@angular/compiler';
import * as html from '@angular/compiler';

export class TemplateCompiler {

  static getTemplateAst(htmlTemplate: string): Symbol[] {
    const parser = new HtmlParser();
    const ast = parser.parse(htmlTemplate, '');
    return jsonifyNodes(ast.rootNodes);
  }

}

class JsonVisitor implements html.Visitor {
  visitElement(element: html.Element, context: any): Symbol {
    let metadata: Symbol = {
        selector: element.name,
        name: element.name
    };

    if (element.attrs.length > 0) {
      const {name, value} = this._visitAll(element.attrs)
      metadata.attrs = element.attrs.map( attr => {
        return {
          name: attr.name,
          value: attr.value
        }
      });
    }
    if (getHtmlTagDefinition(element.name).isVoid) {
      return metadata;
    }
    if (element.children.length > 0) {
      const ast = this._visitAll(element.children);
      if (ast) {
        metadata.declarations = ast;
      }
    }
    return metadata;
  }
  visitAttribute(attribute: html.Attribute, context: any): any {}
  visitText(text: html.Text, context: any): any {}
  visitComment(comment: html.Comment, context: any): any {}
  visitExpansion(expansion: html.Expansion, context: any): any {}
  visitExpansionCase(expansionCase: html.ExpansionCase, context: any): any {}

  private _visitAll(nodes: html.Node[]): any {
    if (nodes.length == 0) {
      return [];
    }
    return nodes.map(a => a.visit(this, null));
  }
}

const jsonVisitor = new JsonVisitor();

function jsonifyNodes(nodes: html.Node[]): Symbol[] {
  return nodes.map(node => node.visit(jsonVisitor, null));
}