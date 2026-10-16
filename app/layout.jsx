import './globals.css';

export const metadata = {
  title: 'SOMA — Shape ideas into reality',
  description: 'SOMA is an open-source desktop app for designing parametric 3D models with the coding agent of your choice. Describe, inspect, refine, and export.',
  openGraph: {
    title: 'SOMA — Solid Object Modeling with Agents',
    description: 'Go from an idea to a precise, editable 3D model with the agent you already use.',
  },
};

export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
