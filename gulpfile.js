const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const cleanCSS = require('gulp-clean-css');
const deploy = require('gulp-gh-pages');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const rename = require('gulp-rename');
const replace = require('gulp-replace');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

const paths = {
	html: 'src/*.html',
	css: 'src/css/*.css',
	js: 'src/js/*.js',
	images: 'src/img/*',
	assets: 'src/assets/*',
	loose: [
		'src/CNAME',
		'src/favicon.ico'
	],
	dist: 'dist/'
};

const getCacheTimestamp = () => {
	return `${Date.now()}`;
};

// Clean dist
gulp.task('clean', () => {
	return gulp.src(paths.dist, {allowEmpty: true, read: false})
		.pipe(clean());
});

// Deploy to gh-pages
gulp.task('deploy', () => {
	return gulp.src("./dist/**/*")
		.pipe(deploy())
});

// Minify HTML
gulp.task('html', () => {
	const version = getCacheTimestamp();
    return gulp.src(paths.html)
		.pipe(replace(/\.css"/g, `.min.css?v=${version}"`))
		.pipe(replace(/\.js"/g, `.min.js?v=${version}"`))
        .pipe(htmlmin({ collapseWhitespace: true }))
        .pipe(gulp.dest(paths.dist))
        .pipe(browserSync.stream())
});

// Minify CSS
gulp.task('css', () => {
	return gulp.src(paths.css)
		.pipe(sourcemaps.init())
		.pipe(cleanCSS())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.dist + 'css'))
		.pipe(browserSync.stream())
});

// Minify JavaScript
gulp.task('js', () => {
	return gulp.src(paths.js)
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(rename({ suffix: '.min' }))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.dist + 'js'))
		.pipe(browserSync.stream());
});

// Crunch images
gulp.task('images', () => {
	return gulp.src(paths.images)
		.pipe(imagemin())
		.pipe(gulp.dest(paths.dist + 'img'))
		.pipe(browserSync.stream())
});

// Handle loose files
gulp.task('loose', () => {
	return gulp.src(paths.loose)
		.pipe(gulp.dest(paths.dist));
});

// Handle downloadable assets
gulp.task('assets', () => {
	return gulp.src(paths.assets)
		.pipe(gulp.dest(paths.dist + 'assets'))
		.pipe(browserSync.stream())
});

// Watch for changes and live reload browser
gulp.task('watch', () => {
	browserSync.init({
		server: './dist/',
		port: 8080,
		reloadDebounce: 100,	// add a debounce time to prevent multiple reloads,
		reloadDelay: 100		// small delay to ensure everything is properly updated
	});
	gulp.watch(paths.html, gulp.series('html')).on('change', browserSync.reload);
    gulp.watch(paths.css, gulp.series('css')).on('change', browserSync.reload);
    gulp.watch(paths.js, gulp.series('js')).on('change', browserSync.reload);
    gulp.watch(paths.images, gulp.series('images')).on('change', browserSync.reload);
});

// Default: clean dist folder, build files, start server and watch for changes
gulp.task('default', gulp.series('clean', gulp.parallel('html', 'css', 'js', 'images', 'assets', 'loose'), 'watch'));

// Build: clean dist folder, build files
gulp.task('build', gulp.series('clean', gulp.parallel('html', 'css', 'js', 'images', 'loose', 'assets')));
