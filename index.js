const syntax = require('babel-plugin-syntax-dynamic-import');

module.exports = function ({ template, types: t }) {
  const buildImport = template(`
    (function() { const component = require(SOURCE); return component.default || component; })()
  `);

  return {
    inherits: syntax,

    visitor: {
      Import(path) {
        const importArguments = path.parentPath.node.arguments;
        const isString = t.isStringLiteral(importArguments[0])
                        || t.isTemplateLiteral(importArguments[0]);
        if (isString) {
          t.removeComments(importArguments[0]);
        }
        const newImport = buildImport({
          SOURCE: (isString)
            ? importArguments
            : t.templateLiteral([
              t.templateElement({ raw: '', cooked: '' }),
              t.templateElement({ raw: '', cooked: '' }, true),
            ], importArguments),
        });
        path.parentPath.parentPath.parentPath.replaceWith(newImport);
      },
    },
  };
};
