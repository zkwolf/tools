#!/usr/bin/env node

const program = require('commander');

program.on('--help', () => {
  console.log('  Usage:'.to.bold.blue.color);
  console.log();
  console.log('    $', 'vc-tools run lint'.to.magenta.color, 'lint source within lib');
  console.log('    $', 'vc-tools run pub'.to.magenta.color, 'publish component');
  console.log('    $', 'vc-tools run server'.to.magenta.color, 'start server');
  console.log('    $', 'vc-tools run pretter'.to.magenta.color, 'pretter all code');
  console.log(
    '    $',
    'vc-tools run init-eslint'.to.magenta.color,
    'generate eslint configuration file'
  );
  console.log(
    '    $',
    'vc-tools run init-tslint'.to.magenta.color,
    'generate tslint configuration file'
  );
  console.log('    $', 'vc-tools run chrome-test'.to.magenta.color, 'run chrome tests');
  console.log();
});

program.parse(process.argv);

function runTask(toRun) {
  const gulp = require('gulp');
  const metadata = { task: toRun };
  // Gulp >= 4.0.0 (doesn't support events)
  const taskInstance = gulp.task(toRun);
  if (taskInstance === undefined) {
    gulp.emit('task_not_found', metadata);
    return;
  }
  const start = process.hrtime();
  gulp.emit('task_start', metadata);
  try {
    taskInstance.apply(gulp);
    metadata.hrDuration = process.hrtime(start);
    gulp.emit('task_stop', metadata);
    gulp.emit('stop');
  } catch (err) {
    err.hrDuration = process.hrtime(start);
    err.task = metadata.task;
    gulp.emit('task_err', err);
  }
}

const task = program.args[0];

function runTask(toRun) {
  const gulp = require('gulp');
  const metadata = { task: toRun };
  // Gulp >= 4.0.0 (doesn't support events)
  const taskInstance = gulp.task(toRun);
  if (taskInstance === undefined) {
    gulp.emit('task_not_found', metadata);
    return;
  }
  const start = process.hrtime();
  gulp.emit('task_start', metadata);
  try {
    taskInstance.apply(gulp);
    metadata.hrDuration = process.hrtime(start);
    gulp.emit('task_stop', metadata);
    gulp.emit('stop');
  } catch (err) {
    err.hrDuration = process.hrtime(start);
    err.task = metadata.task;
    gulp.emit('task_err', err);
  }
}

if (!task) {
  program.help();
} else if (task === 'server') {
  const port = process.env.npm_package_config_port || 8000;
  console.log(`Listening at http://localhost:${port}`);
  const app = require('../server/')();
  app.listen(port);
} else {
  console.log('vc-tools run', task);
  require('../gulpfile');
  runTask(task);
}
