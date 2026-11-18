'use client';
// A prompt from a guide, ready to copy into SOMA AI. The text is in the HTML (search engines read it), the button only
// copies it.
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function PromptBox({ text }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* no clipboard: the text can be selected */ }
  };
  return <figure className="prompt">
    <figcaption>Prompt <button type="button" onClick={copy} aria-label="Copy prompt">{done ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy</>}</button></figcaption>
    <blockquote>{text.split('\n').map((line, i) => <p key={i}>{line}</p>)}</blockquote>
  </figure>;
}
