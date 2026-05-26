var postcss = require("postcss");
var cssnext = require("postcss-cssnext");
var postcssImport = require("postcss-import");
var fs = require("fs");
var path = require("path");
var execSync = require("child_process").execSync;

var files = execSync('find ui blue-shark/ui -name "_*.css" -not -path "*/node_modules/*"', {encoding: "utf8"}).trim().split("\n");
var configPath = path.resolve("./blue-shark/ui/_config.css");
var processor = postcss([postcssImport(), cssnext({warnForDuplicates: false, features: {rem: false}})]);

Promise.all(files.map(function(file) {
    var dir = path.dirname(file);
    var outPath = path.join(dir, path.basename(file).substring(1));
    var css = fs.readFileSync(file, "utf8");
    var importPath = path.relative(dir, configPath).replace(/\\/g, "/");
    var input = "@import '" + importPath + "';\n" + css;
    return processor.process(input, {from: path.resolve(file), to: path.resolve(outPath)}).then(function(r) {
        fs.writeFileSync(outPath, r.css);
    }).catch(function(e) {
        fs.writeFileSync(outPath, css);
    });
})).then(function() {
    console.log("CSS done: " + files.length + " files processed");
});
