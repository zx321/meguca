var concat = require('gulp-concat'),
	debug = require('./config').DEBUG,
	deps = require('./deps'),
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	mediaURL = require('./imager/config').MEDIA_URL,
	rename = require('gulp-rename'),
	rev = require('gulp-rev'),
	source = require('gulp-sourcemaps'),
	uglify = require('gulp-uglify');

function gulper(name, files){
	// XXX: sourcempaps uselsess for mod.js atm
	var needMap = name != 'mod';
	var pretty = needMap && debug;
	// Place all sourcemaps in one directory
	gulp.task(name, function(){
		gulp.src(files, {base: './'})
			.pipe(concat(name))
			.pipe(gulpif(needMap, source.init()))
			.pipe(gulpif(!pretty, uglify()))
			.pipe(rev())
			.pipe(rename({ suffix: '.min.js'}))
			.pipe(gulpif(needMap, source.write('../maps', {
				sourceMappingURLPrefix: mediaURL
			})))
			.pipe(gulp.dest('./www/js/' + name))
			.pipe(rev.manifest(name+'.json'))
			.pipe(gulp.dest('./state'));
	});
}

(function(){
	gulper('client', deps.CLIENT_DEPS);
	gulper('vendor', deps.VENDOR_DEPS);
	gulper('mod', deps.MOD_CLIENT_DEPS);
})();
