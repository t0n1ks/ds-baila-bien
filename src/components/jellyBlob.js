import { useEffect } from 'react';

/**
 * Springy outlines for the dancer blobs.
 *
 * At rest a blob is a soft rounded shape, like a bar of soap. Its outline
 * is a ring of points, each on a spring back to its rest position. A mouse
 * or finger near the edge pushes the nearest points inward, so the edge
 * backs away from it; neighbours pull on each other so the dent spreads,
 * and on release everything springs back with a short wobble.
 *
 * Two outlines: the Upcoming Events blob (a fixed 110 × 100 viewBox,
 * stretched to its box) and the flat trial-form bar, a rounded rectangle
 * built in real pixels for whatever size its box has (see roundedRect).
 */

/**
 * Upcoming Events resting shape. The viewBox is width × height; `roundness`
 * is the superellipse exponent (2 = ellipse, higher = squarer corners);
 * `wobble` adds a slight organic unevenness so the jelly still reads as soft.
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
 * Feel of the Upcoming Events jelly — tune here. Distances are in viewBox
 * units (the blob is 110 × 100, so 10 is a tenth of its height).
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

/**
 * Feel of the flat trial-form bar, in pixels. Its dancer keeps a fifth of
 * the bar's height (~37 px) clear above and below; the cap stays under that
 * minus the feathered rim.
 */
export const JELLY_FLAT = { ...JELLY, radius: 80, push: 28, maxDent: 22 };

/** Corner radius of the flat bar, in px — the form card's rounded-3xl. */
export const FLAT_CORNER = 24;

const at = (points, index) => points[(index + points.length) % points.length];

/** `count` points evenly spaced along a dense closed polyline. */
function resample(dense, count) {
  const lengths = [0];
  for (let i = 1; i <= dense.length; i += 1) {
    const [a, b] = [dense[i - 1], at(dense, i)];
    lengths.push(lengths[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = lengths[lengths.length - 1];
  let j = 0;
  return Array.from({ length: count }, (_, i) => {
    const target = (total * i) / count;
    while (lengths[j + 1] < target) j += 1;
    return dense[j];
  });
}

/**
 * The Upcoming Events rest outline: a superellipse with the wobble, scaled
 * to fill the viewBox exactly (so it touches the left and bottom edges for
 * alignment), with 56 springs.
 */
function superellipse() {
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
  return resample(fitted, 56);
}

/**
 * A width × height rounded rectangle with corner radius `radius`, clockwise
 * on screen like the superellipse, with a spring every ~12 px.
 */
function roundedRectPoints(width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  const dense = [];
  const line = (x0, y0, x1, y1) => {
    const n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0)));
    for (let i = 0; i < n; i += 1) dense.push([x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n]);
  };
  const arc = (cx, cy, from) => {
    for (let i = 0; i < 24; i += 1) {
      const a = from + (Math.PI / 2) * (i / 24);
      dense.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  line(r, 0, width - r, 0);
  arc(width - r, r, -Math.PI / 2);
  line(width, r, width, height - r);
  arc(width - r, height - r, 0);
  line(width - r, height, r, height);
  arc(r, height - r, Math.PI / 2);
  line(0, height - r, 0, r);
  arc(r, r, Math.PI);
  const perimeter = 2 * (width + height) - (8 - 2 * Math.PI) * r;
  return resample(dense, Math.max(24, Math.round(perimeter / 12)));
}

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

/**
 * Everything the jelly needs about one rest shape: its viewBox size, the
 * rest points, the unit vector pointing into the shape at each (the
 * outline runs clockwise on screen, y down, so rotating the tangent by +90°
 * points inwards), the rest path and the feel.
 */
function outline(width, height, rest, feel) {
  const inward = rest.map((_, i) => {
    const [a, b] = [at(rest, i - 1), at(rest, i + 1)];
    const [tx, ty] = [b[0] - a[0], b[1] - a[1]];
    const len = Math.hypot(tx, ty);
    return [-ty / len, tx / len];
  });
  return { width, height, rest, inward, path: toPath(rest), feel };
}

/** The Upcoming Events outline (fixed; stretched to its box). */
export const EVENTS_OUTLINE = outline(SHAPE.width, SHAPE.height, superellipse(), JELLY);

/** The flat bar's outline for a box of width × height px. */
export const roundedRect = (width, height) =>
  outline(width, height, roundedRectPoints(width, height, FLAT_CORNER), JELLY_FLAT);

/** Below this (in units / units per frame) a point counts as settled. */
const SETTLED = 0.02;

/**
 * Runs the jelly for `shape` (an outline from above) on `path`. Pointer and
 * touch input are read on `area`; `box` is the blob's box, used to map
 * screen pixels to viewBox units. The
 * animation frame loop only runs while the pointer is near the edge or the
 * outline is still wobbling back — idle, it stops. Returns a cleanup.
 */
export function attachJelly({ path, box, area, shape }) {
  const { rest: REST, inward: INWARD, path: REST_PATH, feel } = shape;
  const offset = REST.map(() => [0, 0]); // displacement from rest
  const velocity = REST.map(() => [0, 0]);
  let pointer = null; // [x, y] in viewBox units, or null
  let frame = 0;
  let last = 0;

  const toView = (clientX, clientY) => {
    // Per axis: the SVG is stretched to its box (preserveAspectRatio="none").
    const rect = box.getBoundingClientRect();
    return [
      ((clientX - rect.left) * shape.width) / rect.width,
      ((clientY - rect.top) * shape.height) / rect.height,
    ];
  };

  const step = (now) => {
    // Frame-rate independent: `f` is the elapsed time in 60 fps frames.
    const f = last ? Math.min(3, (now - last) / (1000 / 60)) : 1;
    last = now;
    const keep = feel.damping ** f;
    const before = offset.map(([x, y]) => [x, y]);
    let active = false;

    for (let i = 0; i < REST.length; i += 1) {
      // Where the pointer wants this point: pushed into the shape, so the
      // edge backs away from the pointer whichever side it comes from.
      let tx = 0;
      let ty = 0;
      if (pointer) {
        const dist = Math.hypot(REST[i][0] - pointer[0], REST[i][1] - pointer[1]);
        if (dist < feel.radius) {
          const strength = feel.push * (1 - dist / feel.radius) ** 2;
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
          feel.stiffness * (target - before[i][k]) +
          feel.coupling * (prev[k] + next[k] - 2 * before[i][k]);
        velocity[i][k] = (velocity[i][k] + accel * f) * keep;
        offset[i][k] = before[i][k] + velocity[i][k] * f;
      }

      const size = Math.hypot(offset[i][0], offset[i][1]);
      if (size > feel.maxDent) {
        offset[i][0] *= feel.maxDent / size;
        offset[i][1] *= feel.maxDent / size;
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

/** Hook form of attachJelly, active while `enabled` and `shape` is set. */
export function useJelly({ pathRef, boxRef, areaRef, shape, enabled }) {
  useEffect(() => {
    const path = pathRef.current;
    const box = boxRef.current;
    const area = areaRef.current;
    if (!enabled || !shape || !path || !box || !area) return undefined;
    return attachJelly({ path, box, area, shape });
  }, [pathRef, boxRef, areaRef, shape, enabled]);
}
