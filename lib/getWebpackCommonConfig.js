'use strict';

const path = require('path');
const fs = require('fs');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const assign = require('object-assign');
const resolveCwd = require('./resolveCwd');
const getBabelCommonConfig = require('./getBabelCommonConfig');
const getTSCommonConfig = require('./getTSCommonConfig');
const constants = require('./constants');
const replaceLib = require('./replaceLib');

const tsConfig = getTSCommonConfig();
const pkg = require(resolveCwd('package.json'));
const cwd = process.cwd();

function getResolve() {
  const alias = {};
  const resolve = {
    modules: [cwd, 'node_modules'],
    extensions: ['.web.ts', '.web.tsx', '.web.js', '.web.jsx', '.ts', '.tsx', '.js', '.jsx'],
    alias,
  };
  const { name } = pkg;
  const entrys = Object.values(pkg.config.entry);
  const firstEntry = entrys[0];

  // https://github.com/react-component/react-component.github.io/issues/13
  // just for compatibility， we hope to delete /index.js. just use /src/index.js as all entry

  const existEntirys = firstEntry
    .map(entry => {
      const pkgSrcMain = resolveCwd(entry);
      return fs.existsSync(pkgSrcMain) ? pkgSrcMain : undefined;
    })
    .filter(entry => entry);

  if (existEntirys.length <= 0) {
    console.error('Get config.entry error: no /index.[js|ts] or /src/index.[js|ts] exist !!');
    return;
  }
  const pkgSrcMain = existEntirys[0];

  // resolve import { foo } from '@ant-design-vue/xxx'
  // to '@ant-design-vue/xxx/index.js' or '@ant-design-vue/xxx/src/index.js'
  alias[`${name}$`] = pkgSrcMain;

  // resolve import foo from '@ant-design-vue/xxx/lib/foo' to '@ant-design-vue/xxx/src/foo.js'
  alias[`${name}/lib`] = resolveCwd('./src');
  alias[`${name}/${constants.tsCompiledDir}`] = cwd;

  alias[name] = cwd;
  return resolve;
}

function getOptions(obj) {
  return (obj && obj.options) || {};
}

const postcssLoader = {
  loader: 'postcss-loader',
  options: { plugins: require('./postcssConfig') },
};

module.exports = {
  getResolve,
  getResolveLoader() {
    return {
      modules: [
        path.resolve(__dirname, '../node_modules'),
        // npm3 flat module
        path.resolve(__dirname, '../../'),
        // npm @organization/module
        path.resolve(cwd, './node_modules'),
      ],
    };
  },
  getLoaders(c) {
    const commonjs = c || false;
    const babelConfig = getBabelCommonConfig(commonjs);
    if (commonjs === false) {
      babelConfig.plugins.push(replaceLib);
    }
    const babelLoader = {
      loader: 'babel-loader',
      options: babelConfig,
    };
    return [
      assign(
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
        },
        babelLoader
      ),
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          babelLoader,
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              configFile: getTSCommonConfig.getConfigFilePath(),
              compilerOptions: tsConfig,
            },
          },
        ],
      },
      // Needed for the css-loader when [bootstrap-webpack](https://github.com/bline/bootstrap-webpack)
      // loads bootstrap's css.
      {
        test: /\.woff2?(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          minetype: 'application/font-woff',
        },
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          minetype: 'application/octet-stream',
        },
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
      },
      {
        test: /\.(png|jpg|jpeg|webp)$/i,
        loader: 'file-loader',
      },
    ];
  },
  getCssLoaders(extractCss) {
    // package.config.css config
    const {
      config: { css = {} },
    } = pkg;
    const {
      loaderOptions = {
        css: {},
        less: {},
      },
    } = css;

    let cssLoader = [
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
          sourceMap: true,
          ...getOptions(loaderOptions.css),
        },
      },
      postcssLoader,
    ];
    let lessLoader = cssLoader.concat([
      {
        loader: 'less-loader',
        options: {
          lessOptions: {
            sourceMap: true,
            ...getOptions(loaderOptions.less),
          },
        },
      },
    ]);
    if (extractCss) {
      cssLoader = [MiniCssExtractPlugin.loader].concat(cssLoader);
      lessLoader = [MiniCssExtractPlugin.loader].concat(lessLoader);
    } else {
      const styleLoader = {
        loader: 'style-loader',
      };
      cssLoader.unshift(styleLoader);
      lessLoader.unshift(styleLoader);
    }
    return [
      {
        test: /\.css$/,
        use: cssLoader,
      },
      {
        test: /\.less$/,
        use: lessLoader,
      },
    ];
  },
};
