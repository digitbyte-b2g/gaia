#!/bin/node

const fs = require('fs');
const translate = require('translate');

translate.engine = 'google';
translate.key = 'AIzaSyBJHGk4_lPVNEyL6-n_VkbfmOGuC2bd8dQ';

main(process.argv[2]);

function main(lang) {
  var localesIndex = fs.readFileSync('bin/locales_index.txt');
  var manifestIndex = fs.readFileSync('bin/manifest_index.txt');
  localesIndex = localesIndex.toString().split('\n');
  manifestIndex = manifestIndex.toString().split('\n');

  localesIndex.forEach(function (file, index) {
    if (file !== '' && file !== null) {
      console.log(`[translator] Translating "${file}"...`);

      var locale = fs.readFileSync(file);
      var filepath = 'locales/' + lang + '/' + file.replace('.en-US', '');
      var split = filepath.split('/');
      var formatted = filepath.replace('/' + split[split.length - 1], '');

      if (fs.existsSync('locales/' + lang)) {
        fs.rmdirSync('locales/' + lang, {
          recursive: true,
          force: true
        });
      }

      var localeLines = locale.toString().split('\n');

      localeLines.forEach(function (line, lineIdx) {
        var params = line.split('=');
        params[0] = params[0].replace(' ', '');
        var translation = '';
        var cachedText = '';

        (async function () {
          if (line.includes('=') && !line.startsWith('#')) {
            refetch();
          }
        })();

        async function refetch() {
          try {
            translation = await translate(params[1], lang);
            finalize();
          } catch (e) {
            console.log(`[translator] Failed to translate "${params[0]}"`);
            refetch();
          }
        }

        function finalize() {
          cachedText += `${params[0]} = ${translation}\n`;
          fs.mkdirSync(formatted, { recursive: true });
          fs.appendFileSync(filepath, cachedText);
          console.log(`[translator, ${params[0]}] Translated "${params[1]}" successfully to "${translation}"...`);
        }
      });
    }
  });

  // manifestIndex.forEach(function(file) {
  //   console.log(`[translator] Translating ${file}...`);
  // });
}
