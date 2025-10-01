const { test } = require("node:test");
const assert = require("node:assert");
const { Writable } = require("stream");

// Helper to test a transform stream with input and return output
async function testTransform(transform, input) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const output = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk.toString());
        callback();
      },
    });

    output.on("finish", () => {
      resolve(chunks.join(""));
    });

    output.on("error", reject);
    transform.on("error", reject);

    transform.pipe(output);
    transform.write(input);
    transform.end();
  });
}

test("transforms Python INFO level to Pino level 30", async () => {
  const pythonToPinoTransform = require("../lib/pythonToPinoTransform");
  const input = '{"levelname":"INFO","message":"test"}\n';

  const result = await testTransform(pythonToPinoTransform, input);

  assert.match(result, /"level":30/);
  assert.doesNotMatch(result, /"levelname"/);
});

test("transforms Python DEBUG level to Pino level 20", async () => {
  delete require.cache[require.resolve("../lib/pythonToPinoTransform")];
  const pythonToPinoTransform = require("../lib/pythonToPinoTransform");
  const input = '{"levelname":"DEBUG","message":"debug message"}\n';

  const result = await testTransform(pythonToPinoTransform, input);

  assert.match(result, /"level":20/);
});

test("transforms Python ERROR level to Pino level 50", async () => {
  delete require.cache[require.resolve("../lib/pythonToPinoTransform")];
  const pythonToPinoTransform = require("../lib/pythonToPinoTransform");
  const input = '{"levelname":"ERROR","message":"error message"}\n';

  const result = await testTransform(pythonToPinoTransform, input);

  assert.match(result, /"level":50/);
});

test("transforms Python WARNING level to Pino level 40", async () => {
  delete require.cache[require.resolve("../lib/pythonToPinoTransform")];
  const pythonToPinoTransform = require("../lib/pythonToPinoTransform");
  const input = '{"levelname":"WARNING","message":"warning message"}\n';

  const result = await testTransform(pythonToPinoTransform, input);

  assert.match(result, /"level":40/);
});

test("transforms Python CRITICAL level to Pino level 60", async () => {
  delete require.cache[require.resolve("../lib/pythonToPinoTransform")];
  const pythonToPinoTransform = require("../lib/pythonToPinoTransform");
  const input = '{"levelname":"CRITICAL","message":"critical message"}\n';

  const result = await testTransform(pythonToPinoTransform, input);

  assert.match(result, /"level":60/);
});

test("passes through unknown level names unchanged", async () => {
  delete require.cache[require.resolve("../lib/pythonToPinoTransform")];
  const pythonToPinoTransform = require("../lib/pythonToPinoTransform");
  const input = '{"levelname":"CUSTOM","message":"custom level"}\n';

  const result = await testTransform(pythonToPinoTransform, input);

  assert.match(result, /"levelname":"CUSTOM"/);
});
