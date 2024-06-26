const gulp = require('gulp');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const deploy = require('gulp-gh-pages');
const htmlmin = require('gulp-htmlmin');
const imagemin = require('gulp-imagemin');
const inlineSource = require('gulp-inline-source');

const paths = {
	css: 'src/css/*.css',
	html: 'src/*.html',
	images: 'src/img/*',
	assets: 'src/asset/**/*',
	loose: [
		'src/CNAME',
		'src/favicon.ico'
	],
	dist: 'dist/'
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

// Minify HTML and inline
gulp.task('html', () => {
	const version = Date.now().toString(); // Generate version timestamp

	return gulp.src(paths.html)
		.pipe(inlineSource({ compress: true }))
		.pipe(htmlmin({ collapseWhitespace: true }))
		.pipe(gulp.dest(paths.dist))
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
		.pipe(gulp.dest(paths.dist + 'asset'))
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
	gulp.watch(paths.css, gulp.series('html')).on('change', browserSync.reload);
	gulp.watch(paths.images, gulp.series('images')).on('change', browserSync.reload);
});

// Default: clean dist folder, build files, start server and watch for changes
gulp.task('default', gulp.series('clean', gulp.parallel('images', 'assets', 'loose'), 'html', 'watch'));

// Build: clean dist folder, build files
gulp.task('build', gulp.series('clean', gulp.parallel('images', 'loose', 'assets'), 'html'));
