/**
 * Core application types configuration
 */

export interface MeasureResult {
  height: number;
  lineCount: number;
  prepareMs: number;
  layoutMs: number;
}

export interface Line {
  text: string;
  width: number;
}

export type DragonObstacle = { cx: number; cy: number; r: number }[];

export interface RenderedLine {
  x: number;
  y: number;
  text: string;
}
