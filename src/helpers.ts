/// <reference path="../typings/tsd.d.ts" />
import * as fs from 'fs';
import * as path from 'path';

//import * as doT from 'dot';
let doT = require('dot');
let Viz = require('viz.js');
let svg_to_png = require('svg-to-png');

var files = {
  legend: fs.readFileSync(path.resolve(__dirname + '/../templates/legend.def')),
  all: fs.readFileSync(path.resolve(__dirname + '/../templates/all.def')),
  modules: fs.readFileSync(path.resolve(__dirname + '/../templates/modules.def')),
  module: fs.readFileSync(path.resolve(__dirname + '/../templates/module.def')),
  component: fs.readFileSync(path.resolve(__dirname + '/../templates/component.def'))
};

var templates = {
  legendTemplate: null,
  allTemplate: null,
  modulesTemplate: null,
  moduleTemplate: null,
  componentTemplate: null
};

export function preprocessTemplates(options?) {
  // Replace placeholders.
  [
    "legend",
    "all",
    "modules",
    "module",
    "component"
  ].forEach(function(file) {
    files[file] = files[file].toString()
      .replace(/\{1\}/g, options.shapeModules)
      .replace(/\{2\}/g, options.shapeProviders)
      .replace(/\{3\}/g, options.shapeDirectives)
      .replace(/\{scheme\}/g, options.colorScheme);
  });

  // Prime the templates object.
  templates.legendTemplate = doT.template(files.legend.toString());
  templates.allTemplate = doT.template(files.all.toString());
  templates.modulesTemplate = doT.template(files.modules.toString());
  templates.moduleTemplate = doT.template(files.module.toString());
  templates.componentTemplate = doT.template(files.component.toString());

  return templates;

}

export function generateLegendGraph(templates) {
  var legendResult = templates.legendTemplate();
  
  fs.writeFileSync("./test/dot/legend.dot", legendResult);
}

export function generateAllGraph(templates, angular) {
  var allResult = templates.allTemplate({
    modules: angular.modules
  });

  fs.writeFileSync("./test/dot/all.dot", allResult);
}

export function generateModulesGraph(templates, angular) {
  var modulesResult = templates.modulesTemplate({
    modules: angular.modules
  });
  fs.writeFileSync("./test/dot/modules.dot", modulesResult);
}

export function generateModuleGraph(templates, module) {
  var moduleResult = templates.moduleTemplate(module);
  fs.writeFileSync("./test/dot/modules/" + module.name + ".dot", moduleResult);
}

export function generateComponents(templates, component) {
  var moduleResult = templates.componentTemplate(component);
  console.log(moduleResult)
  fs.writeFileSync("./test/dot/components.dot", moduleResult);
}

export function generateGraph(templates, deps) { 
  generateDot(templates, deps);
  generateSVG();
  generatePNG(); 
}

function generateDot(templates, deps) {
  
  console.log(JSON.stringify(deps, null, 1))
  
  return fs.writeFileSync("./test/dot/component.dot", 
    templates.componentTemplate({
      components: deps
    })
  );
}

function generateSVG() {
  let viz_svg = Viz(fs.readFileSync("./test/dot/component.dot").toString(), { format:"svg", engine:"dot" });
  return fs.writeFileSync("./test/dot/component.svg", viz_svg);
}

function generatePNG() {
  return svg_to_png.convert("./test/dot/component.svg", "./test/dot/").then( function(){
    console.log('>> png created');
  });
}

function getMocksDeps() {
  //console.log(JSON.stringify(deps, null, 1));
  
  return [{
    name: 'ApplicationRoot',
    file: 'application.ts',
    directives: [
      'FooCmp3',
      'FooCmp1'
    ],
    providers: []
  }, {
    name: 'FooCmp1',
    file: 'fooCmp.ts',
    directives: [
      'FooCmp2'
    ],
    providers: [{
      name: 'provider #1',
      deps: ['Service #1', 'Service #2']
    }, {
      name: 'provider #2',
      deps: ['Service #1', 'Service #3']
    }]
  }, {
    name: 'FooCmp3',
    file: 'fooCmp2.ts',
    directives: [
      'FooCmp2'
    ],
    providers: [{
      name: 'provider #6',
      deps: ['Service #5']
    }, {
      name: 'provider #7',
      deps: []
    }]
  }, {
    name: 'FooCmp2',
    file: 'fooCmp.ts',
    providers: [{
      name: 'provider #2',
      deps: ['Service #4']
    }, {
      name: 'provider #8',
      deps: ['Service #2']
    }]
  }];
}