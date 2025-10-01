#!/usr/bin/env node

/*
 * Based on pino-pretty/bin.js
 * Original Copyright (c) 2019 the Pino team listed at https://github.com/pinojs/pino#the-team
 * Licensed under MIT License
 *
 * Modifications Copyright (c) 2025 Chris Chang
 *
 * This file is a modified version of pino-pretty's bin.js that adds
 * Python logging level transformation via pythonToPinoTransform.
 *
 * To update when a new version of pino-pretty is released:
 * 1. Copy the entire contents of node_modules/pino-pretty/bin.js
 * 2. Replace the contents of this file with that copy
 * 3. Re-add this copyright notice at the top
 * 4. Add the pythonToPinoTransform import:
 *    const pythonToPinoTransform = require('../lib/pythonToPinoTransform')
 * 5. Update the require statements to reference pino-pretty as a module:
 *    - Change: const build = require('./')
 *      To: const build = require('pino-pretty')
 *    - Change: const CONSTANTS = require('./lib/constants')
 *      To: const CONSTANTS = require('pino-pretty/lib/constants')
 *    - Change: const { isObject } = require('./lib/utils')
 *      To: const { isObject } = require('pino-pretty/lib/utils')
 * 6. Update the help path to use the pino-pretty module path:
 *    dir: path.join(path.dirname(require.resolve('pino-pretty')), 'help')
 * 7. In the pump() call, add pythonToPinoTransform to the chain:
 *    - Change: pump(process.stdin, res)
 *      To: pump(process.stdin, pythonToPinoTransform, res)
 * 8. Ensure minimist is imported (should already be there)
 */

"use strict";

const fs = require("node:fs");
const path = require("node:path");
const help = require("help-me")({
  dir: path.join(path.dirname(require.resolve("pino-pretty")), "help"),
  ext: ".txt",
});
const pump = require("pump");
const sjp = require("secure-json-parse");
const JoyCon = require("joycon");
const { default: stripJsonComments } = require("strip-json-comments");

const build = require("pino-pretty");
const CONSTANTS = require("pino-pretty/lib/constants");
const { isObject } = require("pino-pretty/lib/utils");
const minimist = require("minimist");
const pythonToPinoTransform = require("../lib/pythonToPinoTransform");

const parseJSON = (input) => {
  return sjp.parse(stripJsonComments(input), { protoAction: "remove" });
};

const joycon = new JoyCon({
  parseJSON,
  files: [
    "pino-pretty.config.cjs",
    "pino-pretty.config.js",
    ".pino-prettyrc",
    ".pino-prettyrc.json",
  ],
  stopDir: path.dirname(process.cwd()),
});

const cmd = minimist(process.argv.slice(2));

if (cmd.h || cmd.help) {
  help.toStdout();
} else {
  const DEFAULT_VALUE = "\0default";

  let opts = minimist(process.argv, {
    alias: {
      colorize: "c",
      crlf: "f",
      errorProps: "e",
      levelFirst: "l",
      minimumLevel: "L",
      customLevels: "x",
      customColors: "X",
      useOnlyCustomProps: "U",
      errorLikeObjectKeys: "k",
      messageKey: "m",
      levelKey: CONSTANTS.LEVEL_KEY,
      levelLabel: "b",
      messageFormat: "o",
      timestampKey: "a",
      translateTime: "t",
      ignore: "i",
      include: "I",
      hideObject: "H",
      singleLine: "S",
    },
    default: {
      messageKey: DEFAULT_VALUE,
      minimumLevel: DEFAULT_VALUE,
      levelKey: DEFAULT_VALUE,
      timestampKey: DEFAULT_VALUE,
    },
  });

  // Remove default values
  opts = filter(opts, (value) => value !== DEFAULT_VALUE);
  const config = loadConfig(opts.config);
  // Override config with cli options
  opts = Object.assign({}, config, opts);
  // set defaults
  opts.errorLikeObjectKeys = opts.errorLikeObjectKeys || "err,error";
  opts.errorProps = opts.errorProps || "";

  const res = build(opts);
  // Chain the pythonToPinoTransform before pino-pretty
  pump(process.stdin, pythonToPinoTransform, res);

  // https://github.com/pinojs/pino/pull/358
  /* istanbul ignore next */
  if (!process.stdin.isTTY && !fs.fstatSync(process.stdin.fd).isFile()) {
    process.once("SIGINT", function noOp() {});
  }

  function loadConfig(configPath) {
    const files = configPath ? [path.resolve(configPath)] : undefined;
    const result = joycon.loadSync(files);
    if (result.path && !isObject(result.data)) {
      configPath = configPath || path.basename(result.path);
      throw new Error(`Invalid runtime configuration file: ${configPath}`);
    }
    if (configPath && !result.data) {
      throw new Error(
        `Failed to load runtime configuration file: ${configPath}`
      );
    }
    return result.data;
  }

  function filter(obj, cb) {
    return Object.keys(obj).reduce((acc, key) => {
      const value = obj[key];
      if (cb(value, key)) {
        acc[key] = value;
      }
      return acc;
    }, {});
  }
}
