import Link from 'next/link';
import {ArrowUpRight, Download, MousePointer2, Play, Send, Terminal} from 'lucide-react';
import {Header,Footer} from '../../components/SiteChrome';
import Reveal from '../../components/Reveal';
import VideoStage from '../../components/VideoStage';

export const metadata={title:'How it works — SOMA',description:'Go from a new SOMA model to a printable design in four steps.'};
const steps=[
  {n:'01',icon:Download,title:'Start a new model',body:'Open SOMA and choose New model. You’ll begin with a small example: a box with a lid.'},
  {n:'02',icon:Terminal,title:'Connect your agent',body:'Use the + above the terminal. SOMA shows the compatible CLI agents found on your computer. Choose one you have installed and signed in to.'},
  {n:'03',icon:Send,title:'Describe your idea',body:'Try “A case for a Raspberry Pi 5 with vents in the lid, printed in PETG.” Your agent writes CadQuery; SOMA rebuilds the model as it changes.'},
  {n:'04',icon:MousePointer2,title:'Refine and export',body:'Click a part, measure, or draw on the view. Send the context back to your agent, then export a file such as STL or 3MF.'},
];
export default function Guide(){return <><Header/><main className="subpage guide-page"><section className="page-hero section-wrap"><Reveal><div className="section-kicker"><span>02 / HOW IT WORKS</span><span>FROM IDEA TO OBJECT</span></div><h1>Make it happen,<br/><em>step by step.</em></h1><p>Tell an agent what you need. SOMA gives that idea a shape you can inspect, improve, and make.</p></Reveal></section><section className="section-wrap guide-film"><Reveal><VideoStage compact/></Reveal></section><section className="section-wrap guide-steps"><Reveal className="section-kicker"><span>THE WORKFLOW</span><span>FOUR SIMPLE MOVES</span></Reveal>{steps.map((step,i)=><Reveal className="guide-step" key={step.n}><div className="guide-step-num">{step.n}<span> / 04</span></div><div className="guide-step-icon"><step.icon size={30} strokeWidth={1.5}/></div><div><h2>{step.title}</h2><p>{step.body}</p></div><ArrowUpRight size={23} className="guide-step-arrow"/></Reveal>)}</section><section className="page-end-cta section-wrap"><Reveal><span>READY TO CREATE?</span><h2>Start with<br/><em>an idea.</em></h2><Link href="/download" className="button-primary">Get SOMA <ArrowUpRight size={20}/></Link></Reveal></section></main><Footer/></>}
