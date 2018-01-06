var gulp = require('gulp');
var cssmin = require('gulp-minify-css');
var cssver = require('gulp-make-css-url-version');
var htmlmin = require('gulp-htmlmin');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-tinypng');
var concat = require('gulp-concat');
var px2rem = require('gulp-px2rem');
var autoprefixer = require('gulp-autoprefixer');
var cssimport = require('gulp-cssimport');
var htmlreplace = require('gulp-html-replace');
var clean = require('gulp-clean');


gulp.task('Cssmin',function () {
    return gulp.src(['css/base.css','css/landscape.css','css/portrait.css'])
    	.pipe(concat('app.css'))
//      .pipe(cssimport())
//      .pipe(px2rem({replace: true, mediaQuery: false, rootValue: 20, unitPrecision: 2, minPx: 2}, {map: true}))
        .pipe(autoprefixer())
        .pipe(cssver())
        .pipe(cssmin({
            advanced: true,//类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
            compatibility: '',//保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
            keepBreaks: false,//类型：Boolean 默认：false [是否保留换行]
            keepSpecialComments: '*'
            //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        }))
        .pipe(gulp.dest('dist/css'));
});

gulp.task('Jsmin', function () {
    gulp.src(['js/app.js', 'js/index.js', 'js/slider.js'])
        .pipe(concat('main.js'))    //合并所有js到main.js
        .pipe(uglify())    //压缩
        .pipe(gulp.dest('dist/js'))
});

gulp.task('Imagemin', function () {
    gulp.src('img/*.png')
        .pipe(imagemin('VrDG6RxAdOa1vrzhcOrmLjaBHcsvoEJ1'))//API_KEY
        .pipe(gulp.dest('dist/img'));
});

gulp.task('Htmlmin', function () {
    var options = {
        removeComments: true,  //清除HTML注释
        collapseWhitespace: true,  //压缩HTML
        collapseBooleanAttributes: true,  //省略布尔属性的值 <input checked="true"/> ==> <input checked />
        removeEmptyAttributes: false,  //删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,  //删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,  //删除<style>和<link>的type="text/css"
        minifyJS: true,  //压缩页面JS
        minifyCSS: true  //压缩页面CSS
    };
    gulp.src("index.html")
        .pipe(htmlreplace({
            js: {
                src: new Date().getTime(),
                tpl: '<script src="js/main.js?v=%s"></script>'
            },
            css: {
                src: new Date().getTime(),
                tpl: '<link rel="stylesheet" href="css/app.css?v=%s">'
            }
        }, {
            keepUnassigned: false,
            keepBlockTags: false,
            resolvePaths: false
        }))
        .pipe(htmlmin(options))
        .pipe(gulp.dest('dist'));
});
// 清理dist
gulp.task('clean', function() {
  gulp.src(['dist'], {read: false})
    .pipe(clean());
});
// 项目打包
gulp.task('build',['Cssmin','Jsmin','Imagemin','Htmlmin']);
