import Link from 'next/link';
import GuidePage, { guideMetadata } from '../../../components/GuidePage';
import YouTubeVideo from '../../../components/YouTubeVideo';

// Guide "How to use AI for CAD": for people who do not know SOMA yet and search the topic in general. First a fair
// overview of the ways, then the way with SOMA step by step: SOMA AI first (since 1.0), a coding agent such as Claude
// Code as the alternative. No claims about other products, only about kinds of tools. Change the date when the content
// changes (it is in the structured data and the sitemap).
const GUIDE = {
  path: '/guides/ai-cad/',
  title: 'How to use AI for CAD',
  heading: 'How to use AI for CAD',
  description: 'What AI can and cannot do in CAD today, the ways to use it compared, and step by step how to design a part with an AI agent: prompts, checks, STL and STEP.',
  published: '2026-11-03',
  modified: '2026-11-23',
  image: { src: '/images/features/markup.png', width: 1600, height: 921, alt: 'Marking up a 3D model for the AI agent in SOMA' },
  about: ['Computer-aided design', 'Artificial intelligence', 'CadQuery', '3D printing'],
};

export const metadata = guideMetadata(GUIDE);

const APPROACHES = [
  {
    name: 'Text-to-CAD services',
    what: 'You type a description, the service generates a model.',
    good: 'Quick first shapes and simple parts without installing anything.',
    watch: 'Little control over details; check how you can edit the result and in which formats you get it.',
  },
  {
    name: 'A chatbot writes CAD code',
    what: 'ChatGPT, Claude or Gemini write a script for OpenSCAD, CadQuery or build123d, which you run yourself.',
    good: 'Cheap or included in a plan you have, precise dimensions, the code is editable.',
    watch: 'The chatbot cannot see the result. You copy code back and forth and describe every error yourself.',
  },
  {
    name: 'AI inside a CAD program',
    what: 'Assistants and generative design in classic CAD programs.',
    good: 'If you already work in that program: help with commands, optimized shapes for given loads.',
    watch: 'You still model yourself; the AI helps, it does not design the part from a description.',
  },
  {
    name: 'An AI agent in a CAD app',
    what: 'An agent writes the model as code, builds it, looks at the result and fixes it, while you watch the model in 3D and point at changes.',
    good: 'Complete parts and assemblies from a description or a sketch, refined in conversation, exact geometry, STEP export.',
    watch: 'Needs an AI plan or API key; you still check dimensions and fit.',
  },
];

const FAQ = [
  {
    q: 'Can ChatGPT make CAD models?',
    a: 'Yes, indirectly. Chatbots like ChatGPT, Claude or Gemini can write code for code-based CAD such as OpenSCAD or CadQuery, and that code produces the model. The difficulty is that a chatbot cannot see what its code produces. An AI agent in a CAD app closes that gap: it builds the model, checks it, and fixes its own mistakes. In SOMA, its built-in agent SOMA AI can run on a ChatGPT Plus or Pro plan.',
  },
  {
    q: 'Is AI-made CAD accurate enough for 3D printing and CNC?',
    a: 'The geometry is as exact as the numbers in the code: a 3 mm wall is 3 mm. What the AI gets wrong is usually the design, not the precision: a hole in the wrong place, a part that does not fit its neighbor. Measure the important dimensions and print a test piece before a long print.',
  },
  {
    q: 'Do I need to know CAD or programming to use AI for CAD?',
    a: 'No. With an AI agent you describe the part in plain words, add a sketch if you have one, and point at what is wrong. In SOMA, SOMA AI explains what it did in plain words and puts the important sizes on sliders. The code is there if you want to change a number yourself, but you do not have to read it.',
  },
  {
    q: 'What is the best free AI CAD tool?',
    a: 'It depends on what you need. To try the idea, ask a chatbot for an OpenSCAD script and open it in OpenSCAD, which is free. For real parts, an agent in a CAD app saves the copying back and forth. SOMA is free and open source; its built-in agent SOMA AI is not free, it needs your own ChatGPT Plus or Pro plan or an API key from Anthropic, OpenAI, Google Gemini, OpenRouter or OpenCode.',
  },
  {
    q: 'Can I use Claude Code or Codex for CAD?',
    a: 'Yes. A coding agent that runs in a terminal can write CadQuery code as well as any other code. In SOMA, Claude Code, Codex CLI, OpenCode or Gemini CLI run in a terminal next to the 3D view, on the same model as SOMA AI, with your own subscription and settings.',
  },
];

