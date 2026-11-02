// Häufige Fragen: auf der Startseite, als FAQPage in den strukturierten Daten und in llms.txt. Die Fragen sind so
// formuliert, wie Leute bei Suchmaschinen und KI-Assistenten fragen; jede Antwort steht für sich allein, weil sie
// einzeln zitiert wird. Nur reiner Text, keine Links (die strukturierten Daten brauchen ihn so).
export const FAQ = [
  {
    q: 'What is SOMA?',
    a: 'SOMA (Solid Object Modeling with Agents) is a free, open-source desktop CAD app where your AI coding agent does the CAD. '
      + 'You describe a part, an agent such as Claude Code, Codex CLI, OpenCode or Gemini CLI writes it as a parametric CadQuery model in Python, '
      + 'and SOMA builds it, shows it in 3D and exports STEP, STL and 3MF.',
  },
  {
    q: 'Can Claude Code or Codex design CAD models?',
    a: 'Yes. Coding agents are good at writing CadQuery, a Python library for parametric CAD. What they lack is a way to see the result. '
      + 'SOMA adds that: it rebuilds the model on every change, shows it in a 3D viewer, and gives the agent rules, skills and a command line tool '
      + 'to build, check, measure and export the model. You point at what is wrong and the agent fixes the code.',
  },
  {
    q: 'Does SOMA include its own AI?',
    a: 'No. SOMA works with the CLI agent you already use, such as Claude Code, Codex CLI, OpenCode or Gemini CLI. Any agent that runs in a terminal '
      + 'and can read files and run commands works. You install and sign in to it yourself, so your subscription, model choice and permission settings stay yours.',
  },
  {
    q: 'Can I use SOMA with desktop apps like Claude Desktop or the Codex app?',
    a: 'Yes. Instead of an agent in SOMA\'s terminal you can use a desktop agent app that works on a local folder and can run commands, '
      + 'for example Claude Code in Claude Desktop or the Codex app. Open the model in SOMA, choose Copy path for agent app under the + above the terminal, '
      + 'and open that path as the project folder in the agent app. SOMA keeps building and showing the model while the app\'s agent changes the code. '
      + 'A plain chat without file access and commands does not work.',
  },
  {
    q: 'Is SOMA free?',
    a: 'Yes. SOMA is open source under the GPL-3.0. An additional permission, the SOMA Model Exception, makes sure that the models you design '
      + 'and the files you export belong to you, to use and share on terms of your choice, including commercial and proprietary use.',
  },
  {
    q: 'Is SOMA an open-source alternative to text-to-CAD tools like Zoo?',
    a: 'SOMA is an open-source way to do text-to-CAD. It runs on your own computer, works with the coding agent of your choice, '
      + 'and the result is not a one-off mesh but editable, parametric CadQuery code with exact B-rep geometry that exports to STEP. '
      + 'You can change the model in conversation with the agent, by adjusting parameters, or by editing the code yourself.',
  },
  {
    q: 'How is SOMA different from OpenSCAD?',
    a: 'Both describe models as code. SOMA uses CadQuery, which is built on the OpenCascade kernel: models are exact solids with real faces and edges, '
      + 'so you get fillets, chamfers, accurate measurements and STEP export for other CAD programs. And in SOMA you usually do not write the code yourself, '
      + 'the agent does.',
  },
  {
    q: 'Which file formats can SOMA export?',
    a: 'STL and 3MF for 3D printing, STEP and IGES for other CAD programs, DXF and SVG for 2D and laser cutting, and technical drawings as PDF and DXF. '
      + 'A model can also be exported as a plain CadQuery script that runs without SOMA, or as a ZIP with code, results and history.',
  },
  {
    q: 'Can I use my existing CadQuery scripts?',
    a: 'Yes. SOMA opens plain CadQuery scripts, including scripts written for CQ-editor (show_object) or VS Code with ocp_vscode, '
      + 'and can work directly in a folder or Git repository of yours.',
  },
  {
    q: 'What can I make with SOMA?',
    a: 'Mostly mechanical parts: cases and enclosures for electronics, brackets, mounts, organizers, furniture and machine frames. '
      + 'SOMA has instructions for 3D printing, CNC, sheet metal and standard parts such as screws and nuts, checks parts for printing, '
      + 'computes strength with finite elements (CalculiX), animates mechanisms and makes technical drawings.',
  },
  {
    q: 'Which systems does SOMA run on?',
    a: 'Windows 10 or newer (x64), macOS on Apple Silicon, and Linux x64 with glibc 2.31 or newer. Python, CadQuery, Git and CalculiX are included, '
      + 'so nothing else is needed except a CLI agent.',
  },
  {
    q: 'Does SOMA send my models anywhere?',
    a: 'SOMA itself runs locally and sends nothing by itself; it only checks GitHub for new versions, which can be turned off. '
      + 'Your coding agent sends what it reads to its provider, under your own account and settings.',
  },
];
