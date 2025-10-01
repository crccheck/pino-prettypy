#!/usr/bin/env node

const pinoPretty = require("pino-pretty");
const { Transform } = require("stream");

// Map Python logging levels to Pino levels
const PYTHON_TO_PINO_LEVELS = {
  DEBUG: 20, // Pino debug
  INFO: 30, // Pino info
  WARNING: 40, // Pino warn
  ERROR: 50, // Pino error
  CRITICAL: 60, // Pino fatal
};

// Create a transform stream to convert Python logging levels using regex
const pythonToPinoTransform = new Transform({
  objectMode: false,
  transform(chunk, encoding, callback) {
    let line = chunk.toString();

    // Replace "levelname":"LEVEL" with "level":NUMBER
    line = line.replace(/"levelname"\s*:\s*"(\w+)"/g, (match, levelName) => {
      if (PYTHON_TO_PINO_LEVELS[levelName]) {
        return `"level":${PYTHON_TO_PINO_LEVELS[levelName]}`;
      }
      return match; // If level not found, keep original
    });

    this.push(line);
    callback();
  },
});

// Create the pretty stream
const prettyStream = pinoPretty();

// Pipe stdin through the transform, then through pino-pretty
process.stdin.pipe(pythonToPinoTransform).pipe(prettyStream);