export default function AiCadGuide() {
  return <GuidePage {...GUIDE} faq={FAQ} answer={<>
    AI can design real, dimensioned CAD parts today: cases, brackets, mounts, furniture, even machines with moving parts.
    It works best when the AI writes the model as code, sees the result, and you check and correct it in short steps.
    This guide compares the ways to do that and shows the workflow step by step.
  </>}>
        <nav className="guide-toc" aria-label="On this page">
          <ol>
            <li><a href="#what-works">What AI can and cannot do in CAD</a></li>
            <li><a href="#approaches">Four ways to use AI for CAD</a></li>
            <li><a href="#step-by-step">Step by step: a part with an AI agent</a></li>
            <li><a href="#own-agent">With Claude Code, Codex or another coding agent</a></li>
            <li><a href="#prompts">How to write good CAD prompts</a></li>
            <li><a href="#checking">Check the result</a></li>
            <li><a href="#limits">Limits</a></li>
            <li><a href="#questions">Questions</a></li>
          </ol>
        </nav>

        <h2 id="what-works">What AI can and cannot do in CAD</h2>
        <p>
          Language models do not draw. What they are good at is writing code, and a lot of CAD can be written as code:
          a box of 120 × 80 × 40 mm, a 2 mm wall, four holes for M3 screws 5 mm from each edge. Code-based CAD libraries
          such as <strong>CadQuery</strong> and <strong>build123d</strong> (Python) or <strong>OpenSCAD</strong> turn that
          code into a solid model. Because the model is code, every dimension is exact and every change is a small edit.
        </p>
        <p>AI does well with:</p>
        <ul>
          <li>Mechanical parts made of simple features: plates, boxes, holes, slots, fillets, chamfers, patterns</li>
          <li>Enclosures for electronics, brackets, mounts, adapters, organizers and furniture</li>
          <li>Parametric models: change one value and the whole part follows</li>
          <li>Assemblies with standard parts like screws, bearings and aluminium extrusions</li>
          <li>Reading a hand sketch with measurements, a datasheet or the STEP file of a part it has to fit</li>
          <li>The boring parts: drawings, cutting lists, export in several formats</li>
        </ul>
        <p>
          It struggles with organic, sculpted shapes (figures, ergonomic grips with free-form surfaces), with judging
          what looks good, and with fit it cannot know: how much clearance your printer needs, where the real connector
          on your board sits. That is your part of the job.
        </p>

        <h2 id="approaches">Four ways to use AI for CAD</h2>
        <div className="guide-table">
          <table>
            <thead><tr><th>Approach</th><th>How it works</th><th>Good for</th><th>Watch out for</th></tr></thead>
            <tbody>{APPROACHES.map(a => <tr key={a.name}><th scope="row">{a.name}</th><td>{a.what}</td><td>{a.good}</td><td>{a.watch}</td></tr>)}</tbody>
          </table>
        </div>
        <p>
          The decisive difference is the feedback loop. A human designer looks at the model after every step. An AI that
          only writes code and never sees the result makes the same mistakes again: parts that float in the air, holes on
          the wrong side. The more of the loop the AI can close itself, building, looking, measuring, the better the result.
        </p>

        <h2 id="step-by-step">Step by step: a part with an AI agent</h2>
        <p>
          This is the workflow with <Link href="/">SOMA</Link>, a free, open-source CAD app built for this. Its agent,
          SOMA AI, sits in a chat next to the 3D view. The same ideas apply to any setup where an agent writes CAD code and
          can run it. The guide <Link href="/guides/design-3d-model-with-ai/">how to design a 3D model with AI</Link> shows
          the whole way in a 7 minute video, from installing to export:
        </p>
        <YouTubeVideo/>
        <ol>
          <li><strong>Install SOMA and start a new model.</strong> <Link href="/download/">Download SOMA</Link> for Windows, macOS or Linux. It includes Python, CadQuery and everything needed to build models. Click New model: the 3D view is in the middle, SOMA AI on the right.</li>
          <li><strong>Sign in to SOMA AI.</strong> The first time, it asks for a sign-in: Sign in with ChatGPT uses your ChatGPT Plus or Pro plan, or paste an API key from Anthropic (Claude), OpenAI, Google Gemini, OpenRouter or OpenCode, which the provider bills per use. The sign-in stays on your computer. For the best results the app recommends Opus 5.5 (with an Anthropic API key) or GPT-6.2 Astra (with ChatGPT), with High effort or more.</li>
          <li><strong>Describe the part.</strong> In your own words, with the measurements you know. For example: <em>&ldquo;A bookshelf, 80 cm wide, 180 cm tall and 30 cm deep, from 18 mm plywood. Open shelves at the top, two doors at the bottom. Ask me about anything that is unclear before you start.&rdquo;</em> A photo of a hand sketch with measurements helps: add it with the clip button, or paste it into the chat.</li>
          <li><strong>Answer its questions.</strong> SOMA AI asks about what it cannot guess, all at once, for example how tall the lower cupboard should be. Click an answer or write your own, then Send answers. Then it writes the model, builds it and checks the result itself, and every step shows up in plain words.</li>
          <li><strong>Look and point.</strong> Turn the model, cut it open with Section, measure. When something is wrong, click the part, or click Mark up and draw on the view, and send it to SOMA AI: &ldquo;this hole should be 2 mm further left&rdquo; is clearer with an arrow on it.</li>
          <li><strong>Change sizes with sliders.</strong> Ask for the important sizes as parameters, and they show up in the Parameters tab. Drag a slider and the model rebuilds right away, without the AI.</li>
          <li><strong>Refine in small steps.</strong> One change at a time works better than a long list. Every step lands in the History, so you can go back to any earlier version. Save packs the model with its history into one .soma file.</li>
          <li><strong>Export.</strong> STL or 3MF for the slicer, STEP for other CAD programs, DXF for the laser cutter, or ask for technical drawings as PDF and DXF.</li>
        </ol>
        <figure>
          <img src="/images/features/markup.webp" alt="An arrow and a note drawn on the 3D view, to send to the agent" width="1600" height="921" loading="lazy"/>
          <figcaption>Pointing at the problem: an arrow and a note on the view tell the agent exactly what to change.</figcaption>
        </figure>
        <p>
          A real example: the prompt <em>&ldquo;Design a Scandinavian-style sideboard from 19 mm chipboard, 1800 × 450 × 800 mm,
          with two doors, three drawers and slim wooden legs. Create manufacturing drawings and a cutting list.&rdquo;</em> produced
          the <Link href="/models/">sideboard on the models page</Link>, with hinges, drawer slides, five drawing sheets and a
          cutting list.
        </p>
        <p>
          More worked examples, each with a video: <Link href="/guides/case-for-electronics/">a case around a real circuit board</Link>,{' '}
          <Link href="/guides/edit-stl-file/">editing a downloaded STL file</Link>,{' '}
          <Link href="/guides/sheet-metal-laser-cutting/">sheet metal parts for laser cutting</Link> and{' '}
          <Link href="/guides/ai-furniture-plans/">furniture plans from a sketch</Link>. All of them are in the <Link href="/guides/">guides</Link>.
        </p>

        <h2 id="own-agent">With Claude Code, Codex or another coding agent</h2>
        <p>
          If you already use a coding agent, you can use it instead of SOMA AI. Click the + above the chat and pick your
          agent: Claude Code, Codex CLI, OpenCode or Gemini CLI start in a terminal right next to SOMA AI, in the model&apos;s
          folder, with your own subscription and settings. The agent finds the project rules and knows how to build and
          check the model. Mark up and Send to agent work the same way, and every change lands in the same history.
          Desktop agent apps such as Claude Code in Claude Desktop or the Codex app work too: Copy path for agent app in the
          same menu gives them the model folder.
        </p>

        <h2 id="prompts">How to write good CAD prompts</h2>
        <ul>
          <li><strong>Give numbers and units.</strong> Outer size, wall thickness, hole diameters, screw sizes. &ldquo;Small box&rdquo; leaves the agent guessing.</li>
          <li><strong>Say how it will be made.</strong> 3D printed in PETG, milled from aluminium, cut from 19 mm plywood. The process decides wall thickness, overhangs, radii and tolerances.</li>
          <li><strong>Name the parts it has to fit.</strong> &ldquo;For a Raspberry Pi 5&rdquo;, &ldquo;for a 40 × 40 mm fan&rdquo;, &ldquo;M3 heat-set inserts&rdquo;. If you have a STEP file of the board, import it: the agent can model around the real geometry.</li>
          <li><strong>Show, do not only tell.</strong> A sketch with dimensions, a photo of the old part or a datasheet helps as much as with a human designer.</li>
          <li><strong>Let it ask.</strong> End the first prompt with &ldquo;Ask me about anything that is unclear before you start.&rdquo; SOMA AI then asks its questions at once instead of guessing.</li>
          <li><strong>Ask for parameters.</strong> &ldquo;Make wall thickness and the number of compartments adjustable&rdquo; gives you sliders instead of new prompts.</li>
          <li><strong>Keep the requirements in one place.</strong> Every SOMA model has a notes file that the agent reads first. Decisions written there are not forgotten three prompts later.</li>
          <li><strong>One change per message</strong> once the first version stands. Check it, then the next.</li>
        </ul>

        <h2 id="checking">Check the result</h2>
        <p>
          Trust, but measure. The AI writes exact numbers, but it can put them in the wrong place. Before you print or order
          parts:
        </p>
        <ul>
          <li>Measure the dimensions that matter: hole spacing, inner size, the distance to the connector.</li>
          <li>Cut the model open to see walls, ribs and hidden collisions.</li>
          <li>For printing, check overhangs and thin walls. Ask SOMA AI to analyze both, and SOMA colors the problem areas.</li>
          <li>For load-bearing parts, a quick strength check with finite elements shows where it bends. In SOMA it runs on your own computer with CalculiX.</li>
          <li>Print a small test piece for tight fits before the full part.</li>
        </ul>

        <p>
          Designing a case for electronics? See <Link href="/guides/ai-3d-printed-enclosure/">how to design a 3D printed enclosure with AI</Link>,
          with an example prompt and rules of thumb for printing.
        </p>

        <h2 id="limits">Limits</h2>
        <ul>
          <li><strong>Free-form shapes:</strong> code-based CAD is made for mechanical parts. For sculpted shapes, a mesh or surface modeling tool is the better choice.</li>
          <li><strong>Very large assemblies</strong> take longer to build and to discuss. Split them into modules and work on one at a time.</li>
          <li><strong>Responsibility:</strong> for parts where failure is dangerous, the AI&apos;s design is a draft that an engineer checks, like any other draft.</li>
          <li><strong>Time and cost:</strong> the AI runs on your plan or API credits. In the videos, a bookshelf took SOMA AI under 4 minutes, a smart speaker case around a real board about 39 minutes.</li>
        </ul>
  </GuidePage>;
}
