#!/bin/node

const fs = require('fs');
const path = require('path');
const translate = require('translate');

function fbv(value, replacer) {
  if (replacer) {
    return value || replacer;
  } else {
    return value || undefined;
  }
}

function getIcons(value) {
  if (value) {
    var entries = Object.entries(value);
    entries.forEach((entry, index) => {
      entries[index] = {
        src: entry[1],
        type: 'image/png',
        size: entry[0] + 'x' + entry[0]
      };
    });
    return entries;
  } else {
    return undefined;
  }
}

['gaia/webapps', 'gaia/tv_webapps', 'gaia/dev_webapps', 'gaia/hosted_apps'].forEach(element => {
  var gpath = path.join(element);
  fs.readdir(gpath, (error, apps) => {
    if (error) {
      console.error(error);
      return;
    }

    apps.forEach(app => {
      var apath = path.join(element, app);
      fs.readdir(apath, (error, files) => {
        if (error) {
          console.error(error);
          return;
        }

        files.forEach(file => {
          if (file.includes('.webapp')) {
            var mpath = path.join(element, app, file);
            fs.readFile(mpath, async (error, data) => {
              if (error) {
                console.error(error);
                return;
              }

              var json = JSON.parse(data);
              var template = {
                version: fbv(json.version, '2.0'),
                name: fbv(json.name),
                short_name: fbv(app),
                description: fbv(json.description),
                lang: fbv(json.default_locale),
                orientation: fbv(json.orientation),
                start_url: fbv(json.launch_path || json.start_url),
                icons: getIcons(json.icons),
                b2g_features: fbv({
                  core: fbv(json.type === 'certified'),
                  role: fbv(json.role),
                  developer: fbv(json.developer),
                  permissions: fbv(json.permissions),
                  activities: fbv(json.activities),
                  messages: fbv(json.messages),
                  connections: fbv(json.connections),
                  'datastores-owned': fbv(json['datastores-owned']),
                  'datastores-access': fbv(json['datastores-access']),
                })
              };

              var wpath = path.join(element, app, file.replace('.webapp', '.webmanifest'));
              var content = JSON.stringify(template, null, 2);
              fs.writeFile(wpath, content, error => {
                if (error) {
                  console.error(error);
                }
              });

              var toptions = {
                from: 'en',
                to: process.argv[2],
                engine: 'google',
                key: 'AIzaSyBJHGk4_lPVNEyL6-n_VkbfmOGuC2bd8dQ'
              };

              var template1 = template;
              template1.name = await translate(template1.name, toptions);
              template1.short_name = await translate(template1.short_name, toptions);
              template1.description = await translate(template1.description, toptions);

              var wpath = path.join(element, app, file.replace('.webapp', '.' + process.argv[2] + '.webmanifest'));
              var content = JSON.stringify(template1, null, 2);
              fs.writeFile(wpath, content, error => {
                if (error) {
                  console.error(error);
                }
              });
            });
          }
        });
      });
    });
  });
});
