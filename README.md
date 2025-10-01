# pino-prettypy

A wrapper around [pino-pretty](https://github.com/pinojs/pino-pretty) that adds Python logging level transformation.

> ⚠️ **Note**: This is a toy project and is not actively maintained. It was vibe coded with an LLM.

## What it does

This tool transforms Python logging levels to Pino levels, allowing you to prettify Python logs that use `levelname` with pino-pretty.

**Python → Pino level mapping:**

- `DEBUG` → 20
- `INFO` → 30
- `WARNING` → 40
- `ERROR` → 50
- `CRITICAL` → 60

## What it does not

This tool only transforms the `levelname` field - it does **not**:

- Configure Python logging to output JSON (you need to do that yourself)
- Transform other Python-specific fields (e.g., `asctime` is not transformed to `time`, so pino-pretty's time formatting options won't work)

For JSON logging in Python, use libraries `python-json-logger`.

## Installation

```bash
npm install -g @crccheck/pino-prettypy
```

Or use with npx:

```bash
npx @crccheck/pino-prettypy
```

## Usage

Pipe your Python JSON logs through pino-prettypy:

```bash
cat your-python-logs.jsonl | pino-prettypy
```

**For live Python logs** (Python logs to stderr by default):

```bash
python your_script.py 2>&1 | pino-prettypy
```

All pino-pretty options are supported:

```bash
python your_script.py 2>&1 | pino-prettypy -c
```

## How it works

1. Transforms `"levelname":"INFO"` → `"level":30`
2. Pipes the transformed JSON through pino-pretty
3. Outputs beautifully formatted logs

## License

ISC

This project includes code from [pino-pretty](https://github.com/pinojs/pino-pretty), which is licensed under the MIT License.

## Author

Chris Chang <github@crccheck.com>
