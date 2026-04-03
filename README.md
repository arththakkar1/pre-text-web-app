# PreText Web App

An interactive typography demonstration built with **Next.js** and [`@chenglou/pretext`](https://github.com/chenglou/pretext), showcasing real-time multilingual text layout without DOM reflows.

## Overview

This project demonstrates the capabilities of the PreText layout engine — a library that measures and flows text using pure arithmetic, eliminating the need for browser layout passes (`getBoundingClientRect`, `offsetWidth`, etc.).

## Features

### Dragon — Live Text Reflow

An animated character bounces around a stage while paragraph text dynamically reflows around its body in real-time at 60 fps. The character is also draggable — text reshapes instantly as it moves.

- `layoutNextLine` handles all text measurement via arithmetic, not DOM reads
- Circular obstacle carving (`carveSlots` and `circleInterval`) computes clear text slots per line band
- An imperative DOM element pool eliminates React re-renders during the animation loop
- Live performance stats: lines rendered, reflow time in milliseconds, and frames per second

### Multilingual Text Support

Eleven languages and scripts are available to demonstrate cross-script layout accuracy:

| Language | Script |
|---|---|
| English | Latin |
| Mixed CJK + Arabic + Emoji | Mixed |
| Japanese | Hiragana / Kanji |
| Arabic | Arabic (right-to-left) |
| Hindi | Devanagari |
| Korean | Hangul |
| Thai | Thai |
| Greek | Greek |
| Hebrew | Hebrew (right-to-left) |
| Russian | Cyrillic |
| Bengali | Bengali |

### Canvas Text Rendering

Demonstrates `prepareWithSegments` and `layoutWithLines` for measuring and laying out multi-line text on a `<canvas>` element, accurate across all languages without triggering browser layout.

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Tech Stack

- **Next.js** — React framework
- **@chenglou/pretext** — zero-reflow text measurement and layout
- **TypeScript**
- **Tailwind CSS**

## Key PreText APIs

| API | Purpose |
|---|---|
| `prepareWithSegments` | Segments text into grapheme clusters with font metrics |
| `layoutNextLine` | Lays out one line at a time into a given width slot |
| `layoutWithLines` | Full paragraph layout returning lines and total height |

## How the Reflow Works

Each animation frame executes the following steps:

1. The character position is updated via physics simulation or pointer drag
2. Circle obstacles are computed around the character's center point
3. `circleInterval` calculates the blocked horizontal range for each text line band
4. `carveSlots` subtracts obstacles from the full line width to produce free horizontal slots
5. `layoutNextLine` fills each slot with as much text as fits given the slot width
6. DOM elements are updated imperatively, bypassing React's render cycle

The entire layout pass completes in under one millisecond per frame.

## Project Structure

```
src/app/
  page.tsx          Main page with all demo components
public/
  tenor.gif         Animated character asset
```
