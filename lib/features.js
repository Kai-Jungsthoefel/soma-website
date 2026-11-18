// Funktionen von SOMA: als Tabs auf der Startseite (components/FeatureTabs.jsx) und als Text in llms.txt.
// Die Bilder entstehen mit scripts/app-shots.mjs aus der echten App. Written for people new to CAD: what it does for
// them first, the code at the end.
export const FEATURES = [
  { id: 'markup', title: 'Show what to change', image: '/images/features/markup.webp', alt: 'Arrow and note drawn on the 3D view',
    body: 'Draw arrows, circles and notes on the 3D view and send the picture to SOMA AI. Or click a part and send it, so it knows exactly what you mean.' },
  { id: 'measure', title: 'Measure', image: '/images/features/measure.webp', alt: 'Measured distance in the 3D view',
    body: 'Click a face or edge for its size, a second one for distance and angle. The values are exact, taken from the CAD geometry, not from a mesh.' },
  { id: 'parameters', title: 'Sliders for sizes', image: '/images/features/parameters.webp', alt: 'Parameter panel with sliders',
    body: 'SOMA AI makes the important sizes adjustable, such as width, wall thickness or the number of shelves. Move a slider and the model rebuilds right away.' },
  { id: 'history', title: 'History', image: '/images/features/history.webp', alt: 'Preview of an earlier version on the timeline',
    body: 'Every change lands on a timeline. Preview earlier versions and go back to the one you liked, nothing gets lost.' },
  { id: 'explode', title: 'Exploded views', image: '/images/explode.webp', alt: 'Exploded view of a rover',
    body: 'Take an assembly apart with one slider. SOMA works out in which direction each part comes off.' },
  { id: 'animation', title: 'Animation', image: '/images/animation.webp', alt: 'Animation of a Strandbeest with playback bar',
    body: 'Let mechanisms move: joints, gears, linkages and camera moves. Play them in the viewer, check for collisions, and render a video.' },
  { id: 'analysis', title: 'Strength and printability', image: '/images/features/fem.webp', alt: 'Stress result on a part',
    body: 'Check overhangs and wall thickness for 3D printing, and how much a part holds with a strength analysis (FEM, CalculiX). Results are shown in color on the model.' },
  { id: 'drawings', title: 'Drawings and export', image: '/images/drawing.webp', alt: 'Technical drawing next to the 3D model',
    body: 'Technical drawings with views, sections and dimensions as PDF and DXF. Export STL and 3MF for printing, DXF for laser cutting, STEP for other CAD programs.' },
  { id: 'code', title: 'Real CAD underneath', image: '/images/features/code.webp', alt: 'Code editor next to the 3D view',
    body: 'Behind every model is Python code with CadQuery, exact solid geometry rather than a mesh. You never have to touch it, but it is there: change a number yourself or use the model in other tools.' },
];
