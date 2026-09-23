import { useEffect } from 'react';

/**
 * Springy outline for the Upcoming Events blob.
 *
 * At rest the blob is the #15 ink-blot shape. Its outline is a ring of
 * points, each on a spring back to its rest position. A mouse or finger near
 * the edge pushes the nearest points away from it; neighbours pull on each
 * other so the dent spreads, and on release everything springs back with a
 * short wobble.
 */

/**
 * Feel of the jelly — tune here. Distances are in viewBox units: the blob
 * is 130 × 100, so 10 is a tenth of its height.
 */
export const JELLY = {
  radius: 32, // reaction radius: how close the pointer must come to the edge
  push: 12, // how far the edge right next to the pointer is pushed away
  // Hard cap on any point's displacement, wobble included. The dancer is at
  // least 15.8 from the rest outline; minus the feathered rim that leaves 9.
  maxDent: 9,
  stiffness: 0.1, // spring back to rest, per 60 fps frame (higher = snappier)
  damping: 0.9, // share of velocity kept per frame (lower = wobble dies sooner)
  coupling: 0.08, // pull between neighbouring points: spreads a dent like jelly
};

const VIEW_WIDTH = 130;

/** Anchors of the resting outline (#15), clockwise from the right edge. */
const ANCHORS = [
  [129.9, 51.6], [124.1, 75.3], [106.1, 95.3], [76.3, 99.7], [49.1, 99.2],
  [18.6, 95.9], [3.2, 74.6], [3.6, 51.6], [0.7, 27.7], [18.3, 7.2],
  [48.0, 0.3], [76.6, 2.5], [101.0, 13.1], [120.5, 29.3],
];

/** Springs per anchor segment: 14 × 4 = 56 points around the outline. */
const STEPS = 4;

/** Point `t` of the closed Catmull-Rom segment between p1 and p2. */
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return [0, 1].map(
    (k) =>
      0.5 *
      (2 * p1[k] +
        (p2[k] - p0[k]) * t +
        (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 +
        (3 * p1[k] - p0[k] - 3 * p2[k] + p3[k]) * t3),
  );
}

const at = (points, index) => points[(index + points.length) % points.length];

const REST = ANCHORS.flatMap((_, i) =>
  Array.from({ length: STEPS }, (__, s) =>
    catmullRom(at(ANCHORS, i - 1), ANCHORS[i], at(ANCHORS, i + 1), at(ANCHORS, i + 2), s / STEPS),
  ),
);

/** Smooth closed path through the points (Catmull-Rom as cubic Béziers). */
function toPath(points) {
  const f = (n) => n.toFixed(2);
  let d = `M${f(points[0][0])} ${f(points[0][1])}`;
  for (let i = 0; i < points.length; i += 1) {
    const [p0, p1, p2, p3] = [at(points, i - 1), points[i], at(points, i + 1), at(points, i + 2)];
    d +=
      `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ` +
      `${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ` +
      `${f(p2[0])} ${f(p2[1])}`;
  }
  return `${d}Z`;
}

export const REST_PATH = toPath(REST);

/** Below this (in units / units per frame) a point counts as settled. */
const SETTLED = 0.02;

/**
 * Runs the jelly on `path`. Pointer and touch input are read on `area`;
 * `box` is the blob's box, used to map screen pixels to viewBox units. The
 * animation frame loop only runs while the pointer is near the edge or the
 * outline is still wobbling back — idle, it stops. Returns a cleanup.
 */
