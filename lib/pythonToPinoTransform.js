const { Transform } = require("node:stream");

// Map Python logging levels to Pino levels
const PYTHON_TO_PINO_LEVELS = {
  DEBUG: 20,
  INFO: 30,
  WARNING: 40,
  ERROR: 50,
  CRITICAL: 60,
};

const LEVELNAME_REGEX = /"levelname"\s*:\s*"(\w+)"/;

const pythonToPinoTransform = new Transform({
  objectMode: false,
  transform(chunk, encoding, callback) {
    let line = chunk.toString();
    line = line.replace(LEVELNAME_REGEX, (match, levelName) => {
      if (PYTHON_TO_PINO_LEVELS[levelName]) {
        return `"level":${PYTHON_TO_PINO_LEVELS[levelName]}`;
      }
      return match;
    });

    this.push(line);
    callback();
  },
});

module.exports = pythonToPinoTransform;
