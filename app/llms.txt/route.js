import { llmsTxt } from '../../lib/llms';

// Kurze Übersicht für KI-Assistenten (llmstxt.org), beim Build als statische Datei geschrieben
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
