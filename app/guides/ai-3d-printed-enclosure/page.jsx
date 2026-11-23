import Link from 'next/link';
import GuidePage, { guideMetadata } from '../../../components/GuidePage';

// Guide "3D printed enclosure with AI": what to prepare, the steps with SOMA AI (a coding agent as the alternative),
// an example prompt, FDM guide values, checks before printing, the sensor enclosure example (images from the viewer
// of the site). Guide values are starting points, not a promise. Change the date when the content changes (it is in
// the structured data and the sitemap).
const GUIDE = {
  path: '/guides/ai-3d-printed-enclosure/',
  title: 'Design a 3D printed enclosure with AI',
  heading: 'How to design a 3D printed enclosure with AI',
  description: 'Let AI design a 3D printed case around your circuit board: what to prepare, an example prompt, rules for walls, overhangs, clearances and screws, and checks.',
  published: '2026-11-03',
  modified: '2026-11-23',
  image: { src: '/images/guides/enclosure-explode.webp', width: 660, height: 650, alt: 'Exploded view of a 3D printed sensor enclosure designed with AI' },
  about: ['3D printing', 'Electronics enclosure', 'Computer-aided design', 'Artificial intelligence'],
};

export const metadata = guideMetadata(GUIDE);

// Standardwerte des Skills „3D printing (FDM)“ (app/resources/skills/3d-printing.md im SOMA-Repo). Bei Änderungen
// am Skill hier nachziehen.
const SETTINGS = [
  ['Material', 'PLA', 'PLA, PETG, ABS, ASA or TPU. The skill adjusts clearances and walls to it.'],
  ['Nozzle and layer height', '0.4 mm, 0.2 mm', 'Walls are planned as multiples of the nozzle width.'],
  ['Build volume', '220 × 220 × 250 mm', 'Larger parts are split, with pins or a lap joint.'],
  ['Max. overhang without support', '45°', 'Steeper faces are avoided, or the agent says where support is needed.'],
  ['Max. bridge without support', '10 mm', 'Longer flat ceilings get a different shape or support.'],
  ['Minimum wall', '1.2 mm', 'More where the part carries load or holds screws.'],
  ['Clearance per side for sliding fits', '0.3 mm', 'For lids and parts that slide or turn. PETG gets 0.1 mm more.'],
];

const RULES = [
  'Printed holes come out 0.1 to 0.2 mm small, so screw holes are modeled 0.2 mm larger.',
  'No printed metric threads below M6: heat-set inserts (for M3 a 4.0 mm hole, makers differ) or self-tapping screws (2.5 mm hole).',
  'Screw bosses at least 2.5 times the hole diameter, joined to a wall or ribs.',
  'Horizontal holes get a pointed (teardrop) or flat top instead of sagging.',
  'Edges on the bed get a small chamfer instead of a fillet.',
  'No gap narrower than 0.5 mm, no pin thinner than 2 mm, letters at least 5 mm tall.',
  'The largest flat face goes on the bed, and loads run along the layers, not across them.',
];

const FAQ = [
  {
    q: 'Can AI design a case for my circuit board?',
    a: 'Yes. Give the AI the board size, hole pattern and the positions of the connectors, ideally as a STEP file of the board. An AI agent such as SOMA AI places the board as a reference and models the case around it, with standoffs, cutouts and a lid. Check the connector cutouts and the fit before you print.',
  },
  {
    q: 'How do I get the connector positions right?',
    a: 'The best source is a STEP model of the board from the manufacturer, imported as a reference part. For parts without one, a datasheet with a dimensioned drawing is enough for a simple stand-in. Without either, measure the board with calipers and give the positions from one corner. Cut the model open at each connector to see if the opening lines up.',
  },
  {
    q: 'Which filament is best for electronics enclosures?',
    a: 'PLA is easy to print but gets soft above about 55 °C, which a closed case in the sun or next to warm electronics can reach. PETG or ASA hold up to more heat. Tell the AI the material, or set it in the 3D printing skill: it affects wall thickness, clearances and how screws hold.',
  },
  {
    q: 'Can AI design snap-fit lids?',
    a: 'Yes, but snap fits depend heavily on the material and the printer. Screws or heat-set inserts are more forgiving for a first version. If you want a snap fit, ask for the hook as a parameter and print a test piece.',
  },
  {
    q: 'Should I export STL or 3MF?',
    a: 'Both work in common slicers. 3MF keeps units and several parts in one file, STL is supported everywhere. Export each printed part as its own file so you can orient and slice them separately. In SOMA, exporting all parts gives one file per printed part and leaves the board and other reference parts out.',
  },
  {
    q: 'What do I need to do this with SOMA?',
    a: 'SOMA itself is free and open source and runs on Windows, macOS and Linux. SOMA AI, the agent built into it, needs your own ChatGPT Plus or Pro plan or an API key from Anthropic, OpenAI, Google Gemini, OpenRouter or OpenCode. If you already use Claude Code, Codex CLI, OpenCode or Gemini CLI, you can run it in SOMA instead.',
  },
];

