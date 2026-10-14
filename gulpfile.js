const { src, dest, watch, series, parallel } = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const fs = require('fs');
const path = require('path');

//перевіряє та створює папку і файл, якщо їх немає
function ensureDirAndFile(dirPath, filePath, defaultContent = '') {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  if (filePath && !fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, defaultContent);
  }
}

function html() {
  ensureDirAndFile(
    path.join(__dirname, 'src'),
    path.join(__dirname, 'src', 'index.html'),
    '<!DOCTYPE html><html><head><title>Lab1</title><link rel="stylesheet" href="css/main.css"></head><body><h1>Успішний запуск Gulp!</h1><script src="js/main.min.js"></script></body></html>'
  );

  return src('src/index.html', { allowEmpty: true })
    .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

function styles() {
  ensureDirAndFile(
    path.join(__dirname, 'src', 'scss'),
    path.join(__dirname, 'src', 'scss', 'main.scss'),
    'body { font-family: sans-serif; background-color: #f4f4f9; color: #333; padding: 20px; }'
  );

  return src('src/scss/**/*.scss', { allowEmpty: true })
    .pipe(sass().on('error', sass.logError))
    .pipe(cleanCSS())
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  ensureDirAndFile(
    path.join(__dirname, 'src', 'js'),
    path.join(__dirname, 'src', 'js', 'main.js'),
    'console.log("Gulp працює!");'
  );

  return src('src/js/**/*.js', { allowEmpty: true })
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream());
}

function images() {
  ensureDirAndFile(path.join(__dirname, 'src', 'imgs'));

  return src('src/imgs/**/*', { encoding: false})
    .pipe(dest('dist/imgs'))
    .pipe(browserSync.stream());
}

function browsersync() {
  browserSync.init({
    server: { baseDir: 'dist' },
    port: 3000,
    notify: false
  });
}

function watching() {
  watch(['src/**/*.html'], html);
  watch(['src/scss/**/*.scss'], styles);
  watch(['src/js/**/*.js'], scripts);
  watch(['src/imgs/**/*'], images);
}

exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;

exports.default = parallel(html, styles, scripts, images, browsersync, watching);
exports.build = series(html, styles, scripts, images);