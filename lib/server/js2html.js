'use strict';

var fs = require('fs');
var path = require('path');
var highlightJs = require('highlight.js');
var assign = require('object-assign');
var packageUtil = require('./packageUtil');
var cwd = process.cwd();
var pkg = require(path.join(cwd, 'package.json'));
var srcPath = new RegExp('(["\']' + pkg.name + ')/src/', 'g');
var internalIp = require('internal-ip');
var request = require('koa-request');
const { resolve } = require('path');
var tplName = 'js2html';
const port = (pkg.config && pkg.config.port) || '8000';

if (fs.existsSync(path.join(cwd, 'examples/template.xtpl'))) {
  tplName = path.join(cwd, 'examples/template.xtpl');
}

function replaceSrcToLib(modName) {
  return modName.replace(srcPath, function(m, m1) {
    return m1 + '/lib/';
  });
}

function transformJsForRender(code, jsName) {
  const addr = `//${internalIp.v4.sync()}:${port}/examples/${jsName}.html`;
  return `
    <script>
        document.getElementById("qrcode").appendChild(new QRCode({text: location.protocol + '${addr}'}));
    </script>
    <div class="highlight">
      <pre><code>${highlightJs.highlightAuto(replaceSrcToLib(code)).value}</code></pre>
    </div>
`;
}

module.exports = async (ctx, next) => {
  const pathname = ctx.path;
  if (pathname.match(/\.html$/)) {
    const filePath = path.join(process.cwd(), pathname);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, {
        encoding: 'utf-8',
      }).trim();
      if (content && content !== 'placeholder') {
        await next();
        return;
      }
    }

    const jsPath = pathname.replace(/\.html$/, '.tsx');
    let jsName = path.basename(jsPath, '.tsx');
    let jsFile = path.join(process.cwd(), jsPath);
    if (!fs.existsSync(jsFile)) {
      jsFile = path.join(process.cwd(), pathname.replace(/\.html$/, '.ts'));
    }
    if (!fs.existsSync(jsFile)) {
      jsFile = path.join(process.cwd(), pathname.replace(/\.html$/, '.jsx'));
    }
    if (!fs.existsSync(jsFile)) {
      jsFile = path.join(process.cwd(), pathname.replace(/\.html$/, '.js'));
    }
    const response = await new Promise((resolve, reject) => {
      const req = request({
        url: `http://localhost:${port}/examples/${jsName}.css`,
      });
      req(function(err, res) {
        resolve(res);
      });
    });

    const hasCss = response.statusCode === 200;
    const code = fs.readFileSync(jsFile, {
      encoding: 'utf-8',
    });
    await ctx.render(
      tplName,
      assign(
        {
          name: jsName,
          hasCss,
          pkg,
          query: ctx.query,
          content: transformJsForRender(code, jsName),
        },
        packageUtil.getPackages()
      )
    );
  } else {
    await next();
  }
}