export default function EnclosureGuide() {
  return <GuidePage {...GUIDE} faq={FAQ} answer={<>
    An AI agent can design a printable enclosure around your electronics in an afternoon: standoffs, connector cutouts,
    vents and a lid that screws on. The result is only as good as the information you give it, so most of the work is
    preparing the dimensions and checking the fit before the first print.
  </>}>
    <nav className="guide-toc" aria-label="On this page">
      <ol>
        <li><a href="#prepare">What to prepare</a></li>
        <li><a href="#step-by-step">Step by step</a></li>
        <li><a href="#prompt">An example prompt</a></li>
        <li><a href="#rules">Rules of thumb for FDM printing</a></li>
        <li><a href="#check">Check before you print</a></li>
        <li><a href="#example">Example: a sensor logger enclosure</a></li>
        <li><a href="#questions">Questions</a></li>
      </ol>
    </nav>

    <h2 id="prepare">What to prepare</h2>
    <ul>
      <li><strong>The board.</strong> Outline, thickness, mounting holes and their spacing. A STEP model from the manufacturer is best, often on the product page under Resources or Downloads: the AI can place the case around the real geometry, including connectors and tall parts.</li>
      <li><strong>Everything else inside.</strong> Battery, display, buttons, sockets, speaker, cables. Size and where they go. For a part without a 3D file, its datasheet with a dimensioned drawing.</li>
      <li><strong>What must be reachable.</strong> USB ports, SD card, buttons, LEDs, cable glands, and from which side.</li>
      <li><strong>How it closes.</strong> Screws from below, heat-set inserts, a sliding lid or snap fits.</li>
      <li><strong>Printer and material.</strong> Nozzle size, PLA, PETG or ASA, and how much clearance your printer needs for parts that fit into each other.</li>
    </ul>

    <h2 id="step-by-step">Step by step</h2>
    <p>
      The steps use <Link href="/">SOMA</Link> and its built-in agent SOMA AI. The guide{' '}
      <Link href="/guides/case-for-electronics/">how to design a case for your electronics</Link> shows the same way in a
      video, with a smart speaker around a real board&apos;s STEP file. The general approach is
      in <Link href="/guides/ai-cad/">how to use AI for CAD</Link>.
    </p>
    <ol>
      <li><strong>Start a new model and import the parts.</strong> Click Import at the top and add the STEP file of the board and, for parts without one, their datasheet. They go into the model&apos;s inputs folder, where SOMA AI can use them. Click a STEP file in Files to look at it in the 3D view.</li>
      <li><strong>Set the 3D printing skill to your printer.</strong> Open Skills in the sidebar, click 3D printing, set it to Always for this model and enter your material, nozzle and build volume (see the rules below).</li>
      <li><strong>Let SOMA AI place the parts.</strong> Open the SOMA AI tab; the first time it asks for a sign-in with your ChatGPT plan or an API key. Ask it first only to bring the board and the other parts into the model as reference parts: they are shown see-through to design around, and never exported for printing.</li>
      <li><strong>Describe the enclosure</strong> with the dimensions from your preparation, see the example below, and let it ask about anything that is unclear. Click your answers and send them. SOMA AI then builds the case step by step and checks pictures of its own result.</li>
      <li><strong>Check the first version from all sides.</strong> Is every connector reachable? Does the lid cover what it should? Point at problems by clicking a part, or click Mark up, draw on the view and send it to SOMA AI.</li>
      <li><strong>Cut it open.</strong> A section through each connector shows whether the opening lines up and whether the board sits on its standoffs.</li>
      <li><strong>Explode it.</strong> Pulling the parts apart shows the assembly order: can you put the board in, then the lid, then the screws?</li>
      <li><strong>Check for printing.</strong> Ask SOMA AI to check overhangs and wall thickness. It uses the values of the 3D printing skill, and the Analysis tab shows the problem areas in color. Fix them before slicing.</li>
      <li><strong>Fine-tune with sliders.</strong> Sizes you asked for as parameters, such as wall thickness or clearance, are in the Parameters tab. Drag a slider and the model rebuilds, without the AI.</li>
      <li><strong>Export each printed part</strong> as 3MF or STL: Export, All parts, then the format. The board and other reference parts stay out. Print a test piece of the tightest area first, for example just the wall with the connectors.</li>
    </ol>
    <figure>
      <img src="/images/guides/case-for-electronics/section-view-fit-check.webp" alt="Section through a round smart speaker case: the board under the top with the light ring, the speaker behind the grille, and the Section panel at the bottom left" width="1280" height="720" loading="lazy"/>
      <figcaption>A section view of the smart speaker case from the video guide: the board sits right under the top, the speaker right behind its grille.</figcaption>
    </figure>
    <p>
      Already use a coding agent such as Claude Code, Codex CLI, OpenCode or Gemini CLI? Click the + above the chat and
      start it in a terminal next to SOMA AI. The steps stay the same, it works on the same model and the same history.
    </p>

    <h2 id="prompt">An example prompt</h2>
    <blockquote>
      <p>
        A two-part enclosure for a Raspberry Pi 5 with its active cooler, printed in PETG with a 0.4 mm nozzle.
        2 mm walls, 0.4 mm clearance around the board. The board sits on four standoffs for M2.5 screws in its
        58 × 49 mm hole pattern. Openings for all ports on the board edges and for the microSD card. Vents in the lid
        above the cooler. The lid is held by four M3 screws into heat-set inserts in the base. Use the board&apos;s STEP
        file in inputs as a reference part. Make wall thickness, clearance and lid height parameters. Ask me about
        anything that is unclear before you start.
      </p>
    </blockquote>
    <p>
      Every sentence answers a question the AI would otherwise have to guess, and the last one lets it ask instead of
      guess. Requirements that should stay, such as the material or the screw type, go into the model&apos;s notes file,
      which the agent reads first. A photo of a hand sketch with measurements helps too: add it to the chat with the clip
      button.
    </p>

    <h2 id="rules">Rules of thumb for FDM printing</h2>
    <p>
      You do not have to type these into every prompt. SOMA gives the agent <strong>skills</strong>: sets of
      instructions for a topic, such as 3D printing, CNC or tolerances. Each skill is Off, On demand (the agent reads it
      when the topic comes up) or Always. The 3D printing skill brings these default settings:
    </p>
    <div className="guide-table">
      <table>
        <thead><tr><th>Setting</th><th>Default</th><th>What it does</th></tr></thead>
        <tbody>{SETTINGS.map(([f, v, why]) => <tr key={f}><th scope="row">{f}</th><td>{v}</td><td>{why}</td></tr>)}</tbody>
      </table>
    </div>
    <p>There are three ways to adapt them to your printer:</p>
    <ul>
      <li><strong>In the Skills panel</strong> in the sidebar: click 3D printing and change material, nozzle, build volume, overhang, bridge, wall or clearance. The values are saved with the model.</li>
      <li><strong>In the chat:</strong> &ldquo;my printer handles 55° overhangs&rdquo; or &ldquo;use 0.2 mm clearance&rdquo;. What you tell SOMA AI, or write in the model&apos;s notes file, takes precedence over the settings. The example prompt above does that with 2 mm walls and 0.4 mm clearance.</li>
      <li><strong>In the skill itself:</strong> under Settings, Skills you can edit the text of a built-in skill or write your own, for example with the hole sizes of the heat-set inserts you buy.</li>
    </ul>
    <p>Beyond the settings, the skill tells the agent rules like these:</p>
    <ul>{RULES.map(r => <li key={r}>{r}</li>)}</ul>
    <p>
      When the agent runs SOMA&apos;s printing check, it uses the same values: faces steeper than the overhang angle and
      walls thinner than the minimum show up in color. Values that come from your printer are worth one test print, for example a small lid
      and box to find the clearance that fits.
    </p>

    <h2 id="check">Check before you print</h2>
    <ul>
      <li><strong>Measure</strong> the distances that matter: board to wall, connector to opening, screw holes to their counterparts.</li>
      <li><strong>Section</strong> through every connector and every screw.</li>
      <li><strong>Explode</strong> the assembly and go through the order in which you put it together.</li>
      <li><strong>Collisions:</strong> nothing should overlap in the closed state, especially tall parts on the board and the lid.</li>
      <li><strong>Test print</strong> the critical part before the full enclosure. It costs minutes instead of hours.</li>
    </ul>

    <h2 id="example">Example: a sensor logger enclosure</h2>
    <p>
      This desk enclosure for a sensor logger with a 2.8&Prime; touch display (ESP32-S3) was designed with an agent in SOMA,
      starting from an existing CadQuery project. It holds the display board, a battery, four GX12 sensor sockets and three
      small boards, and is 152 × 88 × 52 mm.
    </p>
    <figure>
      <img src="/images/guides/enclosure-closed.webp" alt="3D printed sensor enclosure with a slanted display, three buttons in front and sockets at the back" width="660" height="495" loading="lazy"/>
      <figcaption>Display set 2 mm into the slanted front, three button plungers below it, sensor sockets at the back.</figcaption>
    </figure>
    <ul>
      <li><strong>Three printed parts</strong> plus three button plungers: a base with the battery and the sockets, a middle frame that carries the display board and the modules, and a cover.</li>
      <li><strong>Printable without supports:</strong> each part was designed for its orientation on the bed. Ledges inside the base have 45° supports built into the design.</li>
      <li><strong>Details that came from checking:</strong> a guide behind the SD card slot so the card cannot fall into the case, a recess to grip the card, and the USB-C port left free for charging.</li>
    </ul>
    <figure>
      <img src="/images/guides/enclosure-explode.webp" alt="Exploded view of the enclosure: cover, display board, middle frame with modules, base with buttons and screws" width="660" height="650" loading="lazy"/>
      <figcaption>The exploded view shows the assembly order: base, middle frame with the electronics, cover, screws from below.</figcaption>
    </figure>
    <p>
      You can turn it, cut it open and explode it yourself on the <Link href="/models/#model-multisens">models page</Link>.
      For a second example with a video, from the board&apos;s STEP file to 3MF files, see the{' '}
      <Link href="/guides/case-for-electronics/">smart speaker case</Link>.
    </p>
  </GuidePage>;
}
