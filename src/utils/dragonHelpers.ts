import { DragonObstacle } from "../types";
import { MIN_SLOT_WIDTH } from "../constants";

/**
 * Carves out horizontal slots by omitting specified blocked intervals from a base segment.
 * Ensures resultant slots meet the minimum width requirements for proper rendering.
 *
 * @param base - The initial horizontal bounding boundary segment
 * @param blocked - Array of horizontal bounds specifying areas that text should avoid
 * @returns Array of available interval slots conforming to length configurations
 */
export function carveSlots(
  base: { left: number; right: number },
  blocked: { left: number; right: number }[]
): { left: number; right: number }[] {
  let slots = [base];
  for (const iv of blocked) {
    const next: { left: number; right: number }[] = [];
    for (const s of slots) {
      if (iv.right <= s.left || iv.left >= s.right) { next.push(s); continue; }
      if (iv.left > s.left) next.push({ left: s.left, right: iv.left });
      if (iv.right < s.right) next.push({ left: iv.right, right: s.right });
    }
    slots = next;
  }
  return slots.filter((s) => s.right - s.left >= MIN_SLOT_WIDTH);
}

/**
 * Calculates the bounding horizontal block interval for a circular geometric obstacle
 * intersecting a particular horizontal line segmentation unit.
 *
 * @param cx - Center x-coordinate of the circle
 * @param cy - Center y-coordinate of the circle
 * @param r - Radius of the circle
 * @param bandTop - Top boundary of the horizontal segmentation band
 * @param bandBottom - Bottom boundary of the horizontal segmentation band
 * @param hPad - Horizontal padding margin added to intervals
 * @param vPad - Vertical padding margin allowed before bounding computes
 * @returns Valid blocked interval object or null if obstacle avoids intersection
 */
export function circleInterval(
  cx: number, cy: number, r: number,
  bandTop: number, bandBottom: number,
  hPad: number, vPad: number
): { left: number; right: number } | null {
  const top = bandTop - vPad;
  const bottom = bandBottom + vPad;
  if (top >= cy + r || bottom <= cy - r) return null;
  const minDy = cy >= top && cy <= bottom ? 0 : cy < top ? top - cy : cy - bottom;
  if (minDy >= r) return null;
  const maxDx = Math.sqrt(r * r - minDy * minDy);
  return { left: cx - maxDx - hPad, right: cx + maxDx + hPad };
}

/**
 * Computes multiple geometric circle approximations to map bounds for dragon visual representation.
 *
 * @param x - Subject x-coordinate location parameter
 * @param y - Subject y-coordinate location parameter
 * @param scale - Size proportionality parameter representation
 * @returns Set of geometry parameters specifying blocked regions respectively
 */
export function getDragonObstacles(x: number, y: number, scale: number): DragonObstacle {
  // Representation uses body, head, and tail scaling geometries from structural center.
  return [
    { cx: x,        cy: y,       r: scale * 1.1 },  // Main body bounding region
    { cx: x + scale * 1.3, cy: y - scale * 0.6, r: scale * 0.55 }, // Head bounding region
    { cx: x - scale * 1.1, cy: y + scale * 0.5, r: scale * 0.5  }, // Tail bounding region
  ];
}
