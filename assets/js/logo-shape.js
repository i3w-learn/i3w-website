// Platonic-ideal I3W mark — pure geometric construction, not a scan trace.
// All strokes are either straight diagonals or true circular arcs; the top
// and bottom edges are level planes (y = +0.468 / -0.468). Three arcs:
//   1. notch left wall  — gentle outward curve, fit to the real boundary
//   2. upper-left brand curve — the "sweeping" descending arc
//   3. bottom brand curve      — the ascending arc under the W
// Every arc endpoint is snapped to center+radius so line/arc joins are
// seamless. Coordinates centered, Y-up, longest side ~2.
export function buildLogoShapes(THREE){
  const s = new THREE.Shape();
  const T = 0.468, B = -0.468;           // level top / bottom planes

  s.moveTo(1.0000, T);                   // top-right corner
  s.lineTo(0.4943, T);                   // top edge (level)
  // notch: right wall (straight) down to the arc start, then the left-wall arc
  s.lineTo(0.3106, 0.1368);              // notch bottom (arc 1 start)
  s.absarc(-0.8021, 0.5027, 1.1713, -0.3177, -0.0296, false);  // arc 1: notch left wall (outward)
  s.lineTo(-0.1153, T);                  // top edge (level)
  // arc 2: upper-left brand curve (descending sweep)
  s.absarc(-0.5590, 0.4363, 0.4448, 0.0713, -1.5234, true);
  s.lineTo(-0.5474, T);                  // back up to the level top
  s.lineTo(-1.0000, T);                  // top-left corner (level)
  s.lineTo(-0.9949, -0.0101);            // left edge of the I stem
  s.lineTo(-0.5530, -0.0139);
  s.lineTo(-0.5449, B);                  // bottom of the I stem (level)
  // arc 3: bottom brand curve (ascending under the W), re-fit to reach y=B
  s.absarc(-0.5764, 0.5063, 0.9748, -1.5385, -0.6545, false);
  s.lineTo(0.0126, B);                   // bottom edge (level)
  s.lineTo(0.5530, B);                   // bottom edge (level) / W right leg foot
  s.closePath();                         // W right leg: one clean diagonal to (1.0000, T)
  return [s];
}
