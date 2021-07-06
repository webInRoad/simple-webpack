const fs = require('fs');
const path = require('path');
const { getAST, getDependencies, transform } = require('./parser');

module.exports = class Compiler {
  constructor(options) {
    const { entry, output } = options;
    this.entry = entry;
    this.output = output;
    this.modules = [];
  }

  run() {
    const entryModule = this.buildModule(this.entry, true);
    this.modules.push(entryModule);
    this.modules.map((_module) => {
      _module.dependencies.map((dependency) => {
        this.modules.push(this.buildModule(dependency));
      });
    });
    this.emitFiles();
  }

  // 模块构建
  buildModule(filename, isEntry) {
    let ast;
    if (isEntry) {
      ast = getAST(filename);
    } else {
      let absolutePath = path.join(path.dirname(this.entry), filename);
      ast = getAST(absolutePath);
    }

    return {
      filename,
      dependencies: getDependencies(ast),
      transformCode: transform(ast),
    };
  }

  // 输出文件
  emitFiles() {
    const outputPath = path.join(this.output.path, this.output.filename);
    let modules = '';
    this.modules.map((_module) => {
      modules += `'${_module.filename}': function (require, exports) { ${_module.transformCode} },`;
    });
    console.info(modules, 'modules');
    const bundle = `
            (function(modules) {
                function require(fileName) {
                    const fn = modules[fileName];
        
                    const exports = {};
        
                    fn(require, exports);
                    console.info(32323)
                    return exports;
                }

                require('${this.entry}');
            })({${modules}})
        `;

    fs.writeFileSync(outputPath, bundle, 'utf-8');
  }
};
