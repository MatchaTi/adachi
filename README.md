# Adachi

Adachi is a Japanese kana learning app built with Vite, React, TanStack Router, and oRPC. It helps users learn how to read and write Hiragana and Katakana with character lists, detail pages, and interactive writing practice.

## Features

- Hiragana and Katakana study pages
- Individual character detail routes for writing practice
- Client-side stroke-order interaction with `hanzi-writer`
- TanStack Query-powered data loading and caching
- Modern UI built with Tailwind CSS and shared component primitives

## Tech Stack

- React 19
- TanStack Router
- TanStack Query
- oRPC
- Tailwind CSS v4
- Biome

## Getting Started

### Install dependencies

```bash
bun install
```

### Run the app locally

```bash
bun run dev
```

The app runs on `http://localhost:3000`.

### Build for production

```bash
bun run build
```

### Preview the production build

```bash
bun run preview
```

### Run checks

```bash
bun run check
bun run lint
bun run test
```

## Project Structure

- `src/routes/` contains the route pages for the app.
- `src/orpc/` contains the shared RPC client, schema, and router code.
- `src/components/` contains reusable UI and layout components.
- `public/graphicsJaKana.txt` contains the kana dataset used by the app.

## Notes

- The kana dataset includes both Hiragana and Katakana rows.
- Hiragana writing practice is implemented with a client-only dynamic import to avoid SSR issues.

