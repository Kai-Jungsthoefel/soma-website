import { ArrowRight, CornerDownRight } from 'lucide-react';
import Reveal from './Reveal';

export default function ConceptSection() {
  return <section className="concept-section section-wrap" id="product">
    <div className="concept-kicker"><span>01 / THE WORKFLOW</span><span>FROM AN IDEA TO AN OBJECT</span></div>
    <div className="concept-grid">
      <Reveal className="concept-copy">
        <span className="concept-overline"><i/> BUILT AS YOU THINK</span>
        <h2>Ideas become<br/><em>geometry.</em></h2>
        <p>Describe what you need. Your agent writes the model, and SOMA makes every change visible, precise, and editable.</p>
        <div className="concept-flow" aria-label="Describe, build, refine">
          <span>Describe</span><ArrowRight size={16}/><span>Build</span><ArrowRight size={16}/><span>Refine</span>
        </div>
      </Reveal>
      <Reveal className="concept-visual" delay={0.12}>
        <div className="concept-visual-bar"><span><i/> LIVE MODEL</span><span>PARAMETRIC / 001</span></div>
        <div className="concept-canvas">
          <svg className="concept-drawing" viewBox="0 0 640 400" fill="none" aria-hidden="true">
            <g className="concept-drawing-grid" stroke="currentColor" strokeWidth="1">
              <path d="M52 330H588M52 276H588M52 222H588M52 168H588M52 114H588M106 74V350M160 74V350M214 74V350M268 74V350M322 74V350M376 74V350M430 74V350M484 74V350M538 74V350"/>
            </g>
            <g className="concept-object" strokeLinejoin="round" strokeLinecap="round">
              <path className="concept-face concept-face-top" d="M119 190 317 107 526 192 326 275Z"/>
              <path className="concept-face concept-face-left" d="M119 190 326 275 326 328 119 244Z"/>
              <path className="concept-face concept-face-right" d="M326 275 526 192 526 246 326 328Z"/>
              <path className="concept-cutout" d="M260 190 318 166 380 191 322 216Z"/>
              <path className="concept-cutout-wall" d="M260 190V210L322 236 380 211V191M322 216V236"/>
              <path className="concept-detail" d="M161 208 326 276 483 210M161 226 326 294 483 228"/>
            </g>
            <g className="concept-dimensions" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
              <path d="M116 260 307 341M113 253 120 268M302 334 311 349M344 339 530 262M339 332 347 347M523 255 536 270"/>
              <circle cx="317" cy="107" r="3" fill="currentColor" stroke="none"/>
              <circle cx="526" cy="192" r="3" fill="currentColor" stroke="none"/>
            </g>
            <path className="concept-scan" d="M125 181 317 100 520 183"/>
          </svg>
          <span className="concept-axis concept-axis-x">X <b/> 120.0 MM</span>
          <span className="concept-axis concept-axis-y">Y <b/> 86.0 MM</span>
          <span className="concept-coordinate">X: 120.0&nbsp;&nbsp; Y: 86.0&nbsp;&nbsp; Z: 32.0</span>
        </div>
        <div className="concept-command"><CornerDownRight size={18}/><span>Make a bracket with a recessed mounting slot</span><i/></div>
      </Reveal>
    </div>
  </section>;
}
