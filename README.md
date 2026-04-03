# PreText Web App

An interactive typography demonstration built with Next.js and PreText, showcasing real-time multilingual text layout without DOM reflows.

## Live Demo

Experience the application live at: [https://pre-text-web-app.vercel.app/](https://pre-text-web-app.vercel.app/)

## Special Acknowledgement

A massive shoutout to Cheng Lou and the incredible work on [PreText](https://github.com/chenglou/pretext). This application is fundamentally built upon the capabilities of the PreText layout engine. By measuring and flowing text using pure arithmetic, PreText eliminates the need for expensive browser layout passes. Thank you for developing and sharing such a powerful tool with the open-source community.

## Overview

This project serves as a showcase for high-performance text rendering techniques. It demonstrates how text can be manipulated and laid out smoothly without relying on conventional DOM reads.

## Key Features

### Dynamic Live Text Reflow

An animated character moves within a stage while surrounding paragraph text dynamically reflows around its body in real-time at 60 FPS. The character is fully interactive and draggable, with text reshaping instantly upon movement.

- The layout handling is performed entirely via arithmetic.
- Circular obstacle carving computes clear text slots per line band.
- An imperative DOM element pool handles updates, bypassing standard React render cycles during the animation loop to maintain performance.
- Live performance statistics are displayed, including lines rendered, reflow time in milliseconds, and frames per second.

### Comprehensive Multilingual Support

The project includes support for various languages and scripts to demonstrate precise cross-script layout accuracy:

| Language | Script |
|---|---|
| English | Latin |
| Mixed | Mixed CJK, Arabic, and Symbols |
| Japanese | Hiragana and Kanji |
| Arabic | Arabic (Right-to-Left) |
| Hindi | Devanagari |
| Korean | Hangul |
| Thai | Thai |
| Greek | Greek |
| Hebrew | Hebrew (Right-to-Left) |
| Russian | Cyrillic |
| Bengali | Bengali |

### Canvas Text Rendering

The application demonstrates precise methods for measuring and laying out multi-line text on a Canvas element. This approach ensures accuracy across all supported languages without triggering any browser layout recalculations.

## Getting Started

To run this project locally on your machine, follow these steps:

```bash
npm install
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

## Technology Stack

- **Next.js**: React framework
- **@chenglou/pretext**: Zero-reflow text measurement and layout
- **TypeScript**: Static typing for JavaScript
- **Tailwind CSS**: Utility classes for styling

## Internal Architecture

The continuous reflow mechanism operates using the following sequence on each animation frame:

1. The character position is updated via a physics simulation or pointer drag events.
2. Circle obstacles are computed around the character's central point.
3. The blocked horizontal range is calculated for each text line band.
4. Obstacles are subtracted from the full line width to generate free horizontal layout slots.
5. Each slot is subsequently filled with the maximum amount of text that fits its specific width.
6. DOM elements are updated imperatively to ensure maximum efficiency.

These highly optimized layout computations complete in under one millisecond per frame.

## Project Structure

```text
src/app/
  page.tsx          Main application page containing all demo components
public/
  tenor.gif         Animated character asset
```
