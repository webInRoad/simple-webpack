const { getAST, getDependencies, transform } = require('./parser');
const path = require('path');
const ast = getAST(path.join(__dirname, '../src/index.js'));
// console.info(ast);
const dependencies = getDependencies(ast);
// console.info(dependencies);
const source = transform(ast);
console.info(source);
