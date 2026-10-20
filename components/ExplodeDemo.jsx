'use client';

// Pi5-Gehäuse mit offener Explosion für „How it works“
import models from '../models/models.json';
import Viewer from './viewer/Viewer';

const model = models.find(m => m.id === 'pi5-case');

export default function ExplodeDemo() {
  return <Viewer model={model} tool="explode" className="viewer-how"/>;
}
