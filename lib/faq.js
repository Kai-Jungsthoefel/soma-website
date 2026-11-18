// Häufige Fragen: auf der Startseite, als FAQPage in den strukturierten Daten und in llms.txt. Die Fragen sind so
// formuliert, wie Leute bei Suchmaschinen und KI-Assistenten fragen; jede Antwort steht für sich allein, weil sie
// einzeln zitiert wird. Nur reiner Text, keine Links (die strukturierten Daten brauchen ihn so).
// The first questions are those of people new to CAD and AI (website overhaul for 1.0), the technical ones follow.
export const FAQ = [
  {
    q: 'What is SOMA?',
    a: 'SOMA (Solid Object Modeling with Agents) is a free, open-source desktop CAD app in which AI does the CAD. '
      + 'You describe a part in your own words, with a sketch or a photo if you like, and SOMA AI, the agent built into SOMA, designs it as a precise, parametric 3D model. '
      + 'SOMA shows it in 3D, lets you measure and mark it up, and exports STL, 3MF, STEP, DXF and technical drawings.',
  },
  {
    q: 'Do I need to know CAD or programming to use SOMA?',
    a: 'No. You describe what you need in a chat and point at what to change, for example by drawing on the 3D view or moving a slider. '
      + 'SOMA AI writes and fixes the model and explains what it did in plain words. The model is code underneath, but you never have to read it.',
  },
  {
    q: 'What is SOMA AI?',
    a: 'SOMA AI is the AI agent built into SOMA. It works in a chat next to the 3D view: it designs and changes the model, builds and checks it, and asks you when it needs a decision. '
      + 'It thinks with an AI model from a provider of your choice: sign in with a ChatGPT Plus or Pro plan, or use an API key from Anthropic (Claude), OpenAI, Google Gemini, OpenRouter or OpenCode. '
      + 'It works in the model\'s folder and asks before it touches other files, downloads or installs anything.',
  },
  {
    q: 'Is SOMA free?',
    a: 'SOMA itself is free and open source under the GPL-3.0. SOMA AI, the built-in agent, needs an AI plan or key of your own: a ChatGPT Plus or Pro subscription, '
      + 'or an API key from Anthropic, OpenAI, Google Gemini, OpenRouter or OpenCode, which the provider bills per use. The cheapest way to start is an OpenCode Go subscription for about $10 a month. '
      + 'An additional permission, the SOMA Model Exception, makes sure that the models you design and the files you export belong to you, '
      + 'including for commercial use.',
  },
  {
    q: 'What can I make with SOMA?',
    a: 'Mostly physical, mechanical things: cases and enclosures for electronics, brackets, mounts, spare parts, furniture with cut lists, sheet metal parts for laser cutting, '
      + 'machines and mechanisms with moving parts, even rooms and whole flats. SOMA has instructions for 3D printing, CNC, laser cutting, sheet metal and standard parts such as screws and nuts, '
      + 'checks parts for printing, computes strength with finite elements (CalculiX), animates mechanisms and makes technical drawings.',
  },
  {
    q: 'Can I 3D print what I design with SOMA?',
    a: 'Yes. SOMA exports STL and 3MF for any slicer, checks overhangs and wall thickness, and SOMA AI follows printing rules for walls, clearances and screw holes when you say how the part will be made. '
      + 'Measure the important dimensions and print a small test piece before a long print.',
  },
  {
    q: 'Can I edit an STL file with SOMA?',
    a: 'Yes, by rebuilding it. An STL is only a mesh of triangles, so SOMA AI uses it as a see-through reference and rebuilds the part as a real CAD model with adjustable sizes. '
      + 'Then you change it with sliders or in words and export a new STL or 3MF. The new part is a new model, not the old mesh.',
  },
  {
    q: 'Can I use Claude Code, Codex or another AI agent instead of SOMA AI?',
    a: 'Yes. Any agent that runs in a terminal and can read files and run commands works in SOMA\'s built-in terminal, for example Claude Code, Codex CLI, OpenCode or Gemini CLI, '
      + 'with your own subscription and settings. Desktop agent apps such as Claude Desktop or the Codex app can work on the model too: SOMA copies the model\'s path for them and keeps showing what they change.',
  },
  {
    q: 'Is SOMA an open-source alternative to text-to-CAD tools like Zoo?',
    a: 'SOMA is an open-source way to do text-to-CAD. It runs on your own computer, and the result is a parametric model with exact solid geometry that exports to STEP. '
      + 'You change it in conversation, by adjusting parameters, or by editing the code yourself, and it stays in a folder of yours.',
  },
  {
    q: 'How is SOMA different from OpenSCAD?',
    a: 'Both describe models as code. SOMA uses CadQuery, which is built on the OpenCascade kernel: models are exact solids with real faces and edges, '
      + 'so you get fillets, chamfers, accurate measurements and STEP export for other CAD programs. And in SOMA you usually do not write the code yourself, the AI does.',
  },
  {
    q: 'Which file formats can SOMA export?',
    a: 'STL and 3MF for 3D printing, STEP and IGES for other CAD programs, DXF and SVG for 2D and laser cutting, GLB and OBJ for 3D graphics, and technical drawings as PDF and DXF. '
      + 'A model can also be exported as a plain CadQuery script that runs without SOMA, or as a ZIP with code, results and history.',
  },
  {
    q: 'Can I use my existing CadQuery scripts?',
    a: 'Yes. SOMA opens plain CadQuery scripts, including scripts written for CQ-editor (show_object) or VS Code with ocp_vscode, '
      + 'and can work directly in a folder or Git repository of yours.',
  },
  {
    q: 'Which systems does SOMA run on?',
    a: 'Windows 10 or newer (x64), macOS on Apple Silicon, and Linux x64 with glibc 2.31 or newer. Python, CadQuery, Git and CalculiX are included, '
      + 'so there is nothing else to install.',
  },
  {
    q: 'Does SOMA send my models anywhere?',
    a: 'SOMA itself runs on your computer and only checks GitHub for new versions, which can be turned off. '
      + 'SOMA AI, or your own agent, sends what it works on to the AI provider you signed in with, under your account and its terms. Voice input runs entirely on your computer.',
  },
];
