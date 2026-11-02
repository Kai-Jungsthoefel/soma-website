import { llmsFullTxt } from '../../lib/llms';

// Alles für KI-Assistenten in einer Datei: Übersicht, Funktionen, Modelle, Fragen und die ganze Anleitung
export const dynamic = 'force-static';

export function GET() {
  return new Response(llmsFullTxt(), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
