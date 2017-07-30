'use strict';

import gulp from 'gulp';

import plumber from 'gulp-plumber';
import livereload from 'gulp-livereload';
import gulpif from 'gulp-if';
import rename from 'gulp-rename';

import twig from 'gulp-twig';
import htmlmin from 'gulp-htmlmin';
import prettify from 'gulp-html-prettify';

import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import uglifycss from 'gulp-uglifycss';

import babelify from 'babelify';
import bro from 'gulp-bro';
import uglifyify from 'uglifyify';


let env = 'dev';

const rootPath = 'web/';
const assetsPath = rootPath + 'assets/';

const paths = {
    watch: {
        twig: [
            'src/views/**/*.twig'
        ],
        js: [
            'src/js/**/*.js',
            '!src/js/copy/**/*'
        ],
        sass: [
            'src/scss/**/*.scss'
        ]
    },
    copy: {
        js: [
            'src/js/copy/**/*'
        ],
        img: [
            'src/img/**/*'
        ],
        videos: [
            'src/videos/**/'
        ],
        fonts: [
            'src/fonts/**/'
        ]
    },
    build: {
        twig: [
            'src/views/pages/**/*.twig'
        ],
        sass: [
            'src/scss/**/*.scss'
        ]
    }
};

gulp.task('set-dev', function() {
    env = 'dev';
});

gulp.task('set-prod', function() {
    env = 'prod';
});

gulp.task('build-html', function () {
    'use strict';
    return gulp.src(paths.build.twig)
        .pipe(plumber())
        .pipe(twig({
            data: {
                environment: env
            }
        }))
        .pipe(gulpif(env === 'dev',
            htmlmin({collapseWhitespace: true, preserveLineBreaks: true}),
            htmlmin({collapseWhitespace: true})
        ))
        .pipe(gulpif(env === 'dev', prettify({indent_char: ' ', indent_size: 4})))
        .pipe(gulp.dest(rootPath));
});

gulp.task('build-js', function () {
    return gulp.src('./src/js/index.js')
        .pipe(gulpif(env === 'dev',
            bro({
                transform: [
                    babelify.configure({ presets: ['es2015'] })
                ]
            }),
            bro({
                transform: [
                    babelify.configure({ presets: ['es2015'] }),
                    [ 'uglifyify', { global: true } ]
                ]
            })
        ))
        .pipe(plumber())
        .pipe(gulpif(env === 'prod', rename('app.min.js'), rename('app.js')))
        .pipe(gulp.dest(assetsPath + 'js/'))
    ;
});


gulp.task('build-css', function() {
    return gulp.src(paths.build.sass)
        .pipe(plumber())
        .pipe(gulpif(env === 'dev', sourcemaps.init()))
        .pipe(sass())
        .pipe(gulpif(env === 'dev', sourcemaps.write('.')))
        .pipe(gulpif(env === 'prod', uglifycss()))
        .pipe(gulpif(env === 'prod', rename('style.min.css'), rename('style.css')))
        .pipe(gulp.dest(assetsPath + 'css/'))
    ;
});

gulp.task('copy-js', function () {
    return gulp.src(paths.copy.js)
        .pipe(gulp.dest(assetsPath + 'js/'));
});

gulp.task('copy-img', function() {
    return gulp.src(paths.copy.img)
        .pipe(gulp.dest(assetsPath + 'img/'));
});

gulp.task('copy-videos', function() {
    return gulp.src(paths.copy.videos)
        .pipe(gulp.dest(assetsPath + 'videos/'));
});

gulp.task('copy-fonts', function() {
    return gulp.src(paths.copy.fonts)
        .pipe(gulp.dest(assetsPath + 'fonts/'));
});



gulp.task('files-watch', function() {
    livereload.listen();

    gulp.watch(paths.watch.twig, ['build-html']);
    gulp.watch(paths.watch.sass, ['build-css']);
    gulp.watch(paths.watch.js, ['build-js']);
    gulp.watch(paths.copy.js, ['copy-js']);
    gulp.watch(paths.copy.img, ['copy-img']);
    gulp.watch(paths.copy.videos, ['copy-videos']);
    gulp.watch(paths.copy.fonts, ['copy-fonts']);
});

gulp.task('default', ['copy', 'build']);
gulp.task('build', ['build-html', 'build-css', 'build-js']);
gulp.task('copy', ['copy-js', 'copy-img', 'copy-videos', 'copy-fonts']);
gulp.task('watch', ['set-dev', 'default', 'files-watch']);
gulp.task('deploy-dev', ['set-dev', 'default']);
gulp.task('deploy-prod', ['set-prod', 'default']);