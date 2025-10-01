#!/usr/bin/env node

// Simple wrapper around pino-pretty CLI that adds nothing
const pinoPretty = require("pino-pretty");

// Create the pretty stream with parsed command line options
const prettyStream = pinoPretty();

// Pipe stdin through pino-pretty to stdout
process.stdin.pipe(prettyStream).pipe(process.stdout);
