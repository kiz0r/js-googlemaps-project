const gulp = require("gulp");
const webserver = require("gulp-webserver");

gulp.task("start", function () {
    gulp.src(".").pipe(
        webserver({
            host: "localhost",
            port: 8000,
            livereload: true,
            open: true,
        })
    );
});
