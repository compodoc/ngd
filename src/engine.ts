/// <reference path="../typings/tsd.d.ts" />

import * as fs from 'fs';
import * as path from 'path';

module Ng2Graph.Core {
  
  let q = require('q');
  let doT = require('dot');
  let Viz = require('viz.js');
  let svg_to_png = require('svg-to-png');
  
  export class Engine {
    
    files = {
      component: fs.readFileSync(path.resolve(__dirname + '/../templates/component.def'))
    };
    
    templates = {
      legendTemplate: null,
      allTemplate: null,
      modulesTemplate: null,
      moduleTemplate: null,
      componentTemplate: null
    };
    
    constructor() {
      
    }
    
    preprocessTemplates(options?) {
      // Replace placeholders.
      ['component'].forEach((file) => {
        this.files[file] = this.files[file].toString()
          .replace(/\{1\}/g, options.shapeModules)
          .replace(/\{2\}/g, options.shapeProviders)
          .replace(/\{3\}/g, options.shapeDirectives)
          .replace(/\{scheme\}/g, options.colorScheme);
      });
    
      this.templates.componentTemplate = doT.template(this.files.component.toString());
      return this.templates;
    }
    
    generateGraph(deps) {
      let templates = this.preprocessTemplates({
        shapeModules: 'component',
        shapeProviders: 'ellipse',
        shapeDirectives: 'cds',
        colorScheme: 'paired12'
      });
      
      this.generateDot(this.templates, deps)
        .then( _ => this.generateSVG() )
        .then( _ => this.generatePNG() ); 
    }
    
    generateDot(templates, deps) {
      return q.denodeify(fs.writeFileSync('./test/dot/component.dot', 
        templates.componentTemplate({
          components: deps
        })
      ));
    }
    
    generateSVG() {
      let viz_svg = Viz(fs.readFileSync('./test/dot/component.dot').toString(), { format:'svg', engine:'dot' });
      return q.denodeify(fs.writeFileSync('./test/dot/component.svg', viz_svg));
    }
    
    generatePNG() {
      return svg_to_png.convert('./test/dot/component.svg', './test/dot/').then( function(){
        console.log('>> png created');
      });
    }

    
  }
}