// Next to every download button: SOMA is free, but SOMA AI needs an AI plan or key of your own. Without this, people
// downloaded SOMA and only found out in the app that they need a subscription (wish of the maintainer, 2026-11-18).
// OpenCode Go is the cheapest start; its price is the provider's (checked 2026-11-18), keep it in sync.
import { KeyRound } from 'lucide-react';

export const OPENCODE_GO = { url: 'https://opencode.ai/go', price: '$10 a month' };

export default function AiNeeded({ compact = false }) {
  return <aside className={compact ? 'ai-needed compact' : 'ai-needed'} aria-label="What you need for SOMA AI">
    <KeyRound size={18} strokeWidth={1.8}/>
    <p>
      <strong>SOMA is free. SOMA AI needs an AI plan of your own:</strong> a ChatGPT Plus or Pro subscription, or an API key from
      Anthropic, OpenAI, Google and others. The cheapest way to start is <a href={OPENCODE_GO.url}>OpenCode Go</a> for
      about {OPENCODE_GO.price}.
    </p>
  </aside>;
}
