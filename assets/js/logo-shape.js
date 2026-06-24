// Platonic-ideal I3W mark — hand-reconstructed from the brand geometry, NOT a
// scan trace. 21 clean vertices, straight diagonal strokes, three true circular
// arcs: the two brand "sweeping curves" plus the notch's left wall (a gentle
// outward arc fit to the real boundary, replacing a straight segment).
// Replaces the noisy cv2 point trace so the extruded 3D mark has smooth arcs
// and zero scan artefacts.
//
// Returns THREE.Shape[] (factory takes the THREE module). Coordinates are
// centered, Y-up, longest side ~2 — same space as the old LOGO_SHAPES.
export function buildLogoShapes(THREE){
  const s = new THREE.Shape();
  s.moveTo(1.0000, 0.4678);
  s.lineTo(0.4943, 0.4703);
  // notch left wall: true arc fit to the real boundary (center left of wall,
  // r=1.1713) — bulges gently outward into the notch. Endpoints snapped to
  // center+radius so the right-wall line and the following segment join seamless.
  s.lineTo(0.3106, 0.1368);
  s.absarc(-0.8021,0.5027,1.1713,-0.3177,-0.0336,false);
  s.lineTo(-0.1151, 0.4650);
  s.absarc(-0.5590,0.4363,0.4448,0.0646,-1.5223,true);
  s.lineTo(-0.5474, 0.4652);
  s.lineTo(-1.0000, 0.4602);
  s.lineTo(-0.9949, -0.0101);
  s.lineTo(-0.5525, -0.0152);
  s.lineTo(-0.5449, -0.4641);
  s.absarc(-0.5471,0.4671,0.9312,-1.5685,-0.6719,false);
  s.lineTo(0.0139, -0.4703);
  s.lineTo(0.5575, -0.4703);
  s.lineTo(0.9899, 0.4349);
  s.closePath();
  return [s];
}
