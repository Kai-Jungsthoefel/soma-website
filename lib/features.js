// Funktionen von SOMA: als Tabs auf der Startseite (components/FeatureTabs.jsx) und als Text in llms.txt.
// Die Bilder entstehen mit scripts/app-shots.mjs aus der echten App.
export const FEATURES = [
  { id: 'code', title: 'Models as code', image: '/images/features/code.webp', alt: 'Code editor next to the 3D view',
    body: 'Your agent writes the model as Python with CadQuery. SOMA rebuilds it on every change, and the code is always there if you want to change a dimension yourself.' },
  { id: 'markup', title: 'Mark up for the agent', image: '/images/features/markup.webp', alt: 'Arrow and note drawn on the 3D view',
    body: 'Draw arrows, circles and notes on a picture of the view and send it to the agent. Or click a part and send it, so the agent knows exactly what you mean.' },
  { id: 'measure', title: 'Measure', image: '/images/features/measure.webp', alt: 'Measured distance in the 3D view',
    body: 'Click a face or edge for its size, a second one for distance and angle. The values are exact, taken from the CAD geometry, not from the mesh.' },
  { id: 'parameters', title: 'Parameters', image: '/images/features/parameters.webp', alt: 'Parameter panel with sliders',
    body: 'Change the values the agent made adjustable, such as wall thickness or work area, without touching the code. The model rebuilds right away.' },
  { id: 'history', title: 'History', image: '/images/features/history.webp', alt: 'Preview of an earlier version on the timeline',
    body: 'Every step of the agent lands on a timeline. Preview earlier versions and restore the one you want to continue from.' },
  { id: 'explode', title: 'Exploded views', image: '/images/explode.webp', alt: 'Exploded view of a rover',
    body: 'Take an assembly apart with one slider. SOMA works out in which direction each part comes off.' },
  { id: 'animation', title: 'Animation', image: '/images/animation.webp', alt: 'Animation of a Strandbeest with playback bar',
    body: 'Your agent describes motion in Python: joints, gears, camera moves. Play it in the viewer, check for collisions, and render it to video.' },
  { id: 'analysis', title: 'Analysis and FEM', image: '/images/features/fem.webp', alt: 'Stress result on a part',
    body: 'Check overhangs and wall thickness for printing, and strength with finite elements using CalculiX. Results are shown in color on the model.' },
  { id: 'drawings', title: 'Drawings and export', image: '/images/drawing.webp', alt: 'Technical drawing next to the 3D model',
    body: 'Technical drawings with views, sections and dimensions as PDF and DXF. Export STEP, STL, 3MF and more, or the whole model as a plain CadQuery script.' },
];