export function attachJelly({ path, box, area }) {
  const offset = REST.map(() => [0, 0]); // displacement from rest
  const velocity = REST.map(() => [0, 0]);
  let pointer = null; // [x, y] in viewBox units, or null
  let frame = 0;
  let last = 0;

  const toView = (clientX, clientY) => {
    const rect = box.getBoundingClientRect();
    const scale = VIEW_WIDTH / rect.width;
    return [(clientX - rect.left) * scale, (clientY - rect.top) * scale];
  };

  const step = (now) => {
    // Frame-rate independent: `f` is the elapsed time in 60 fps frames.
    const f = last ? Math.min(3, (now - last) / (1000 / 60)) : 1;
    last = now;
    const keep = JELLY.damping ** f;
    const before = offset.map(([x, y]) => [x, y]);
    let active = false;

    for (let i = 0; i < REST.length; i += 1) {
      // Where the pointer wants this point: pushed straight away from it.
      let tx = 0;
      let ty = 0;
      if (pointer) {
        const ax = REST[i][0] - pointer[0];
        const ay = REST[i][1] - pointer[1];
        const dist = Math.hypot(ax, ay);
        if (dist < JELLY.radius && dist > 0.001) {
          const strength = JELLY.push * (1 - dist / JELLY.radius) ** 2;
          tx = (ax / dist) * strength;
          ty = (ay / dist) * strength;
          active = true;
        }
      }

      const prev = at(before, i - 1);
      const next = at(before, i + 1);
      for (let k = 0; k < 2; k += 1) {
        const target = k === 0 ? tx : ty;
        const accel =
          JELLY.stiffness * (target - before[i][k]) +
          JELLY.coupling * (prev[k] + next[k] - 2 * before[i][k]);
        velocity[i][k] = (velocity[i][k] + accel * f) * keep;
        offset[i][k] = before[i][k] + velocity[i][k] * f;
      }

      const size = Math.hypot(offset[i][0], offset[i][1]);
      if (size > JELLY.maxDent) {
        offset[i][0] *= JELLY.maxDent / size;
        offset[i][1] *= JELLY.maxDent / size;
      }
      if (
        size > SETTLED ||
        Math.abs(velocity[i][0]) > SETTLED ||
        Math.abs(velocity[i][1]) > SETTLED
      ) {
        active = true;
      }
    }

    if (active) {
      path.setAttribute('d', toPath(REST.map((p, i) => [p[0] + offset[i][0], p[1] + offset[i][1]])));
      frame = requestAnimationFrame(step);
    } else {
      // Settled and nothing near: snap to rest and stop the loop.
      offset.forEach((o) => o.fill(0));
      velocity.forEach((v) => v.fill(0));
      path.setAttribute('d', REST_PATH);
      frame = 0;
      last = 0;
    }
  };

  const wake = () => {
    if (!frame) frame = requestAnimationFrame(step);
  };

  // Mouse / pen: hover. Touch goes through the touch events below, which
  // are passive, so a finger on the blob never blocks page scrolling.
  const onPointerMove = (event) => {
    if (event.pointerType === 'touch') return;
    pointer = toView(event.clientX, event.clientY);
    wake();
  };
  const onPointerLeave = (event) => {
    if (event.pointerType === 'touch') return;
    pointer = null;
    wake();
  };
  const onTouch = (event) => {
    const touch = event.touches[0];
    if (!touch) return;
    pointer = toView(touch.clientX, touch.clientY);
    wake();
  };
  const onTouchEnd = (event) => {
    if (event.touches.length) return;
    pointer = null;
    wake();
  };

  const passive = { passive: true };
  area.addEventListener('pointermove', onPointerMove);
  area.addEventListener('pointerleave', onPointerLeave);
  area.addEventListener('touchstart', onTouch, passive);
  area.addEventListener('touchmove', onTouch, passive);
  area.addEventListener('touchend', onTouchEnd);
  area.addEventListener('touchcancel', onTouchEnd);

  return () => {
    area.removeEventListener('pointermove', onPointerMove);
    area.removeEventListener('pointerleave', onPointerLeave);
    area.removeEventListener('touchstart', onTouch, passive);
    area.removeEventListener('touchmove', onTouch, passive);
    area.removeEventListener('touchend', onTouchEnd);
    area.removeEventListener('touchcancel', onTouchEnd);
    cancelAnimationFrame(frame);
    path.setAttribute('d', REST_PATH);
  };
}

/** Hook form of attachJelly, active while `enabled`. */
export function useJelly({ pathRef, boxRef, areaRef, enabled }) {
  useEffect(() => {
    const path = pathRef.current;
    const box = boxRef.current;
    const area = areaRef.current;
    if (!enabled || !path || !box || !area) return undefined;
    return attachJelly({ path, box, area });
  }, [pathRef, boxRef, areaRef, enabled]);
}
