import { useEffect } from 'react';

/**
 * Springy outline for the Upcoming Events blob.
 *
 * At rest the blob is a soft rounded square, like a bar of soap. Its outline
 * is a ring of points, each on a spring back to its rest position. A mouse
 * or finger near the edge pushes the nearest points inward, so the edge
 * backs away from it; neighbours pull on each other so the dent spreads,
 * and on release everything springs back with a short wobble.
 */

/**
 * Resting shape. The viewBox is width × height; `roundness` is the
 * superellipse exponent (2 = ellipse, higher = squarer corners); `wobble`
 * adds a slight organic unevenness so the jelly still reads as soft.
 */
export const SHAPE = {
  width: 110,
  height: 100,
  roundness: 3.4,
  wobble: [
    [3, 0.012, 0.8], // [waves around the outline, depth, phase]
    [5, 0.008, 2.1],
  ],
};

/**
 * Feel of the jelly — tune here. Distances are in viewBox units (the blob is
 * 110 × 100, so 10 is a tenth of its height).
 */
export const JELLY = {
  radius: 32, // reaction radius: how close the pointer must come to the edge
  push: 12, // how far the edge right next to the pointer is pushed in
  // Hard cap on any point's displacement, wobble included. The dancer is at
  // least 16.9 from the rest outline; minus the feathered rim that leaves 9.
  maxDent: 9,
  stiffness: 0.1, // spring back to rest, per 60 fps frame (higher = snappier)
  damping: 0.9, // share of velocity kept per frame (lower = wobble dies sooner)
  coupling: 0.08, // pull between neighbouring points: spreads a dent like jelly
};

/** Springs around the outline. */
const POINTS = 56;

const at = (points, index) => points[(index + points.length) % points.length];

/**
 * The rest outline: a superellipse with the wobble, scaled to fill the
 * viewBox exactly (so it touches the left and bottom edges for alignment),
 * then resampled so the points are evenly spaced along it.
 */
function restOutline() {
  const { width, height, roundness, wobble } = SHAPE;
  const dense = Array.from({ length: 2000 }, (_, i) => {
    const t = (2 * Math.PI * i) / 2000;
    const c = Math.cos(t);
    const s = Math.sin(t);
    const r =
      (Math.abs(c) ** roundness + Math.abs(s) ** roundness) ** (-1 / roundness) *
      (1 + wobble.reduce((sum, [k, depth, phase]) => sum + depth * Math.sin(k * t + phase), 0));
    return [r * c, r * s];
  });

  const xs = dense.map((p) => p[0]);
  const ys = dense.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const fitted = dense.map(([x, y]) => [((x - x0) / (x1 - x0)) * width, ((y - y0) / (y1 - y0)) * height]);

  const lengths = [0];
  for (let i = 1; i <= fitted.length; i += 1) {
    const [a, b] = [fitted[i - 1], at(fitted, i)];
    lengths.push(lengths[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = lengths[lengths.length - 1];
  let j = 0;
  return Array.from({ length: POINTS }, (_, i) => {
    const target = (total * i) / POINTS;
    while (lengths[j + 1] < target) j += 1;
    return fitted[j];
  });
}

const REST = restOutline();

/**
 * Unit vector pointing into the shape at each rest point (perpendicular to
 * the outline). The outline runs clockwise on screen (y down), so rotating
 * the tangent by +90° points inwards.
 */
const INWARD = REST.map((_, i) => {
  const [a, b] = [at(REST, i - 1), at(REST, i + 1)];
  const [tx, ty] = [b[0] - a[0], b[1] - a[1]];
  const len = Math.hypot(tx, ty);
  return [-ty / len, tx / len];
});

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
    // Per axis: the SVG is stretched to its box (preserveAspectRatio="none"),
    // which is not always 11:10 (see DancerBlob's `flat`).
    const rect = box.getBoundingClientRect();
    return [
      ((clientX - rect.left) * SHAPE.width) / rect.width,
      ((clientY - rect.top) * SHAPE.height) / rect.height,
    ];
  };

  const step = (now) => {
    // Frame-rate independent: `f` is the elapsed time in 60 fps frames.
    const f = last ? Math.min(3, (now - last) / (1000 / 60)) : 1;
    last = now;
    const keep = JELLY.damping ** f;
    const before = offset.map(([x, y]) => [x, y]);
    let active = false;

    for (let i = 0; i < REST.length; i += 1) {
      // Where the pointer wants this point: pushed into the shape, so the
      // edge backs away from the pointer whichever side it comes from.
      let tx = 0;
      let ty = 0;
      if (pointer) {
        const dist = Math.hypot(REST[i][0] - pointer[0], REST[i][1] - pointer[1]);
        if (dist < JELLY.radius) {
          const strength = JELLY.push * (1 - dist / JELLY.radius) ** 2;
          tx = INWARD[i][0] * strength;
          ty = INWARD[i][1] * strength;
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
