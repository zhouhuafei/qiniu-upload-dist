import gulp from 'gulp'
import babel from 'gulp-babel'
import changed from 'gulp-changed'
import babelConfig from './babel.config'

const src = './src'
const dist = './dist'
const isProduction = process.env.NODE_ENV === 'production'

function ts2js () {
  return gulp.src(`${src}/**/*.ts`)
    .pipe(changed(dist, { extension: '.js' }))
    .pipe(babel(babelConfig))
    .pipe(gulp.dest(dist))
}

function watcher () {
  gulp.watch(`${src}/**/*.ts`, gulp.series(ts2js))
}

const series: Array<gulp.TaskFunction> = [ts2js]
if (!isProduction) {
  series.push(watcher)
}
export default gulp.series(...series)
