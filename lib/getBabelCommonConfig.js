'use strict';

const argv = require('minimist')(process.argv.slice(2));

module.exports = function(modules) {
  const plugins = [
    require.resolve('babel-plugin-transform-vue-jsx'),
    require.resolve('babel-plugin-transform-es3-member-expression-literals'),
    require.resolve('babel-plugin-transform-es3-property-literals'),
    require.resolve('babel-plugin-transform-object-assign'),
  ];
  if (argv['babel-runtime']) {
    plugins.push([
      require.resolve('babel-plugin-transform-runtime'),
      {
        polyfill: false,
      },
    ]);
  }
  return {
    presets: [
      [
        require.resolve(`babel-preset-env`),
        {
          modules,
          exclude: ['transform-es2015-typeof-symbol'],
        },
      ],
    ].concat(
      ['stage-0'].map(name => {
        return require(`babel-preset-${name}`);
      })
    ),
    plugins,
  };
};
