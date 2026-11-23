// Guides as cards with the cover of their video (home page and /guides/). Server component: GUIDES reads files.
import Link from 'next/link';
import { Play } from 'lucide-react';

// wide: four in a row (home page, eight guides in two full rows)
export default function GuideCards({ guides, wide = false }) {
  return <div className={wide ? 'guide-cards guide-cards-wide' : 'guide-cards'}>
    {guides.map(g => <Link key={g.path} href={g.path} prefetch={false} className="guide-card">
      {g.cover && <span className="guide-card-cover">
        <img src={g.cover} alt="" width="1280" height="720" loading="lazy"/>
        {g.duration && <span className="guide-card-time"><Play size={12}/> {g.duration}</span>}
      </span>}
      <span className="guide-card-text">
        <strong>{g.title}</strong>
        <span>{g.summary}</span>
      </span>
    </Link>)}
  </div>;
}
