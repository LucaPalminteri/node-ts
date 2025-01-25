# Node.js TypeScript Starter

## Project Setup

Minimal Node.js TypeScript project with native TS execution and VS Code debugging.

## Prerequisites

- Node.js v23.6.0+
- TypeScript

## Project Structure

``` bash
project-root/
├── src/
│   ├── server.ts
│   └── tests/
│       └── testRunner.ts
├── tsconfig.json
├── package.json
└── .vscode/
    └── launch.json
```

## Available Scripts

- `node --run dev`: Start development server with file watching
- `node --run test`: Run test runner

## Debugging

1. Set breakpoints in VS Code
2. Use F5 to start debugging
3. Configured to debug `src/server.ts`

## TypeScript Configuration

- ES2022 target
- NodeNext module resolution
- Strict type checking
- No emit (transpilation handled at runtime)

## VS Code Debugging Setup

Configured in `.vscode/launch.json` to debug TypeScript files directly.
