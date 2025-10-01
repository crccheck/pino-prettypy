#!/usr/bin/env node

const pinoPretty = require("pino-pretty");
const pythonToPinoTransform = require("../lib/pythonToPinoTransform");

const prettyStream = pinoPretty();

// Pipe stdin through the transform, then through pino-pretty to stdout
process.stdin.pipe(pythonToPinoTransform).pipe(prettyStream);
