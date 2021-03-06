#!/usr/bin/env node

require('colorful').colorful();

const program = require('commander');

program.on('--help', () => {
  console.log('  Usage:'.to.bold.blue.color);
  console.log();
  console.log('    $', 'vc-tools run lint'.to.magenta.color, 'lint source within lib');
  console.log('    $', 'vc-tools run pub'.to.magenta.color, 'publish component');
  console.log('    $', 'vc-tools run server'.to.magenta.color, 'start server');
  console.log('    $', 'vc-tools run chrome-test'.to.magenta.color, 'run chrome tests');
  console.log();
});

program.parse(process.argv);

const task = program.args[0];

if (!task) {
  program.help();
} else if (task === 'server') {
  const port = process.env.npm_package_config_port || 8000;
  console.log(`Listening at http://localhost:${port}`);
  const app = require('../server/')();
  app.listen(port);
} else {
  console.log('vc-tools run', task);
  const gulp = require('gulp');
  require('../gulpfile');
  gulp.start(task);
}
