'use strict';
/* jslint node: true */
/* global TestAgent, server */
var fsPath = require('path');

// All require paths must be absolute -- use __dirname
var Agent = TestAgent,
    Apps = Agent.server,
    Suite = Agent.Suite,
    testSuite = new Suite({
      paths: [fsPath.resolve(__dirname + '/../../webapps/'),
              fsPath.resolve(__dirname + '/../../tv_webapps/'),
              fsPath.resolve(__dirname + '/../../dev_webapps/')],
      strictMode: false,
      testDir: '/test/unit/',
      libDir: 'js/',
      testSuffix: '_test.js'
    });

server.use(Apps.Suite, testSuite);
