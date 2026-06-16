import React, { useEffect, useRef } from 'react';
import p5 from 'p5';
import { Nom } from '../types';
import { RefreshCw, Zap } from 'lucide-react';

const THEMES = [
  {
    id: 'defaut',
    name: "Stark Lab Sémantique",
    colors: ['#2563eb', '#16a34a', '#eab308', '#8b5cf6', '#dc2626', '#0d9488', '#292524']
  },
  {
    id: 'mono_rouge',
    name: 'Radical Noir, Blanc, Rouge',
    colors: ['#ff007f', '#ff00ff', '#8b5cf6', '#3b82f6', '#00ffff', '#10b981', '#ffe600']
  },
  {
    id: 'cyber_critique',
    name: 'Oxyde de Fer & Cendre',
    colors: ['#4c1d95', '#6d28d9', '#8b5cf6', '#c084fc', '#f472b6', '#db2777', '#9d174d']
  },
  {
    id: 'stark_contrast',
    name: "Noir Profond & Éminent",
    colors: ['#7c2d12', '#9a3412', '#c2410c', '#ea580c', '#f97316', '#facc15', '#fef08a']
  }
];

interface CalderP5MobileProps {
  noms: Nom[];
  activeThemeId: string;
  onEditNom?: (nom: Nom) => void;
  activeLayerId?: string;
  layers?: any[];
}

interface PhysicalBar {
  propId: string;
  noms: Nom[];
  level: number;
  angleY: number;    // Rotational state
  velY: number;      // Rotational speed
  damping: number;
  mass: number;
  seed: number;
  barWidth: number;
  yDrop: number;     // Vertical distance to next joint
  
  // Track computed layout points for clicks & drags
  centerX?: number;
  centerY?: number;
  centerZ?: number;
  
  // Array of tracked token locations
  tokenCoords: Array<{
    id: string;
    nom: Nom;
    x: number;
    y: number;
    z: number;
    width: number;
    height: number;
    seed: number;
  }>;
}

