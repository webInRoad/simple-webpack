const fs = require('fs');
const babylon = require('babylon');
const traverse = require('babel-traverse').default;
const { transformFromAst } = require('babel-core');

module.exports = {
  // 根据代码生成 AST (抽象语法树)
  getAST: (path) => {
    const content = fs.readFileSync(path, 'utf-8');

    return babylon.parse(content, {
      sourceType: 'module',
    });
  },
  // 分析依赖
  getDependencies: (ast) => {
    const dependencies = [];
    traverse(ast, {
      ImportDeclaration: ({ node }) => {
        dependencies.push(node.source.value);
      },
    });
    return dependencies;
  },
  // 将 ast 转换成 es5 代码
  transform: (ast) => {
    const { code } = transformFromAst(ast, null, {
      presets: ['env'],
    });

    return code;
  },
};