export function CalderP5Mobile({ noms, activeThemeId, onEditNom, activeLayerId = 'default-layer', layers = [] }: CalderP5MobileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const p5InstanceRef = useRef<p5 | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (p5InstanceRef.current) {
      p5InstanceRef.current.remove();
    }

    const currentTheme = THEMES.find(t => t.id === activeThemeId) || THEMES[0];
    
    // Find the list of unique paragraphs that contain at least one collected token (nom)
    const uniqueParagraphs = Array.from(new Set(noms.map(n => n.propId))).sort((a, b) => {
      const numA = parseFloat(a.replace(/[^\d.]/g, ''));
      const numB = parseFloat(b.replace(/[^\d.]/g, ''));
      if (isNaN(numA)) return 1;
      if (isNaN(numB)) return -1;
      return numA - numB;
    });

    // Detect Active Layer index to modulate shapes
    const activeLayerIndex = Math.max(0, layers.findIndex(l => l.id === activeLayerId));

    // Compile levels: group tokens by paragraph
    let bars: PhysicalBar[] = uniqueParagraphs.map((pid, idx) => {
      const propNoms = noms.filter(n => n.propId === pid);
      const hash = pid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      // Auto-scale sizes depending on density of levels
      const scaleFactor = uniqueParagraphs.length <= 3 
        ? 1.0 
        : uniqueParagraphs.length <= 6 
          ? 0.85 
          : 0.7;

      const barWidth = (100 + propNoms.length * 24) * scaleFactor;
      const yDrop = (50 + Math.min(idx * 8, 30)) * scaleFactor;

      return {
        propId: pid,
        noms: propNoms,
        level: idx,
        angleY: (hash % 360) * (Math.PI / 180),
        velY: 0.003 * (idx % 2 === 0 ? 1 : -1),
        damping: 0.985,
        mass: 2 + propNoms.length * 0.8,
        seed: hash,
        barWidth,
        yDrop,
        tokenCoords: []
      };
    });

    const sketch = (p: p5) => {
      let windX = 0;
      let dragPower = 0;
      let globalRotation = 0;
      let lastDraggedX = 0;
      let lastDraggedY = 0;
      let isDraggingScreen = false;

      p.setup = () => {
        const w = containerRef.current?.getBoundingClientRect().width || 800;
        p.createCanvas(w, 520);
        p.noiseDetail(3, 0.4);
      };

      p.windowResized = () => {
        const w = containerRef.current?.getBoundingClientRect().width || 800;
        p.resizeCanvas(w, 520);
      };

      // Draw the sheet metal abstract plate representing Alexander Calder aesthetics
      const drawCalderShape = (pw: number, ph: number, seed: number, styleSelector: number) => {
        p.beginShape();
        const style = Math.abs(styleSelector);
        
        if (style % 5 === 0) {
          // 🍁 Organic Leaves - Rounded asymmetric lobed leaf
          const steps = 14;
          for (let i = 0; i < steps; i++) {
            const angle = (p.TWO_PI / steps) * i;
            const nVal = p.noise(p.cos(angle) + seed, p.sin(angle) + seed);
            const rBase = ph * 0.45 + (pw - ph) * 0.45 * (p.cos(angle) > 0 ? 1 : 0.35);
            const radius = rBase * (0.85 + 0.3 * nVal);
            let rx = p.cos(angle) * radius * 1.25;
            let ry = p.sin(angle) * radius;
            if (angle > p.HALF_PI && angle < (p.PI * 1.5)) {
              rx *= 1.45; // drag spine tail out long
            }
            p.vertex(rx, ry + ph / 2.5);
          }
        } 
        else if (style % 5 === 1) {
          // 💿 Modernist Pierced Disks with retro cutout centers
          const steps = 30;
          const r = ph * 0.58;
          for (let i = 0; i < steps; i++) {
            const angle = (p.TWO_PI / steps) * i;
            const nVal = p.noise(p.cos(angle) * 1.5 + seed, p.sin(angle) * 1.5 + seed);
            const radius = r * (0.95 + 0.08 * nVal);
            p.vertex(p.cos(angle) * radius, p.sin(angle) * radius + ph / 2.5);
          }
          p.endShape(p.CLOSE);
          
          // Draw center physical rivet hole cutout
          p.push();
          p.fill(245, 243, 238); // canvas background simulation layer
          p.stroke(40, 35, 30);
          p.strokeWeight(1.4);
          p.ellipse(0, ph / 2.5, r * 0.32, r * 0.32);
          p.pop();
          return;
        } 
        else if (style % 5 === 2) {
          // 🔺 Sharp Geometric Wedge/Triangles
          const r = ph * 0.65;
          p.vertex(0, -r + ph / 2.5);
          p.vertex(r * 1.15, r * 0.6 + ph / 2.5);
          p.vertex(-r * 0.9, r * 0.7 + ph / 2.5);
        } 
        else if (style % 5 === 3) {
          // 🌙 Waxing & Waning Crescent Sémantique Moons
          const steps = 18;
          const r = ph * 0.68;
          // Outer arc curves
          for (let i = 0; i <= steps; i++) {
            const angle = p.map(i, 0, steps, -p.HALF_PI - 0.3, p.HALF_PI + 0.3);
            p.vertex(p.cos(angle) * r, p.sin(angle) * r + ph / 2.5);
          }
          // Inner arc scoop
          for (let i = steps; i >= 0; i--) {
            const angle = p.map(i, 0, steps, -p.HALF_PI - 0.3, p.HALF_PI + 0.3);
            p.vertex(p.cos(angle) * r * 0.5 + r * 0.38, p.sin(angle) * r * 0.65 + ph / 2.5);
          }
        } 
        else {
          // ✈️ Aerodynamic Slender Fins / Kinetic Blades
          const steps = 16;
          for (let i = 0; i < steps; i++) {
            const angle = (p.TWO_PI / steps) * i;
            const rx = p.cos(angle) * pw * 0.65;
            const ry = p.sin(angle) * ph * 0.3;
            p.vertex(rx, ry + ph / 2.5);
          }
        }
        
        p.endShape(p.CLOSE);
      };

      p.draw = () => {
        p.clear();

        // 🖼️ Modern Gallery Backlayer Textures
        p.noStroke();
        p.fill(248, 246, 240, 95); 
        p.rect(0, 0, p.width, p.height);

        // Draw structural wire gridlines
        p.stroke(232, 228, 218, 90);
        p.strokeWeight(1);
        p.line(p.width / 2, 0, p.width / 2, p.height);

        // Dynamic mouse force brushing trigger
        let mxForceX = p.mouseX - p.pmouseX;
        let mxForceY = p.mouseY - p.pmouseY;
        let pMouseSpeed = p.sqrt(mxForceX * mxForceX + mxForceY * mxForceY);
        
        if (pMouseSpeed > 1) {
          windX += (mxForceX - windX) * 0.08;
        } else {
          windX += (0 - windX) * 0.03; // return to balance calm
        }

        // Apply global drifting
        globalRotation += 0.0012 + Math.sin(p.frameCount * 0.004) * 0.0004;

        if (bars.length === 0) {
          // Welcome message if no words highlight
          p.fill(150, 140, 130);
          p.noStroke();
          p.textAlign(p.CENTER, p.CENTER);
          p.textFont('serif');
          p.textSize(12.5);
          p.text("Activez l'éditeur et récoltez des mots critiques.", p.width / 2, p.height / 2 - 15);
          p.textSize(10.5);
          p.text("Chaque paragraphe indexera sa propre branche et s'équilibrera en l'air !", p.width / 2, p.height / 2 + 10);
          return;
        }

        p.push();
        // Central Top anchor loop
        p.translate(p.width / 2, 40);
        
        // Rigid ceiling hook line
        p.stroke(65, 60, 55);
        p.strokeWeight(2.5);
        p.line(0, -40, 0, 0);
        p.fill(50, 45, 40);
        p.ellipse(0, 0, 7, 7);

        // Track iterative suspension joint coordinate
        let currentX = 0;
        let currentY = 0;
        let currentZ = 0;

        // Auto balance scaling for dense spines
        const finalScale = bars.length <= 3 
          ? 1.0 
          : bars.length <= 6 
            ? 0.88 
            : 0.72;

        bars.forEach((bar, bIdx) => {
          // Physics step for this level
          bar.angleY += bar.velY;
          bar.velY *= bar.damping;

          // Natural rotation drift
          bar.velY += Math.sin(p.frameCount * 0.008 + bar.seed) * 0.00008;

          // Drag swipe-interaction over the bar line
          const globalJointX = p.width / 2 + currentX;
          const globalJointY = 40 + currentY;
          const dToMouse = p.dist(p.mouseX, p.mouseY, globalJointX, globalJointY);
          
          if (dToMouse < bar.barWidth && p.mouseIsPressed) {
            // Apply spin force based on touch interaction directions
            const swipeForce = (p.mouseX - p.pmouseX) * 0.0003;
            bar.velY += swipeForce;
          }

          // Compute balance arm skew sizes: asymmetrical Calder proportions
          const leftArm = bar.barWidth * 0.58;
          const rightArm = bar.barWidth * 0.42;

          // Total combined yaw rotation on this level
          const curYaw = bar.angleY + globalRotation;

          // Project balance bar coordinates in pseudo-3D
          const leftEndX = -leftArm * p.cos(curYaw);
          const leftEndZ = -leftArm * p.sin(curYaw) * 0.35;
          const rightEndX = rightArm * p.cos(curYaw);
          const rightEndZ = rightArm * p.sin(curYaw) * 0.35;

          // Save center coordinates
          bar.centerX = globalJointX;
          bar.centerY = globalJointY;
          bar.centerZ = currentZ;

          p.push();
          p.translate(currentX, currentY);

          // 1. Draw hanging suspension cable for this level
          p.stroke(85, 80, 75);
          p.strokeWeight(1.3);
          p.line(0, -bar.yDrop, 0, 0);

          // Level link joint loop
          p.fill(210, 205, 195);
          p.ellipse(0, 0, 5, 5);

          // 2. Hanging shadow projection below
          p.noStroke();
          p.fill(40, 35, 30, 10);
          p.line(leftEndX + 5, 12, rightEndX + 5, 12);

          // 3. Draw horizontal central structural steel rod
          p.stroke(80, 75, 70);
          p.strokeWeight(1.8);
          p.line(leftEndX, 0, rightEndX, 0);

          // Loop terminals at ends
          p.noStroke();
          p.fill(210, 150, 70);
          p.ellipse(leftEndX, 0, 4.5, 4.5);
          p.ellipse(rightEndX, 0, 4.5, 4.5);

          // Reset token tracking coords
          bar.tokenCoords = [];

          // 4. Draw collected tokens (noms) hanging along the LEFT side
          const tokenCount = bar.noms.length;
          if (tokenCount > 0) {
            bar.noms.forEach((nom, nIdx) => {
              // Space tokens horizontally from left terminal inwards using proportional splits
              const tRatio = tokenCount === 1 ? 1.0 : (nIdx + 1) / (tokenCount);
              const txOffset = leftEndX * tRatio;
              const tzOffset = leftEndZ * tRatio;

              // Cascade vertical thread strings slightly to prevent overlay collisions
              const stringLength = (16 + nIdx * 10) * finalScale;
              
              // Swaying pendulum angle per token
              const swingAngle = p.sin(p.frameCount * 0.012 + nom.text.charCodeAt(0)) * 0.06 + (windX * 0.012);

              const tokenSeed = nom.text.split('').reduce((ac, c) => ac + c.charCodeAt(0), 0);
              const tColorIdx = nom.colorIndex ?? 0;
              const hexColor = currentTheme.colors[tColorIdx % currentTheme.colors.length];

              // Element plate width and height scaling
              const plateW = (80 + (tokenSeed % 25)) * finalScale;
              const plateH = (60 + (tokenSeed % 20)) * finalScale;

              const plateWorldX = globalJointX + txOffset;
              const plateWorldY = globalJointY + stringLength + plateH / 2.3;

              // Save coordinate maps for clicks/hover checks
              bar.tokenCoords.push({
                id: nom.id,
                nom,
                x: plateWorldX,
                y: plateWorldY,
                z: currentZ + tzOffset,
                width: plateW,
                height: plateH,
                seed: tokenSeed
              });

              // Live drag/swipe checks
              const distanceToMouse = p.dist(p.mouseX, p.mouseY, plateWorldX, plateWorldY);
              const isHovered = distanceToMouse < plateW / 1.6;

              // Trigger swipe velocity impulse on hovered token
              if (isHovered && p.mouseIsPressed) {
                bar.velY += (p.mouseX - p.pmouseX) * 0.0004;
              }

              p.push();
              p.translate(txOffset, 0);
              p.rotate(swingAngle);

              // Thin support cord wire
              p.stroke(95, 90, 85);
              p.strokeWeight(1);
              p.line(0, 0, 0, stringLength);

              // Shift down to plate center draw
              p.translate(0, stringLength);

              // Flat plate shadow
              p.push();
              p.translate(4, 9);
              p.noStroke();
              p.fill(40, 35, 30, 18);
              drawCalderShape(plateW, plateH, tokenSeed, activeLayerIndex);
              p.pop();

              // Sheet metal border & fill
              p.stroke(38, 32, 28);
              p.strokeWeight(2.0);
              p.fill(hexColor);
              
              if (isHovered) {
                p.scale(1.08);
                p.cursor('pointer');
              }

              drawCalderShape(plateW, plateH, tokenSeed, activeLayerIndex);

              // Core aluminum copper rivet hanging core
              p.noStroke();
              p.fill(180, 80, 50);
              p.ellipse(0, 0, 4, 4);

              // Text labeling labels
              p.fill(28, 24, 20);
              p.noStroke();
              p.textAlign(p.CENTER, p.CENTER);
              p.textFont('serif');
              p.textStyle(p.BOLD);
              p.textSize(9.5 * finalScale);
              
              // Split text block to prevent spill boundaries
              const cleanTxt = nom.text.length > 10 ? nom.text.substring(0, 9) + '..' : nom.text;
              p.text(cleanTxt.toUpperCase(), 0, plateH / 2.3);

              // Paragraph subtag
              p.fill(110, 100, 90);
              p.textSize(8 * finalScale);
              p.textStyle(p.ITALIC);
              p.text(`§ ${nom.propId}`, 0, plateH / 2.3 + 11 * finalScale);

              p.pop();
            });
          } else {
            // Draw dummy wire balance plate if paragraph has no noms yet
            p.push();
            p.translate(leftEndX, 0);
            p.stroke(95, 90, 85);
            p.strokeWeight(1.1);
            p.line(0, 0, 0, 15);
            p.translate(0, 15);
            p.fill(200, 195, 185);
            p.ellipse(0, 0, 8, 8);
            p.pop();
          }

          // 5. Suspension down to the NEXT level from Right balance end
          if (bIdx < bars.length - 1) {
            currentX += rightEndX;
            currentY += bar.yDrop * 1.35; // cascading heights staggered function
            currentZ += rightEndZ;
          } else {
            // Last level: Hang a gorgeous, heavy, circular terminal anchor plate (Wittgenstein's Anchor)
            p.push();
            p.translate(rightEndX, 0);
            
            const lastSway = p.sin(p.frameCount * 0.009 + 99) * 0.04;
            p.rotate(lastSway);

            p.stroke(85, 80, 75);
            p.strokeWeight(1.2);
            p.line(0, 0, 0, 24 * finalScale);
            p.translate(0, 24 * finalScale);

            // Large balancing heavy steel plate
            p.push();
            p.translate(4, 9);
            p.noStroke();
            p.fill(30, 25, 20, 22);
            const anchorSizeW = 85 * finalScale;
            const anchorSizeH = 85 * finalScale;
            drawCalderShape(anchorSizeW, anchorSizeH, bar.seed + 500, activeLayerIndex + 3);
            p.pop();

            p.stroke(35, 30, 25);
            p.strokeWeight(2.2);
            p.fill('#1c1917'); // Solid dark charcoal anchor
            drawCalderShape(85 * finalScale, 85 * finalScale, bar.seed + 500, activeLayerIndex + 3);

            p.fill(250, 245, 235);
            p.noStroke();
            p.textAlign(p.CENTER, p.CENTER);
            p.textFont('serif');
            p.textSize(8 * finalScale);
            p.text("CONTRE", 0, 36 * finalScale);
            p.text("POIDS", 0, 45 * finalScale);

            p.pop();
          }

          p.pop(); // restore parent
        });

        p.pop(); // restore main container
      };

      p.mousePressed = () => {
        let clickedOnPlate = false;
        
        // Loop through each bar's mapped tokens to match 2D boundaries
        for (let i = 0; i < bars.length; i++) {
          const bar = bars[i];
          for (let j = 0; j < bar.tokenCoords.length; j++) {
            const coord = bar.tokenCoords[j];
            const distToCheck = p.dist(p.mouseX, p.mouseY, coord.x, coord.y);
            
            if (distToCheck < coord.width / 1.4) {
              // Click inside plate boundaries: trigger editing
              if (onEditNom) {
                onEditNom(coord.nom);
              }
              // Push kinetic rotation speed
              bar.velY += 0.08 * (p.random() > 0.5 ? 1 : -1);
              clickedOnPlate = true;
              break;
            }
          }
          if (clickedOnPlate) break;
        }

        if (!clickedOnPlate) {
          isDraggingScreen = true;
          lastDraggedX = p.mouseX;
          lastDraggedY = p.mouseY;
        }
      };

      p.mouseDragged = () => {
        if (isDraggingScreen) {
          // Brush wind impulse along all levels based on sweeping hand gesture on screen
          const dxSpeed = p.mouseX - p.pmouseX;
          bars.forEach((bar, idx) => {
            bar.velY += dxSpeed * 0.00065 * (1.1 - idx * 0.08);
          });
          lastDraggedX = p.mouseX;
          lastDraggedY = p.mouseY;
        }
      };

      p.mouseReleased = () => {
        isDraggingScreen = false;
      };
    };

    const newP5 = new p5(sketch, containerRef.current);
    p5InstanceRef.current = newP5;

    // Handle incoming broadcast signals for ambient wind
    const handleRandomWind = () => {
      if (bars) {
        bars.forEach((bar, bidx) => {
          bar.velY += (Math.random() - 0.5) * 0.12 * (1.1 - bidx * 0.08);
        });
      }
    };

    window.addEventListener('calder-random-wind', handleRandomWind);

    return () => {
      newP5.remove();
      window.removeEventListener('calder-random-wind', handleRandomWind);
    };
  }, [noms, activeThemeId, activeLayerId, layers]);

  return (
    <div className="w-full bg-stone-100/40 rounded-3xl border border-stone-200 shadow-inner overflow-hidden relative">
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md py-1 px-2.5 rounded-full border border-stone-200/80 shadow-3xs">
        <Zap className="w-3 h-3 text-amber-500 animate-pulse fill-amber-500" />
        <span className="text-[10px] font-mono text-stone-600 font-extrabold uppercase tracking-widest">Simulation Physique 3D Calder</span>
      </div>
      
      <div ref={containerRef} className="w-full h-[520px]" id="calder-p5-container" />
      
      <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-2xl border border-stone-190/70 shadow-2xs flex flex-row items-center justify-between gap-4 text-[10.5px] text-stone-500 select-none">
        <span className="leading-tight">
          🪁 <strong>Mobile Physique :</strong> Touchez et glissez votre doigt ou la souris sur l'écran pour insuffler des souffles de vent. Touchez un élément métallique pour éditer sa définition logique. Les formes géométriques s'adaptent dynamiquement à chaque calque.
        </span>
        <button 
          onClick={() => {
            window.dispatchEvent(new CustomEvent('calder-random-wind'));
          }}
          className="shrink-0 flex items-center gap-1 bg-neutral-900 hover:bg-neutral-800 text-stone-100 font-mono font-bold px-3 py-1.5 rounded-xl border border-[#111] shadow-3xs cursor-pointer active:scale-95 text-[10px] transition-all"
        >
          <RefreshCw className="w-3 h-3 text-amber-400 rotate-spin-slow" /> Insuffler du souffle
        </button>
      </div>
    </div>
  );
}
