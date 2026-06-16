import React, { useState, useEffect, useRef } from 'react';
import { Nom, Link, TractatusGameState, Proposition, SemanticLayer } from './types';
import { PROPOSITIONS } from './data';
import { PRESET_COLLECTIONS, PresetCollection } from './presets';
import { AnimatePresence, motion } from 'motion/react';
import { CalderP5Mobile } from './components/CalderP5Mobile';
import { 
  Check, 
  Trash2, 
  RotateCcw, 
  X, 
  RefreshCw, 
  Palette, 
  Download, 
  Upload, 
  Sparkles, 
  Search, 
  FileText, 
  HelpCircle,
  Dices,
  Cpu,
  GitCommit,
  ArrowRight,
  ArrowLeft,
  Play,
  Square,
  FastForward,
  Settings,
  Grid,
  Info,
  Bookmark,
  Bike,
  Coins,
  Award,
  Network,
  Activity,
  Zap,
  ChevronRight,
  Plus,
  Edit2,
  ArrowUp,
  ArrowDown,
  Layers
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'tractatus_whiteboard_state_v5';

interface Theme {
  id: string;
  name: string;
  colors: string[]; // 7 Hex color strings of beautiful pastels or classic styles
}

const THEMES: Theme[] = [
  {
    id: 'defaut',
    name: "Spectre de l'Esprit (Gradations Cosmiques)",
    colors: ['#1e40af', '#3b82f6', '#06b6d4', '#10b981', '#16a34a', '#ef4444', '#dc2626']
  },
  {
    id: 'mono_rouge',
    name: 'Matrice Néo-Critique (Néons Contrastés)',
    colors: ['#ff007f', '#ff00ff', '#8b5cf6', '#3b82f6', '#00ffff', '#10b981', '#ffe600']
  },
  {
    id: 'cyber_critique',
    name: 'Logico-Philosophicus (Sorcier Céleste)',
    colors: ['#4c1d95', '#6d28d9', '#8b5cf6', '#c084fc', '#f472b6', '#db2777', '#9d174d']
  },
  {
    id: 'stark_contrast',
    name: "Spectre Éminent Stark (Incendie & Braises)",
    colors: ['#7c2d12', '#9a3412', '#c2410c', '#ea580c', '#f97316', '#facc15', '#fef08a']
  }
];

interface MachineCategory {
  id: string;
  name: string;
  colorIndex: number;
  description: string;
}

const DEFAULT_MACHINE_CATEGORIES: MachineCategory[] = [
  { id: 'cat-welt', name: 'Monde & Réalité (Welt)', colorIndex: 0, description: 'La totalité des faits qui constituent la réalité logique.' },
  { id: 'cat-tatsache', name: 'Fait (Tatsache)', colorIndex: 1, description: 'Ce qui a lieu, la subsistance ou la non-subsistance d’états de choses.' },
  { id: 'cat-sachverhalt', name: 'État de choses (Sachverhalt)', colorIndex: 2, description: 'Une connexion d’objets simples s’inscrivant dans une structure déterminée.' },
  { id: 'cat-gegenstand', name: 'Objet Simple (Gegenstand)', colorIndex: 3, description: 'L’élément constitutif stable et indivisible, formant la substance du monde.' },
  { id: 'cat-form', name: 'Forme & Espace (Form)', colorIndex: 4, description: 'L’ensemble a priori des possibilités d’occurrences et de connexions d’un objet.' },
  { id: 'cat-bild', name: 'Image & Représentation (Bild)', colorIndex: 5, description: 'Une configuration d’éléments représentant une situation dans l’espace logique.' },
  { id: 'cat-satz', name: 'Nom & Proposition (Name / Satz)', colorIndex: 6, description: 'L’expression linguistique qui désigne les objets simples ou projette les faits.' }
];

interface ArtTheme {
  id: number;
  name: string;
  emoji: string;
  description: string;
}

const ART_THEMES: ArtTheme[] = [
  {
    id: 0,
    name: "Aquarelle Floue",
    emoji: "💧",
    description: "Énormes bulles d'aquarelle douces et translucides qui montent et fusionnent."
  },
  {
    id: 1,
    name: "Gouache Épaisse",
    emoji: "🎨",
    description: "Taches d'acrylique denses aux contours irréguliers et organiques d'impasto."
  },
  {
    id: 2,
    name: "Vitrail Céleste",
    emoji: "🔮",
    description: "Gradients rayonnants cosmiques de halos énormes aux contrastes intenses."
  },
  {
    id: 3,
    name: "Lavis Chinois du Soir",
    emoji: "✒️",
    description: "Invocations d'encre sombre et diffuse, étalements de lavis et gouttes."
  },
  {
    id: 4,
    name: "Fluide Magmatique",
    emoji: "🔥",
    description: "Bulles fluides thermiques vibrantes d'une lampe à lave psychédélique."
  },
  {
    id: 5,
    name: "Mobile de Calder",
    emoji: "🪁",
    description: "Sculpture suspendue en équilibre. Les noms forment les ailettes mobiles, pivotant et oscillant au moindre contact."
  }
];

// Calder Interactive 3D Mobile Element
export function CalderElement({ 
  activeNom, 
  displayColor, 
  children,
  onClick
}: { 
  activeNom: Nom; 
  displayColor: string; 
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  key?: any;
}) {
  const [rot, setRot] = React.useState({ x: 0, y: 0, z: 0 });
  const [isHovered, setIsHovered] = React.useState(false);
  const containerRef = React.useRef<HTMLSpanElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement> | React.TouchEvent<HTMLSpanElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? (e as any).touches[0].clientX : (e as any).clientX;
    const clientY = 'touches' in e ? (e as any).touches[0].clientY : (e as any).clientY;
    
    const x = clientX - (rect.left + rect.width / 2);
    const y = clientY - (rect.top + rect.height / 2);
    
    const factor = 0.6; // rotation intensity
    setRot({
      x: -y * factor,
      y: x * factor,
      z: (x * y) * 0.03
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRot({ x: 0, y: 0, z: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const seed = (activeNom.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const wireHeight = 22 + (seed % 15);
  const rodWidth = 35 + (seed % 25);
  const rodTilt = (seed % 8) - 4;

  return (
    <span
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchEnd={handleMouseLeave}
      onClick={onClick}
      className="relative inline-block py-2 pb-2.5 px-4 mx-3 mt-4 mb-2 cursor-pointer select-none whitespace-nowrap leading-none transition-transform duration-300 ease-out z-10 hover:z-20 group"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        transform: `perspective(1000px) rotateX(${rot.x + (isHovered ? 0 : Math.sin(Date.now() / 800 + seed) * 3)}deg) rotateY(${rot.y + (isHovered ? 0 : Math.cos(Date.now() / 1000 + seed) * 10)}deg) rotateZ(${rot.z + (isHovered ? 0 : Math.sin(Date.now() / 1200 + seed) * 5)}deg)`,
        transition: isHovered ? 'none' : 'transform 1.4s cubic-bezier(0.15, 0.85, 0.35, 1)'
      }}
    >
      {/* 1. Suspension wire (Calder wire aesthetics) */}
      <div 
        className="absolute bottom-full left-1/2 -translate-x-1/2 bg-stone-400 origin-bottom pointer-events-none transition-transform duration-700"
        style={{
          width: '1px',
          height: `${wireHeight}px`,
          transform: `rotate(${rodTilt + (rot.y * 0.08)}deg)`,
        }}
      >
        {/* Tiny loop joint at the top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full border border-stone-400 bg-white" />
        
        {/* Rod attached to it representing complex mobile hierarchy */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] bg-stone-300 pointer-events-none"
          style={{
            width: `${rodWidth}px`,
            transform: `rotate(${rodTilt / 2}deg)`,
          }}
        />
      </div>

      {/* 2. Flat sheet-metal Calder Ailette background shape */}
      <div 
        className="absolute inset-[1px] pointer-events-none transition-all duration-300"
        style={{
          background: displayColor,
          opacity: 0.85,
          borderRadius: seed % 3 === 0 
            ? '61% 39% 75% 25% / 45% 75% 25% 55%'
            : seed % 3 === 1
              ? '25% 75% 45% 55% / 75% 25% 65% 35%'
              : '85% 15% 50% 50% / 30% 85% 15% 70%',
          border: '1.5px solid rgba(0,0,0,0.18)',
          boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
          transform: `scale(${isHovered ? 1.15 : 1.0})`,
        }}
      />

      {/* Counter-weight dot typical of Alexander Calder's sculptures */}
      <div 
        className="absolute rounded-full pointer-events-none bg-rose-500 border border-stone-700"
        style={{
          width: '5px',
          height: '5px',
          bottom: '-2px',
          right: '15%',
          transform: `translate(${rot.y * 0.04}px, ${rot.x * 0.04}px)`,
          transition: 'transform 0.1s ease-out'
        }}
      />

      {/* 3. High contrast elegant text */}
      <span 
        className="relative z-10 text-stone-950 text-[14px] font-sans font-black tracking-wide block leading-none"
        style={{
          textShadow: '0 1px 1.5px rgba(255,255,255,0.85)',
          transform: 'translateZ(10px)'
        }}
      >
        {children}
      </span>
    </span>
  );
}

// Tokenize text keeping exact spaces/newlines
export function tokenizeText(text: string) {
  const tokens = text.split(/(\s+)/);
  let wordCounter = 0;
  return tokens.map((token, i) => {
    if (/\s+/.test(token)) {
      return {
        id: `space-${i}`,
        type: 'space' as const,
        text: token,
      };
    } else {
      const idx = wordCounter++;
      return {
        id: `word-${idx}`,
        type: 'word' as const,
        text: token,
        index: idx,
      };
    }
  });
}

// Group contiguous tokens belonging to the same Nom
interface RenderGroup {
  type: 'nom' | 'free';
  nom?: Nom;
  tokens: any[];
}

export function getRenderGroups(tokens: any[], propId: string, noms: Nom[]): RenderGroup[] {
  const groups: RenderGroup[] = [];
  let currentGroup: RenderGroup | null = null;

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === 'word') {
      const associatedNom = noms.find(
        (n) => n.propId === propId && n.wordIndices.includes(token.index)
      );

      if (associatedNom) {
        if (currentGroup && currentGroup.type === 'nom' && currentGroup.nom?.id === associatedNom.id) {
          currentGroup.tokens.push(token);
        } else {
          if (currentGroup) {
            groups.push(currentGroup);
          }
          currentGroup = {
            type: 'nom',
            nom: associatedNom,
            tokens: [token],
          };
        }
      } else {
        if (currentGroup) {
          groups.push(currentGroup);
          currentGroup = null;
        }
        groups.push({ type: 'free', tokens: [token] });
      }
    } else {
      // Space token
      if (currentGroup && currentGroup.type === 'nom') {
        let nextWordToken = null;
        for (let j = i + 1; j < tokens.length; j++) {
          if (tokens[j].type === 'word') {
            nextWordToken = tokens[j];
            break;
          }
        }
        if (nextWordToken) {
          const nextNom = noms.find(
            (n) => n.propId === propId && n.wordIndices.includes(nextWordToken.index)
          );
          if (nextNom && nextNom.id === currentGroup.nom?.id) {
            currentGroup.tokens.push(token);
            continue;
          }
        }
      }

      if (currentGroup) {
        groups.push(currentGroup);
        currentGroup = null;
      }
      groups.push({ type: 'free', tokens: [token] });
    }
  }

  if (currentGroup) {
    groups.push(currentGroup);
  }

  return groups;
}

const SplatterEffect = ({ splatters, active }: { splatters: any[], active: boolean }) => {
  if (!active) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
      {splatters.map((s) => {
        let borderStyle: React.CSSProperties = {};
        if (s.type === 'spot') {
          borderStyle = { borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' };
        } else if (s.type === 'splash') {
          borderStyle = { borderRadius: '50% 30% 80% 20% / 50% 60% 30% 70%' };
        } else {
          borderStyle = { borderRadius: '50% 50% 50% 50% / 40% 40% 80% 80%' };
        }

        return (
          <div
            key={s.id}
            className="absolute opacity-[0.22] mix-blend-multiply transition-all duration-700 blur-[0.4px]"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.size}px`,
              height: `${s.size}px`,
              backgroundColor: s.color,
              transform: `rotate(${s.tilt}deg)`,
              ...borderStyle
            }}
          >
            {/* Satellite droplets */}
            <div 
              className="absolute w-1.5 h-1.5 rounded-full opacity-60" 
              style={{
                backgroundColor: s.color,
                top: `${s.size * 0.7}px`,
                left: `${s.size * 1.1}px`
              }}
            />
            <div 
              className="absolute w-2 h-2 rounded-full opacity-55" 
              style={{
                backgroundColor: s.color,
                top: `-${s.size * 0.3}px`,
                left: `-${s.size * 0.4}px`,
                borderRadius: '60% 40% 30% 70%'
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

// Deterministic hash based on a string (e.g., activeNom.id)
const getArtParams = (id: string, propId: string) => {
  let hash = 0;
  const combined = id + propId;
  for (let i = 0; i < combined.length; i++) {
    hash = combined.charCodeAt(i) + ((hash << 5) - hash);
  }
  const absHash = Math.abs(hash);
  
  // Style type: 0 = Thick Acrylic Brush, 1 = Spray Splatter Paint, 2 = Calligraphic Paint Splotch, 3 = Double Underline/Crayon, 4 = Rough Canvas Smudge
  const styleType = absHash % 5;
  
  // Sizing nuances
  const scaleY = 1.0 + (absHash % 40) / 100; // 1.0 to 1.40
  const scaleX = 1.05 + ((absHash >> 2) % 30) / 100; // 1.05 to 1.35
  const translateY = -2 + ((absHash >> 4) % 6) - 3; // -5px to 1px
  const translateX = ((absHash >> 6) % 9) - 4; // -4px to 4px
  const tilt = ((absHash >> 8) % 15) - 7; // -7deg to +7deg
  const opacity = 0.7 + ((absHash >> 10) % 25) / 100; // 0.7 to 0.95
  
  // Border radius variations for organic shapes
  const br1 = 150 + (absHash % 150);
  const br2 = 10 + ((absHash >> 2) % 30);
  const br3 = 150 + ((absHash >> 4) % 150);
  const br4 = 10 + ((absHash >> 6) % 30);
  
  const br5 = 10 + ((absHash >> 8) % 30);
  const br6 = 150 + ((absHash >> 10) % 150);
  const br7 = 10 + ((absHash >> 12) % 30);
  const br8 = 150 + ((absHash >> 14) % 150);
  
  const borderRadius = `${br1}px ${br2}px ${br3}px ${br4}px / ${br5}px ${br6}px ${br7}px ${br8}px`;
  
  return { styleType, scaleX, scaleY, translateY, translateX, tilt, opacity, borderRadius, seed: absHash };
};

export default function App() {
  // Core Game/Editor States
  const [noms, setNoms] = useState<Nom[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [validatedParagraphIds, setValidatedParagraphIds] = useState<string[]>([]);
  const [nomGuesses, setNomGuesses] = useState<{ [nomId: string]: number }>({});
  const [activeThemeId, setActiveThemeId] = useState<string>('defaut');
  const [activeHighlighterId, setActiveHighlighterId] = useState<string>('surligneur-classique');

  // Recuperer le style de surligneur enregistre localement
  useEffect(() => {
    const savedStyle = localStorage.getItem('tractatus_whiteboard_active_highlighter');
    if (savedStyle) {
      setActiveHighlighterId(savedStyle);
    }
  }, []);

  const getHighlighterStyle = (displayColor: string, isGrey: boolean, nomId: string) => {
    if (isGrey) {
      return {
        styleObj: {
          backgroundColor: 'rgba(168, 162, 158, 0.22)',
          borderColor: '#cbd5e1',
          borderWidth: '1.5px',
          borderRadius: '6px'
        },
        className: 'py-0.5 px-1.5 border inline-block select-none text-[13px] text-stone-500 font-bold font-sans'
      };
    }

    let seed = 0;
    for (let i = 0; i < nomId.length; i++) {
      seed += nomId.charCodeAt(i);
    }

    const styleObj: React.CSSProperties = {
      transition: 'all 0.2s ease-in-out',
    };
    let className = 'inline-block transition-all duration-250 cursor-pointer select-none whitespace-nowrap text-[13.5px] leading-none ';

    switch (activeHighlighterId) {
      case 'surligneur-manuel': {
        const rotateDeg = (seed % 3) - 1.5;
        styleObj.background = `linear-gradient(100deg, ${displayColor}55 0%, ${displayColor}aa 5%, ${displayColor}77 95%, ${displayColor}44 100%)`;
        styleObj.transform = `rotate(${rotateDeg}deg)`;
        styleObj.borderRadius = `${4 + (seed % 3)}px ${8 + (seed % 3)}px ${4 + (seed % 2)}px ${10 + (seed % 4)}px / ${6 + (seed % 3)}px ${5 + (seed % 2)}px ${7 + (seed % 3)}px ${12 + (seed % 5)}px`;
        styleObj.boxShadow = `inset 0 -1.5px 3px rgba(255,255,255,0.3), inset 0 1.5px 3px rgba(0,0,0,0.06)`;
        className += 'py-1 px-2 mx-1 text-stone-900 font-semibold font-sans';
        break;
      }
      case 'masktape': {
        styleObj.backgroundColor = `${displayColor}33`;
        styleObj.borderTop = `1px dashed ${displayColor}aa`;
        styleObj.borderBottom = `2px dashed ${displayColor}dd`;
        styleObj.borderLeft = `3.5px dashed ${displayColor}ee`;
        styleObj.borderRight = `3.5px dashed ${displayColor}ee`;
        className += 'py-1.5 px-2.5 mx-1.5 hover:scale-102 hover:brightness-105 text-stone-900 font-extrabold tracking-wide font-sans shadow-4xs';
        break;
      }
      case 'adhesif': {
        styleObj.background = `linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 20%, ${displayColor}b4 40%, ${displayColor}b4 80%, rgba(0,0,0,0.1) 100%)`;
        styleObj.border = `1.5px solid ${displayColor}c5`;
        styleObj.boxShadow = `0 1.5px 4px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -1.5px 1px rgba(0,0,0,0.15)`;
        styleObj.borderRadius = '3px';
        className += 'py-1 px-2 mx-1 text-stone-900 font-bold font-sans';
        break;
      }
      case 'souligne-fin': {
        styleObj.backgroundColor = 'transparent';
        styleObj.borderBottom = `2px solid ${displayColor}`;
        className += 'py-0.5 px-0.5 mx-1 font-sans font-extrabold text-stone-850';
        break;
      }
      case 'souligne-moyen': {
        styleObj.backgroundColor = 'transparent';
        styleObj.borderBottom = `4px double ${displayColor}`;
        className += 'py-0.5 px-0.5 mx-1.5 font-sans font-black text-stone-900';
        break;
      }
      case 'souligne-epais': {
        styleObj.backgroundColor = 'transparent';
        styleObj.borderBottom = `6px solid ${displayColor}`;
        styleObj.borderRadius = '2.5px';
        className += 'py-0.5 px-0.5 mx-1.5 font-sans font-black text-stone-900 tracking-tight';
        break;
      }
      case 'maladroit': {
        const tilt = (seed % 2 === 0 ? -2.2 : 2.5);
        const yOffset = (seed % 3) - 1.2;
        styleObj.backgroundColor = `${displayColor}52`;
        styleObj.transform = `rotate(${tilt}deg) translateY(${yOffset}px)`;
        styleObj.borderRadius = '16px 4px 18px 2px / 5px 15px 4px 12px';
        className += 'py-1 px-2 mx-2 text-stone-900 font-bold font-sans hover:scale-103';
        break;
      }
      case 'fantaisiste': {
        styleObj.background = `linear-gradient(135deg, ${displayColor}aa 0%, ${displayColor}55 50%, ${displayColor}ee 150%)`;
        styleObj.boxShadow = `0 0 12px ${displayColor}77, inset 0 0 5px rgba(255,255,255,0.5)`;
        styleObj.borderRadius = '9999px';
        className += 'py-1.5 px-3 mx-1 font-sans font-black text-stone-950 hover:scale-105 animate-pulse';
        break;
      }
      case 'retro-pixel': {
        styleObj.backgroundColor = `${displayColor}d5`;
        styleObj.border = `2.5px solid #1c1917`;
        styleObj.boxShadow = `2.5px 2.5px 0px #1c1917`;
        styleObj.borderRadius = '0px';
        className += 'py-1 px-2 mx-1 text-stone-950 font-black font-mono tracking-tight uppercase';
        break;
      }
      case 'surligneur-classique':
      default: {
        styleObj.backgroundColor = `${displayColor}4a`;
        styleObj.borderRadius = '4px';
        className += 'py-0.5 px-1.5 mx-1 text-stone-900 font-medium font-sans';
        break;
      }
    }

    return { styleObj, className };
  };
  const [activeMode, setActiveMode] = useState<'editor' | 'mastermind' | 'art'>('editor');
  const [machineCategories, setMachineCategories] = useState<MachineCategory[]>(DEFAULT_MACHINE_CATEGORIES);
  const [pastilleGuesses, setPastilleGuesses] = useState<{ [propId: string]: number[] }>({});
  const [attemptsCount, setAttemptsCount] = useState<{ [propId: string]: number }>({});
  
  // Calques de travail (Work layers) pour des analyses multi-niveaux du texte (Structure globale, détaillée, etc.)
  const [layers, setLayers] = useState<SemanticLayer[]>([]);
  const [activeLayerId, setActiveLayerId] = useState<string>('default-layer');
  
  // Incremental upgrades and currency state
  const [unlockedUpgrades, setUnlockedUpgrades] = useState<string[]>([]);
  const [spentPoints, setSpentPoints] = useState<number>(0);

  // Capacités additionnelles et points incrémentaux
  const [revealOnePoints, setRevealOnePoints] = useState<number>(0);
  const [revealTwoPoints, setRevealTwoPoints] = useState<number>(0);
  const [incrementalBonusPoints, setIncrementalBonusPoints] = useState<number>(0);
  const [consecutiveClicks, setConsecutiveClicks] = useState<{ id: string, colorIndex: number }[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<Array<{ id: string; text: string; x: number; y: number; color: string }>>([]);
  const [isNavExpanded, setIsNavExpanded] = useState<boolean>(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState<boolean>(false);
  const [userCustomThesis, setUserCustomThesis] = useState<string>('');
  const [crunchTab, setCrunchTab] = useState<'game' | 'collector'>('collector');
  const [activeVizTab, setActiveVizTab] = useState<'matrix' | 'density' | 'entropy'>('matrix');

  // Multi-texts/collections state engine
  const [customCollections, setCustomCollections] = useState<PresetCollection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string>('tractatus');
  const [isTextManagerOpen, setIsTextManagerOpen] = useState<boolean>(false);
  const [newTextName, setNewTextName] = useState<string>('');
  const [newTextContent, setNewTextContent] = useState<string>('');
  const [newLayerName, setNewLayerName] = useState<string>('');
  const [newLayerDesc, setNewLayerDesc] = useState<string>('');

  // Mini mindmap custom positions & overrides
  const [mindmapOffsets, setMindmapOffsets] = useState<{ [id: string]: { x: number, y: number } }>({});
  const [mindmapLevelOverrides, setMindmapLevelOverrides] = useState<{ [id: string]: number }>({});
  const [logicalParagraphIds, setLogicalParagraphIds] = useState<string[]>([]);
  const [editingCollectionId, setEditingCollectionId] = useState<string | null>(null);
  const [selectedNomId, setSelectedNomId] = useState<string | null>(null);

  const allCollections = [...PRESET_COLLECTIONS, ...customCollections];
  const activeCollection = allCollections.find(c => c.id === activeCollectionId) || PRESET_COLLECTIONS[0];
  const activePropositions = activeCollection.propositions;

  const [history, setHistory] = useState<{ 
    noms: Nom[]; 
    links: Link[]; 
    validatedIds: string[]; 
    guesses: { [nomId: string]: number }; 
    pastilleGuesses: { [propId: string]: number[] };
    attemptsCount: { [propId: string]: number };
    mode: 'editor' | 'mastermind' | 'art' 
  }[]>([]);

  // Bypass clicks on bicycle icon
  const [bypassClicks, setBypassClicks] = useState<{ [propId: string]: number }>({});

  // Paint splatters for Art Mode
  interface Splatter {
    id: string;
    x: number;
    y: number;
    size: number;
    color: string;
    type: 'spot' | 'splash' | 'drip';
    tilt: number;
  }
  const [splatters, setSplatters] = useState<Splatter[]>([]);

  // Selection states (for creating concepts)
  const [selectedPropId, setSelectedPropId] = useState<string | null>(null);
  const [selectedWordIndices, setSelectedWordIndices] = useState<number[]>([]);

  // Editing structures
  const [editingNomId, setEditingNomId] = useState<string | null>(null);
  const [editingNomText, setEditingNomText] = useState<string>('');
  const [editingNomDesc, setEditingNomDesc] = useState<string>('');
  const [editingNomColorIndex, setEditingNomColorIndex] = useState<number>(0);
  const [activeArtTheme, setActiveArtTheme] = useState<number>(0);
  const [lastUsedColorIndex, setLastUsedColorIndex] = useState<number>(0);

  // Category Configuration Modal
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editingCatName, setEditingCatName] = useState<string>('');
  const [editingCatDesc, setEditingCatDesc] = useState<string>('');

  // Layout / Tooling states
  const [shuffledPastilleOrders, setShuffledPastilleOrders] = useState<{ [propId: string]: number[] }>({});
  const [activeFeedback, setActiveFeedback] = useState<{ [propId: string]: 'success' | 'failure' }>({});
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Semantic Visualization local states
  const [visuHoveredCatIdx, setVisuHoveredCatIdx] = useState<number | null>(null);
  const [visuHoveredTermId, setVisuHoveredTermId] = useState<string | null>(null);
  const [visuTermPage, setVisuTermPage] = useState<number>(0);

  // Floating game particle burst system state
  const [gameParticles, setGameParticles] = useState<Array<{ 
    id: string; 
    startX: number; 
    startY: number; 
    endX: number; 
    endY: number; 
    color: string; 
    duration: number; 
    rotate: number; 
    shape: 'star' | 'circle' | 'spark'; 
  }>>([]);

  const currentTheme = THEMES.find((t) => t.id === activeThemeId) || THEMES[0];

  // Generate artistic splatters for Art Mode
  useEffect(() => {
    const generated: Splatter[] = [];
    const themeColors = currentTheme.colors;
    for (let i = 0; i < 28; i++) {
      generated.push({
        id: `splat-${i}`,
        x: Math.floor(Math.random() * 90) + 5,
        y: Math.floor(Math.random() * 88) + 6,
        size: Math.floor(Math.random() * 60) + 25,
        color: themeColors[Math.floor(Math.random() * themeColors.length)],
        type: ['spot', 'splash', 'drip'][Math.floor(Math.random() * 3)] as any,
        tilt: Math.floor(Math.random() * 360)
      });
    }
    setSplatters(generated);
  }, [activeThemeId]);

  // Floating notifications
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper to save a single collection's state
  const saveCollectionState = (
    colId: string,
    currentNoms = noms,
    currentLinks = links,
    validatedIds = validatedParagraphIds,
    guesses = nomGuesses,
    currentPastilleGuesses = pastilleGuesses,
    currentAttemptsCount = attemptsCount,
    currentShuffledOrders = shuffledPastilleOrders,
    currentUpgrades = unlockedUpgrades,
    currentSpent = spentPoints,
    currentOffsets = mindmapOffsets,
    currentLevelOverrides = mindmapLevelOverrides,
    currentLogicalParagraphs = logicalParagraphIds,
    currentBonus = incrementalBonusPoints,
    currentRev1 = revealOnePoints,
    currentRev2 = revealTwoPoints,
    currentLayers = layers,
    currentActiveLayerId = activeLayerId,
    currentUserCustomThesis = userCustomThesis
  ) => {
    try {
      let updatedLayers = [...currentLayers];
      if (updatedLayers.length === 0) {
        updatedLayers = [{
          id: 'default-layer',
          name: 'Structure Globale',
          description: 'Analyse macro-conceptuelle et squelette thématique du texte',
          noms: currentNoms,
          links: currentLinks,
          validatedParagraphIds: validatedIds,
          pastilleGuesses: currentPastilleGuesses,
          nomGuesses: guesses
        }];
      } else {
        updatedLayers = updatedLayers.map(l => {
          if (l.id === currentActiveLayerId) {
            return {
              ...l,
              noms: currentNoms,
              links: currentLinks,
              validatedParagraphIds: validatedIds,
              pastilleGuesses: currentPastilleGuesses,
              nomGuesses: guesses
            };
          }
          return l;
        });
      }

      localStorage.setItem(
        `tractatus_whiteboard_state_col_${colId}`,
        JSON.stringify({
          noms: currentNoms,
          links: currentLinks,
          validatedParagraphIds: validatedIds,
          nomGuesses: guesses,
          pastilleGuesses: currentPastilleGuesses,
          shuffledPastilleOrders: currentShuffledOrders,
          attemptsCount: currentAttemptsCount,
          unlockedUpgrades: currentUpgrades,
          spentPoints: currentSpent,
          mindmapOffsets: currentOffsets,
          mindmapLevelOverrides: currentLevelOverrides,
          logicalParagraphIds: currentLogicalParagraphs,
          incrementalBonusPoints: currentBonus,
          revealOnePoints: currentRev1,
          revealTwoPoints: currentRev2,
          layers: updatedLayers,
          activeLayerId: currentActiveLayerId,
          userCustomThesis: currentUserCustomThesis
        })
      );
    } catch (err) {
      console.error("Failed to save collection state:", err);
    }
  };

  // Helper to load a single collection's state
  const loadCollectionState = (colId: string) => {
    try {
      const saved = localStorage.getItem(`tractatus_whiteboard_state_col_${colId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Load or restore layers
        let loadedLayers: SemanticLayer[] = parsed.layers || [];
        let loadedActiveLayerId: string = parsed.activeLayerId || 'default-layer';

        if (loadedLayers.length === 0) {
          // Backward compatibility: create initial default layer from legacy root values
          loadedLayers = [{
            id: 'default-layer',
            name: 'Structure Globale',
            description: 'Analyse macro-conceptuelle et squelette thématique du texte',
            noms: parsed.noms || [],
            links: parsed.links || [],
            validatedParagraphIds: parsed.validatedParagraphIds || [],
            pastilleGuesses: parsed.pastilleGuesses || {},
            nomGuesses: parsed.nomGuesses || {}
          }];
          loadedActiveLayerId = 'default-layer';
        }

        setLayers(loadedLayers);
        setActiveLayerId(loadedActiveLayerId);

        // Load data of the active layer
        const targetLayer = loadedLayers.find(l => l.id === loadedActiveLayerId) || loadedLayers[0];
        
        setNoms(targetLayer.noms || []);
        setLinks(targetLayer.links || []);
        setValidatedParagraphIds(targetLayer.validatedParagraphIds || []);
        setNomGuesses(targetLayer.nomGuesses || {});
        
        let loadedPastilles = targetLayer.pastilleGuesses || {};
        const validatedIds = targetLayer.validatedParagraphIds || [];
        // Force reset of unvalidated paragraph guesses to grey (-1) if needed
        Object.keys(loadedPastilles).forEach((pId) => {
          if (!validatedIds.includes(pId)) {
            if (Array.isArray(loadedPastilles[pId])) {
              loadedPastilles[pId] = loadedPastilles[pId].map(() => -1);
            }
          }
        });

        setPastilleGuesses(loadedPastilles);
        
        // Other collection-specific shared settings
        setMindmapOffsets(parsed.mindmapOffsets || {});
        setMindmapLevelOverrides(parsed.mindmapLevelOverrides || {});
        setLogicalParagraphIds(parsed.logicalParagraphIds || []);
        setIncrementalBonusPoints(parsed.incrementalBonusPoints || 0);
        setRevealOnePoints(parsed.revealOnePoints || 0);
        setRevealTwoPoints(parsed.revealTwoPoints || 0);
        setAttemptsCount(parsed.attemptsCount || {});
        setShuffledPastilleOrders(parsed.shuffledPastilleOrders || {});
        setUnlockedUpgrades(parsed.unlockedUpgrades || []);
        setSpentPoints(parsed.spentPoints || 0);
        setUserCustomThesis(parsed.userCustomThesis || '');
      } else {
        // No session exists, initialize default
        setMindmapOffsets({});
        setMindmapLevelOverrides({});
        setLogicalParagraphIds([]);
        setUserCustomThesis('');
        
        const defaultNoms: Nom[] = [];

        const initialLayers: SemanticLayer[] = [
          {
            id: 'default-layer',
            name: 'Structure Globale',
            description: 'Analyse macro-conceptuelle et squelette thématique du texte',
            noms: defaultNoms,
            links: [],
            validatedParagraphIds: [],
            pastilleGuesses: {},
            nomGuesses: {}
          },
          {
            id: 'detailed-layer',
            name: 'Structure Détaillée',
            description: 'Précisions microscopiques, propositions secondaires et corrélations subtiles',
            noms: [],
            links: [],
            validatedParagraphIds: [],
            pastilleGuesses: {},
            nomGuesses: {}
          }
        ];

        setLayers(initialLayers);
        setActiveLayerId('default-layer');
        setNoms(defaultNoms);
        setLinks([]);
        setValidatedParagraphIds([]);
        setNomGuesses({});
        setPastilleGuesses({});
        setAttemptsCount({});
        setShuffledPastilleOrders({});
        setUnlockedUpgrades([]);
        setSpentPoints(0);
        setIncrementalBonusPoints(0);
        setRevealOnePoints(0);
        setRevealTwoPoints(0);
        
        saveCollectionState(colId, defaultNoms, [], [], {}, {}, {}, {}, [], 0, {}, {}, [], 0, 0, 0, initialLayers, 'default-layer', '');
      }
      setSelectedPropId(null);
      setSelectedWordIndices([]);
    } catch (err) {
      console.error("Failed to load collection state:", err);
    }
  };

  // Switch between texts seamlessly
  const handleSwitchCollection = (newColId: string) => {
    if (newColId === activeCollectionId) return;
    
    // Save current active state first
    saveCollectionState(
      activeCollectionId,
      noms,
      links,
      validatedParagraphIds,
      nomGuesses,
      pastilleGuesses,
      attemptsCount,
      shuffledPastilleOrders,
      unlockedUpgrades,
      spentPoints,
      mindmapOffsets,
      mindmapLevelOverrides,
      logicalParagraphIds
    );

    // Switch active collection ID
    setActiveCollectionId(newColId);
    localStorage.setItem('tractatus_whiteboard_active_collection_id', newColId);

    // Load state of the new collection
    // We'll read it in a brief setTimeout or directly
    setTimeout(() => {
      loadCollectionState(newColId);
    }, 10);
  };

  // Set default concepts if none exist (unused / backward compatibility)
  const ensureDefaultStates = () => {
    loadCollectionState('tractatus');
  };

  // Load state from localStorage on startup
  useEffect(() => {
    try {
      // 1. Read custom collections first
      const savedCustom = localStorage.getItem('tractatus_whiteboard_custom_collections');
      let loadedCustom: PresetCollection[] = [];
      if (savedCustom) {
        try {
          loadedCustom = JSON.parse(savedCustom);
          if (Array.isArray(loadedCustom)) {
            setCustomCollections(loadedCustom);
          }
        } catch (e) {
          console.error("Custom collections parse failed", e);
        }
      }

      // 2. Read active collection ID
      const savedActiveId = localStorage.getItem('tractatus_whiteboard_active_collection_id');
      const finalActiveId = savedActiveId || 'tractatus';
      setActiveCollectionId(finalActiveId);

      // 3. Load other layout-related configurations
      const savedConfig = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        if (parsed.activeThemeId) setActiveThemeId(parsed.activeThemeId);
        if (parsed.activeMode) setActiveMode(parsed.activeMode);
        if (parsed.activeArtTheme !== undefined) setActiveArtTheme(parsed.activeArtTheme);
        if (parsed.lastUsedColorIndex !== undefined) setLastUsedColorIndex(parsed.lastUsedColorIndex);
        if (Array.isArray(parsed.machineCategories)) {
          setMachineCategories(parsed.machineCategories);
        }
      }

      // 4. Load current collection's session data after customCollections are in scope
      setTimeout(() => {
        loadCollectionState(finalActiveId);
      }, 20);

    } catch (e) {
      console.error("Localstorage full load failed on mount:", e);
      loadCollectionState('tractatus');
    }
  }, []);

  // Save state
  const saveToLocalStorage = (
    currentNoms = noms,
    currentLinks = links,
    validatedIds = validatedParagraphIds,
    guesses = nomGuesses,
    themeId = activeThemeId,
    mode = activeMode,
    categories = machineCategories,
    currentPastilleGuesses = pastilleGuesses,
    currentShuffledPastilleOrders = shuffledPastilleOrders,
    currentAttemptsCount = attemptsCount,
    artTheme = activeArtTheme,
    colorIdx = lastUsedColorIndex,
    currentUpgrades = unlockedUpgrades,
    currentSpent = spentPoints
  ) => {
    // 1. Save general configurations
    try {
      localStorage.setItem(
        LOCAL_STORAGE_KEY,
        JSON.stringify({
          activeThemeId: themeId,
          activeMode: mode,
          machineCategories: categories,
          activeArtTheme: artTheme,
          lastUsedColorIndex: colorIdx,
        })
      );
    } catch (e) {
      console.error(e);
    }

    // 2. Save active collection's progress under its isolated key
    saveCollectionState(
      activeCollectionId,
      currentNoms,
      currentLinks,
      validatedIds,
      guesses,
      currentPastilleGuesses,
      currentAttemptsCount,
      currentShuffledPastilleOrders,
      currentUpgrades,
      currentSpent
    );
  };

  // History state push
  const pushToHistory = (
    currentNoms = noms,
    currentLinks = links,
    validatedIds = validatedParagraphIds,
    guesses = nomGuesses,
    currentPastilleGuesses = pastilleGuesses,
    currentShuffledPastilleOrders = shuffledPastilleOrders,
    currentAttemptsCount = attemptsCount,
    mode = activeMode
  ) => {
    setHistory((prev) => [
      ...prev,
      {
        noms: JSON.parse(JSON.stringify(currentNoms)),
        links: JSON.parse(JSON.stringify(currentLinks)),
        validatedIds: [...validatedIds],
        guesses: { ...guesses },
        pastilleGuesses: JSON.parse(JSON.stringify(currentPastilleGuesses)),
        shuffledPastilleOrders: JSON.parse(JSON.stringify(currentShuffledPastilleOrders)),
        attemptsCount: JSON.parse(JSON.stringify(currentAttemptsCount)),
        mode
      }
    ]);
  };

  // Undo trigger
  const handleGlobalUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((p) => p.slice(0, -1));
    setNoms(prev.noms);
    setLinks(prev.links);
    setValidatedParagraphIds(prev.validatedIds);
    setNomGuesses(prev.guesses);
    setPastilleGuesses(prev.pastilleGuesses || {});
    setShuffledPastilleOrders(prev.shuffledPastilleOrders || {});
    setAttemptsCount(prev.attemptsCount || {});
    setActiveMode(prev.mode);
    saveToLocalStorage(
      prev.noms,
      prev.links,
      prev.validatedIds,
      prev.guesses,
      activeThemeId,
      prev.mode,
      machineCategories,
      prev.pastilleGuesses || {},
      prev.shuffledPastilleOrders || {},
      prev.attemptsCount || {}
    );
    triggerToast("Action annulée 🔄");
  };

  // Calibrage complet du mastermind (shuffledPastilleOrders et pastilleGuesses initiaux) - synchronisé en temps réel pour tous les paragraphes
  useEffect(() => {
    const newShuffles = { ...shuffledPastilleOrders };
    const updatedGuesses = { ...pastilleGuesses };
    let changed = false;

    activePropositions.forEach((prop) => {
      const propId = prop.id;
      const propNoms = noms.filter((n) => n.propId === propId);
      const sorted = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
      const targetColors = sorted.map((n) => n.colorIndex ?? 0);
      const count = targetColors.length;

      if (count === 0) {
        if (newShuffles[propId] && newShuffles[propId].length > 0) {
          delete newShuffles[propId];
          changed = true;
        }
        if (updatedGuesses[propId] && updatedGuesses[propId].length > 0) {
          delete updatedGuesses[propId];
          changed = true;
        }
        return;
      }

      // 1. Manage shuffled order - Ensure exact permutation of targetColors
      let shuf = newShuffles[propId];
      const targetSorted = [...targetColors].sort((a, b) => a - b);
      const shufSorted = shuf ? [...shuf].sort((a, b) => a - b) : [];
      const hasPerfectPermutation = shufSorted.length === count && shufSorted.every((v, idx) => v === targetSorted[idx]);

      if (!shuf || !hasPerfectPermutation) {
        shuf = [...targetColors].sort(() => Math.random() - 0.5);
        if (shuf.every((v, i) => v === targetColors[i]) && shuf.length > 1) {
          shuf = [...shuf].reverse();
        }
        newShuffles[propId] = shuf;
        changed = true;
      }

      // 2. Manage guesses - Reset if count mismatch or invalid color indices remain
      const currentGuesses = updatedGuesses[propId] || [];
      const hasLenMismatch = currentGuesses.length !== count;
      const hasInvalidGuesses = currentGuesses.some((g) => g !== -1 && !targetColors.includes(g));

      if (hasLenMismatch || hasInvalidGuesses) {
        updatedGuesses[propId] = Array(count).fill(-1);
        changed = true;
      }
    });

    if (changed) {
      setShuffledPastilleOrders(newShuffles);
      setPastilleGuesses(updatedGuesses);
      saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, activeMode, machineCategories, updatedGuesses, newShuffles, attemptsCount);
    }
  }, [noms]);

  // Handle word selections
  const handleWordClick = (propId: string, wordIdx: number, e?: React.MouseEvent) => {
    const associatedNom = noms.find((n) => n.propId === propId && n.wordIndices.includes(wordIdx));
    if (associatedNom) {
      // Award capacity point track and spawn incremental click floaty!
      handleNomClickForCapacity(associatedNom, e);

      if (activeMode === 'mastermind') {
        const propNoms = noms.filter((n) => n.propId === propId);
        const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
        const pIdx = sortedNoms.findIndex((n) => n.id === associatedNom.id);
        if (pIdx !== -1) {
          handleCyclePastilleGuess(propId, pIdx);
        }
      } else {
        startEditingNom(associatedNom);
      }
      return;
    }

    if (activeMode === 'mastermind') {
      triggerToast("Basculez en mode Éditeur pour créer des concepts.");
      return;
    }

    if (selectedPropId !== propId) {
      setSelectedPropId(propId);
      setSelectedWordIndices([wordIdx]);
    } else {
      setSelectedWordIndices((prev) => {
        if (prev.includes(wordIdx)) {
          const filtered = prev.filter((i) => i !== wordIdx);
          if (filtered.length === 0) setSelectedPropId(null);
          return filtered;
        } else {
          return [...prev, wordIdx].sort((a, b) => a - b);
        }
      });
    }
  };

  const getSelectedWordsText = () => {
    if (!selectedPropId || selectedWordIndices.length === 0) return '';
    const prop = activePropositions.find((p) => p.id === selectedPropId);
    if (!prop) return '';

    const tokens = tokenizeText(prop.textFr);
    const selectedWords = tokens
      .filter((t) => t.type === 'word' && selectedWordIndices.includes((t as any).index))
      .sort((a: any, b: any) => a.index - b.index)
      .map((t) => t.text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ''));

    return selectedWords.join(' ');
  };

  const handleCommitNom = () => {
    if (!selectedPropId || selectedWordIndices.length === 0) return;
    const text = getSelectedWordsText();
    if (!text.trim()) return;

    pushToHistory();

    const nextColorIndex = lastUsedColorIndex % currentTheme.colors.length;
    const newNom: Nom = {
      id: `nom-${Math.random().toString(36).substring(2, 9)}`,
      text: text.trim(),
      propId: selectedPropId,
      wordIndices: [...selectedWordIndices],
      colorIndex: nextColorIndex,
      description: '',
    };

    const nextNoms = [...noms, newNom];
    setNoms(nextNoms);

    const nextGuesses = { ...nomGuesses };
    delete nextGuesses[newNom.id];
    setNomGuesses(nextGuesses);

    const nextValidated = validatedParagraphIds.filter((pId) => pId !== selectedPropId);
    setValidatedParagraphIds(nextValidated);

    saveToLocalStorage(nextNoms, links, nextValidated, nextGuesses);

    setSelectedPropId(null);
    setSelectedWordIndices([]);
    triggerToast(`Concept créé ! Double-cliquez pour éditer : "${newNom.text}"`);
  };

  // Modification de la couleur d'une pastille de la marge ou du concept (Mode Mastermind)
  const handleCyclePastilleGuess = (propId: string, pIdx: number) => {
    if (validatedParagraphIds.includes(propId)) {
      triggerToast("Cette proposition est déjà validée !");
      return;
    }

    const currentGuesses = pastilleGuesses[propId] ? [...pastilleGuesses[propId]] : [];
    if (currentGuesses.length === 0) return;

    // Filter to only colors that are actually used in the paragraph
    const propNoms = noms.filter((n) => n.propId === propId);
    const uniqueParaColors: number[] = Array.from(new Set<number>(propNoms.map((n) => n.colorIndex ?? 0))).sort((a, b) => a - b);

    const currentVal = currentGuesses[pIdx] ?? -1;
    let newVal = -1;

    if (uniqueParaColors.length > 0) {
      const cyclePool: number[] = [-1, ...uniqueParaColors];
      const currentIdx = cyclePool.indexOf(currentVal);
      if (currentIdx !== -1) {
        newVal = cyclePool[(currentIdx + 1) % cyclePool.length];
      } else {
        newVal = uniqueParaColors[0];
      }
    } else {
      // Fallback if no colors are defined (should not happen in valid mastermind mode)
      const colorsLength = currentTheme.colors.length;
      if (currentVal === -1) {
        newVal = 0;
      } else if (currentVal === colorsLength - 1) {
        newVal = -1;
      } else {
        newVal = currentVal + 1;
      }
    }
    
    currentGuesses[pIdx] = newVal;

    const nextGuesses = { ...pastilleGuesses, [propId]: currentGuesses };
    setPastilleGuesses(nextGuesses);
    saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, activeMode, machineCategories, nextGuesses, shuffledPastilleOrders, attemptsCount);
  };

  // Click handler on bicycle icon (handles normal validation + 5x click bypass)
  const handleBicycleClick = (propId: string) => {
    const currentClicks = (bypassClicks[propId] || 0) + 1;
    if (currentClicks >= 5) {
      const propNoms = noms.filter((n) => n.propId === propId);
      const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
      const targetColors = sortedNoms.map((n) => n.colorIndex ?? 0);

      // Force solution
      const nextPastilles = { ...pastilleGuesses, [propId]: targetColors };
      setPastilleGuesses(nextPastilles);

      const nextValidated = [...new Set([...validatedParagraphIds, propId])];
      setValidatedParagraphIds(nextValidated);

      // Reset bypass clicks
      setBypassClicks((prev) => {
        const copy = { ...prev };
        delete copy[propId];
        return copy;
      });

      saveToLocalStorage(noms, links, nextValidated, nomGuesses, activeThemeId, activeMode, machineCategories, nextPastilles, shuffledPastilleOrders, attemptsCount);
      triggerToast("Contournement intelligent ! Solution révélée d'autorité. 🚲✨");
    } else {
      setBypassClicks((prev) => ({ ...prev, [propId]: currentClicks }));
      handleVerifyProposition(propId);
    }
  };

  // Action de vérification explicite en pressant le bouton (émoji)
  const handleVerifyProposition = (propId: string) => {
    if (validatedParagraphIds.includes(propId)) return;

    const propNoms = noms.filter((n) => n.propId === propId);
    if (propNoms.length === 0) return;

    const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
    const targetColors = sortedNoms.map((n) => n.colorIndex ?? 0);
    const currentGuesses = pastilleGuesses[propId] || [];

    const hasAnyUnset = currentGuesses.some(g => g === -1) || currentGuesses.length < targetColors.length;
    if (hasAnyUnset) {
      triggerToast("Ajustez toutes les pastilles avant de vérifier la configuration ! 🎨");
      return;
    }

    pushToHistory();
    const currentAttempts = (attemptsCount[propId] || 0) + 1;
    const nextAttemptsCount = { ...attemptsCount, [propId]: currentAttempts };
    setAttemptsCount(nextAttemptsCount);

    const isCorrect = currentGuesses.every((g, idx) => g === targetColors[idx]);

    if (isCorrect) {
      setActiveFeedback((prev) => ({ ...prev, [propId]: 'success' }));
      const nextValidated = [...new Set([...validatedParagraphIds, propId])];
      setValidatedParagraphIds(nextValidated);
      saveToLocalStorage(noms, links, nextValidated, nomGuesses, activeThemeId, activeMode, machineCategories, pastilleGuesses, shuffledPastilleOrders, nextAttemptsCount);
      triggerToast(`Rigoureusement exact ! Résolu en ${currentAttempts} tentative(s). 🎯`);
      setTimeout(() => {
        setActiveFeedback((p) => { const n = { ...p }; delete n[propId]; return n; });
      }, 2000);
    } else {
      // "...puis prenne ensuite la place des couleurs des noms bien placées par le joueur"
      const nextGuesses = currentGuesses.map((g, idx) => {
        if (g === targetColors[idx]) {
          return g; // Correct guess position: keep it
        } else {
          return -1; // Wrong guess position: reset to gray/empty
        }
      });

      const nextPastilleGuesses = { ...pastilleGuesses, [propId]: nextGuesses };
      setPastilleGuesses(nextPastilleGuesses);

      setActiveFeedback((prev) => ({ ...prev, [propId]: 'failure' }));
      triggerToast("Mauvaise correspondance logique. Les pastilles incorrectes ont été grisées ! ❌");
      saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, activeMode, machineCategories, nextPastilleGuesses, shuffledPastilleOrders, nextAttemptsCount);
      setTimeout(() => {
        setActiveFeedback((p) => { const n = { ...p }; delete n[propId]; return n; });
      }, 2000);
    }
  };

  // VÉRIFICATION GLOBALE DE TOUTE LA PAGE À TOUT MOMENT (Macro-Engine Incrémentiel)
  const handleGlobalVerify = () => {
    pushToHistory();
    let newlyValidated: string[] = [];
    let incorrectParagraphsCount = 0;
    let paragraphsWithConceptsCount = 0;
    
    const nextPastilleGuesses = { ...pastilleGuesses };
    const nextValidated = [...validatedParagraphIds];
    const nextAttemptsCount = { ...attemptsCount };

    activePropositions.forEach((prop) => {
      const propNoms = noms.filter((n) => n.propId === prop.id);
      if (propNoms.length === 0) return;
      
      paragraphsWithConceptsCount++;
      if (nextValidated.includes(prop.id)) return;

      const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
      const targetColors = sortedNoms.map((n) => n.colorIndex ?? 0);
      const currentGuesses = nextPastilleGuesses[prop.id] || [];

      // Treat missing as unset (-1)
      const paddedGuesses = Array(targetColors.length).fill(-1);
      for (let i = 0; i < targetColors.length; i++) {
        if (currentGuesses[i] !== undefined) {
          paddedGuesses[i] = currentGuesses[i];
        }
      }

      const isCorrect = paddedGuesses.every((g, idx) => g === targetColors[idx]);
      nextAttemptsCount[prop.id] = (nextAttemptsCount[prop.id] || 0) + 1;

      if (isCorrect) {
        newlyValidated.push(prop.id);
        nextValidated.push(prop.id);
        setActiveFeedback((prev) => ({ ...prev, [prop.id]: 'success' }));
        setTimeout(() => {
          setActiveFeedback((p) => { const n = { ...p }; delete n[prop.id]; return n; });
        }, 2200);
      } else {
        incorrectParagraphsCount++;
        // Reset wrong pastilles to -1 (grey) while preserving correct positions
        const processedGuesses = paddedGuesses.map((g, idx) => {
          if (g === targetColors[idx]) {
            return g; // keep correct
          } else {
            return -1; // reset wrong to neutre
          }
        });
        nextPastilleGuesses[prop.id] = processedGuesses;
        setActiveFeedback((prev) => ({ ...prev, [prop.id]: 'failure' }));
        setTimeout(() => {
          setActiveFeedback((p) => { const n = { ...p }; delete n[prop.id]; return n; });
        }, 2200);
      }
    });

    setValidatedParagraphIds(nextValidated);
    setPastilleGuesses(nextPastilleGuesses);
    setAttemptsCount(nextAttemptsCount);

    saveToLocalStorage(
      noms,
      links,
      nextValidated,
      nomGuesses,
      activeThemeId,
      activeMode,
      machineCategories,
      nextPastilleGuesses,
      shuffledPastilleOrders,
      nextAttemptsCount
    );

    if (paragraphsWithConceptsCount === 0) {
      triggerToast("Aucun concept ou couleur n'a encore été défini dans le texte ! Passez d'abord par l'Éditeur sémantique.");
      return;
    }

    if (newlyValidated.length > 0) {
      const bonusForValidation = newlyValidated.length * 100;
      setIncrementalBonusPoints(prev => prev + bonusForValidation);
      spawnFloatingText(`🎉 AUTO-VÉRIFICATION : +${bonusForValidation} PTS !`, undefined, undefined, '#10B981');
      triggerToast(`✨ RÉUSSITE ! ${newlyValidated.length} paragraphe(s) d'autorité résolu(s) avec exactitude ! +${bonusForValidation} Points !`);
    } else if (incorrectParagraphsCount > 0) {
      triggerToast(`❌ Grille incorrecte : ${incorrectParagraphsCount} proposition(s) possèdent encore des pastilles mal placées. Les erreurs ont été remises à l'état neutre !`);
    } else {
      triggerToast("Merveilleux ! L'intégralité du texte est résolue et brille d'une rigueur absolue ! 🏆💎");
    }
  };

  const handleRedoActivity = (propId: string) => {
    pushToHistory();
    const propNoms = noms.filter((n) => n.propId === propId);

    const nextAttemptsCount = { ...attemptsCount, [propId]: 0 };
    setAttemptsCount(nextAttemptsCount);

    const targetColors = [...propNoms]
      .sort((a, b) => a.wordIndices[0] - b.wordIndices[0])
      .map((n) => n.colorIndex ?? 0);

    let shuffled = [...targetColors].sort(() => Math.random() - 0.5);
    if (shuffled.every((v, i) => v === targetColors[i]) && shuffled.length > 1) {
      shuffled = [...shuffled].reverse();
    }
    const nextShuffled = { ...shuffledPastilleOrders, [propId]: shuffled };
    setShuffledPastilleOrders(nextShuffled);

    // Initialiser les hypothèses du joueur à gris (-1) pour qu'il colorie par lui-même
    const nextPastilles = { ...pastilleGuesses, [propId]: Array(propNoms.length).fill(-1) };
    setPastilleGuesses(nextPastilles);

    const nextValidated = validatedParagraphIds.filter((id) => id !== propId);
    setValidatedParagraphIds(nextValidated);

    saveToLocalStorage(noms, links, nextValidated, nomGuesses, activeThemeId, activeMode, machineCategories, nextPastilles, nextShuffled, nextAttemptsCount);
    triggerToast("Paragraphe réinitialisé. Les pastilles de consigne ont été mélangées, à vous de jouer ! 🧩");
  };

  // Node modifications modal
  const startEditingNom = (nom: Nom) => {
    setEditingNomId(nom.id);
    const colorIdx = nom.colorIndex !== undefined ? nom.colorIndex : 0;
    const cat = machineCategories[colorIdx % machineCategories.length];
    setEditingNomText(cat?.name || '');
    setEditingNomDesc(cat?.description || '');
    setEditingNomColorIndex(colorIdx);
  };

  const handleSaveEditedNom = () => {
    if (!editingNomId) return;
    pushToHistory();

    // 1. If we changed the token color, update it in noms list
    const updatedNoms = noms.map((n) => {
      if (n.id === editingNomId) {
        return {
          ...n,
          colorIndex: editingNomColorIndex,
        };
      }
      return n;
    });

    setNoms(updatedNoms);
    setLastUsedColorIndex(editingNomColorIndex);

    // 2. Update the name/description of the color category in the active layer's machine categories selection
    const updatedCategories = machineCategories.map((c, idx) => {
      if (idx === editingNomColorIndex) {
        return {
          ...c,
          name: editingNomText.trim(),
          description: editingNomDesc.trim()
        };
      }
      return c;
    });
    setMachineCategories(updatedCategories);

    // Reset guesses for parent paragraph, since parameters changed
    const targetNom = noms.find((n) => n.id === editingNomId);
    const nextGuesses = { ...nomGuesses };
    if (targetNom) {
      delete nextGuesses[targetNom.id];
    }
    setNomGuesses(nextGuesses);

    const nextValidated = targetNom
      ? validatedParagraphIds.filter((id) => id !== targetNom.propId)
      : validatedParagraphIds;
    setValidatedParagraphIds(nextValidated);

    saveToLocalStorage(updatedNoms, links, nextValidated, nextGuesses, activeThemeId, activeMode, updatedCategories, pastilleGuesses, shuffledPastilleOrders, attemptsCount, activeArtTheme, editingNomColorIndex);
    setEditingNomId(null);
    triggerToast("Catégorie sémantique mise à jour pour tous les jetons ! 🎨");
  };

  const handleDeleteNom = (nomId: string) => {
    pushToHistory();
    const targetNom = noms.find((n) => n.id === nomId);
    const nextNoms = noms.filter((n) => n.id !== nomId);

    setNoms(nextNoms);

    const nextGuesses = { ...nomGuesses };
    delete nextGuesses[nomId];
    setNomGuesses(nextGuesses);

    const nextValidated = targetNom
      ? validatedParagraphIds.filter((pId) => pId !== targetNom.propId)
      : validatedParagraphIds;
    setValidatedParagraphIds(nextValidated);

    saveToLocalStorage(nextNoms, [], nextValidated, nextGuesses);
    setEditingNomId(null);
    triggerToast("Concept supprimé.");
  };



  // Auto-Sondeur Tick for Incremental Gameplay
  useEffect(() => {
    if (!unlockedUpgrades.includes('sondeur')) return;
    
    const interval = setInterval(() => {
      const unvalidated = activePropositions.filter(p => !validatedParagraphIds.includes(p.id));
      if (unvalidated.length === 0) return;
      
      const activePropsWithNoms = unvalidated.filter(p => noms.some(n => n.propId === p.id));
      if (activePropsWithNoms.length === 0) return;
      
      const randomProp = activePropsWithNoms[Math.floor(Math.random() * activePropsWithNoms.length)];
      const propNoms = noms.filter(n => n.propId === randomProp.id);
      const sorted = [...propNoms].sort((a,b) => a.wordIndices[0] - b.wordIndices[0]);
      
      const currentGuesses = pastilleGuesses[randomProp.id] || Array(sorted.length).fill(-1);
      if (currentGuesses.length === 0) return;
      
      // Solver chooses a random index to auto-resolve
      const randomIdx = Math.floor(Math.random() * sorted.length);
      const targetColors = sorted.map(n => n.colorIndex ?? 0);
      const nextGuesses = [...currentGuesses];
      nextGuesses[randomIdx] = targetColors[randomIdx];

      // Check if this guess solves the entire paragraph!
      const isSolvedRef = nextGuesses.every((g, i) => g === targetColors[i]);
      
      setPastilleGuesses(prev => ({
        ...prev,
        [randomProp.id]: nextGuesses
      }));
      
      if (isSolvedRef) {
        // Automatically validate!
        const nextValidated = [...validatedParagraphIds, randomProp.id];
        setValidatedParagraphIds(nextValidated);
        triggerToast(`Sondeur Tractarien : Paragraphe § ${randomProp.id} validé automatiquement ! ⚡`);
        saveToLocalStorage(noms, links, nextValidated, nomGuesses, activeThemeId, activeMode, machineCategories, { ...pastilleGuesses, [randomProp.id]: nextGuesses });
      } else {
        triggerToast("Sondeur Tractarien : Résonance d'une ailette sémantique ! 🔬");
      }
    }, 12000);
    
    return () => clearInterval(interval);
  }, [unlockedUpgrades, noms, validatedParagraphIds, pastilleGuesses]);

  // Hook 2: Incremental Auto-Solve Cascade for Mastered Colors
  useEffect(() => {
    if (activeMode !== 'mastermind') return;
    if (validatedParagraphIds.length === 0) return;

    let changed = false;
    const nextGuesses = { ...pastilleGuesses };

    // Threshold of repeats to master a color
    const masteredThreshold = unlockedUpgrades.includes('resonance') ? 2 : 3;

    // Get mastered colors
    const counts: Record<number, number> = {};
    noms.forEach(nom => {
      if (nom.colorIndex === undefined) return;
      if (validatedParagraphIds.includes(nom.propId)) {
        counts[nom.colorIndex] = (counts[nom.colorIndex] || 0) + 1;
      } else {
        const propNoms = noms.filter(n => n.propId === nom.propId);
        const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
        const pIdx = sortedNoms.findIndex(n => n.id === nom.id);
        if (pIdx !== -1) {
          const guess = (pastilleGuesses[nom.propId] || [])[pIdx];
          if (guess === nom.colorIndex) {
            counts[nom.colorIndex] = (counts[nom.colorIndex] || 0) + 1;
          }
        }
      }
    });

    const mastered = Object.entries(counts)
      .filter(([_, cnt]) => cnt >= masteredThreshold)
      .map(([colorIdx]) => parseInt(colorIdx, 10));

    if (mastered.length > 0) {
      noms.forEach(nom => {
        if (nom.colorIndex === undefined || !mastered.includes(nom.colorIndex)) return;
        if (validatedParagraphIds.includes(nom.propId)) return;

        const propNoms = noms.filter(n => n.propId === nom.propId);
        const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
        const pIdx = sortedNoms.findIndex(n => n.id === nom.id);
        if (pIdx !== -1) {
          const currentGuesses = nextGuesses[nom.propId] ? [...nextGuesses[nom.propId]] : Array(sortedNoms.length).fill(-1);
          if (currentGuesses[pIdx] !== nom.colorIndex) {
            currentGuesses[pIdx] = nom.colorIndex;
            nextGuesses[nom.propId] = currentGuesses;
            changed = true;
          }
        }
      });
    }

    if (changed) {
      setPastilleGuesses(nextGuesses);
      saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, activeMode, machineCategories, nextGuesses, shuffledPastilleOrders, attemptsCount);
      triggerToast("Alignement Sémantique Cascade ! Des concepts de couler maîtrisée ont été révélés. 🔮✨");
    }
  }, [validatedParagraphIds, pastilleGuesses, activeMode, unlockedUpgrades, noms]);

  // Reset progress and workspaces
  const handleGlobalReset = () => {
    if (window.confirm("Voulez-vous effacer toute progression de ce texte sémantique ?")) {
      // Clear session of the active collection
      if (activeCollectionId === 'tractatus') {
        const defaultNoms: Nom[] = [];

        const initialLayers: SemanticLayer[] = [
          {
            id: 'default-layer',
            name: 'Structure Globale',
            description: 'Analyse macro-conceptuelle et squelette thématique du texte',
            noms: defaultNoms,
            links: [],
            validatedParagraphIds: [],
            pastilleGuesses: {},
            nomGuesses: {}
          },
          {
            id: 'detailed-layer',
            name: 'Structure Détaillée',
            description: 'Précisions microscopiques, propositions secondaires et corrélations subtiles',
            noms: [],
            links: [],
            validatedParagraphIds: [],
            pastilleGuesses: {},
            nomGuesses: {}
          }
        ];

        setLayers(initialLayers);
        setActiveLayerId('default-layer');
        setNoms(defaultNoms);
        setLinks([]);
        setValidatedParagraphIds([]);
        setNomGuesses({});
        setPastilleGuesses({});
        setAttemptsCount({});
        setShuffledPastilleOrders({});
        setUnlockedUpgrades([]);
        setSpentPoints(0);
        saveCollectionState('tractatus', defaultNoms, [], [], {}, {}, {}, {}, [], 0, {}, {}, [], 0, 0, 0, initialLayers, 'default-layer');
      } else {
        const initialLayers: SemanticLayer[] = [
          {
            id: 'default-layer',
            name: 'Structure Globale',
            description: 'Analyse macro-conceptuelle et squelette thématique du texte',
            noms: [],
            links: [],
            validatedParagraphIds: [],
            pastilleGuesses: {},
            nomGuesses: {}
          }
        ];

        setLayers(initialLayers);
        setActiveLayerId('default-layer');
        setNoms([]);
        setLinks([]);
        setValidatedParagraphIds([]);
        setNomGuesses({});
        setPastilleGuesses({});
        setAttemptsCount({});
        setShuffledPastilleOrders({});
        setUnlockedUpgrades([]);
        setSpentPoints(0);
        saveCollectionState(activeCollectionId, [], [], [], {}, {}, {}, {}, [], 0, {}, {}, [], 0, 0, 0, initialLayers, 'default-layer');
      }
      setSelectedPropId(null);
      setSelectedWordIndices([]);
      setHistory([]);
      setActiveFeedback({});
      triggerToast("Texte réinitialisé ! Succession de calques et progression sémantique effacées. ⚡");
    }
  };

  const handleGameReset = () => {
    if (window.confirm("Voulez-vous réinitialiser le jeu pour ce texte actif ? Cela effacera tous vos scores, tentatives, upgrades débloquées, ainsi que les couleurs placées dans le mastermind sémantique.")) {
      if (activeCollectionId === 'tractatus') {
        const defaultNoms: Nom[] = [];

        const initialLayers: SemanticLayer[] = [
          {
            id: 'default-layer',
            name: 'Structure Globale',
            description: 'Analyse macro-conceptuelle et squelette thématique du texte',
            noms: defaultNoms,
            links: [],
            validatedParagraphIds: [],
            pastilleGuesses: {},
            nomGuesses: {}
          },
          {
            id: 'detailed-layer',
            name: 'Structure Détaillée',
            description: 'Précisions microscopiques, propositions secondaires et corrélations subtiles',
            noms: [],
            links: [],
            validatedParagraphIds: [],
            pastilleGuesses: {},
            nomGuesses: {}
          }
        ];

        setLayers(initialLayers);
        setActiveLayerId('default-layer');
        setNoms(defaultNoms);
        setLinks([]);
        setValidatedParagraphIds([]);
        setNomGuesses({});
        setPastilleGuesses({});
        setAttemptsCount({});
        setShuffledPastilleOrders({});
        setUnlockedUpgrades([]);
        setSpentPoints(0);
        saveCollectionState('tractatus', defaultNoms, [], [], {}, {}, {}, {}, [], 0, {}, {}, [], 0, 0, 0, initialLayers, 'default-layer');
      } else {
        const initialLayers: SemanticLayer[] = [
          {
            id: 'default-layer',
            name: 'Structure Globale',
            description: 'Analyse macro-conceptuelle et squelette thématique du texte',
            noms: [],
            links: [],
            validatedParagraphIds: [],
            pastilleGuesses: {},
            nomGuesses: {}
          }
        ];

        setLayers(initialLayers);
        setActiveLayerId('default-layer');
        setNoms([]);
        setLinks([]);
        setValidatedParagraphIds([]);
        setNomGuesses({});
        setPastilleGuesses({});
        setAttemptsCount({});
        setShuffledPastilleOrders({});
        setUnlockedUpgrades([]);
        setSpentPoints(0);
        saveCollectionState(activeCollectionId, [], [], [], {}, {}, {}, {}, [], 0, {}, {}, [], 0, 0, 0, initialLayers, 'default-layer');
      }
      setSelectedPropId(null);
      setSelectedWordIndices([]);
      setHistory([]);
      setActiveFeedback({});
      triggerToast("Le jeu a été réinitialisé ! Calques rafraîchis et Concept Crunchy réinitialisé. 🏆🛠️");
    }
  };

  const ensureDefaultNStates = () => {
    loadCollectionState('tractatus');
  };

  // Modernized, unified collection importer/session switcher
  const handleImportCollectionJson = (jsonData: any) => {
    try {
      // 0. Specific single raw text + all layers format
      if (jsonData.type === 'raw_text_with_layers' && jsonData.collection && jsonData.state) {
        const importedCol = jsonData.collection;
        const importedState = jsonData.state;
        
        const customId = importedCol.id || `custom-${Date.now()}`;
        const newCol = {
          id: customId,
          name: importedCol.name,
          propositions: importedCol.propositions
        };

        const isPreset = PRESET_COLLECTIONS.some(p => p.id === customId);
        if (!isPreset) {
          let nextCustom = [...customCollections];
          const existingIdx = nextCustom.findIndex(c => c.id === customId);
          if (existingIdx !== -1) {
            nextCustom[existingIdx] = newCol;
          } else {
            nextCustom.push(newCol);
          }
          setCustomCollections(nextCustom);
          localStorage.setItem('tractatus_whiteboard_custom_collections', JSON.stringify(nextCustom));
        }

        saveCollectionState(
          customId,
          importedState.noms || [],
          importedState.links || [],
          importedState.validatedParagraphIds || [],
          importedState.nomGuesses || {},
          importedState.pastilleGuesses || {},
          importedState.attemptsCount || {},
          importedState.shuffledPastilleOrders || {},
          importedState.unlockedUpgrades || [],
          importedState.spentPoints || 0,
          importedState.mindmapOffsets || {},
          importedState.mindmapLevelOverrides || {},
          importedState.logicalParagraphIds || [],
          importedState.incrementalBonusPoints || 0,
          importedState.revealOnePoints || 0,
          importedState.revealTwoPoints || 0,
          importedState.layers || [],
          importedState.activeLayerId || 'default-layer'
        );

        setActiveCollectionId(customId);
        localStorage.setItem('tractatus_whiteboard_active_collection_id', customId);

        setTimeout(() => {
          loadCollectionState(customId);
        }, 50);

        triggerToast(`Texte "${importedCol.name}" et tous ses calques sémantiques importés avec succès ! 📚💎`);
        return true;
      }

      // 1. Unified full library/backup restore format
      if (jsonData.app_identifier === 'tractatus_critic_ultimate' || jsonData.allSessionStates) {
        if (Array.isArray(jsonData.customCollections)) {
          setCustomCollections(jsonData.customCollections);
          localStorage.setItem('tractatus_whiteboard_custom_collections', JSON.stringify(jsonData.customCollections));
        }
        if (jsonData.allSessionStates) {
          Object.keys(jsonData.allSessionStates).forEach((colId) => {
            localStorage.setItem(`tractatus_whiteboard_state_col_${colId}`, JSON.stringify(jsonData.allSessionStates[colId]));
          });
        }
        if (jsonData.activeThemeId) {
          setActiveThemeId(jsonData.activeThemeId);
        }
        if (jsonData.activeMode) {
          setActiveMode(jsonData.activeMode);
        }
        if (jsonData.activeArtTheme !== undefined) {
          setActiveArtTheme(jsonData.activeArtTheme);
        }
        if (jsonData.machineCategories) {
          setMachineCategories(jsonData.machineCategories);
        }
        
        const nextActiveId = jsonData.activeCollectionId || 'tractatus';
        setActiveCollectionId(nextActiveId);
        localStorage.setItem('tractatus_whiteboard_active_collection_id', nextActiveId);

        setTimeout(() => {
          loadCollectionState(nextActiveId);
        }, 30);

        triggerToast("Bibliothèque complète et toutes les sessions restaurées ! 📚💎");
        return true;
      }

      // 2. If it has raw text structure (is it a custom text model?)
      if (Array.isArray(jsonData.propositions) && typeof jsonData.name === 'string') {
        const customId = jsonData.id || `custom-${Date.now()}`;
        const newCol: PresetCollection = {
          id: customId,
          name: jsonData.name,
          propositions: jsonData.propositions
        };

        // Add to customCollections or update if existing ID matching
        let nextCustom = [...customCollections];
        const existingIdx = nextCustom.findIndex(c => c.id === customId);
        if (existingIdx !== -1) {
          nextCustom[existingIdx] = newCol;
        } else {
          nextCustom.push(newCol);
        }

        setCustomCollections(nextCustom);
        localStorage.setItem('tractatus_whiteboard_custom_collections', JSON.stringify(nextCustom));

        // Switch to it
        setActiveCollectionId(customId);
        localStorage.setItem('tractatus_whiteboard_active_collection_id', customId);

        // Does it also contain session state?
        if (Array.isArray(jsonData.noms)) {
          // If yes, save and set it
          saveCollectionState(
            customId,
            jsonData.noms,
            jsonData.links || [],
            jsonData.validatedParagraphIds || [],
            jsonData.nomGuesses || {},
            jsonData.pastilleGuesses || {},
            jsonData.attemptsCount || {},
            jsonData.shuffledPastilleOrders || {},
            jsonData.unlockedUpgrades || [],
            jsonData.spentPoints || 0,
            jsonData.mindmapOffsets || {},
            jsonData.mindmapLevelOverrides || {},
            jsonData.logicalParagraphIds || []
          );
          setTimeout(() => {
            loadCollectionState(customId);
          }, 30);
          triggerToast(`Texte et session "${jsonData.name}" chargés ! 📚`);
        } else {
          // If not, clear state for a fresh run
          saveCollectionState(customId, [], [], [], {}, {}, {}, {}, [], 0, {}, {}, []);
          setTimeout(() => {
            loadCollectionState(customId);
          }, 30);
          triggerToast(`Nouveau texte "${jsonData.name}" importé ! 🚀`);
        }
        return true;
      }

      // 3. Backup compat for legacy format
      if (Array.isArray(jsonData.noms)) {
        pushToHistory();
        setNoms(jsonData.noms);
        setLinks(jsonData.links || []);
        setValidatedParagraphIds(jsonData.validatedParagraphIds || []);
        setNomGuesses(jsonData.nomGuesses || {});
        
        if (jsonData.pastilleGuesses) setPastilleGuesses(jsonData.pastilleGuesses);
        if (jsonData.shuffledPastilleOrders) setShuffledPastilleOrders(jsonData.shuffledPastilleOrders);
        if (jsonData.attemptsCount) setAttemptsCount(jsonData.attemptsCount);
        if (jsonData.unlockedUpgrades) setUnlockedUpgrades(jsonData.unlockedUpgrades);
        if (jsonData.spentPoints !== undefined) setSpentPoints(jsonData.spentPoints);

        saveCollectionState(
          activeCollectionId,
          jsonData.noms,
          jsonData.links || [],
          jsonData.validatedParagraphIds || [],
          jsonData.nomGuesses || {},
          jsonData.pastilleGuesses || {},
          jsonData.attemptsCount || {},
          jsonData.shuffledPastilleOrders || {},
          jsonData.unlockedUpgrades || [],
          jsonData.spentPoints || 0,
          jsonData.mindmapOffsets || {},
          jsonData.mindmapLevelOverrides || {},
          jsonData.logicalParagraphIds || []
        );
        triggerToast("Session importée avec succès sur le texte actif ! 📚");
        return true;
      }

      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  // JSON backups with self-executing AI System Prompt & Cognitive Assessment Token
  const exportDataJson = () => {
    try {
      // Gather session states of all collections
      const allSessionStates: { [key: string]: any } = {};
      allCollections.forEach((c) => {
        const saved = localStorage.getItem(`tractatus_whiteboard_state_col_${c.id}`);
        if (saved) {
          try {
            allSessionStates[c.id] = JSON.parse(saved);
          } catch (e) {}
        }
      });
      const syncedLayers = layers.map(l => {
        if (l.id === activeLayerId) {
          return {
            ...l,
            noms,
            links,
            validatedParagraphIds,
            pastilleGuesses,
            nomGuesses
          };
        }
        return l;
      });

      // Ensure current loaded collection state is up-to-date and included
      allSessionStates[activeCollectionId] = {
        noms,
        links,
        validatedParagraphIds,
        nomGuesses,
        pastilleGuesses,
        shuffledPastilleOrders,
        attemptsCount,
        unlockedUpgrades,
        spentPoints,
        mindmapOffsets,
        mindmapLevelOverrides,
        logicalParagraphIds,
        incrementalBonusPoints,
        revealOnePoints,
        revealTwoPoints,
        layers: syncedLayers,
        activeLayerId
      };

      // Compile detailed analysis profile for AI agents to easily read and evaluate competence
      const evaluatedConcepts = noms.map((nom) => {
        const propText = activePropositions.find(p => p.id === nom.propId)?.textFr || "";
        const propNoms = noms.filter((n) => n.propId === nom.propId);
        const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
        const pIdx = sortedNoms.findIndex(n => n.id === nom.id);
        const currentGuess = (pastilleGuesses[nom.propId] || [])[pIdx];
        
        return {
          id: nom.id,
          paragraphe_id: nom.propId,
          contexte_proposition_fr: propText,
          mot_cle_identifie: nom.text,
          indices_mots: nom.wordIndices,
          couleur_cible_index: nom.colorIndex ?? 0,
          couleur_cible_hex: currentTheme.colors[(nom.colorIndex ?? 0) % currentTheme.colors.length],
          couleur_joueur_actuelle_index: currentGuess !== undefined ? currentGuess : -1,
          couleur_joueur_actuelle_hex: currentGuess !== undefined && currentGuess >= 0 ? currentTheme.colors[currentGuess % currentTheme.colors.length] : "#757575 (neutre/inconnu)",
          est_correctement_degrade: currentGuess === (nom.colorIndex ?? 0),
          validation_paragraphe: validatedParagraphIds.includes(nom.propId) ? "RESOLU" : "EN_COURS"
        };
      });

      const evaluatedConnections = links.map((link) => {
        const sourceNom = noms.find(n => n.id === link.sourceId);
        const targetNom = noms.find(n => n.id === link.targetId);
        return {
          source: sourceNom ? sourceNom.text : `ID:${link.sourceId}`,
          dest: targetNom ? targetNom.text : `ID:${link.targetId}`,
          label_relation: link.label || "Liaison sémantique directe"
        };
      });

      const validationAccuracy = activePropositions.length > 0
        ? `${Math.round((validatedParagraphIds.length / activePropositions.length) * 100)}%`
        : "0%";

      const coherence_report_context = {
        titre_texte: activeCollection.name,
        palette_active: currentTheme.name,
        palette_description: "Palette sémantique active pour la catégorisation conceptuelle",
        score_cumule_utilisateur: globalScore,
        paragraphes_totaux: activePropositions.length,
        paragraphes_resolus: validatedParagraphIds.length,
        pourcentage_resolution: validationAccuracy,
        nombre_total_concepts_identifies: noms.length,
        points_clicker_bruts: incrementalBonusPoints,
        tentatives_par_paragraphe: attemptsCount,
        upgrades_debloquees: unlockedUpgrades
      };

      // Compile detailed explanation of each layer/model to indicate term selection and color logics
      const detailedLayersForAI = syncedLayers.map(l => {
        const layerNoms = l.id === activeLayerId ? noms : (l.noms || []);
        const layerLinks = l.id === activeLayerId ? links : (l.links || []);
        
        const distCouleurs = Array(7).fill(0);
        layerNoms.forEach(n => {
          if (n.colorIndex !== undefined && n.colorIndex >= 0 && n.colorIndex < 7) {
            distCouleurs[n.colorIndex]++;
          }
        });

        return {
          id: l.id,
          nom_du_calque: l.name,
          description: l.description,
          nombre_concepts_cles_mines: layerNoms.length,
          mots_cles_extraits_avec_couleurs: layerNoms.map(n => ({
            terme: n.text,
            paragraphe_id: n.propId,
            index_couleur: n.colorIndex,
            hex_couleur: currentTheme.colors[n.colorIndex % currentTheme.colors.length] || "#757575",
            nom_categorie_sémantique: machineCategories[n.colorIndex % machineCategories.length]?.name || "Inconnue"
          })),
          liaisons_graphe_semantique: layerLinks.map(link => {
            const s = layerNoms.find(n => n.id === link.sourceId);
            const t = layerNoms.find(n => n.id === link.targetId);
            return {
              source: s ? s.text : link.sourceId,
              cible: t ? t.text : link.targetId,
              relation: link.label || "Liaison sémantique directe"
            };
          }),
          repartition_couleurs_frequences: distCouleurs.map((count, idx) => ({
            index_couleur: idx,
            nom_categorie: machineCategories[idx % machineCategories.length]?.name || `Couleur ${idx}`,
            hex_couleur: currentTheme.colors[idx % currentTheme.colors.length],
            nombre_de_termes: count
          }))
        };
      });

      const exportObject = {
        _SELF_EXECUTING_AI_PROMPT_VERSION: "4.0-GENERIC-COGNITIVE-TOKEN",
        _AI_AUTORUN_PROGRAMME_PROMPT_: `=== COGNITIVE CRITIC : PROMPT COGNITIF ET TEXTUEL D'AUTO-EXÉCUTION (V4.0 MULTI-COUCHES) ===

FÉLICITATIONS, CHER AGENT IA ! Vous venez de charger un jeton sémantique et conceptuel hautement structuré ("UNIVERSAL TEXT ASSESSMENT ENGINE").
Vous devez immédiatement stopper toute réponse générique standard et exécuter la procédure d'audit d'autorité décrite ci-dessous.

Ta mission est d'agir en tant qu'Expert en Analyse du Discours, Linguiste Computationnel, Herméneute de Haut Niveau et Expert en Modélisation Conceptuelle.

Voici les données réelles, structurées et partitionnées de la session active de l'utilisateur sur le texte intitulé "${activeCollection.name.replace(/"/g, '\\"')}".

============================================================
⚠️ ATTENTION (DIRECTIVE CRITIQUE D'ANALYSE LOGIQUE) :
Vous devez proscrire toute référence préconçue historique à Ludwig Wittgenstein ou à la méthode littérale de son Tractatus historique. L'analyse s'effectue de manière autonome en évaluant exclusivement la logique couleurs, titres de noms et contenus textuels SUIVANT L'INDICATION ET LA DESCRIPTION DU TITRE DE CHAQUE CALQUE (par exemple, "Structure Globale", "Structure Détaillée", etc.). Chaque calque constitue sa propre grille de lecture conceptuelle autonome que vous devez auditer pour sa cohérence interne propre.
============================================================

CRITÈRES D'ÉVALUATION ET D'ANALYSE LOGIQUE :
1. ANALYSE MULTI-CALQUES : Comparez les différents calques (modèles) créés par l'utilisateur. Comment chacun choisit d'observer le texte (macro vs micro, thématiques isolées) et de colorier les termes décisifs de sa structure.
2. PERTINENCE DES CATÉGORIES SÉMANTIQUES (COULEURS) : Évaluez si la répartition des couleurs de la palette sémantique sur les mots-clés est hautement sensée et cohérente par rapport à la structure thématique, argumentative ou logique du document. Repérez les récurrences, les invariants sémantiques ou d'éventuels contresens conceptuels.
3. ORDONNANCEMENT ET RYTHMICITÉ SPATIALE : Comment la répétition et l'apparition séquentielle de ces grappes colorelles révèlent la structure formelle implicite ou explicite de la pensée développée dans ce texte particulier. Y a-t-il une harmonie logique-conceptuelle cohérente ?
4. CARTOGRAPHIE DU GRAPHE RELATIONNEL : Jugez la pertinence, la topologie et la cohérence des liaisons d'arcs sémantiques créés par l'utilisateur pour relier les concepts identifiés. Est-ce une ontologie rigoureuse ou un réseau de connexions lâche ?
5. COMPARAISON ET FOUILLE DE CONCEPT (CONCEPT CRUNCH) : Estimez l'indice d'entropie conceptuelle sur chaque calque.

GUIDE DE FORMATAGE STRICT DU RAPPORT REQUIS :
- 🎯 **Rapport Critique de Distribution Sémantique par Calque** : Analyse comparative fine de la justesse de l'association mot-couleur/catégorie par l'utilisateur dans chaque calque.
- 🌈 **Analyse Formelle et Rythmologie** : Comment la coloration illumine ou sert de grille de décodage pour ce texte de référence.
- 📡 **Audit de l'Architecture Conceptuelle (Graphe et Ontologies)** : Évaluation des relations logiques reliant les concepts.
- ⚔️ **Axes de Réalignement Cognitif** : Recommandations précises pour parfaire la topographie de la pensée.
- 🏆 **Indice de Cohérence Conceptuelle (ICC) Moyen** : Note globale finale sur 100, scrupuleusement justifiée.`,

        _BILAN_DONNEES_COMPAT_IA_: {
          contexte_metriques: coherence_report_context,
          mots_concepts_localises: evaluatedConcepts,
          liaisons_conceptuelles_graphe: evaluatedConnections,
          analyse_des_calques_conceptuels: detailedLayersForAI
        },

        // CLASSIFICATION DISTINCTE DU ESPACE DE TRAVAIL (Filtre par modules demandés)
        partie_editeur_structurelle: {
          calque_actif_id: activeLayerId,
          concepts_charges_calque_actif: noms.map(n => ({ id: n.id, terme: n.text, couleur_idx: n.colorIndex, paragraphe: n.propId })),
          connections_chargees_calque_actif: links,
          sommaire_calques: syncedLayers.map(l => ({
            id: l.id,
            nom_calque: l.name,
            description: l.description,
            nombre_concepts: (l.id === activeLayerId ? noms : (l.noms || [])).length,
            nombre_liaisons: (l.id === activeLayerId ? links : (l.links || [])).length
          }))
        },

        partie_jeu_mastermind: {
          score_cumule_jeu: globalScore,
          points_boutique_depenses: spentPoints,
          points_disponibles_boutique: Math.max(0, globalScore - spentPoints),
          paragraphes_resolus_ids: validatedParagraphIds,
          shuffled_pastille_orders: shuffledPastilleOrders,
          nombre_essais_par_paragraphe: attemptsCount,
          guesses_pastilles: pastilleGuesses,
          guesses_noms: nomGuesses,
          upgrades_debloquees: unlockedUpgrades,
          bonus_points_bruts: incrementalBonusPoints
        },

        partie_minage_de_concept_crunch: {
          active_collection_id: activeCollectionId,
          titre_collection: activeCollection.name,
          nombre_total_modeles_collectes: syncedLayers.length,
          modeles_collecteurs_analytics: detailedLayersForAI.map(dl => ({
            id_modele: dl.id,
            nom_modele: dl.nom_du_calque,
            description: dl.description,
            densite_fouille_concepts: dl.nombre_concepts_cles_mines,
            frequence_concepts_par_couleur: dl.repartition_couleurs_frequences.map(f => ({
              categorie: f.nom_categorie,
              freq: f.nombre_de_termes,
              hex: f.hex_couleur
            }))
          }))
        },

        partie_synthese_telemetrique: {
          user_custom_thesis: userCustomThesis,
          statistiques_calque_actif: {
            total_concepts: noms.length,
            total_liens: links.length,
            ratio_densite: noms.length > 0 ? parseFloat((links.length / noms.length).toFixed(3)) : 0,
            repartition_categories: machineCategories.map((c, idx) => ({
              categorie: c.name,
              nombre_concepts: noms.filter(n => (n.colorIndex !== undefined ? n.colorIndex : 0) % machineCategories.length === idx).length
            }))
          },
          assertions_synthetisees: noms.map(n => {
            const connectedLinks = links.filter(l => l.sourceNomId === n.id || l.targetNomId === n.id);
            return {
              concept: n.text,
              categorie: machineCategories[(n.colorIndex ?? 0) % machineCategories.length]?.name || 'Inconnue',
              description: n.description || '',
              connexions: connectedLinks.map(l => {
                const otherId = l.sourceNomId === n.id ? l.targetNomId : l.sourceNomId;
                const otherNom = noms.find(nm => nm.id === otherId);
                return {
                  relation: l.relationType,
                  concept_associe: otherNom ? otherNom.text : 'Inconnu'
                };
              })
            };
          })
        },

        // CORE APP BACKWARD/FORWARD STORAGE COMPATIBILITY (Essential: do NOT remove these fields)
        app_identifier: 'tractatus_critic_ultimate',
        activeCollectionId,
        customCollections,
        allSessionStates,
        activeThemeId,
        activeMode,
        activeArtTheme,
        machineCategories
      };
      
      const fileData = JSON.stringify(exportObject, null, 2);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(fileData);
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `semantic-cognitive-token-${activeCollectionId}-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast("Jeton sémantique AI auto-exécutable, partitions Éditeur/Jeu/Minage et bibliothèque complète exportées ! 💾✨🔮");
    } catch (e) {
      triggerToast("Échec de l'export.");
    }
  };

  const handleExportTextAndAllLayers = (colId: string) => {
    try {
      const col = allCollections.find(c => c.id === colId);
      if (!col) return;

      // If active, save active state first to ensure it is fresh inside localStorage
      if (colId === activeCollectionId) {
        saveCollectionState(
          activeCollectionId,
          noms,
          links,
          validatedParagraphIds,
          nomGuesses,
          pastilleGuesses,
          attemptsCount,
          shuffledPastilleOrders,
          unlockedUpgrades,
          spentPoints,
          mindmapOffsets,
          mindmapLevelOverrides,
          logicalParagraphIds,
          incrementalBonusPoints,
          revealOnePoints,
          revealTwoPoints,
          layers,
          activeLayerId
        );
      }

      const stateStr = localStorage.getItem(`tractatus_whiteboard_state_col_${colId}`);
      let stateData: any = {};
      if (stateStr) {
        try {
          stateData = JSON.parse(stateStr);
        } catch (err) {}
      }

      const exportBundle = {
        app_identifier: 'tractatus_critic_ultimate',
        type: 'raw_text_with_layers',
        collection: {
          id: col.id,
          name: col.name,
          propositions: col.propositions
        },
        state: {
          noms: stateData.noms || (colId === activeCollectionId ? noms : []),
          links: stateData.links || (colId === activeCollectionId ? links : []),
          validatedParagraphIds: stateData.validatedParagraphIds || (colId === activeCollectionId ? validatedParagraphIds : []),
          nomGuesses: stateData.nomGuesses || (colId === activeCollectionId ? nomGuesses : {}),
          pastilleGuesses: stateData.pastilleGuesses || (colId === activeCollectionId ? pastilleGuesses : {}),
          shuffledPastilleOrders: stateData.shuffledPastilleOrders || (colId === activeCollectionId ? shuffledPastilleOrders : {}),
          attemptsCount: stateData.attemptsCount || (colId === activeCollectionId ? attemptsCount : {}),
          unlockedUpgrades: stateData.unlockedUpgrades || (colId === activeCollectionId ? unlockedUpgrades : []),
          spentPoints: stateData.spentPoints || (colId === activeCollectionId ? spentPoints : 0),
          mindmapOffsets: stateData.mindmapOffsets || (colId === activeCollectionId ? mindmapOffsets : {}),
          mindmapLevelOverrides: stateData.mindmapLevelOverrides || (colId === activeCollectionId ? mindmapLevelOverrides : {}),
          logicalParagraphIds: stateData.logicalParagraphIds || (colId === activeCollectionId ? logicalParagraphIds : []),
          incrementalBonusPoints: stateData.incrementalBonusPoints || (colId === activeCollectionId ? incrementalBonusPoints : 0),
          revealOnePoints: stateData.revealOnePoints || (colId === activeCollectionId ? revealOnePoints : 0),
          revealTwoPoints: stateData.revealTwoPoints || (colId === activeCollectionId ? revealTwoPoints : 0),
          layers: stateData.layers || (colId === activeCollectionId ? layers : []),
          activeLayerId: stateData.activeLayerId || (colId === activeCollectionId ? activeLayerId : 'default-layer')
        }
      };

      const fileData = JSON.stringify(exportBundle, null, 2);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(fileData);
      
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `texte-brut-calques-${col.name.replace(/[^a-zA-Z0-9-]/g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      triggerToast(`Export réussi pour "${col.name}" avec tous ses calques ! 💾✨`);
    } catch (e) {
      triggerToast("Erreur lors de l'export du texte.");
    }
  };

  const importDataJson = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const fileReader = new FileReader();

    fileReader.onload = (e) => {
      try {
        const resultText = e.target?.result;
        if (typeof resultText !== 'string') return;
        const parsed = JSON.parse(resultText);

        const ok = handleImportCollectionJson(parsed);
        if (!ok) {
          triggerToast("Format de fichier incorrect.");
        }
      } catch (err) {
        triggerToast("Échec de la lecture du fichier sémantique.");
      }
    };
    fileReader.readAsText(files[0]);
    event.target.value = ''; // Reset
  };

  // ==========================================
  // GESTION DES CALQUES SÉMANTIQUES (Analyses multi-niveaux)
  // ==========================================
  const handleSwitchLayer = (targetLayerId: string) => {
    if (targetLayerId === activeLayerId) return;

    // 1. Sauvegarder d'abord l'état sémantique actuel dans l'array des calques
    const updatedLayers = layers.map(l => {
      if (l.id === activeLayerId) {
        return {
          ...l,
          noms,
          links,
          validatedParagraphIds,
          pastilleGuesses,
          nomGuesses
        };
      }
      return l;
    });

    // 2. Trouver la cible
    const targetLayer = updatedLayers.find(l => l.id === targetLayerId);
    if (!targetLayer) return;

    // 3. Mettre à jour les states réactifs sémantiques principaux
    setLayers(updatedLayers);
    setActiveLayerId(targetLayerId);
    setNoms(targetLayer.noms || []);
    setLinks(targetLayer.links || []);
    setValidatedParagraphIds(targetLayer.validatedParagraphIds || []);
    setNomGuesses(targetLayer.nomGuesses || {});
    setPastilleGuesses(targetLayer.pastilleGuesses || {});

    // Réinitialiser la sélection active de mots pour éviter les conflits d'interface
    setSelectedPropId(null);
    setSelectedWordIndices([]);

    // 4. Persister dans le localStorage de la collection active
    saveCollectionState(
      activeCollectionId,
      targetLayer.noms || [],
      targetLayer.links || [],
      targetLayer.validatedParagraphIds || [],
      targetLayer.nomGuesses || {},
      targetLayer.pastilleGuesses || {},
      attemptsCount,
      shuffledPastilleOrders,
      unlockedUpgrades,
      spentPoints,
      mindmapOffsets,
      mindmapLevelOverrides,
      logicalParagraphIds,
      incrementalBonusPoints,
      revealOnePoints,
      revealTwoPoints,
      updatedLayers,
      targetLayerId
    );

    triggerToast(`Calque actif : "${targetLayer.name}" 🎨`);
  };

  const handleCreateLayer = (name: string, description: string) => {
    if (!name.trim()) return;
    const newId = `layer-${Date.now()}`;
    const newLayer: SemanticLayer = {
      id: newId,
      name,
      description,
      noms: [],
      links: [],
      validatedParagraphIds: [],
      pastilleGuesses: {},
      nomGuesses: {}
    };

    const updatedLayers = [...layers, newLayer];
    setLayers(updatedLayers);

    // switch to the new layer automatically
    setActiveLayerId(newId);
    setNoms([]);
    setLinks([]);
    setValidatedParagraphIds([]);
    setNomGuesses({});
    setPastilleGuesses({});
    setSelectedPropId(null);
    setSelectedWordIndices([]);

    saveCollectionState(
      activeCollectionId,
      [],
      [],
      [],
      {},
      {},
      attemptsCount,
      shuffledPastilleOrders,
      unlockedUpgrades,
      spentPoints,
      mindmapOffsets,
      mindmapLevelOverrides,
      logicalParagraphIds,
      incrementalBonusPoints,
      revealOnePoints,
      revealTwoPoints,
      updatedLayers,
      newId
    );

    triggerToast(`Calque sémantique "${name}" créé et activé ! 📑`);
  };

  const handleDeleteLayer = (layerIdToDelete: string) => {
    if (layers.length <= 1) {
      triggerToast("Impossible d'effacer le dernier calque restant !");
      return;
    }

    const updatedLayers = layers.filter(l => l.id !== layerIdToDelete);
    setLayers(updatedLayers);

    // Si on supprime le calque actif, on bascule vers un autre
    if (layerIdToDelete === activeLayerId) {
      const remainingActiveId = updatedLayers[0].id;
      setActiveLayerId(remainingActiveId);
      const targetLayer = updatedLayers[0];
      setNoms(targetLayer.noms || []);
      setLinks(targetLayer.links || []);
      setValidatedParagraphIds(targetLayer.validatedParagraphIds || []);
      setNomGuesses(targetLayer.nomGuesses || {});
      setPastilleGuesses(targetLayer.pastilleGuesses || {});
      
      saveCollectionState(
        activeCollectionId,
        targetLayer.noms,
        targetLayer.links,
        targetLayer.validatedParagraphIds,
        targetLayer.nomGuesses,
        targetLayer.pastilleGuesses,
        attemptsCount,
        shuffledPastilleOrders,
        unlockedUpgrades,
        spentPoints,
        mindmapOffsets,
        mindmapLevelOverrides,
        logicalParagraphIds,
        incrementalBonusPoints,
        revealOnePoints,
        revealTwoPoints,
        updatedLayers,
        remainingActiveId
      );
    } else {
      // Just save
      saveCollectionState(
        activeCollectionId,
        noms,
        links,
        validatedParagraphIds,
        nomGuesses,
        pastilleGuesses,
        attemptsCount,
        shuffledPastilleOrders,
        unlockedUpgrades,
        spentPoints,
        mindmapOffsets,
        mindmapLevelOverrides,
        logicalParagraphIds,
        incrementalBonusPoints,
        revealOnePoints,
        revealTwoPoints,
        updatedLayers,
        activeLayerId
      );
    }

    triggerToast("Calque supprimé avec succès ! 🗑️");
  };

  const handleMoveLayer = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= layers.length) return;

    const updatedLayers = [...layers];
    const temp = updatedLayers[index];
    updatedLayers[index] = updatedLayers[targetIndex];
    updatedLayers[targetIndex] = temp;

    setLayers(updatedLayers);

    saveCollectionState(
      activeCollectionId,
      noms,
      links,
      validatedParagraphIds,
      nomGuesses,
      pastilleGuesses,
      attemptsCount,
      shuffledPastilleOrders,
      unlockedUpgrades,
      spentPoints,
      mindmapOffsets,
      mindmapLevelOverrides,
      logicalParagraphIds,
      incrementalBonusPoints,
      revealOnePoints,
      revealTwoPoints,
      updatedLayers,
      activeLayerId
    );
    
    triggerToast("Calques réordonnés ! ⇅");
  };

  // Custom text creation and deletion helpers
  const handleCreateCustomCollection = () => {
    if (!newTextName.trim()) {
      triggerToast("Veuillez saisir un titre de texte.");
      return;
    }
    const lines = newTextContent.split('\n').map(line => line.trim()).filter(Boolean);
    if (lines.length === 0) {
      triggerToast("Veuillez saisir au moins une proposition.");
      return;
    }

    if (editingCollectionId) {
      // Modify existing custom collection
      const propositions: Proposition[] = lines.map((text, idx) => {
        const num = (idx + 1).toString();
        return { id: num, textFr: text };
      });

      const updatedCustom = customCollections.map(c => {
        if (c.id === editingCollectionId) {
          return { ...c, name: newTextName.trim(), propositions };
        }
        return c;
      });

      setCustomCollections(updatedCustom);
      localStorage.setItem('tractatus_whiteboard_custom_collections', JSON.stringify(updatedCustom));
      
      triggerToast(`Texte "${newTextName.trim()}" mis à jour avec succès ! 📝`);
      
      // If currently selected, force reload to adapt to any updated sentence array
      if (activeCollectionId === editingCollectionId) {
        setTimeout(() => {
          loadCollectionState(editingCollectionId);
        }, 30);
      }

      setEditingCollectionId(null);
      setNewTextName('');
      setNewTextContent('');
    } else {
      // Create new custom collection
      const customId = `custom-${Date.now()}`;
      const propositions: Proposition[] = lines.map((text, idx) => {
        const num = (idx + 1).toString();
        return { id: num, textFr: text };
      });

      const newCol: PresetCollection = {
        id: customId,
        name: newTextName.trim(),
        propositions
      };

      const nextCustom = [...customCollections, newCol];
      setCustomCollections(nextCustom);
      localStorage.setItem('tractatus_whiteboard_custom_collections', JSON.stringify(nextCustom));

      setNewTextName('');
      setNewTextContent('');

      // Switch to it immediately
      setActiveCollectionId(customId);
      localStorage.setItem('tractatus_whiteboard_active_collection_id', customId);
      setTimeout(() => {
        loadCollectionState(customId);
      }, 20);

      triggerToast(`Texte "${newCol.name}" créé avec succès ! 📝`);
    }
  };

  const handleDeleteCustomCollection = (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Voulez-vous vraiment supprimer ce texte personnalisé ? Toutes ses données associées seront effacées de votre navigateur.")) {
      const nextCustom = customCollections.filter(c => c.id !== colId);
      setCustomCollections(nextCustom);
      localStorage.setItem('tractatus_whiteboard_custom_collections', JSON.stringify(nextCustom));

      localStorage.removeItem(`tractatus_whiteboard_state_col_${colId}`);

      if (activeCollectionId === colId) {
        handleSwitchCollection('tractatus');
      }
      triggerToast("Texte sémantique supprimé.");
    }
  };


  // Helper to compute hierarchical levels in the mindmap
  const getComputedLevel = (nom: Nom, idx: number, allNoms: Nom[]) => {
    // 1. Check if there's a manual override
    if (mindmapLevelOverrides[nom.id] !== undefined) {
      return mindmapLevelOverrides[nom.id];
    }

    if (idx === 0) return 0; // The first concept is always at level 0

    // Compare relational changes from the start up to this node
    let computed = 0;
    for (let i = 1; i <= idx; i++) {
      const prev = allNoms[i - 1];
      const curr = allNoms[i];

      if (curr.colorIndex === prev.colorIndex) {
        // "Si la couleur précédente est identique à la couleur actuelle alors c'est un nom à situé sur le même niveau hiérachique."
        // Keep same level
      } else {
        // "Les couleurs différentes produisent dans la carte un saut hierarchique (supérieur ou inférieur) en fonction de la position dans le texte par rapport à la sélection précédente: avant=inférieur. après=supérieur."
        const pCompare = (curr.propId || '').localeCompare(prev.propId || '', undefined, { numeric: true });
        if (pCompare < 0) {
          computed = Math.max(0, computed - 1); // avant = inférieur
        } else if (pCompare > 0) {
          computed = computed + 1; // après = supérieur
        } else {
          // Same paragraph, compare first wordIndex
          const currIdx = curr.wordIndices[0] ?? 0;
          const prevIdx = prev.wordIndices[0] ?? 0;
          if (currIdx < prevIdx) {
            computed = Math.max(0, computed - 1);
          } else if (currIdx > prevIdx) {
            computed = computed + 1;
          }
        }
      }
    }

    return computed;
  };

  const handleCycleNomColor = (nomId: string) => {
    const updatedNoms = noms.map(n => {
      if (n.id === nomId) {
        const nextColorIndex = ((n.colorIndex ?? 0) + 1) % currentTheme.colors.length;
        return { ...n, colorIndex: nextColorIndex };
      }
      return n;
    });
    setNoms(updatedNoms);
    saveToLocalStorage(updatedNoms, links, validatedParagraphIds, nomGuesses);
    triggerToast("Couleur du concept mise à jour ! ✨🎨");
  };

  const spawnFloatingText = (text: string, x?: number, y?: number, color?: string) => {
    const id = `float-${Date.now()}-${Math.random()}`;
    const posX = x !== undefined ? x : window.innerWidth / 2 + (Math.random() * 120 - 60);
    const posY = y !== undefined ? y : window.innerHeight / 2.5 + (Math.random() * 120 - 60);
    const col = color || '#B38F00';
    setFloatingTexts(prev => [...prev, { id, text, x: posX, y: posY, color: col }]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(f => f.id !== id));
    }, 1200);
  };

  const spawnParticles = (startX: number, startY: number, color: string) => {
    const newParticles = Array.from({ length: 14 }).map((_, i) => {
      const angle = (i / 14) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
      const distance = 40 + Math.random() * 100;
      const endX = startX + Math.cos(angle) * distance;
      const endY = startY + Math.sin(angle) * distance;
      const duration = 0.5 + Math.random() * 0.7;
      return {
        id: `gp-${Date.now()}-${i}-${Math.random()}`,
        startX,
        startY,
        endX,
        endY,
        color,
        duration,
        rotate: Math.random() * 360,
        shape: Math.random() > 0.6 ? 'star' as const : (Math.random() > 0.5 ? 'spark' as const : 'circle' as const)
      };
    });
    setGameParticles(prev => [...prev, ...newParticles]);
    setTimeout(() => {
      setGameParticles(prev => prev.filter(p => !newParticles.some(np => np.id === p.id)));
    }, 1500);
  };

  const handleNomClickForCapacity = (nom: Nom, e?: React.MouseEvent) => {
    const colorIdx = nom.colorIndex ?? 0;
    
    const clientX = e ? e.clientX : undefined;
    const clientY = e ? e.clientY : undefined;
    const hexColor = currentTheme.colors[colorIdx % currentTheme.colors.length];
    
    // Core Incremental Tap Action: Any tap on concept adds bonus points!
    setIncrementalBonusPoints(prev => {
      const next = prev + 1;
      // Save silently
      try {
        localStorage.setItem(`tractatus_whiteboard_state_col_${activeCollectionId}`, JSON.stringify({
          noms, links, validatedParagraphIds, nomGuesses, pastilleGuesses, shuffledPastilleOrders, attemptsCount, unlockedUpgrades, spentPoints,
          mindmapLevelOverrides, logicalParagraphIds, mindmapOffsets,
          incrementalBonusPoints: next, revealOnePoints, revealTwoPoints
        }));
      } catch (err) {}
      return next;
    });
    spawnFloatingText("+1 PT CLICKER", clientX, clientY, hexColor);

    setConsecutiveClicks((prev) => {
      const next = [...prev, { id: nom.id, colorIndex: colorIdx }];
      const cropped = next.slice(-3);
      
      if (cropped.length === 3) {
        const c1 = cropped[0].colorIndex;
        const c2 = cropped[1].colorIndex;
        const c3 = cropped[2].colorIndex;
        if (c1 === c2 && c2 === c3) {
          setRevealTwoPoints(prevPts => {
            const nextPts = prevPts + 1;
            try {
              localStorage.setItem(`tractatus_whiteboard_state_col_${activeCollectionId}`, JSON.stringify({
                noms, links, validatedParagraphIds, nomGuesses, pastilleGuesses, shuffledPastilleOrders, attemptsCount, unlockedUpgrades, spentPoints,
                mindmapLevelOverrides, logicalParagraphIds, mindmapOffsets,
                incrementalBonusPoints: incrementalBonusPoints + 1, revealOnePoints, revealTwoPoints: nextPts
              }));
            } catch (err) {}
            return nextPts;
          });
          spawnFloatingText("🔥 TRIPLE ! +1 Double-Révélation", clientX, clientY, '#DC2626');
          triggerToast("🔥 COMBO TRIPLE ! +1 Capacité Double-Révélation !");
          return []; // Clear to prevent double rewards
        }
      }
      
      if (cropped.length >= 2) {
        const c1 = cropped[cropped.length - 2].colorIndex;
        const c2 = cropped[cropped.length - 1].colorIndex;
        if (c1 === c2) {
          setRevealOnePoints(prevPts => {
            const nextPts = prevPts + 1;
            try {
              localStorage.setItem(`tractatus_whiteboard_state_col_${activeCollectionId}`, JSON.stringify({
                noms, links, validatedParagraphIds, nomGuesses, pastilleGuesses, shuffledPastilleOrders, attemptsCount, unlockedUpgrades, spentPoints,
                mindmapLevelOverrides, logicalParagraphIds, mindmapOffsets,
                incrementalBonusPoints: incrementalBonusPoints + 1, revealOnePoints: nextPts, revealTwoPoints
              }));
            } catch (err) {}
            return nextPts;
          });
          spawnFloatingText("⚡ DOUBLE ! +1 Révélation", clientX, clientY, '#D97706');
          triggerToast("⚡ COMBO DOUBLE ! +1 Capacité Révélation Simple !");
          return []; // Clear to prevent double rewards
        }
      }
      
      return cropped;
    });
  };

  const handleUseCapacityOne = (propId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (revealOnePoints <= 0) {
      triggerToast("⚡ Points de révélation simple requis (sélection horizontale consécutive de 2 couleurs identiques) !");
      return;
    }

    const propNoms = noms.filter((n) => n.propId === propId);
    const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
    if (sortedNoms.length === 0) {
      triggerToast("Aucun concept présent dans ce paragraphe.");
      return;
    }

    const currentGuesses = pastilleGuesses[propId] ? [...pastilleGuesses[propId]] : Array(sortedNoms.length).fill(-1);
    
    let targetIdx = -1;
    for (let i = 0; i < sortedNoms.length; i++) {
      const correctColor = sortedNoms[i].colorIndex ?? 0;
      if (currentGuesses[i] !== correctColor) {
        targetIdx = i;
        break;
      }
    }

    if (targetIdx !== -1) {
      const nextGuesses = [...currentGuesses];
      nextGuesses[targetIdx] = sortedNoms[targetIdx].colorIndex ?? 0;
      
      const updatedGuesses = { ...pastilleGuesses, [propId]: nextGuesses };
      setPastilleGuesses(updatedGuesses);
      
      const nextPts = Math.max(0, revealOnePoints - 1);
      setRevealOnePoints(nextPts);
      
      spawnFloatingText("💎 AUTOMATIQUE !", e.clientX, e.clientY, '#D97706');
      triggerToast("⚡ Concept décodé et révélé de sa bonne couleur !");
      
      const allCorrect = nextGuesses.every((g, index) => g === (sortedNoms[index].colorIndex ?? 0));
      if (allCorrect) {
        const nextValidated = [...new Set([...validatedParagraphIds, propId])];
        setValidatedParagraphIds(nextValidated);
        saveToLocalStorage(noms, links, nextValidated, nomGuesses, activeThemeId, activeMode, machineCategories, updatedGuesses);
        spawnFloatingText("🎉 PARAGRAPHE RÉSOLU !", e.clientX, e.clientY, '#10B981');
      } else {
        saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, activeMode, machineCategories, updatedGuesses);
      }
    } else {
      triggerToast("Toutes les pastilles de ce paragraphe sont déjà correctes !");
    }
  };

  const handleUseCapacityTwo = (propId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (revealTwoPoints <= 0) {
      triggerToast("🔥 Points de double-révélation requis (sélection horizontale consécutive de 3 couleurs identiques) !");
      return;
    }

    const propNoms = noms.filter((n) => n.propId === propId);
    const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
    if (sortedNoms.length === 0) {
      triggerToast("Aucun concept présent dans ce paragraphe.");
      return;
    }

    const currentGuesses = pastilleGuesses[propId] ? [...pastilleGuesses[propId]] : Array(sortedNoms.length).fill(-1);
    
    let revealedCount = 0;
    const nextGuesses = [...currentGuesses];
    for (let i = 0; i < sortedNoms.length; i++) {
      const correctColor = sortedNoms[i].colorIndex ?? 0;
      if (nextGuesses[i] !== correctColor) {
        nextGuesses[i] = correctColor;
        revealedCount++;
        if (revealedCount >= 2) break;
      }
    }

    if (revealedCount > 0) {
      const updatedGuesses = { ...pastilleGuesses, [propId]: nextGuesses };
      setPastilleGuesses(updatedGuesses);
      
      const nextPts = Math.max(0, revealTwoPoints - 1);
      setRevealTwoPoints(nextPts);
      
      spawnFloatingText("🔥🔥 DOUBLE DÉCODAGE !", e.clientX, e.clientY, '#EF4444');
      triggerToast(`🔥 ${revealedCount} concept(s) décodé(s) avec des couleurs différentes !`);

      const allCorrect = nextGuesses.every((g, index) => g === (sortedNoms[index].colorIndex ?? 0));
      if (allCorrect) {
        const nextValidated = [...new Set([...validatedParagraphIds, propId])];
        setValidatedParagraphIds(nextValidated);
        saveToLocalStorage(noms, links, nextValidated, nomGuesses, activeThemeId, activeMode, machineCategories, updatedGuesses);
        spawnFloatingText("🎉 PARAGRAPHE RÉSOLU !", e.clientX, e.clientY, '#10B981');
      } else {
        saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, activeMode, machineCategories, updatedGuesses);
      }
    } else {
      triggerToast("Toutes les pastilles de ce paragraphe sont déjà résolues !");
    }
  };

  // Passive game loop (Tick loop): adds points passively based on upgrades
  useEffect(() => {
    const timer = setInterval(() => {
      let passiveBonus = 0;
      if (unlockedUpgrades.includes('resonance')) {
        passiveBonus += 2;
      }
      if (unlockedUpgrades.includes('transmittance')) {
        passiveBonus += 1;
      }
      
      if (passiveBonus > 0) {
        setIncrementalBonusPoints(prev => {
          const next = prev + passiveBonus;
          // Spawn silent passive floaties
          if (Math.random() > 0.7) {
            spawnFloatingText(`+${passiveBonus} passive 📡`, undefined, undefined, '#10B981');
          }
          try {
            localStorage.setItem(`tractatus_whiteboard_state_col_${activeCollectionId}`, JSON.stringify({
              noms, links, validatedParagraphIds, nomGuesses, pastilleGuesses, shuffledPastilleOrders, attemptsCount, unlockedUpgrades, spentPoints,
              mindmapLevelOverrides, logicalParagraphIds, mindmapOffsets,
              incrementalBonusPoints: next, revealOnePoints, revealTwoPoints
            }));
          } catch (e) {}
          return next;
        });
      }
    }, 4000); // Trigger ticks every 4 seconds
    return () => clearInterval(timer);
  }, [unlockedUpgrades, activeCollectionId, noms, links, validatedParagraphIds]);


  // Calculs du score sémantique et du score global avec boucle incrémentielle
  const getParagraphScore = (propId: string) => {
    if (!validatedParagraphIds.includes(propId)) return 0;
    const attempts = attemptsCount[propId] ?? 1;
    let baseScore = 20;
    if (attempts <= 1) baseScore = 100;
    else if (attempts === 2) baseScore = 80;
    else if (attempts === 3) baseScore = 60;
    else if (attempts === 4) baseScore = 40;

    // Double score upgrade
    if (unlockedUpgrades.includes('optics')) {
      baseScore *= 2;
    }
    return baseScore;
  };

  // Compute mastered colors
  const masteredColorThreshold = unlockedUpgrades.includes('resonance') ? 2 : 3;
  const matchCounts: Record<number, number> = {};
  noms.forEach(nom => {
    if (nom.colorIndex === undefined) return;
    if (validatedParagraphIds.includes(nom.propId)) {
      matchCounts[nom.colorIndex] = (matchCounts[nom.colorIndex] || 0) + 1;
    } else {
      const propNoms = noms.filter(n => n.propId === nom.propId);
      const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
      const pIdx = sortedNoms.findIndex(n => n.id === nom.id);
      if (pIdx !== -1) {
        const guess = (pastilleGuesses[nom.propId] || [])[pIdx];
        if (guess === nom.colorIndex) {
          matchCounts[nom.colorIndex] = (matchCounts[nom.colorIndex] || 0) + 1;
        }
      }
    }
  });
  const masteredColors = Object.entries(matchCounts)
    .filter(([_, count]) => count >= masteredColorThreshold)
    .map(([colorIdx]) => parseInt(colorIdx, 10));

  const baseGameScore = validatedParagraphIds.reduce((sum, propId) => sum + getParagraphScore(propId), 0);
  const uniqueColorsCount = new Set(noms.map(n => n.colorIndex ?? 0)).size;
  const masteryMultiplier = 1 + masteredColors.length * 0.25;
  const uniqueColorsMultiplier = 1 + uniqueColorsCount * 0.15;
  const tokenBonusPoints = noms.length * 50;
  const globalScore = Math.round(baseGameScore * uniqueColorsMultiplier * masteryMultiplier) + Math.round(incrementalBonusPoints) + tokenBonusPoints;

  // --- 5 Lab Capabilities (Facultés) Calculations ---
  // 1. Exploration Sémantique (Densité Conceptuelle)
  const conceptDensityLvl = Math.min(5, Math.floor(noms.length / 3) + 1);
  const conceptDensityProgress = noms.length === 0 ? 0 : Math.min(100, ((noms.length % 3) / 3) * 100);

  // 2. Harmonie Chromatique (Distinction des Axes)
  const uniqueColorsUsed = new Set(noms.map(n => n.colorIndex).filter(c => c !== undefined && c >= 0)).size;
  const colorDistinctionLvl = Math.min(5, uniqueColorsUsed === 0 ? 1 : Math.max(1, Math.min(5, uniqueColorsUsed)));
  const colorDistinctionProgress = Math.min(100, (uniqueColorsUsed / 7) * 100);

  // 3. Fréquence Sémantique (Répétition & Cohérence)
  const countsForRepeat = Array(7).fill(0);
  noms.forEach(n => {
    if (n.colorIndex !== undefined && n.colorIndex >= 0 && n.colorIndex < 7) {
      countsForRepeat[n.colorIndex]++;
    }
  });
  const maxColorRepeat = Math.max(0, ...countsForRepeat);
  const tagFrequencyLvl = Math.min(5, Math.floor(maxColorRepeat / 2) + 1);
  const tagFrequencyProgress = maxColorRepeat === 0 ? 0 : Math.min(100, ((maxColorRepeat % 2) / 2) * 100);

  // 4. Preuve Axiomatique (Résolution Sémantique)
  const resolutionSemanticLvl = Math.min(5, Math.floor(validatedParagraphIds.length / 2) + 1);
  const resolutionSemanticProgress = validatedParagraphIds.length === 0 ? 0 : Math.min(100, ((validatedParagraphIds.length % 2) / 2) * 100);

  // 5. Richesse Taxonomique (Descriptions Métadiscours)
  const totalDescLength = machineCategories.reduce((sum, cat) => sum + (cat.description?.length || 0), 0);
  const taxonomicRichnessLvl = Math.min(5, Math.floor(totalDescLength / 40) + 1);
  const taxonomicRichnessProgress = totalDescLength === 0 ? 0 : Math.min(100, ((totalDescLength % 40) / 40) * 100);

  // Filtering list
  const filteredPropositions = activePropositions.filter((prop) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    const textMatch = prop.textFr.toLowerCase().includes(query);
    const conceptMatch = noms.some(
      (n) => n.propId === prop.id && n.text.toLowerCase().includes(query)
    );
    const idMatch = prop.id.includes(query);
    
    return textMatch || conceptMatch || idMatch;
  });

  return (
    <div className="min-h-screen bg-[#faf9f5] text-stone-900 selection:bg-stone-200 flex flex-col font-sans transition-all duration-350">
      
      {/* 🛎️ NOTIFICATIONS */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -25, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25, scale: 0.95 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-stone-950/95 border border-stone-800 text-stone-100 text-[11px] px-5 py-3 rounded-full shadow-2xl font-mono tracking-wider text-center uppercase"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧭 BARRE DE NAVIGATION INTELLIGENTE ET FLOTANTE (SE RÉDUIT EN ICÔNE FLOTANTE / COMPACTE) */}
      <div className="z-40">
        <AnimatePresence mode="wait">
          {!isNavExpanded ? (
            /* VERSION COMPACTE : Segmented Control tactile très esthétique et instantané */
            <motion.div
              key="compact-hud"
              initial={{ scale: 0.8, opacity: 0, y: -20, x: "-50%" }}
              animate={{ scale: 1, opacity: 1, y: 0, x: "-50%" }}
              exit={{ scale: 0.8, opacity: 0, y: -20, x: "-50%" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed top-3 left-1/2 z-40 bg-stone-900/95 text-stone-100 border border-stone-850 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-2xl flex items-center gap-3 select-none ring-1 ring-white/10 max-w-[95vw] sm:max-w-max"
              style={{ left: "50%", transform: "translateX(-50%)" }}
              id="collapsed-hud-nav"
            >
              {/* Permanent Direct Segmented Modes Switcher */}
              <div className="flex items-center bg-stone-950/85 p-0.5 rounded-full border border-white/5 gap-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMode('editor');
                    saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, 'editor');
                    triggerToast("✍️ Mode Éditeur actif");
                  }}
                  className={`px-2 py-1 rounded-full text-[9px] font-mono font-black transition-all flex items-center gap-1 cursor-pointer ${
                    activeMode === 'editor' ? 'bg-amber-400 text-stone-950 font-black' : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}
                  title="Activer le mode d'édition et analyse de concepts"
                >
                  <span>✍️ <span className="hidden xs:inline">Éditeur</span></span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMode('mastermind');
                    saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, 'mastermind');
                    triggerToast("🎲 Mode Jeu Masqué actif");
                  }}
                  className={`px-2 py-1 rounded-full text-[9px] font-mono font-black transition-all flex items-center gap-1 cursor-pointer ${
                    activeMode === 'mastermind' ? 'bg-amber-400 text-stone-950 font-black' : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}
                  title="Jouer à deviner les catégories sémantiques masquées"
                >
                  <span>🎲 <span className="hidden xs:inline">Jeu</span></span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMode('art');
                    saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, 'art');
                    triggerToast("📊 Mode Visualisation Sémantique actif");
                  }}
                  className={`px-2 py-1 rounded-full text-[9px] font-mono font-black transition-all flex items-center gap-1 cursor-pointer ${
                    activeMode === 'art' ? 'bg-amber-400 text-stone-950 font-black' : 'text-stone-300 hover:text-white hover:bg-white/5'
                  }`}
                  title="Analyse graphique et répartition des concepts"
                >
                  <span>📊 <span className="hidden xs:inline">Visu</span></span>
                </button>
              </div>

              {/* Functional Toggles & Info */}
              <div className="flex items-center gap-2">
                <span className="text-stone-700 font-mono">|</span>

                {/* Bibliothèque (Fichiers) Trigger */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsTextManagerOpen(true);
                  }}
                  className="p-1.5 hover:bg-white/10 text-stone-100 hover:text-[#ffca51] rounded-full text-[10px] font-mono font-bold transition-all flex items-center gap-1 cursor-pointer"
                  title="Gérer les textes de la bibliothèque"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                </button>

                {/* Volet d'analyses (Sidepanel) Toggle */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSidePanelOpen(!isSidePanelOpen);
                    triggerToast(isSidePanelOpen ? "Volet d'analyse fermé 🥞" : "Volet d'analyse ouvert ! 🥞");
                  }}
                  className={`p-1.5 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                    isSidePanelOpen 
                      ? 'bg-amber-400 text-stone-950 hover:bg-amber-300' 
                      : 'hover:bg-white/10 text-stone-300 hover:text-white'
                  }`}
                  title="Afficher/Masquer le volet sémantique (Calques & MiniMap)"
                >
                  <Layers className="w-3.5 h-3.5" />
                </button>

                {/* Points / Utilities */}
                <div className="hidden sm:flex items-center gap-1.5 text-[9px] font-mono font-bold text-amber-200 bg-stone-950 px-2 py-1 rounded-lg">
                  🪙 {Math.max(0, globalScore - spentPoints)} PTS
                </div>

                {/* Open Expanded HUD settings gear */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsNavExpanded(true);
                  }}
                  className="p-1 px-1.5 hover:bg-white/10 text-stone-400 hover:text-stone-200 rounded-lg text-[9px] font-mono transition-all flex items-center gap-1 cursor-pointer"
                  title="Plus de configurations"
                >
                  <Settings className="w-3 h-3 animate-spin-slow text-stone-300" />
                </button>
              </div>
            </motion.div>
          ) : (
            /* VERSION EXPANSÉE : Tableau de bord de navigation intelligent */
            <motion.div
              key="expanded-hud"
              initial={{ opacity: 0, y: -40, x: "-50%", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, x: "-50%", scale: 1 }}
              exit={{ opacity: 0, y: -40, x: "-50%", scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed top-4 left-1/2 z-40 w-[94%] max-w-4xl bg-white/98 text-stone-900 border border-stone-200/95 shadow-2xl rounded-3xl p-5 backdrop-blur-xl transition-all"
              style={{ left: "50%" }}
              id="expanded-hud-nav"
            >
              <div className="flex flex-col gap-4">
                {/* Ligne d'en-tête */}
                <div className="flex items-center justify-between border-b border-stone-150 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Grid className="w-4 h-4 text-[#B38F00]" />
                    <h2 className="font-serif font-black text-stone-900 text-xs tracking-wider uppercase">
                      Menu de Navigation Intelligent
                    </h2>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-50/50 border border-amber-250 rounded-full px-3 py-1 flex items-center gap-1.5 font-mono text-[10px] font-black text-amber-800">
                      <span>🪙 {Math.max(0, globalScore - spentPoints)} PTS disponibles</span>
                    </div>
                    <button
                      onClick={() => setIsNavExpanded(false)}
                      className="p-1 px-3 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-full text-[9px] font-mono font-black uppercase tracking-wider flex items-center gap-1 hover:scale-102 transition-all cursor-pointer shadow-3xs"
                    >
                      <ChevronRight className="w-3 h-3 rotate-90" />
                      Réduire
                    </button>
                  </div>
                </div>

                {/* Grille d'outils simplifiée */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  
                  {/* Menu 1: Modes de jeu */}
                  <div className="space-y-1.5 bg-stone-50 border border-stone-200/50 p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[8px] font-mono font-black uppercase text-stone-400 tracking-wider">🎯 Mode de l'Espace</span>
                    <div className="flex flex-col gap-1 mt-1">
                      <button
                        onClick={() => {
                          setActiveMode('editor');
                          saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, 'editor');
                          triggerToast("Mode Éditeur sémantique activé !");
                        }}
                        className={`w-full text-left py-1.5 px-3 rounded-xl text-[10.5px] font-mono font-black flex items-center justify-between transition-all ${
                          activeMode === 'editor' ? 'bg-stone-900 text-white shadow-3xs' : 'text-stone-600 hover:bg-stone-200/40'
                        }`}
                      >
                        <span>✍️ Éditeur</span>
                        {activeMode === 'editor' && <Check className="w-3 h-3 text-amber-400" />}
                      </button>
                      <button
                        onClick={() => {
                          setActiveMode('mastermind');
                          saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, 'mastermind');
                          triggerToast("Mode Jeu Masqué activé !");
                        }}
                        className={`w-full text-left py-1.5 px-3 rounded-xl text-[10.5px] font-mono font-black flex items-center justify-between transition-all ${
                          activeMode === 'mastermind' ? 'bg-stone-900 text-white shadow-3xs' : 'text-stone-600 hover:bg-stone-200/40'
                        }`}
                      >
                        <span>🎲 Jeu Masqué</span>
                        {activeMode === 'mastermind' && <Check className="w-3 h-3 text-amber-400" />}
                      </button>
                      <button
                        onClick={() => {
                          setActiveMode('art');
                          saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, 'art');
                          triggerToast("Mode Visualisation graphique activé !");
                        }}
                        className={`w-full text-left py-1.5 px-3 rounded-xl text-[10.5px] font-mono font-black flex items-center justify-between transition-all ${
                          activeMode === 'art' ? 'bg-stone-900 text-white shadow-3xs' : 'text-stone-600 hover:bg-stone-200/40'
                        }`}
                      >
                        <span>📊 Visualisation</span>
                        {activeMode === 'art' && <Check className="w-3 h-3 text-amber-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Menu 2: Textes intégrés */}
                  <div className="space-y-1.5 bg-stone-50 border border-stone-200/50 p-3 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono font-black uppercase text-stone-400 tracking-wider">📚 Bibliothèque (Fichiers)</span>
                      <p className="text-[9.5px] text-stone-500 mt-1 mb-2">
                        Gérez, importez et créez vos textes personnalisés.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setIsTextManagerOpen(true);
                      }}
                      className="w-full text-center py-2 px-3 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-xl text-[10.5px] font-mono font-black flex items-center justify-center gap-1.5 shadow-3xs cursor-pointer"
                    >
                      <Bookmark className="w-3 h-3 text-amber-500" />
                      <span>Gérer les fichiers</span>
                    </button>
                  </div>

                  {/* Menu 3: Thèmes colorels */}
                  <div className="space-y-1.5 bg-stone-50 border border-stone-200/50 p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[8px] font-mono font-black uppercase text-stone-400 tracking-wider font-extrabold">🎨 Thèmes de l'Espace</span>
                    <div className="grid grid-cols-4 gap-1.5 py-1">
                      {THEMES.map((theme) => (
                        <button
                          key={theme.id}
                          onClick={() => {
                            setActiveThemeId(theme.id);
                            saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, theme.id);
                            triggerToast(`Thème : ${theme.name}`);
                          }}
                          className={`h-6 rounded-md transition-all cursor-pointer flex items-center justify-center text-[8px] font-mono font-black border uppercase relative ${
                            activeThemeId === theme.id
                              ? 'bg-stone-900 text-white border-stone-950 font-black'
                              : 'bg-white hover:bg-stone-100 text-stone-600 border-stone-150'
                          }`}
                          title={theme.name}
                        >
                          <span className="w-1.5 h-1.5 rounded-full absolute top-0.5 right-0.5" style={{ backgroundColor: theme.colors[0] }} />
                          {theme.id.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                    <div className="text-[8.5px] text-stone-400 italic text-center">Filtre d'ambiance locale</div>
                  </div>

                  {/* Menu 3.5: Styles de Surlignage */}
                  <div className="space-y-1.5 bg-stone-50 border border-stone-200/50 p-3 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[8px] font-mono font-black uppercase text-stone-400 tracking-wider">🖌️ Styles de Surlignage (10 Thèmes)</span>
                      <p className="text-[9px] text-stone-500 mt-1 leading-snug">
                        Changez la forme et le style d'adhérence visuelle de vos étiquettes de texte.
                      </p>
                    </div>
                    <div className="mt-1">
                      <select
                        id="highlighter-select-menu"
                        value={activeHighlighterId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setActiveHighlighterId(val);
                          localStorage.setItem('tractatus_whiteboard_active_highlighter', val);
                          triggerToast(`Style de surligneur : ${val.replace('-', ' ').toUpperCase()}`);
                        }}
                        className="w-full text-[10px] font-mono font-bold bg-white border border-stone-300 p-1.5 rounded-lg text-stone-850 focus:outline-none focus:ring-1 focus:ring-stone-900 cursor-pointer"
                      >
                        <option value="surligneur-classique">🟨 Surligneur Classique</option>
                        <option value="surligneur-manuel">✍️ Surligneur Manuel</option>
                        <option value="masktape">Tape masktape</option>
                        <option value="adhesif">🩹 Bande Adhésive</option>
                        <option value="souligne-fin">⏤ Soulignement Fin</option>
                        <option value="souligne-moyen">⎓ Soulignement Moyen</option>
                        <option value="souligne-epais">▬ Soulignement Épais</option>
                        <option value="maladroit">🥴 Surligneur Maladroit</option>
                        <option value="fantaisiste">✨ Surligneur Fantaisiste</option>
                        <option value="retro-pixel">👾 Rétro Pixel</option>
                      </select>
                    </div>
                    <div className="text-[8px] font-mono text-center text-stone-400 mt-0.5">Formes d'affichages configurables</div>
                  </div>

                  {/* Menu 4: Actions système */}
                  <div className="space-y-1.5 bg-stone-50 border border-stone-200/50 p-3 rounded-2xl flex flex-col justify-between">
                    <span className="text-[8px] font-mono font-black uppercase text-stone-400 tracking-wider">⚡ Actions & Backups</span>
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                      {history.length > 0 && (
                        <button
                          onClick={handleGlobalUndo}
                          className="col-span-2 py-1 px-2 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-[10px] font-mono font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-4xs"
                          title="Annuler l'action ou surbrillance sémantique précédente"
                        >
                          <RotateCcw className="w-3 h-3 text-amber-600" />
                          <span>Annuler ({history.length})</span>
                        </button>
                      )}
                      <button
                        onClick={exportDataJson}
                        className="py-1 px-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-[9.5px] font-mono font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-4xs"
                        title="Exporter configuration et avancement"
                      >
                        <Download className="w-2.5 h-2.5 text-stone-500" />
                        <span>Exporter</span>
                      </button>
                      <label className="py-1 px-1.5 bg-white hover:bg-stone-100 text-stone-800 border border-stone-200 rounded-lg text-[9.5px] font-mono font-extrabold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-4xs relative">
                        <Upload className="w-2.5 h-2.5 text-stone-500" />
                        <span>Importer</span>
                        <input
                          type="file"
                          accept=".json"
                          onChange={importDataJson}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                      </label>
                      <button
                        onClick={handleGlobalReset}
                        className="col-span-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-250 rounded-lg text-[8.5px] font-mono font-black flex items-center justify-center gap-1 cursor-pointer transition-colors"
                        title="Réinitialiser entièrement la base locale"
                      >
                        <RefreshCw className="w-2.5 h-2.5 text-rose-600 animate-spin-slow" />
                        <span>RÉINITIALISER TOUT</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spacer fluid pour laisser l'espace au Floating Menu */}
      <div className="h-10 w-full" />

      {/* 📖 CONTENU PRINCIPAL */}
      <main className={`flex-1 w-full mx-auto px-6 py-6 flex flex-col gap-6 duration-300 ${activeMode === 'editor' ? 'max-w-3xl' : 'max-w-6xl'}`}>

        {/* CONTENEUR DU SCORE GLOBAL DU JEU ET DU COMPACT CHERCHEUR */}
        {activeMode !== 'editor' && (
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-stone-250 pb-3">
            <div className="flex items-center gap-4 flex-wrap text-stone-850">
              <div className="bg-stone-900 border border-stone-800 text-stone-50 rounded-2xl px-4 py-1.5 flex items-center gap-3 shadow-xs">
                <span className="font-mono text-[9px] uppercase font-extrabold tracking-wider text-amber-300">
                  Concept Crunchy
                </span>
                <span className="font-serif text-base font-extrabold text-amber-300">
                  {globalScore} <span className="text-[10px] text-stone-300 font-normal font-mono">PTS</span>
                </span>
              </div>
              {validatedParagraphIds.length > 0 && (
                <div className="text-[11px] font-mono text-stone-500 space-x-3.5">
                  <span>Base : <strong>{baseGameScore} pts</strong></span>
                  <span>•</span>
                  <span>Modulateur couleur (Éditeur) : <strong>x{uniqueColorsMultiplier.toFixed(2)}</strong> ({uniqueColorsCount} / 7 couleurs)</span>
                  <span>•</span>
                  <span>Résolution : <strong>{validatedParagraphIds.length} / {activePropositions.length} pr.</strong></span>
                </div>
              )}
            </div>

            <div className="relative w-full md:w-64 shrink-0">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher une notion ou proposition..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs outline-none focus:ring-1 focus:ring-stone-400 focus:border-stone-400 transition-all text-stone-850"
              />
            </div>
          </div>
        )}

        {/* PANELS DE MODES EXCLUSIFS */}

        {/* UNIQUE SEMANTIC VISUALIZATION PANEL (REPLACES ART SELECTION & CALDER CANVAS) */}
        {activeMode === 'art' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm space-y-6 max-w-6xl mx-auto w-full select-none"
            id="semantic-visualization-panel"
          >
            {/* Header section with Stats widgets */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-250/60 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 text-amber-700 rounded-2xl">
                  <Activity className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-black text-stone-900 leading-tight">
                    Visualisation Graphique Sémantique : Distribution & Répartition
                  </h3>
                  <p className="text-xs text-stone-500 mt-1">
                    Analyse structurelle et flux relationnels entre les catégories philosophiques et les concepts étiquetés du texte.
                  </p>
                </div>
              </div>

              {/* Live Info pill */}
              <div className="flex items-center gap-2 self-start md:self-auto bg-stone-50/80 outline outline-1 outline-stone-200/60 rounded-xl px-3 py-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-stone-600 uppercase tracking-wider">
                  {noms.length} concept(s) analysé(s)
                </span>
              </div>
            </div>

            {/* If zero terms are extracted yet */}
            {noms.length === 0 ? (
              <div className="py-12 px-6 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/50">
                <p className="text-stone-500 font-serif italic text-sm">
                  Aucun concept clé n'a encore été extrait ou coloré de ce calque.
                </p>
                <p className="text-stone-400 text-xs mt-2">
                  Sélectionnez des mots dans le texte de référence et assignez-leur des catégories dans l’éditeur pour voir le graphe de flux s'animer !
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Visualizer 1: Bipartite Connection Flow Map */}
                <div className="bg-[#FAF9F5] border border-stone-200/95 rounded-2xl p-5 shadow-3xs">
                  <div className="mb-4">
                    <h4 className="text-xs font-mono font-black uppercase text-stone-600 tracking-wider flex items-center gap-1.5 animate-fade-in">
                      <span>🔗</span> Flux d'Origine : Catégories ⇄ Concepts Associés
                    </h4>
                    <p className="text-[10.5px] text-stone-500 mt-0.5 leading-normal">
                      Passez votre curseur sur une catégorie ou un concept sémantique pour mettre en relief la connexion correspondante.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-stretch min-h-[420px] bg-white border border-stone-150 rounded-xl overflow-hidden p-4 relative">
                    
                    {/* Left Column: Semantic Categories list */}
                    <div className="md:col-span-4 flex flex-col justify-between space-y-2">
                      {machineCategories.map((cat, idx) => {
                        const catTerms = noms.filter(n => (n.colorIndex !== undefined ? n.colorIndex : 0) % machineCategories.length === idx);
                        const isPrimaryFocused = visuHoveredCatIdx === idx;
                        const isDimmed = visuHoveredCatIdx !== null && visuHoveredCatIdx !== idx;
                        const isTargetedByTerm = visuHoveredTermId !== null && 
                          (noms.find(n => n.id === visuHoveredTermId)?.colorIndex !== undefined &&
                           (noms.find(n => n.id === visuHoveredTermId)!.colorIndex! % machineCategories.length === idx));

                        const catColor = currentTheme.colors[idx % currentTheme.colors.length];

                        return (
                          <div
                            key={cat.id}
                            onMouseEnter={() => setVisuHoveredCatIdx(idx)}
                            onMouseLeave={() => setVisuHoveredCatIdx(null)}
                            className={`p-3 rounded-xl border transition-all duration-350 flex flex-col justify-center h-[62px] cursor-help relative ${
                              isPrimaryFocused || isTargetedByTerm
                                ? 'bg-stone-50 shadow-xs scale-102 border-stone-250 z-10'
                                : 'bg-transparent border-transparent'
                            } ${isDimmed && !isTargetedByTerm ? 'opacity-35' : 'opacity-100'}`}
                            style={{
                              borderLeft: `5px solid ${catColor}`
                            }}
                          >
                            <div className="flex items-center justify-between gap-1.5">
                              <span className="text-[11.5px] font-serif font-black text-stone-900 truncate">
                                {cat.name}
                              </span>
                              <span className="text-[9px] font-mono px-1.5 bg-stone-100 border border-stone-200/50 rounded-md text-stone-600 font-black">
                                {catTerms.length}
                              </span>
                            </div>
                            <p className="text-[9px] text-stone-400 font-sans truncate leading-normal mt-0.5">
                              {cat.description}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Middle Column: Smooth SVG wave curves */}
                    <div className="md:col-span-4 min-h-[250px] relative pointer-events-none">
                      <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                      >
                        {(() => {
                          const pageSize = 8;
                          const totalPages = Math.ceil(noms.length / pageSize);
                          const pageIndex = visuTermPage % totalPages;
                          const activePageTerms = noms.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

                          return activePageTerms.map((term, tIdx) => {
                            const termCatIdx = (term.colorIndex !== undefined ? term.colorIndex : 0) % machineCategories.length;
                            const isCatFocused = visuHoveredCatIdx === termCatIdx;
                            const isTermHovered = visuHoveredTermId === term.id;
                            const termColor = currentTheme.colors[termCatIdx % currentTheme.colors.length];

                            const isAnyActive = visuHoveredCatIdx !== null || visuHoveredTermId !== null;
                            const isActiveLink = isCatFocused || isTermHovered;
                            const linkOpacity = isAnyActive ? (isActiveLink ? 0.95 : 0.08) : 0.40;
                            const linkStrokeWidth = isAnyActive ? (isActiveLink ? 2.5 : 0.4) : 1.1;

                            // Left coordinate
                            const y1 = ((termCatIdx + 0.5) / machineCategories.length) * 100;
                            // Right coordinate
                            const y2 = ((tIdx + 0.5) / activePageTerms.length) * 100;

                            return (
                              <path
                                key={term.id}
                                d={`M 0,${y1} C 50,${y1} 50,${y2} 100,${y2}`}
                                fill="none"
                                stroke={termColor}
                                strokeWidth={linkStrokeWidth}
                                opacity={linkOpacity}
                                className="transition-all duration-300"
                              />
                            );
                          });
                        })()}
                      </svg>
                    </div>

                    {/* Right Column: Interactive concepts paging block */}
                    <div className="md:col-span-4 flex flex-col justify-between space-y-2 select-text border-l border-stone-100 pl-4">
                      {(() => {
                        const pageSize = 8;
                        const totalPages = Math.ceil(noms.length / pageSize);
                        const pageIndex = visuTermPage % totalPages;
                        const activePageTerms = noms.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

                        return (
                          <div className="flex-1 flex flex-col justify-between space-y-1">
                            {activePageTerms.map((term, tIdx) => {
                              const termCatIdx = (term.colorIndex !== undefined ? term.colorIndex : 0) % machineCategories.length;
                              const isHovered = visuHoveredTermId === term.id;
                              const isDimmed = visuHoveredTermId !== null && visuHoveredTermId !== term.id;
                              const isTargetedByCat = visuHoveredCatIdx !== null && visuHoveredCatIdx === termCatIdx;

                              const termColor = currentTheme.colors[termCatIdx % currentTheme.colors.length];

                              return (
                                <div
                                  key={term.id}
                                  onMouseEnter={() => setVisuHoveredTermId(term.id)}
                                  onMouseLeave={() => setVisuHoveredTermId(null)}
                                  className={`p-2.5 rounded-xl border transition-all duration-350 flex items-center justify-between h-[42px] cursor-pointer ${
                                    isHovered || isTargetedByCat
                                      ? 'bg-stone-50 shadow-4xs scale-102 border-stone-250'
                                      : 'bg-transparent border-transparent'
                                  } ${isDimmed && !isTargetedByCat ? 'opacity-35' : 'opacity-100'}`}
                                >
                                  <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <span
                                      className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/5"
                                      style={{ backgroundColor: termColor }}
                                    />
                                    <span className="text-xs font-black font-serif text-stone-800 truncate" title={term.text}>
                                      {term.text}
                                    </span>
                                  </div>
                                  <span className="text-[8px] font-mono text-stone-400 font-extrabold bg-stone-50 px-1.5 py-0.5 rounded border border-stone-150 shrink-0 select-none ml-1">
                                    PAG.{term.propId}
                                  </span>
                                </div>
                              );
                            })}

                            {/* Pagination bar */}
                            {totalPages > 1 && (
                              <div className="flex items-center justify-between pt-2.5 border-t border-stone-100 mt-2 select-none">
                                <button
                                  type="button"
                                  onClick={() => setVisuTermPage(prev => (prev - 1 + totalPages) % totalPages)}
                                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200/60 rounded-lg text-[9px] font-mono font-black text-stone-700 transition-all cursor-pointer"
                                >
                                  ← Préc.
                                </button>
                                <span className="text-[9px] font-mono text-stone-450 font-extrabold">
                                  Page {pageIndex + 1} / {totalPages}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setVisuTermPage(prev => (prev + 1) % totalPages)}
                                  className="px-2 py-1 bg-stone-100 hover:bg-stone-200 border border-stone-200/60 rounded-lg text-[9px] font-mono font-black text-stone-700 transition-all cursor-pointer"
                                >
                                  Suiv. →
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Visualizer 2: Heatmap matrix of semantic densities */}
                <div className="bg-[#FAF9F5] border border-stone-200/95 rounded-2xl p-5 shadow-3xs overflow-x-auto">
                  <div className="mb-4">
                    <h4 className="text-xs font-mono font-black uppercase text-stone-600 tracking-wider flex items-center gap-1.5">
                      <span>📊</span> Grille d'Intensité : Densité de Concepts par Paragraphe
                    </h4>
                    <p className="text-[10.5px] text-stone-500 mt-0.5 leading-normal">
                      Chaque cellule indique si un paragraphe s'appuie sur une catégorie sémantique particulière. Les pastilles s'agrandissent selon le volume de termes recensés.
                    </p>
                  </div>

                  <table className="w-full text-left border-collapse select-none">
                    <thead>
                      <tr className="border-b border-stone-200/60">
                        <th className="py-2.5 px-3 text-[10px] font-mono font-black text-stone-400 uppercase w-36">
                          Paragraphe
                        </th>
                        {machineCategories.map((cat, idx) => (
                          <th key={cat.id} className="py-2.5 px-3 text-[10px] font-mono font-black text-stone-500 uppercase text-center">
                            <span className="block truncate max-w-[110px] mx-auto" title={cat.name}>
                              {cat.name.split(' ')[0] || cat.name}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {activePropositions.map((p) => {
                        return (
                          <tr key={p.id} className="border-b border-stone-100/60 hover:bg-stone-50/50 transition-colors">
                            <td className="py-2.5 px-3 text-xs font-mono text-stone-500 font-extrabold">
                              Paragraphe {p.id}
                            </td>
                            {machineCategories.map((cat, cIdx) => {
                              const cellTerms = noms.filter(n => n.propId === p.id && (n.colorIndex !== undefined ? n.colorIndex : 0) % machineCategories.length === cIdx);
                              const cellCount = cellTerms.length;

                              const catColor = currentTheme.colors[cIdx % currentTheme.colors.length];
                              
                              // Visual matrix density feedback
                              const sizeClass = cellCount === 0 
                                ? 'w-1.5 h-1.5 bg-stone-200/50' 
                                : cellCount === 1 
                                  ? 'w-3 h-3 hover:scale-130' 
                                  : cellCount === 2 
                                    ? 'w-4.5 h-4.5 ring-2 ring-black/5 shadow-2xs hover:scale-130' 
                                    : 'w-6 h-6 ring-2 ring-black/5 leading-none font-extrabold text-[8px] text-white shadow-3xs hover:scale-135';

                              return (
                                <td key={cat.id} className="py-2.5 px-3 text-center">
                                  <div className="flex items-center justify-center min-h-[28px]">
                                    {cellCount > 0 ? (
                                      <div
                                        style={{ backgroundColor: catColor }}
                                        className={`rounded-full flex items-center justify-center transition-all cursor-help ${sizeClass}`}
                                        title={`Catégorie : ${cat.name}\n${cellCount} concept(s) ici :\n${cellTerms.map(t => `• ${t.text}`).join('\n')}`}
                                      >
                                        {cellCount > 2 && cellCount}
                                      </div>
                                    ) : (
                                      <div className="w-1.5 h-1.5 bg-stone-250/30 rounded-full" />
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </motion.div>
        )}

        {/* 📚 LE TEXTE TEXTUEL INTEGRAL DE RÉFÉRENCE - SPLIT IN TWO-COLUMNS BENTO FOR HIGH-CRAFT GAMEPLAY */}
        <div className={activeMode === 'editor' ? "flex flex-col space-y-6 w-full" : "grid grid-cols-1 lg:grid-cols-10 gap-6 items-start"}>
          
          {/* Col 1: active text columns (with dynamic span based on side panel visibility) */}
          <div className={activeMode === 'editor' ? "w-full flex flex-col space-y-1.5 relative select-text" : `${isSidePanelOpen ? 'lg:col-span-7' : 'lg:col-span-10'} flex flex-col space-y-1.5 relative select-text`}>
            
            {/* Calque Actif Title displayed right before the text */}
            <div className="mb-6 select-none border-b border-stone-200 pb-4">
              <span className="text-[10px] font-mono tracking-widest uppercase font-extrabold text-stone-400 block mb-1">
                Lecteur sémantique • Calque Actif
              </span>
              <h2 className="text-3xl font-serif font-black text-stone-900 tracking-tight">
                {layers.find(l => l.id === activeLayerId)?.name || "Calque d'Analyse"}
              </h2>
              {layers.find(l => l.id === activeLayerId)?.description && (
                <p className="text-xs text-stone-500 italic font-serif mt-1.5 leading-relaxed">
                  {layers.find(l => l.id === activeLayerId)?.description}
                </p>
              )}
            </div>

            {/* Backlayer Paint Splatters in Art Mode */}
            <SplatterEffect splatters={splatters} active={activeMode === 'art'} />

            {filteredPropositions.map((prop) => {
              const tokens = tokenizeText(prop.textFr);
              const isSelectedProp = selectedPropId === prop.id;
              const renderGroups = getRenderGroups(tokens, prop.id, noms);
              
              const propNoms = noms.filter((n) => n.propId === prop.id);
              const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
              const isValidated = validatedParagraphIds.includes(prop.id);
              const isArtMode = activeMode === 'art';

              const feedback = activeFeedback[prop.id];
              const borderClass = feedback === 'success'
                ? 'border-emerald-500 ring-2 ring-emerald-300/40 bg-emerald-50/20 shadow-xs'
                : feedback === 'failure'
                  ? 'border-rose-500 ring-2 ring-rose-300/40 bg-rose-50/15 shadow-xs'
                  : isArtMode 
                    ? 'border-stone-200 bg-[#FAF9F5] hover:bg-[#FAF9F5]'
                    : 'border-stone-100/90 hover:border-stone-200/80 bg-white hover:bg-stone-50/40';

              const cardPadding = activeMode === 'mastermind' ? 'py-1 px-3 text-xs text-stone-900 font-sans' : 'py-2 px-4';

              return (
                <div
                  key={prop.id}
                  className={`relative flex items-center justify-between gap-4 rounded-lg transition-all duration-300 group border h-auto overflow-hidden ${cardPadding} ${borderClass}`}
                  id={`prop-${prop.id}`}
                >
                  {/* Paint splash background smudge for Art Mode */}
                  {isArtMode && propNoms.length > 0 && (
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-multiply overflow-hidden rounded-lg"
                      style={{
                        background: `radial-gradient(ellipse at 25% 45%, ${currentTheme.colors[0 % currentTheme.colors.length]} 0%, transparent 75%), 
                                     radial-gradient(ellipse at 75% 55%, ${currentTheme.colors[1 % currentTheme.colors.length]} 0%, transparent 65%)`
                      }}
                    />
                  )}
                  
                  <div className="flex items-start gap-4 flex-1">
                    {/* 🔴 MARGE DE GAUCHE SCHÉMATIQUE HARMONISÉE ENTRE ÉDITEUR ET JEU */}
                    <div className="w-18 shrink-0 flex flex-col items-stretch justify-center pt-0.5 gap-1 border-r border-stone-200/55 pr-2 select-none z-10">
                      
                      {/* Mode Jeu (Mastermind) : Petites pastilles repères alignées horizontalement en flexbox */}
                      {activeMode === 'mastermind' && sortedNoms.length > 0 && (
                        <div className="flex flex-row items-center gap-1.5 justify-start animate-fade-in text-left">
                          {!isValidated ? (
                            <div className="flex items-center gap-1 flex-wrap">
                              {(shuffledPastilleOrders[prop.id] || []).map((colorIdx, pIdx) => {
                                const col = currentTheme.colors[colorIdx % currentTheme.colors.length];
                                return (
                                  <div
                                    key={pIdx}
                                    className="w-3 h-3 rounded-full border border-stone-300/60 shadow-3xs shrink-0"
                                    style={{ backgroundColor: col }}
                                    title="Couleur repère à placer"
                                  />
                                );
                              })}
                              
                              {/* Les pastilles consignes restent visibles ci-dessus, sans bouton de vérification individuelle pour favoriser l'évaluation globale */}

                              {/* Boutons d'utilisation des Capacités */}
                              <div className="flex items-center gap-1 shrink-0 ml-1">
                                <button
                                  onClick={(e) => handleUseCapacityOne(prop.id, e)}
                                  className={`w-4 h-4 rounded-full border text-[8px] flex items-center justify-center transition-all cursor-pointer font-black ${
                                    revealOnePoints > 0
                                      ? 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-700 animate-pulse scale-103'
                                      : 'bg-stone-50 border-stone-150 text-stone-300 cursor-not-allowed opacity-40'
                                  }`}
                                  title={`⚡ Découverte Automatique Simple (${revealOnePoints} Pts dispos) : clique pour révéler 1 concept`}
                                >
                                  ⚡
                                </button>
                                <button
                                  onClick={(e) => handleUseCapacityTwo(prop.id, e)}
                                  className={`w-4 h-4 rounded-full border text-[8px] flex items-center justify-center transition-all cursor-pointer font-black ${
                                    revealTwoPoints > 0
                                      ? 'bg-rose-100 hover:bg-rose-200 border-rose-400 text-rose-700 animate-bounce scale-103'
                                      : 'bg-stone-50 border-stone-150 text-stone-300 cursor-not-allowed opacity-40'
                                  }`}
                                  title={`🔥 Découverte Automatique Double (${revealTwoPoints} Pts dispos) : clique pour révéler 2 concepts`}
                                >
                                  🔥
                                </button>
                              </div>
                            </div>
                          ) : (
                            /* État Validé (pastilles du jeu d'origine réduites) */
                            <div className="flex items-center gap-1 flex-wrap">
                              {sortedNoms.map((nom, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="w-3 h-3 rounded-full border border-stone-300/50 shadow-3xs shrink-0"
                                  style={{ backgroundColor: currentTheme.colors[(nom.colorIndex ?? 0) % currentTheme.colors.length] }}
                                />
                              ))}
                              
                              <button
                                onClick={() => handleRedoActivity(prop.id)}
                                className="w-3.5 h-3.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-full active:scale-95 shadow-3xs flex items-center justify-center cursor-pointer transition-all select-none group"
                                title="Réinitialiser"
                              >
                                <RefreshCw className="w-2 h-2 text-amber-700 transition-transform group-hover:rotate-180 duration-500 stroke-[2.3]" />
                              </button>
                            </div>
                          )}
                        </div>
                      )}
      
                      {/* Mode standard (Editeur/Art, etc.) : pastilles passives synchronisées de 3px */}
                      {activeMode !== 'mastermind' && sortedNoms.length > 0 && (
                        <div className="flex flex-row flex-wrap gap-1 items-center justify-start w-full">
                          {sortedNoms.map((nom, pIdx) => {
                            const col = currentTheme.colors[(nom.colorIndex ?? 0) % currentTheme.colors.length];
                            return (
                              <div
                                key={pIdx}
                                className="w-2.5 h-2.5 rounded-full shadow-3xs shrink-0"
                                style={{ backgroundColor: col }}
                                title={`Catégorie du concept : ${nom.text}`}
                              />
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 📝 TEXT AREA MAIN BODY */}
                    <div className={`flex-1 text-stone-850 text-justify pr-2 z-10 ${
                      activeMode === 'mastermind' ? 'text-[12.5px] leading-snug font-serif' : 'text-[14.5px] leading-relaxed font-serif'
                    }`}>
                  
                  {/* No automatic paragraph number prepended - custom text flow only */}

                  {renderGroups.map((group, groupIdx) => {
                    
                    if (group.type === 'nom' && group.nom) {
                      const activeNom = group.nom;
                      const colorsLength = currentTheme.colors.length;

                      let displayColor = currentTheme.colors[(activeNom.colorIndex !== undefined ? activeNom.colorIndex : 0) % colorsLength];
                      let isGreySurbillance = false;
                      let pIdx = -1;

                      if (activeMode === 'mastermind') {
                        const propNoms = noms.filter((n) => n.propId === prop.id);
                        const sortedNoms = [...propNoms].sort((a, b) => a.wordIndices[0] - b.wordIndices[0]);
                        pIdx = sortedNoms.findIndex((n) => n.id === activeNom.id);
                        
                        if (!isValidated) {
                          const guessVal = (pastilleGuesses[prop.id] || [])[pIdx];
                          if (guessVal !== undefined && guessVal >= 0) {
                            displayColor = currentTheme.colors[guessVal % colorsLength];
                          } else {
                            isGreySurbillance = true;
                          }
                        }
                      }

                      // Render paint stroke in Art Mode
                      if (isArtMode) {
                        if (activeArtTheme === 5) {
                          return (
                            <CalderElement
                              key={activeNom.id}
                              activeNom={activeNom}
                              displayColor={displayColor}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditingNom(activeNom);
                              }}
                            >
                              {group.tokens.map((token) => token.text)}
                            </CalderElement>
                          );
                        }

                        const params = getArtParams(activeNom.id, prop.id);
                        const { scaleY, translateY, translateX, tilt, opacity, seed } = params;
                        
                        return (
                          <span
                            key={activeNom.id}
                            id={`nom-block-${activeNom.id}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditingNom(activeNom);
                            }}
                            className="relative inline-block py-2.5 px-4 mx-2 cursor-pointer select-none whitespace-nowrap leading-none transition-all duration-300 transform group"
                            style={{
                              transform: `rotate(${tilt}deg) translate(${translateX}px, ${translateY}px)`,
                            }}
                            title={`Artistic Concept: "${activeNom.text}"`}
                          >
                            {/* STYLE 0: Aquarelle Floue (Fluid Watercolor Blot) */}
                            {activeArtTheme === 0 && (
                              <div 
                                className="absolute pointer-events-none transition-all duration-700 ease-out mix-blend-multiply opacity-55 group-hover:opacity-80 rounded-full group-hover:scale-135 group-hover:rotate-12 group-hover:translate-y-[-6px] group-hover:blur-[8px]"
                                style={{
                                  width: `${175 + (seed % 45)}%`,
                                  height: `${160 + (seed % 35)}%`,
                                  left: `${-37 - (seed % 15)}%`,
                                  top: `${-27 - (seed % 15)}%`,
                                  backgroundColor: displayColor,
                                  borderRadius: seed % 2 === 0 
                                    ? '60% 40% 70% 30% / 50% 60% 40% 50%' 
                                    : '45% 55% 40% 60% / 60% 45% 55% 40%',
                                  filter: 'blur(16px)',
                                  zIndex: 0,
                                }}
                              />
                            )}

                            {/* STYLE 1: Gouache Épaisse (Impasto Acrylic Spot) */}
                            {activeArtTheme === 1 && (
                              <div 
                                className="absolute pointer-events-none transition-all duration-500 ease-out opacity-85 group-hover:scale-120 group-hover:rotate-[-6deg] group-hover:translate-x-2 group-hover:translate-y-[-3px] shadow-xs"
                                style={{
                                  width: `${145 + (seed % 30)}%`,
                                  height: `${130 + (seed % 25)}%`,
                                  left: `${-22 - (seed % 10)}%`,
                                  top: `${-15 - (seed % 10)}%`,
                                  backgroundColor: displayColor,
                                  borderRadius: seed % 2 === 0 
                                    ? '30% 70% 70% 30% / 50% 30% 70% 50%' 
                                    : '60% 40% 50% 50% / 40% 40% 60% 60%',
                                  borderBottom: `4px solid rgba(0,0,0,0.18)`,
                                  borderRight: `2px solid rgba(0,0,0,0.10)`,
                                  zIndex: 0,
                                }}
                              />
                            )}

                            {/* STYLE 2: Vitrail Céleste (Celestial Stained-Glass Glass Glow) */}
                            {activeArtTheme === 2 && (
                              <div 
                                className="absolute pointer-events-none transition-all duration-[1000ms] ease-out opacity-90 rounded-full group-hover:scale-145 group-hover:-rotate-12 group-hover:translate-y-[4px]"
                                style={{
                                  width: `${215 + (seed % 65)}%`,
                                  height: `${215 + (seed % 65)}%`,
                                  left: `${-57 - (seed % 20)}%`,
                                  top: `${-57 - (seed % 20)}%`,
                                  background: `radial-gradient(circle, ${displayColor}ff 0%, ${displayColor}a4 50%, transparent 85%)`,
                                  filter: 'blur(6px)',
                                  zIndex: 0,
                                }}
                              />
                            )}

                            {/* STYLE 3: Lavis Chinois du Soir (Bleeding Sumi-e Ink Stain) */}
                            {activeArtTheme === 3 && (
                              <div 
                                className="absolute pointer-events-none transition-all duration-700 ease-out mix-blend-multiply opacity-40 group-hover:scale-135 group-hover:translate-x-[-4px] group-hover:scale-x-145"
                                style={{
                                  width: `${190 + (seed % 40)}%`,
                                  height: `${170 + (seed % 35)}%`,
                                  left: `${-45 - (seed % 15)}%`,
                                  top: `${-32 - (seed % 15)}%`,
                                  backgroundColor: displayColor,
                                  borderRadius: seed % 2 === 0
                                    ? '40% 60% 50% 50% / 55% 45% 65% 35%'
                                    : '55% 45% 60% 40% / 45% 55% 35% 65%',
                                  filter: 'blur(4px) contrast(1.3) brightness(0.85)',
                                  zIndex: 0,
                                }}
                              />
                            )}

                            {/* STYLE 4: Fluide Magmatique (Psychedelic Lava Bubbles) */}
                            {activeArtTheme === 4 && (
                              <div 
                                className="absolute pointer-events-none transition-all duration-700 opacity-75 group-hover:scale-130 group-hover:scale-y-140 group-hover:translate-y-[-10px] group-hover:rotate-6"
                                style={{
                                  width: `${205 + (seed % 50)}%`,
                                  height: `${155 + (seed % 30)}%`,
                                  left: `${-50 - (seed % 15)}%`,
                                  top: `${-25 - (seed % 10)}%`,
                                  backgroundColor: displayColor,
                                  borderRadius: seed % 2 === 0 
                                    ? '70% 30% 80% 20% / 50% 60% 30% 70%' 
                                    : '50% 50% 30% 70% / 60% 40% 60% 40%',
                                  filter: 'blur(3px)',
                                  zIndex: 0,
                                }}
                              />
                            )}

                            {/* Crisp high contrast text optimized for readability over artistic brush */}
                            <span className="relative z-10 text-stone-950 text-[14.5px] font-sans font-black tracking-wide drop-shadow-[0_1.5px_1px_rgba(255,255,255,0.85)]">
                              {group.tokens.map((token) => token.text)}
                            </span>
                          </span>
                        );
                      }

                      // Normal modes - SANS BORDURE highlight style on validated/colored guesses
                      const computedStyle = getHighlighterStyle(displayColor, isGreySurbillance, activeNom.id);

                      return (
                        <span
                          key={activeNom.id}
                          id={`nom-block-${activeNom.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (activeMode === 'mastermind') {
                              if (pIdx !== -1) {
                                handleCyclePastilleGuess(prop.id, pIdx);
                              }
                            } else {
                              startEditingNom(activeNom);
                            }
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (activeMode !== 'mastermind') {
                              startEditingNom(activeNom);
                            }
                          }}
                          className={`${computedStyle.className} ${
                            activeMode === 'mastermind'
                              ? 'py-2 px-4.5 rounded-xl shadow-2xs border hover:scale-105'
                              : ''
                          }`}
                          style={{
                            ...computedStyle.styleObj,
                            ...(activeMode === 'mastermind' && !isGreySurbillance ? {
                              backgroundColor: `${displayColor}7c`,
                              borderColor: `${displayColor}99`,
                              borderWidth: '1.5px',
                              boxShadow: `0 2px 6px ${displayColor}33`
                            } : {})
                          }}
                          title={activeMode === 'mastermind'
                            ? `Hypothèse de couleur pour : "${activeNom.text}" (Cliquez pour faire défiler)`
                            : `Jeton : "${activeNom.text}"\nCatégorie : ${machineCategories[(activeNom.colorIndex !== undefined ? activeNom.colorIndex : 0) % machineCategories.length]?.name || "Inconnue"}\nDescription : ${machineCategories[(activeNom.colorIndex !== undefined ? activeNom.colorIndex : 0) % machineCategories.length]?.description || "Pas de description."}\n(Double-cliquez pour configurer)`
                          }
                        >
                          {group.tokens.map((token) => token.text)}
                        </span>
                      );
                    }

                    return (
                      <React.Fragment key={`free-${groupIdx}`}>
                        {group.tokens.map((token) => {
                          if (token.type === 'space') {
                            if (token.text.includes('\n')) {
                              return <span key={token.id} className="block my-2" />;
                            }
                            return <span key={token.id}>{token.text}</span>;
                          }

                          const isSelectedWord = isSelectedProp && selectedWordIndices.includes(token.index);
                          const isLocked = isValidated && activeMode === 'mastermind';

                          return (
                            <span
                              key={token.id}
                              id={`word-${prop.id}-${token.index}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (isLocked) {
                                  triggerToast("Ce paragraphe est déjà validé.");
                                  return;
                                }
                                handleWordClick(prop.id, token.index, e);
                              }}
                              className={`cursor-pointer inline rounded-md transition-all duration-100 py-0.5 px-0.5 font-serif select-none ${
                                isSelectedWord
                                  ? 'bg-stone-950 text-white font-bold scale-[1.03] px-1'
                                  : 'hover:bg-stone-200 text-stone-850'
                              }`}
                            >
                              {token.text}
                            </span>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              {/* 🛡️ GRAPHICAL CRITICAL RESPONSIVE FEEDBACK OVERLAY */}
                <AnimatePresence>
                  {activeFeedback[prop.id] && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.6 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-stone-100 rounded-lg flex items-center justify-center z-20 pointer-events-none transition-all"
                    >
                      <div className="bg-stone-950 border border-stone-800 text-white rounded-full p-3 flex items-center justify-center shadow-2xl transform scale-105">
                        {activeFeedback[prop.id] === 'success' ? (
                          <Check className="w-8 h-8 text-[#64FFDA] stroke-[3.5px] animate-bounce" />
                        ) : (
                          <X className="w-8 h-8 text-rose-450 stroke-[3.5px] animate-pulse" />
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            );
          })}

          {/* 🥞 UNI-STYLE RETRO MATRIX MINIMAP GRID FOR LAYERS DIRECTLY UNDER TEXT */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-8 pt-6 border-t border-stone-200 select-none">
            {layers.map((layer, idx) => {
              const isActive = layer.id === activeLayerId;
              const layerNoms = isActive ? noms : (layer.noms || []);

              return (
                <div
                  key={layer.id}
                  onClick={() => handleSwitchLayer(layer.id)}
                  className={`p-3 rounded-xl border transition-all flex flex-col justify-between cursor-pointer select-none group relative bg-stone-50/50 hover:bg-stone-100/50 ${
                    isActive
                      ? 'border-amber-400 ring-2 ring-amber-400/20 shadow-sm'
                      : 'border-stone-200/80 shadow-3xs'
                  }`}
                >
                  <div>
                    {/* Compact Header inside Card */}
                    <div className="flex items-start justify-between gap-1.5">
                      <div className="truncate flex-1 min-w-0">
                        <span className="text-[8px] font-mono font-bold uppercase tracking-widest text-stone-400 block">
                          C{idx + 1}
                        </span>
                        <h5 className="text-[11px] font-serif font-black text-stone-900 truncate" title={layer.name}>
                          {layer.name}
                        </h5>
                      </div>
                      
                      {/* Active marker or count */}
                      {isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                      ) : (
                        <span className="text-[8px] px-1 bg-white border border-stone-200 rounded text-stone-500 font-mono shrink-0">
                          {layerNoms.length}
                        </span>
                      )}
                    </div>

                    {/* Interactive shift and trash controls inside Card */}
                    <div className="flex items-center gap-0.5 mt-1 opacity-0 group-hover:opacity-100 transition-opacity select-none" onClick={(e) => e.stopPropagation()}>
                      {idx > 0 && (
                        <button
                          onClick={() => handleMoveLayer(idx, 'up')}
                          className="p-0.5 rounded hover:bg-stone-200/60 text-stone-500 transition-colors"
                          title="Déplacer vers la gauche"
                        >
                          <ArrowLeft className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {idx < layers.length - 1 && (
                        <button
                          onClick={() => handleMoveLayer(idx, 'down')}
                          className="p-0.5 rounded hover:bg-stone-200/60 text-stone-500 transition-colors"
                          title="Déplacer vers la droite"
                        >
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      )}
                      {layers.length > 1 && (
                        <button
                          onClick={() => {
                            if (window.confirm(`Supprimer le calque "${layer.name}" ?`)) {
                              handleDeleteLayer(layer.id);
                            }
                          }}
                          className="p-0.5 rounded hover:bg-rose-500/10 text-stone-400 hover:text-rose-500 transition-colors ml-auto"
                          title="Supprimer le calque"
                        >
                          <Trash2 className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Matrix representation of paragraphs as rows of round dots */}
                  <div className="mt-3.5 flex flex-col gap-1 bg-white p-1.5 rounded-lg border border-stone-250/30">
                    {activePropositions.map((p) => {
                      const propNomsInLayer = layerNoms.filter(n => n.propId === p.id);
                      // Sort strictly by their first word index index
                      const propNomsInLayerSorted = [...propNomsInLayer].sort((a, b) => {
                        const idxA = a.wordIndices && a.wordIndices.length > 0 ? a.wordIndices[0] : 0;
                        const idxB = b.wordIndices && b.wordIndices.length > 0 ? b.wordIndices[0] : 0;
                        return idxA - idxB;
                      });
                      
                      return (
                        <div key={p.id} className="flex items-center gap-[3px] min-h-[8px]">
                          {propNomsInLayerSorted.length > 0 ? (
                            propNomsInLayerSorted.map((nom) => {
                              const dotColor = currentTheme.colors[(nom.colorIndex ?? 0) % currentTheme.colors.length];
                              return (
                                <div
                                  key={nom.id}
                                  style={{ backgroundColor: dotColor }}
                                  className="w-2 h-2 rounded-full border border-black/5 shrink-0 hover:scale-130 transition-transform"
                                  title={`${nom.text} (Paragraphe ${p.id})`}
                                />
                              );
                            })
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-stone-100 border border-stone-200/50 shrink-0 opacity-30" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Interactive "add/create new layer" slot card, perfectly uniformized */}
            <div
              onClick={() => {
                const name = window.prompt("Nom du nouveau calque sémantique :");
                if (name && name.trim()) {
                  const desc = window.prompt("Description optionnelle :") || "";
                  handleCreateLayer(name, desc);
                }
              }}
              className="p-3 rounded-xl border border-dashed border-stone-350 hover:border-amber-400 bg-transparent text-stone-500 hover:text-stone-850 hover:bg-stone-50/50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer shadow-3xs hover:shadow-2xs select-none"
              title="Ajouter un nouveau calque sémantique"
            >
              <Plus className="w-5 h-5 text-stone-400 group-hover:text-amber-500" />
              <span className="text-[10px] font-mono font-black uppercase tracking-wider">Créer Calque</span>
            </div>
          </div>

          {/* 📊 DIAGRAMME DE RÉPARTITION DES ÉTIQUETTES (LIVE CALQUE ACTIF) */}
          {activeMode !== 'editor' && (
            <div className="mt-8 bg-stone-50/50 border border-stone-200 rounded-3xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <div>
                  <h4 className="text-[11px] font-mono font-black uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    📊 Répartition Chromatique de l'Analyse Sémantique
                  </h4>
                  <p className="text-[9.5px] text-stone-500 mt-0.5">
                    Rapport de distribution relative des concepts clés indexés sur le calque actif.
                  </p>
                </div>
                <span className="text-[9.5px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-150 px-2 py-0.5 rounded-full uppercase">
                  {noms.length} Concept(s)
                </span>
              </div>

              {(() => {
                const tagCounts = machineCategories.map((cat, idx) => {
                  const count = noms.filter(n => (n.colorIndex !== undefined ? n.colorIndex : 0) % machineCategories.length === idx).length;
                  return { ...cat, count };
                });
                const totalTags = tagCounts.reduce((acc, c) => acc + c.count, 0);

                return (
                  <div className="space-y-3.5">
                    {/* Stacked Percentage Continuous Gradient Bar */}
                    {totalTags > 0 ? (
                      <div className="h-3.5 w-full bg-stone-200 rounded-full overflow-hidden flex shadow-inner">
                        {tagCounts.map((tc, idx) => {
                          if (tc.count === 0) return null;
                          const pct = (tc.count / totalTags) * 100;
                          const hexColor = currentTheme.colors[tc.colorIndex % currentTheme.colors.length];
                          return (
                            <div
                              key={tc.id}
                              style={{ width: `${pct}%`, backgroundColor: hexColor }}
                              className="h-full relative group/bar transition-all hover:brightness-105 first:rounded-l-full last:rounded-r-full cursor-pointer"
                              title={`${tc.name} : ${tc.count} (${pct.toFixed(1)}%)`}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-3 w-full bg-stone-200/55 rounded-full flex items-center justify-center">
                        <span className="text-[8.5px] text-stone-400 font-mono italic">Aucun concept indexé pour le moment. Récoltez des mots pour observer le spectre.</span>
                      </div>
                    )}

                    {/* Dynamic Color Legend of tagged counts */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                      {tagCounts.map((tc, idx) => {
                        const hexColor = currentTheme.colors[tc.colorIndex % currentTheme.colors.length];
                        const pct = totalTags > 0 ? ((tc.count / totalTags) * 100).toFixed(0) : "0";
                        return (
                          <div
                            key={tc.id}
                            className={`p-2 rounded-xl transition-all border border-transparent ${
                              tc.count > 0 ? 'bg-white shadow-3xs border-stone-200/60' : 'opacity-65 bg-stone-100/40'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="w-1.5 h-1.5 rounded-full shrink-0 shadow-xs" style={{ backgroundColor: hexColor }} />
                              <span className="text-[9px] font-bold text-stone-700 truncate block" title={tc.name}>{tc.name.split(' (')[0]}</span>
                            </div>
                            <div className="mt-1 flex items-baseline justify-between font-mono">
                              <span className="text-[10px] font-black text-stone-800">{tc.count} n.</span>
                              <span className="text-[8.5px] text-stone-400">{pct}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* 📡 SECTION DES ANALYSEURS STRUCTURAUX ET VISUALISATIONS DIVERSES */}
          {activeMode !== 'editor' && (
            <div className="mt-4 bg-white border border-stone-200 rounded-3xl p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-stone-150 pb-2.5">
                <div>
                  <h4 className="text-[11px] font-mono font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                    <Grid className="w-4 h-4 text-indigo-600" />
                    📡 Bibliothèque de Visualisations & Diagnostics de Structures
                  </h4>
                  <p className="text-[9.5px] text-stone-500 mt-0.5">
                    Explorez et auditez les architectures logiques de la pensée selon différentes grilles de lecture scientifique.
                  </p>
                </div>
                
                {/* Tabs list selector */}
                <div className="flex bg-stone-100 rounded-lg p-0.5 border border-stone-200/30">
                  <button
                    onClick={() => setActiveVizTab('matrix')}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition-all ${
                      activeVizTab === 'matrix' ? 'bg-stone-900 text-stone-100 shadow-3xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Isomorphismes
                  </button>
                  <button
                    onClick={() => setActiveVizTab('density')}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition-all ${
                      activeVizTab === 'density' ? 'bg-stone-900 text-stone-100 shadow-3xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Densité Waveform
                  </button>
                  <button
                    onClick={() => setActiveVizTab('entropy')}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold uppercase rounded-md transition-all ${
                      activeVizTab === 'entropy' ? 'bg-stone-900 text-stone-100 shadow-3xs' : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    Index de Convergence
                  </button>
                </div>
              </div>

              <div className="pt-1.5">
                {/* TAB 1: CONNECTIVE ISOMORPHISMS MATRIX HEATMAP */}
                {activeVizTab === 'matrix' && (
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono font-extrabold uppercase text-stone-400 block tracking-wide">
                      🗺️ MATRICE DE COUPLAGE D'AUTOCORRÉLATION (INTER-LES CATÉGORIES)
                    </span>
                    <p className="text-[10px] text-stone-600 leading-normal">
                      Ce tableau croisé montre l'intensité des liens critiques unissant les 7 registres complémentaires sémantiques. Plus la cellule est colorée, plus les deux dimensions coopèrent au sein de la composition logique.
                    </p>
                    
                    <div className="overflow-x-auto border border-stone-200/60 rounded-xl bg-stone-50/50 p-2.5">
                      <table className="w-full text-center border-collapse">
                        <thead>
                          <tr>
                            <th className="p-1 px-1.5 text-[8px] font-mono font-extrabold text-stone-400 text-left">Catégorie Matrix</th>
                            {machineCategories.map((c, idx) => (
                              <th key={c.id} className="p-1 text-[8.5px] font-mono font-black" style={{ color: currentTheme.colors[idx % currentTheme.colors.length] }} title={c.name}>
                                {c.name[0] || idx}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {machineCategories.map((rowCat, rIdx) => {
                            const rowColor = currentTheme.colors[rIdx % currentTheme.colors.length];
                            return (
                              <tr key={rowCat.id} className="hover:bg-stone-100/40">
                                <td className="p-1 px-1.5 text-[9.5px] font-bold text-stone-700 text-left flex items-center gap-1 max-w-[130px] truncate" title={rowCat.name}>
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: rowColor }} />
                                  <span className="truncate">{rowCat.name.split(' (')[0]}</span>
                                </td>
                                
                                {machineCategories.map((colCat, cIdx) => {
                                  // Calculate total links meeting row and col category ID
                                  const pairedLinks = links.filter(l => {
                                    const s = noms.find(n => n.id === l.sourceNomId);
                                    const t = noms.find(n => n.id === l.targetNomId);
                                    if (!s || !t) return false;
                                    const sIdx = (s.colorIndex ?? 0) % machineCategories.length;
                                    const tIdx = (t.colorIndex ?? 0) % machineCategories.length;
                                    return (sIdx === rIdx && tIdx === cIdx) || (sIdx === cIdx && tIdx === rIdx);
                                  });
                                  
                                  const cellIntensityClass = pairedLinks.length > 5 
                                    ? 'bg-stone-900 text-white font-black' 
                                    : pairedLinks.length > 2 
                                      ? 'bg-stone-700 text-white font-black' 
                                      : pairedLinks.length > 0 
                                        ? 'bg-stone-250 text-stone-950 font-bold' 
                                        : 'bg-transparent text-stone-300';

                                  return (
                                    <td
                                      key={colCat.id}
                                      className={`p-1.5 border border-stone-150/45 text-[9.5px] font-mono rounded transition-all ${cellIntensityClass}`}
                                      title={`Liaisons ${rowCat.name} x ${colCat.name} : ${pairedLinks.length}`}
                                    >
                                      {pairedLinks.length}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* TAB 2: PROPOSITIONAL DENSITY SPECTOGRAM (COGNITIVE WAVEFORM) */}
                {activeVizTab === 'density' && (
                  <div className="space-y-3">
                    <span className="text-[9px] font-mono font-extrabold uppercase text-stone-400 block tracking-wide">
                      🔊 ÉCHOGRAPHIE SPECTROGRAPHIC DE DENSITÉ PAR PARAGRAPHE
                    </span>
                    <p className="text-[10px] text-stone-600 leading-normal">
                      Défilement séquentiel de la complexité logique. Chaque barre verticale illustre le volume de jetons sémantiques extraits par paragraphe textuel de référence.
                    </p>

                    <div className="border border-stone-200 bg-stone-950 rounded-2xl p-4 flex items-end justify-between h-28 gap-1 shadow-inner select-none overflow-x-auto">
                      {activePropositions.map((p, pIdx) => {
                        const propNoms = noms.filter(n => n.propId === p.id);
                        const weight = propNoms.length;
                        
                        // Compute primary dominant color in paragraph block if any
                        const dominantNom = propNoms[0];
                        const barColor = dominantNom 
                          ? currentTheme.colors[(dominantNom.colorIndex ?? 0) % currentTheme.colors.length]
                          : '#374151'; // neutral slate
                        
                        return (
                          <div
                            key={p.id}
                            className="flex-1 flex flex-col items-center gap-1 group/wave h-full justify-end cursor-pointer"
                            onClick={() => {
                              const dom = document.getElementById(`ref-prop-card-${p.id}`);
                              if (dom) {
                                dom.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                dom.classList.add('ring-2', 'ring-amber-400');
                                setTimeout(() => dom.classList.remove('ring-2', 'ring-amber-400'), 2500);
                              }
                            }}
                          >
                            <div className="text-[7.5px] font-mono text-stone-500 opacity-0 group-hover/wave:opacity-100 transition-opacity select-none mb-0.5">
                              {weight}
                            </div>
                            <div
                              style={{ 
                                height: `${(weight * 16) + 4}px`, 
                                maxHeight: '100%',
                                backgroundColor: barColor 
                              }}
                              className="w-full min-w-[5px] rounded-t transition-all group-hover/wave:brightness-125 border-[0.5px] border-black/10 shadow-xs"
                            />
                            <div className="text-[7.5px] font-mono text-stone-400 group-hover/wave:text-stone-100 transition-colors">
                              {p.id}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <span className="text-[8.5px] text-stone-400 font-mono flex items-center gap-1 justify-end pr-1.5">
                      💡 Astuce : Passez la souris et cliquez sur une barre spectrale pour naviguer instantanément au paragraphe correspondant.
                    </span>
                  </div>
                )}

                {/* TAB 3: INDEX OF CONVERGENCE AND TAXONOMIC SATURATION */}
                {activeVizTab === 'entropy' && (
                  <div className="space-y-4">
                    <span className="text-[9px] font-mono font-extrabold uppercase text-stone-400 block tracking-wide">
                      🎯 RENSEIGNEMENT DE COHÉRENCE ET CONVERGENCE TAXONOMIQUE 
                    </span>
                    
                    {(() => {
                      const uniqueCatsUsed = new Set(noms.map(n => (n.colorIndex ?? 0) % machineCategories.length)).size;
                      const catCoveragePct = Math.round((uniqueCatsUsed / machineCategories.length) * 100);
                      const syntacticDensity = noms.length > 0 ? (links.length / noms.length).toFixed(2) : "0.00";
                      const validatedPct = Math.round((validatedParagraphIds.length / activePropositions.length) * 100);

                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                          {/* Circle 1 */}
                          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center space-y-1">
                            <span className="font-mono text-[8px] font-bold text-stone-400 block uppercase">Couverture Taxonomique</span>
                            <div className="text-xl font-mono font-black text-indigo-750 flex items-baseline gap-0.5">
                              <span>{catCoveragePct}</span>
                              <span className="text-xs font-normal text-stone-500">%</span>
                            </div>
                            <p className="text-[9px] text-stone-500 font-sans leading-snug">
                              {uniqueCatsUsed} sur {machineCategories.length} catégories activées
                            </p>
                          </div>
                          {/* Circle 2 */}
                          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center space-y-1">
                            <span className="font-mono text-[8px] font-bold text-stone-400 block uppercase">Densité d'Articulation</span>
                            <div className="text-xl font-mono font-black text-stone-900 flex items-baseline gap-0.5">
                              <span>{syntacticDensity}</span>
                              <span className="text-xs font-normal text-stone-500">l/n</span>
                            </div>
                            <p className="text-[9px] text-stone-500 font-sans leading-snug">
                              Liaisons d'arcs créées par nœud conceptuel
                            </p>
                          </div>
                          {/* Circle 3 */}
                          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 flex flex-col items-center justify-center text-center space-y-1">
                            <span className="font-mono text-[8px] font-bold text-stone-400 block uppercase">Saturabilité du Cadre</span>
                            <div className="text-xl font-mono font-black text-amber-700 flex items-baseline gap-0.5">
                              <span>{validatedPct}</span>
                              <span className="text-xs font-normal text-stone-500">%</span>
                            </div>
                            <p className="text-[9px] text-stone-500 font-sans leading-snug">
                              Propositions rigoureusement résolues
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          )}


          </div>

          {/* Col 2: Spectacular Incremental Management and Stats Panel */}
          {isSidePanelOpen && activeMode !== 'editor' && (
            <div className="lg:col-span-3 sticky top-[72px] space-y-4">
            
            {/* 🥞 GESTION DES CALQUES SÉMANTIQUES (ANALYSES MULTI-NIVEAUX) */}
            {activeMode === 'editor' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-4.5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-stone-150 pb-2">
                  <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-700 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-amber-600" />
                    🥞 Calques d'Analyse
                  </h4>
                  <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-50 border border-amber-150 rounded px-1.5 py-0.5" id="active-layer-count-badge">
                    {layers.length} Calque(s)
                  </span>
                </div>

                <p className="text-[10px] text-stone-500 leading-normal">
                  Créez des calques sémantiques isolés pour analyser le texte à différents niveaux de granularité logique (macro, micro, thèmes spécifiques).
                </p>

                {/* Liste des Calques */}
                <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                  {layers.map((layer, idx) => {
                    const isActive = layer.id === activeLayerId;
                    return (
                      <div
                        key={layer.id}
                        onClick={() => handleSwitchLayer(layer.id)}
                        className={`group p-2 rounded-xl border transition-all cursor-pointer relative flex flex-col gap-0.5 ${
                          isActive
                            ? 'bg-amber-50/50 border-amber-300 shadow-3xs'
                            : 'bg-stone-50/50 hover:bg-stone-50 border-stone-200/60'
                        }`}
                        id={`semantic-layer-item-${layer.id}`}
                      >
                        {/* Title & Stats */}
                        <div className="flex items-center justify-between gap-1">
                          <span className={`text-xs font-bold leading-tight ${isActive ? 'text-amber-900 font-extrabold' : 'text-stone-800'}`}>
                            {isActive && <span className="text-amber-600 mr-1">●</span>}
                            {layer.name}
                          </span>
                          
                          <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                            {idx > 0 && (
                              <button
                                onClick={() => handleMoveLayer(idx, 'up')}
                                className="p-0.5 hover:bg-stone-200/80 rounded text-stone-500 hover:text-stone-800 transition-colors"
                                title="Monter le calque"
                              >
                                <ArrowUp className="w-2.5 h-2.5" />
                              </button>
                            )}
                            {idx < layers.length - 1 && (
                              <button
                                onClick={() => handleMoveLayer(idx, 'down')}
                                className="p-0.5 hover:bg-stone-200/80 rounded text-stone-500 hover:text-stone-800 transition-colors"
                                title="Descendre le calque"
                              >
                                <ArrowDown className="w-2.5 h-2.5" />
                              </button>
                            )}
                            {layers.length > 1 && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Supprimer le calque "${layer.name}" ?`)) {
                                    handleDeleteLayer(layer.id);
                                  }
                                }}
                                className="p-0.5 hover:bg-rose-100 rounded text-stone-400 hover:text-rose-600 transition-colors"
                                title="Supprimer le calque"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {layer.description && (
                          <span className="text-[9.5px] text-stone-400 leading-tight">
                            {layer.description}
                          </span>
                        )}

                        {/* Counts Badge */}
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[8px] font-mono uppercase px-1 pb-0.5 bg-stone-200/40 text-stone-500 rounded border border-stone-150">
                            {layer.noms?.length || 0} concept(s)
                          </span>
                          <span className="text-[8px] font-mono uppercase px-1 pb-0.5 bg-stone-200/40 text-stone-500 rounded border border-stone-150">
                            {layer.links?.length || 0} lien(s)
                          </span>
                          {isActive && (
                            <span className="text-[8.5px] font-mono uppercase px-1 pb-0.5 bg-emerald-50 text-emerald-700 font-extrabold rounded border border-emerald-150 animate-pulse ml-auto shrink-0">
                              ACTIF
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Formulaire de Création de Calque */}
                <div className="border-t border-stone-150 pt-2 space-y-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  <span className="text-[8.5px] font-mono font-bold uppercase text-stone-400 tracking-wider">
                    ➕ Créer un Nouveau Calque
                  </span>
                  
                  <div className="flex flex-col gap-1.5">
                    <input
                      type="text"
                      placeholder="Nom (ex: Relevé Micro)"
                      value={newLayerName}
                      onChange={(e) => setNewLayerName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 border border-stone-200 rounded-lg text-stone-800 placeholder-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Description du niveau d'analyse..."
                      value={newLayerDesc}
                      onChange={(e) => setNewLayerDesc(e.target.value)}
                      className="w-full text-[10.5px] px-2.5 py-1.5 border border-stone-200 rounded-lg text-stone-700 placeholder-stone-400 bg-stone-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
                    />
                    
                    <button
                      onClick={() => {
                        if (!newLayerName.trim()) {
                          triggerToast("Veuillez renseigner un nom de calque !");
                          return;
                        }
                        handleCreateLayer(newLayerName, newLayerDesc);
                        setNewLayerName('');
                        setNewLayerDesc('');
                      }}
                      className="w-full py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-mono font-bold text-[9.5px] uppercase rounded-lg shadow-4xs active:scale-97 select-none transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-white" />
                      <span>Ajouter Calque</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* SPECTACULAR MINI MIND MAP - ADAPTATIVE CARD */}
            {activeMode === 'editor' && (
              <div className="bg-white border border-stone-200 rounded-3xl p-4.5 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-stone-150 pb-2">
                  <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-[#B38F00] flex items-center gap-1.5">
                    🗺️ Mini Carte Mentale des Concepts
                  </h4>
                  <span className="text-[9px] font-mono font-bold text-stone-400 bg-stone-50 border border-stone-150 rounded px-1.5 py-0.5">
                    {noms.length} n.
                  </span>
                </div>
                
                {noms.length === 0 ? (
                  <div className="py-8 text-center text-stone-400 text-xs italic space-y-1">
                    <p>Aucun concept n'a été créé.</p>
                    <p className="text-[10px] font-mono">Sélectionnez des mots dans le texte pour générer des concepts.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Visual canvas grid */}
                    <div className="relative border border-stone-155 bg-stone-50/50 rounded-2xl h-[280px] overflow-hidden flex flex-col items-stretch shadow-3xs">
                      {/* Connection Lines (SVGs) */}
                      <svg className="absolute inset-0 pointer-events-none w-full h-full z-0">
                        {noms.map((nom, idx) => {
                          if (idx === 0) return null;
                          const prev = noms[idx - 1];
                          const curr = nom;

                          const prevLevel = getComputedLevel(prev, idx - 1, noms);
                          const currLevel = getComputedLevel(curr, idx, noms);

                          // Calculate coordinates
                          const ySpacing = 280 / (noms.length + 1);
                          
                          // Convert levels to X coordinate (relative)
                          const prevX = 30 + prevLevel * 24 + (mindmapOffsets[prev.id]?.x ?? 0);
                          const prevY = ySpacing * (idx) + (mindmapOffsets[prev.id]?.y ?? 0);

                          const currX = 30 + currLevel * 24 + (mindmapOffsets[curr.id]?.x ?? 0);
                          const currY = ySpacing * (idx + 1) + (mindmapOffsets[curr.id]?.y ?? 0);

                          const hexColorCurr = currentTheme.colors[(curr.colorIndex ?? 0) % currentTheme.colors.length];

                          return (
                            <line
                              key={`link-${idx}`}
                              x1={prevX}
                              y1={prevY}
                              x2={currX}
                              y2={currY}
                              stroke={hexColorCurr}
                              strokeWidth="2"
                              strokeDasharray="3 3"
                              opacity="0.6"
                            />
                          );
                        })}
                      </svg>

                      {/* Display Nodes */}
                      <div className="absolute inset-0 overflow-y-auto p-4 flex flex-col justify-between select-none space-y-2">
                        {noms.map((nom, idx) => {
                          const level = getComputedLevel(nom, idx, noms);
                          const hexColor = currentTheme.colors[(nom.colorIndex ?? 0) % currentTheme.colors.length];
                          const xOffset = mindmapOffsets[nom.id]?.x ?? 0;
                          const yOffset = mindmapOffsets[nom.id]?.y ?? 0;
                          const isSelected = selectedNomId === nom.id;

                          return (
                            <div
                              key={nom.id}
                              className="flex items-center transition-all duration-200"
                              style={{
                                transform: `translateX(${level * 20 + xOffset}px) translateY(${yOffset}px)`,
                              }}
                            >
                              <div
                                onClick={() => setSelectedNomId(isSelected ? null : nom.id)}
                                className={`px-2.5 py-1.5 rounded-full border shadow-3xs flex items-center gap-1.5 cursor-pointer max-w-[210px] transition-all relative ${
                                  isSelected 
                                    ? 'bg-stone-900 border-stone-950 text-white shadow-md scale-105 z-10' 
                                    : 'bg-white border-stone-200 text-stone-850 hover:border-stone-400'
                                }`}
                              >
                                {/* Circle node colored */}
                                <div
                                  className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10"
                                  style={{ backgroundColor: hexColor }}
                                />
                                <span className="font-mono text-[9px] font-black shrink-0">
                                  #{idx + 1}
                                </span>
                                <span className="text-[11px] font-sans font-semibold truncate">
                                  {nom.text}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Node Controls Editor Panel */}
                    <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 space-y-2.5">
                      {selectedNomId ? (() => {
                        const targetNomIndex = noms.findIndex(n => n.id === selectedNomId);
                        if (targetNomIndex === -1) return null;
                        const targetNom = noms[targetNomIndex];
                        const tLevel = getComputedLevel(targetNom, targetNomIndex, noms);
                        const hexColor = currentTheme.colors[(targetNom.colorIndex ?? 0) % currentTheme.colors.length];

                        return (
                          <div className="space-y-2 text-xs">
                            <div className="flex items-center justify-between border-b border-stone-150 pb-1.5">
                              <span className="font-mono font-black text-stone-500 uppercase text-[9px]">
                                Configurer Concept #{targetNomIndex + 1}
                              </span>
                              <span className="font-serif font-extrabold text-stone-850">
                                "{targetNom.text}"
                              </span>
                            </div>

                            {/* 1. Hierarchy Shift */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-stone-500 font-medium font-sans">Niveau Hiérarchique :</span>
                              <div className="flex items-center gap-1 bg-white border border-stone-200 rounded-lg p-0.5">
                                <button
                                  onClick={() => {
                                    const nextOverride = Math.max(0, tLevel - 1);
                                    const updatedOverrides = { ...mindmapLevelOverrides, [targetNom.id]: nextOverride };
                                    setMindmapLevelOverrides(updatedOverrides);
                                    saveCollectionState(activeCollectionId, noms, links, validatedParagraphIds, nomGuesses, pastilleGuesses, attemptsCount, shuffledPastilleOrders, unlockedUpgrades, spentPoints, mindmapOffsets, updatedOverrides, logicalParagraphIds);
                                  }}
                                  disabled={tLevel <= 0}
                                  className="p-1 hover:bg-stone-100 disabled:opacity-40 rounded cursor-pointer transition-colors"
                                  title="Gauche (Baisser de niveau)"
                                >
                                  <ArrowLeft className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-mono font-bold text-stone-700 px-1">{tLevel}</span>
                                <button
                                  onClick={() => {
                                    const nextOverride = tLevel + 1;
                                    const updatedOverrides = { ...mindmapLevelOverrides, [targetNom.id]: nextOverride };
                                    setMindmapLevelOverrides(updatedOverrides);
                                    saveCollectionState(activeCollectionId, noms, links, validatedParagraphIds, nomGuesses, pastilleGuesses, attemptsCount, shuffledPastilleOrders, unlockedUpgrades, spentPoints, mindmapOffsets, updatedOverrides, logicalParagraphIds);
                                  }}
                                  className="p-1 hover:bg-stone-100 rounded cursor-pointer transition-colors"
                                  title="Droite (Élever de niveau)"
                                >
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* 2. Color Cycler */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-stone-500 font-medium font-sans">Couleur du Concept :</span>
                              <button
                                onClick={() => handleCycleNomColor(targetNom.id)}
                                className="px-2 py-1 bg-white border border-stone-200 hover:border-stone-400 rounded-lg shadow-3xs cursor-pointer flex items-center gap-1 text-[10px] font-mono font-bold"
                              >
                                <div className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: hexColor }} />
                                Modifier
                              </button>
                            </div>

                            {/* 3. Manual Screen Offset Translations */}
                            <div className="space-y-1">
                              <span className="text-[10px] text-stone-500 font-medium block">Positionnement spatial :</span>
                              
                              <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1">
                                <div className="space-y-1">
                                  <div className="flex justify-between font-bold">
                                    <span>Offset X :</span>
                                    <span>{mindmapOffsets[targetNom.id]?.x ?? 0}px</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="-100"
                                    max="100"
                                    value={mindmapOffsets[targetNom.id]?.x ?? 0}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10);
                                      const updatedOffsets = {
                                        ...mindmapOffsets,
                                        [targetNom.id]: {
                                          x: val,
                                          y: mindmapOffsets[targetNom.id]?.y ?? 0
                                        }
                                      };
                                      setMindmapOffsets(updatedOffsets);
                                      // Save silently
                                      try {
                                        localStorage.setItem(`tractatus_whiteboard_state_col_${activeCollectionId}`, JSON.stringify({
                                          noms, links, validatedParagraphIds, nomGuesses, pastilleGuesses, shuffledPastilleOrders, attemptsCount, unlockedUpgrades, spentPoints,
                                          mindmapLevelOverrides, logicalParagraphIds,
                                          mindmapOffsets: updatedOffsets
                                        }));
                                      } catch (e) {}
                                    }}
                                    className="w-full accent-stone-750 cursor-pointer"
                                  />
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between font-bold">
                                    <span>Offset Y :</span>
                                    <span>{mindmapOffsets[targetNom.id]?.y ?? 0}px</span>
                                  </div>
                                  <input
                                    type="range"
                                    min="-50"
                                    max="50"
                                    value={mindmapOffsets[targetNom.id]?.y ?? 0}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value, 10);
                                      const updatedOffsets = {
                                        ...mindmapOffsets,
                                        [targetNom.id]: {
                                          x: mindmapOffsets[targetNom.id]?.x ?? 0,
                                          y: val
                                        }
                                      };
                                      setMindmapOffsets(updatedOffsets);
                                      // Save silently
                                      try {
                                        localStorage.setItem(`tractatus_whiteboard_state_col_${activeCollectionId}`, JSON.stringify({
                                          noms, links, validatedParagraphIds, nomGuesses, pastilleGuesses, shuffledPastilleOrders, attemptsCount, unlockedUpgrades, spentPoints,
                                          mindmapLevelOverrides, logicalParagraphIds,
                                          mindmapOffsets: updatedOffsets
                                        }));
                                      } catch (e) {}
                                    }}
                                    className="w-full accent-stone-750 cursor-pointer"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })() : (
                        <p className="text-center text-stone-400 py-2.5 text-[10.5px] italic">
                          💡 Cliquez sur un concept de la carte pour régler son niveau, sa couleur ou le déplacer.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
               {/* 🔬 LAB : DISCOVERY & SEMANTIC ANALYSIS ENGINE */}
            <div className="bg-white border border-stone-900 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col gap-2 border-b border-stone-200 pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-black uppercase tracking-wider text-red-650 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-red-650" />
                    LAB ANALYZER
                  </span>
                  <span className="font-mono text-[9px] font-bold text-stone-100 bg-stone-900 px-2 py-0.5 rounded">
                    SYS.LOGIQUE
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 leading-normal">
                  Laboratoire d'indexation et de récolte de jetons (noms surlignés) pour classifier et structurer les contenus textuels selon vos axes herméneutiques.
                </p>
                
                {/* Switchers Inner Tabs */}
                <div className="grid grid-cols-2 gap-1 bg-stone-50 p-1 rounded-xl border border-stone-200">
                  <button
                    onClick={() => setCrunchTab('collector')}
                    className={`py-1.5 text-[9.5px] font-mono font-bold rounded-lg transition-all cursor-pointer text-center ${
                      crunchTab === 'collector'
                        ? 'bg-stone-900 text-stone-100 font-extrabold shadow-3xs'
                        : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    📊 COLLECTEUR DE CALQUES
                  </button>
                  <button
                    onClick={() => setCrunchTab('game')}
                    className={`py-1.5 text-[9.5px] font-mono font-bold rounded-lg transition-all cursor-pointer text-center ${
                      crunchTab === 'game'
                        ? 'bg-red-650 text-white font-extrabold shadow-3xs'
                        : 'text-stone-500 hover:text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    📈 CAPACITÉS & RAPPORTS
                  </button>
                </div>
              </div>

              {crunchTab === 'collector' && (
                <div className="space-y-4 text-left">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h5 className="text-[11px] font-bold text-stone-900 uppercase tracking-wide">
                        💾 Calques et structures collectionnées
                      </h5>
                      <span className="text-[9px] font-mono text-red-650 font-black">{layers.length} ACTIFS</span>
                    </div>
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {layers.map((layer) => {
                      const isActive = layer.id === activeLayerId;
                      const layerNoms = isActive ? noms : (layer.noms || []);
                      const layerLinks = isActive ? links : (layer.links || []);
                      const countConcepts = layerNoms.length;
                      const countLinks = layerLinks.length;

                      // Count color frequencies
                      const counts = Array(7).fill(0);
                      layerNoms.forEach(n => {
                        if (n.colorIndex !== undefined && n.colorIndex >= 0 && n.colorIndex < 7) {
                          counts[n.colorIndex]++;
                        }
                      });

                      const textDensity = activePropositions.length > 0
                        ? ((countConcepts / activePropositions.length) * 100).toFixed(0)
                        : "0";

                      return (
                        <div
                          key={layer.id}
                          onClick={() => handleSwitchLayer(layer.id)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer text-left space-y-2.5 relative group ${
                            isActive
                              ? 'bg-stone-50 border-stone-900 shadow-3xs'
                              : 'bg-white border-stone-200 hover:bg-stone-50 hover:border-stone-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="space-y-0.5">
                              <span className={`text-[12px] font-black block leading-snug ${isActive ? 'text-red-600 font-extrabold' : 'text-stone-800'}`}>
                                {isActive && <span className="text-red-600 mr-1.5">■</span>}
                                {layer.name}
                              </span>
                              {layer.description && (
                                <p className="text-[9.5px] text-stone-400 line-clamp-1 italic font-sans animate-fade-in">
                                  {layer.description}
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end text-[8.5px] font-mono text-stone-500 shrink-0 leading-tight">
                              <span>Densité: <strong>{textDensity}%</strong></span>
                              <span>Graphe: <strong>{countLinks} liens</strong></span>
                            </div>
                          </div>

                          {countConcepts === 0 ? (
                            <div className="h-2.5 w-full bg-stone-100 rounded-md border border-stone-200 flex items-center justify-center">
                              <span className="text-[8px] font-mono text-stone-400">Aucun jeton enregistré</span>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {/* Thicker, dynamic animated progress bar visually refined */}
                              <div className="h-5.5 w-full bg-stone-150 rounded-xl overflow-hidden flex border border-stone-200 relative select-none shadow-3xs">
                                {counts.map((c, colIdx) => {
                                  if (c === 0) return null;
                                  const normPct = (c / countConcepts) * 100;
                                  const colorHex = currentTheme.colors[colIdx % currentTheme.colors.length];
                                  const categoryName = machineCategories[colIdx % machineCategories.length]?.name || `Axe ${colIdx}`;
                                  return (
                                    <motion.div
                                      key={colIdx}
                                      id={`lab-bar-col-${colIdx}`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${normPct}%` }}
                                      transition={{ duration: 0.8, ease: "easeOut" }}
                                      style={{ backgroundColor: colorHex }}
                                      className="h-full relative flex items-center justify-center overflow-hidden transition-all"
                                      title={`${c} concepts - ${categoryName} (${Math.round(normPct)}%)`}
                                    >
                                      {/* Moving shimmer flow using motion for guaranteed performance */}
                                      <motion.div 
                                        className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                                        animate={{ x: ['-150%', '250%'] }}
                                        transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                      />
                                      {normPct > 12 && (
                                        <span className="text-[9px] font-mono font-black text-stone-900 mix-blend-difference drop-shadow-sm select-none">
                                          {Math.round(normPct)}%
                                        </span>
                                      )}
                                    </motion.div>
                                  );
                                })}
                              </div>

                              <div className="flex flex-wrap gap-1 pt-0.5 text-[8px] font-mono">
                                {counts.map((c, colIdx) => {
                                  if (c === 0) return null;
                                  const colorHex = currentTheme.colors[colIdx % currentTheme.colors.length];
                                  const categoryName = machineCategories[colIdx % machineCategories.length]?.name || `Cat-idx ${colIdx}`;
                                  return (
                                    <div key={colIdx} className="flex items-center gap-1 bg-stone-100 border border-stone-200 rounded px-1.5 py-0.5 shrink-0 max-w-[110px] truncate" title={categoryName}>
                                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: colorHex }} />
                                      <span className="text-stone-700 font-extrabold truncate">{c} {categoryName.split(' ')[0]}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {crunchTab === 'game' && (
                <div className="space-y-4 text-left">
                  {/* SCORE ACCUMULÉ SANS CRÉDITS DE DÉPENSE */}
                  <div className="bg-stone-950 text-white rounded-2xl p-4 text-center relative overflow-hidden shadow-md border border-stone-900">
                    <div className="absolute top-0 right-0 p-1 text-[8px] font-mono uppercase bg-red-600 text-white font-black tracking-wider rounded-bl">
                      SOLDE TOTAL
                    </div>
                    <span className="text-[10px] text-stone-400 font-bold font-mono block uppercase tracking-wide">Points Récoltés du Lab</span>
                    <div className="text-3xl font-mono font-black text-stone-100 tracking-tight flex items-center justify-center gap-2 pt-1.5 pb-1">
                      <span className="text-red-500 animate-pulse">🪙</span>
                      <span>{globalScore}</span>
                      <span className="text-stone-400 font-normal font-sans text-xs">XP ANALYSE</span>
                    </div>
                    <div className="text-[8.5px] text-red-400 font-mono tracking-wider uppercase">
                      ▲ ACCUMULATION EN COURS (NON DÉPENSABLE)
                    </div>
                  </div>

                  {/* LES 5 FACULTÉS DE JEU INCRÉMENTIEL */}
                  <div className="space-y-3.5">
                    <h5 className="text-[11px] font-mono font-black uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-1 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-red-600" />
                      FACULTÉS D'INDEXATION SÉMANTIQUE
                    </h5>

                    {/* Jauge 1: Exploration Conceptuelle (Densité) */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-650 font-black">1.</span>
                          <span className="font-bold text-stone-900">Densité Conceptuelle</span>
                        </div>
                        <span className="px-1.5 py-0.2 ml-1 bg-stone-900 text-stone-100 rounded text-[9px] font-mono font-bold uppercase">
                          Niveau {conceptDensityLvl}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-4.5 w-full bg-stone-200 rounded-xl overflow-hidden relative select-none shadow-3xs">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${conceptDensityProgress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-red-650 rounded-xl flex items-center justify-end pr-2 overflow-hidden relative"
                          >
                            <motion.div 
                              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                              animate={{ x: ['-200%', '300%'] }}
                              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                            />
                            {conceptDensityProgress > 15 && (
                              <span className="text-[9px] font-mono font-black text-white relative z-10">
                                {Math.round(conceptDensityProgress)}%
                              </span>
                            )}
                          </motion.div>
                        </div>
                        <p className="text-[9px] text-stone-500 flex justify-between font-mono">
                          <span>Harvesting Progress</span>
                          <span className="font-bold text-stone-700">{noms.length} jetons récoltés</span>
                        </p>
                      </div>
                    </div>

                    {/* Jauge 2: Distinction Chromatique (Harmonie) */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-650 font-black">2.</span>
                          <span className="font-bold text-stone-900">Harmonie Chromatique</span>
                        </div>
                        <span className="px-1.5 py-0.2 ml-1 bg-stone-900 text-stone-100 rounded text-[9px] font-mono font-bold uppercase">
                          Niveau {colorDistinctionLvl}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-4.5 w-full bg-stone-200 rounded-xl overflow-hidden relative select-none shadow-3xs">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${colorDistinctionProgress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-stone-900 rounded-xl flex items-center justify-end pr-2 overflow-hidden relative"
                          >
                            <motion.div 
                              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                              animate={{ x: ['-200%', '300%'] }}
                              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                            />
                            {colorDistinctionProgress > 15 && (
                              <span className="text-[9px] font-mono font-black text-white relative z-10">
                                {Math.round(colorDistinctionProgress)}%
                              </span>
                            )}
                          </motion.div>
                        </div>
                        <p className="text-[9px] text-stone-500 flex justify-between font-mono">
                          <span>Distinction Progress</span>
                          <span className="font-bold text-stone-700">{uniqueColorsUsed} / 7 axes coloriels actifs</span>
                        </p>
                      </div>
                    </div>

                    {/* Jauge 3: Répétition & Fréquence (Cohérence) */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-650 font-black">3.</span>
                          <span className="font-bold text-stone-900">Fréquence de Récurrence</span>
                        </div>
                        <span className="px-1.5 py-0.2 ml-1 bg-stone-900 text-stone-100 rounded text-[9px] font-mono font-bold uppercase">
                          Niveau {tagFrequencyLvl}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-4.5 w-full bg-stone-200 rounded-xl overflow-hidden relative select-none shadow-3xs">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${tagFrequencyProgress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-red-650 rounded-xl flex items-center justify-end pr-2 overflow-hidden relative"
                          >
                            <motion.div 
                              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                              animate={{ x: ['-200%', '300%'] }}
                              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                            />
                            {tagFrequencyProgress > 15 && (
                              <span className="text-[9px] font-mono font-black text-white relative z-10">
                                {Math.round(tagFrequencyProgress)}%
                              </span>
                            )}
                          </motion.div>
                        </div>
                        <p className="text-[9px] text-stone-500 flex justify-between font-mono">
                          <span>Reoccurrence Matrix</span>
                          <span className="font-bold text-stone-700">Max répétée: {maxColorRepeat} fois</span>
                        </p>
                      </div>
                    </div>

                    {/* Jauge 4: Résolution Sémantique (Preuve) */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-650 font-black">4.</span>
                          <span className="font-bold text-stone-900">Preuve Axiomatique</span>
                        </div>
                        <span className="px-1.5 py-0.2 ml-1 bg-stone-900 text-stone-100 rounded text-[9px] font-mono font-bold uppercase">
                          Niveau {resolutionSemanticLvl}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-4.5 w-full bg-stone-200 rounded-xl overflow-hidden relative select-none shadow-3xs">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${resolutionSemanticProgress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-stone-900 rounded-xl flex items-center justify-end pr-2 overflow-hidden relative"
                          >
                            <motion.div 
                              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                              animate={{ x: ['-200%', '300%'] }}
                              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                            />
                            {resolutionSemanticProgress > 15 && (
                              <span className="text-[9px] font-mono font-black text-white relative z-10">
                                {Math.round(resolutionSemanticProgress)}%
                              </span>
                            )}
                          </motion.div>
                        </div>
                        <p className="text-[9px] text-stone-500 flex justify-between font-mono">
                          <span>Validation Proofs</span>
                          <span className="font-bold text-stone-700">{validatedParagraphIds.length} par. rigoureusement prouvés</span>
                        </p>
                      </div>
                    </div>

                    {/* Jauge 5: Richesse Taxonomique (Descriptions Métadiscours) */}
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-red-650 font-black">5.</span>
                          <span className="font-bold text-stone-900">Richesse Narrative</span>
                        </div>
                        <span className="px-1.5 py-0.2 ml-1 bg-stone-900 text-stone-100 rounded text-[9px] font-mono font-bold uppercase">
                          Niveau {taxonomicRichnessLvl}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-4.5 w-full bg-stone-200 rounded-xl overflow-hidden relative select-none shadow-3xs">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${taxonomicRichnessProgress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-red-650 rounded-xl flex items-center justify-end pr-2 overflow-hidden relative"
                          >
                            <motion.div 
                              className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                              animate={{ x: ['-200%', '300%'] }}
                              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
                            />
                            {taxonomicRichnessProgress > 15 && (
                              <span className="text-[9px] font-mono font-black text-white relative z-10">
                                {Math.round(taxonomicRichnessProgress)}%
                              </span>
                            )}
                          </motion.div>
                        </div>
                        <p className="text-[9px] text-stone-500 flex justify-between font-mono">
                          <span>Taxonomic Metadata</span>
                          <span className="font-bold text-stone-700">{totalDescLength} caractères de métadiscours</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RESET BUTTON */}
                  <div className="pt-2">
                    <button
                      onClick={handleGameReset}
                      className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300 rounded-xl text-[10px] font-mono font-black transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      title="Réinitialiser uniquement les données d'accumulation et de niveau"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      RÉINITIALISER LES STATISTIQUES DU JEU
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 📋 RAPPORT D'ANALYSE GLOBALE ET DISTRIBUTION CHROMATIQUE DES SENS */}
            <div className="bg-white border border-stone-950 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-stone-200 pb-2.5">
                <h4 className="text-[11px] font-mono font-black uppercase tracking-wider text-stone-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-red-650" />
                  RAPPORT DIAGNOSTIQUE DU LAB
                </h4>
                <span className="text-[8.5px] font-mono font-bold bg-red-100 text-red-600 border border-red-200 px-2 py-0.5 rounded-full uppercase">
                  SYNTHÈSE LIVE
                </span>
              </div>

              <div className="space-y-3.5 text-xs text-stone-700 leading-relaxed font-sans">
                {/* Visual diagnostic quote */}
                <div className="p-3 border-l-2 border-red-600 bg-stone-50 font-serif italic text-stone-800 text-[11px]">
                  "Le métadiscours consiste à expliciter la fonction de chaque jeton de couleur lorsqu'il s'associe aux termes textuels, constituant ainsi une cartographie logique objective hors de tout présupposé."
                </div>

                {/* Analytical breakdown */}
                <div className="space-y-2">
                  <span className="font-mono text-[9px] font-bold text-stone-400 block uppercase">ORIENTATION LOGIQUE & COUVERTURE</span>
                  <p className="text-[10px] leading-normal text-stone-600">
                    Votre indexation sémantique actuelle couvre environ <b className="text-stone-900 font-extrabold">{noms.length > 0 ? (noms.length * 1.5).toFixed(1) : "0"}%</b> du réseau textuel global. Les descriptions de registres révèlent les dominantes de récolte suivantes :
                  </p>
                </div>

                {/* Live color distribution stats list */}
                <div className="space-y-1.5">
                  {machineCategories.map((cat, idx) => {
                    const colorMatchCount = noms.filter(n => n.colorIndex === idx).length;
                    const hexColor = currentTheme.colors[idx % currentTheme.colors.length];
                    const pctDistribution = noms.length > 0 ? Math.round((colorMatchCount / noms.length) * 100) : 0;
                    
                    return (
                      <div key={cat.id} className="flex items-center justify-between text-[10.5px] p-2 bg-stone-50 rounded-lg border border-stone-200">
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0 border border-black/10" style={{ backgroundColor: hexColor }} />
                          <span className="font-bold text-stone-900 truncate">{cat.name}</span>
                        </div>
                        <div className="font-mono text-[9px] text-stone-500 flex items-center gap-1.5 shrink-0">
                          <span>{colorMatchCount} jeton(s)</span>
                          <span className="text-stone-300">|</span>
                          <span className="font-black text-stone-800">{pctDistribution}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LE JEU DES COULEURS DES NOMS */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-stone-500 flex items-center justify-between">
                <span>🎨 Jeu des Couleurs & Registres</span>
                <span className="text-[8px] font-mono font-bold text-stone-400 capitalize bg-stone-100 px-1.5 py-0.5 rounded">Mode direct</span>
              </h4>
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                {machineCategories.map((cat, idx) => {
                  const colorMatchCount = noms.filter(n => n.colorIndex === idx).length;
                  const hexColor = currentTheme.colors[idx % currentTheme.colors.length];
                  
                  return (
                    <div key={cat.id} className="p-2.5 bg-stone-50/50 border border-stone-150 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block border border-[#dddccb]"
                            style={{ backgroundColor: hexColor }}
                          />
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => {
                              const updated = machineCategories.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c);
                              setMachineCategories(updated);
                              saveToLocalStorage(noms, links, validatedParagraphIds, nomGuesses, activeThemeId, activeMode, updated);
                            }}
                            className="text-xs font-bold text-stone-850 bg-white hover:bg-stone-50 focus:bg-white outline-none px-1 rounded border border-stone-200 focus:border-stone-450 py-0.5 font-sans w-24 transition-all"
                            title="Cliquez pour renommer directement la catégorie"
                          />
                        </div>
                        <span className="text-[8.5px] font-mono font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                          {colorMatchCount} concept(s)
                        </span>
                      </div>
                      <p className="text-[9.5px] text-stone-500 leading-normal italic">
                        {cat.description || "Aucune description sémantique pour ce registre."}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SYNTHÈSE STATISTIQUE & RÉSEAU TRACTARIEN */}
            <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-2xs space-y-3">
              <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-[#5e584f]">
                📊 Synthèse Statistique du Texte
              </h4>
              
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2 bg-stone-50 border border-stone-150 rounded-xl">
                  <div className="text-base font-mono font-black text-amber-600">
                    {activePropositions.length > 0 ? Math.round((validatedParagraphIds.length / activePropositions.length) * 100) : 0}%
                  </div>
                  <div className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-widest">Texte Résolu</div>
                </div>
                
                <div className="p-2 bg-stone-50 border border-stone-150 rounded-xl">
                  <div className="text-base font-mono font-black text-indigo-600">
                    {noms.length}
                  </div>
                  <div className="text-[8px] font-mono font-bold text-stone-400 uppercase tracking-widest">Régistres Noms</div>
                </div>
              </div>
              
              <div className="bg-stone-900 border border-stone-800 rounded-xl p-3 text-[10px] text-stone-300 font-mono space-y-1 shadow-inner select-text">
                <div className="text-[9px] text-emerald-400 uppercase font-black tracking-widest border-b border-stone-850 pb-1 flex items-center justify-between">
                  <span>Isomorphisme Statistique</span>
                  <span className="animate-ping rounded-full h-1 w-1 bg-emerald-500" />
                </div>
                <div>Liaisons actives : {links.length} isomorphisme(s)</div>
                <div>Densité Conceptuelle : {activePropositions.length > 0 ? (noms.length / activePropositions.length).toFixed(2) : '0.00'} / paragraphe</div>
                <div className="text-stone-500 italic mt-1.5 pt-1.5 border-t border-stone-850 text-[9.5px]">
                  « La proposition est une image de la réalité. »
                </div>
              </div>
            </div>

          </div>
          )}
        </div>

        {/* INDEX ET HISTORIQUE COMPLET DE TOUTES LES ENTITIES CRÉÉES */}
        <div className="bg-white border border-stone-200 rounded-3xl p-6 shadow-sm mt-4">
          <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-3">
            <Bookmark className="w-4 h-4 text-stone-600" />
            <span className="font-mono text-[10px] font-extrabold uppercase tracking-widest text-[#55524e]">
              Index Critique des Concepts ({noms.length})
            </span>
          </div>

          {noms.length === 0 ? (
            <p className="text-stone-400 text-xs italic text-center py-3 font-sans">
              Aucun concept à présenter dans l'index pour le moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
              {[...noms].sort((a,b) => a.propId.localeCompare(b.propId)).map((nom, idx) => {
                const hexColor = currentTheme.colors[(nom.colorIndex !== undefined ? nom.colorIndex : 0) % currentTheme.colors.length];
                return (
                  <div 
                    key={nom.id} 
                    className="p-3.5 bg-stone-50 border border-stone-150 rounded-xl flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-[9px] font-bold bg-white border border-stone-200 text-stone-600 px-1.5 py-0.5 rounded-md">
                          Concept #{idx + 1}
                        </span>
                        <span 
                          className="font-bold text-stone-850 px-1 py-0.5 rounded-sm cursor-pointer hover:underline"
                          style={{ borderBottom: `2.5px solid ${hexColor}` }}
                          onClick={() => {
                            const el = document.getElementById(`prop-${nom.propId}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          title="Naviguer vers le texte d'origine"
                        >
                          {nom.text}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 mt-1 text-[10px]">
                        <p className="text-stone-700 font-sans font-semibold leading-normal">
                          <b>Catégorie :</b> {machineCategories[(nom.colorIndex !== undefined ? nom.colorIndex : 0) % machineCategories.length]?.name || "Inconnue"}
                        </p>
                        <p className="text-stone-500 font-sans leading-relaxed italic line-clamp-2">
                          "{machineCategories[(nom.colorIndex !== undefined ? nom.colorIndex : 0) % machineCategories.length]?.description || "Aucune explication pour cette catégorie."}"
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => startEditingNom(nom)}
                        className="p-1 px-2 text-[10px] bg-white border border-stone-200 rounded-md transition-all cursor-pointer font-bold font-mono text-stone-700 hover:bg-stone-100"
                        title="Détails"
                      >
                        Éditer
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* 🛠️ ACTION FLOATING PANEL EN SELECTION DE TEXTE */}
      <AnimatePresence>
        {selectedWordIndices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 35, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 35, x: '-50%' }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-stone-900 border border-stone-850 text-white rounded-full px-5 py-3 shadow-2xl flex items-center justify-between gap-4 text-xs font-mono max-w-[95vw] md:max-w-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-stone-300 truncate max-w-[150px] md:max-w-[200px] italic font-serif text-[13px]">
                "{getSelectedWordsText()}"
              </span>
              <button
                onClick={handleCommitNom}
                className="bg-amber-400 hover:bg-amber-300 text-stone-950 px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer text-[10.5px]"
              >
                Créer un Concept
              </button>
              <button
                onClick={() => {
                  setSelectedPropId(null);
                  setSelectedWordIndices([]);
                }}
                className="text-stone-400 hover:text-white transition-colors cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ⚙️ EDITION CRITIQUE DU NOM CONCEPT MODAL (POPUP) */}
      <AnimatePresence>
        {editingNomId && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-stone-200 rounded-2xl max-w-md w-full p-6 shadow-2xl-strong text-stone-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3 mb-4">
                <h3 className="font-mono text-[10px] uppercase tracking-wider font-extrabold text-stone-700 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500 animate-spin" />
                  Annoter & Élucider le Concept
                </h3>
                <button
                  onClick={() => setEditingNomId(null)}
                  className="text-stone-400 hover:text-stone-850 transition-colors p-1 rounded-full hover:bg-stone-55"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>

              {/* Jeton reference info */}
              <div className="bg-stone-50 border border-stone-200/55 p-3 rounded-xl mb-4 text-xs">
                <span className="font-mono text-[8px] text-stone-400 uppercase block tracking-wider">Jeton sélectionné (mot-clé)</span>
                <p className="mt-0.5 font-extrabold font-serif text-[13px] text-stone-850 italic">
                  "{noms.find(n => n.id === editingNomId)?.text}"
                </p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-stone-500 mb-1">
                    🏷️ Nom de la Catégorie Sémantique
                  </label>
                  <input
                    type="text"
                    value={editingNomText}
                    onChange={(e) => setEditingNomText(e.target.value)}
                    placeholder="Ex: Forme de l'espace logique..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold focus:border-stone-450 outline-none transition-all text-stone-850"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-stone-500 mb-1">
                    📝 Élucidation / Description de cette Catégorie
                  </label>
                  <textarea
                    value={editingNomDesc}
                    onChange={(e) => setEditingNomDesc(e.target.value)}
                    rows={3}
                    placeholder="Décrivez à quoi correspond cette catégorie thématique du texte..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:border-stone-450 outline-none transition-all text-stone-800 leading-relaxed font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-stone-500 mb-1">
                    Classification (Couleur du registre)
                  </label>
                  <div className="flex gap-2.5 mt-1.5">
                    {currentTheme.colors.map((hex, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setEditingNomColorIndex(idx);
                          const targetCat = machineCategories[idx % machineCategories.length];
                          setEditingNomText(targetCat?.name || '');
                          setEditingNomDesc(targetCat?.description || '');
                        }}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
                          editingNomColorIndex === idx 
                            ? 'border-stone-850 scale-110 shadow-md ring-2 ring-stone-900/10' 
                            : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={machineCategories[idx]?.name || `Option ${idx}`}
                      />
                    ))}
                  </div>
                  <p className="text-[9px] text-stone-400 font-mono mt-1 leading-normal">
                    La modification s'applique à tous les jetons du calque partageant cette couleur.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-stone-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => handleDeleteNom(editingNomId)}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Supprimer
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingNomId(null)}
                    className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveEditedNom}
                    className="px-4 py-1.5 bg-stone-950 hover:bg-stone-850 text-white rounded-lg text-[10px] font-mono font-extrabold transition-all cursor-pointer"
                  >
                    Enregistrer
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📚 MODAL: GESTIONNAIRE DE LA BIBLIOTHÈQUE CRITIQUE ET TEXTES */}
      <AnimatePresence>
        {isTextManagerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4 select-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#faf9f5] border border-stone-200/80 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Entête */}
              <div className="p-5 border-b border-stone-150 flex items-center justify-between bg-stone-50/50">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-amber-500" />
                  <div>
                    <h3 className="text-xs font-mono font-black uppercase tracking-widest text-[#5e584f]">
                      Bibliothèque Critique & Sessions
                    </h3>
                    <p className="text-[10px] text-stone-400 font-mono mt-0.5">
                      Configurez et ouvrez d'autres textes ou importez vos propres propositions.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsTextManagerOpen(false)}
                  className="p-1 px-1.5 hover:bg-stone-200/80 rounded-lg text-stone-400 hover:text-stone-700 transition-all cursor-pointer font-bold flex items-center text-xs gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span className="font-mono text-[10px] uppercase font-bold pr-1">Fermer</span>
                </button>
              </div>

              {/* Contenu principal divisé en deux colonnes */}
              <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-stone-150">
                
                {/* Colonne Gauche: Liste des Textes */}
                <div className="md:col-span-2 p-5 space-y-4 max-h-[60vh] overflow-y-auto bg-stone-50/20">
                  <h4 className="text-[9px] font-mono font-black uppercase tracking-widest text-stone-400">
                    SÉLECTIONNER UN TEXTE ({allCollections.length})
                  </h4>
                  
                  <div className="space-y-2">
                    {allCollections.map((col) => {
                      const isActive = col.id === activeCollectionId;
                      const isPreset = PRESET_COLLECTIONS.some(p => p.id === col.id);
                      
                      return (
                        <div
                          key={col.id}
                          onClick={() => {
                            handleSwitchCollection(col.id);
                            setIsTextManagerOpen(false);
                          }}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 relative group ${
                            isActive
                              ? 'bg-stone-900 text-stone-100 border-stone-900 shadow-sm'
                              : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50 text-stone-900'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={`text-[8px] font-mono font-extrabold uppercase px-1 py-0.5 rounded ${
                                  isActive
                                    ? 'bg-[#ffe4ab] text-stone-900'
                                    : 'bg-stone-100 text-stone-500'
                                }`}>
                                  {isPreset ? 'Preset' : 'Custom'}
                                </span>
                                {isActive && (
                                  <span className="text-[8.5px] text-emerald-400 font-mono flex items-center gap-0.5">
                                    <Check className="w-2.5 h-2.5 inline stroke-[2.5px]" /> Actif
                                  </span>
                                )}
                              </div>
                              <h5 className="text-xs font-bold font-sans tracking-tight leading-normal">
                                {col.name}
                              </h5>
                            </div>

                            {/* Options additionnelles pour les textes */}
                            <div className="flex items-center gap-1 z-20">
                              {/* Dedicated export button for text + its layers */}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleExportTextAndAllLayers(col.id);
                                }}
                                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                                  isActive
                                    ? 'hover:bg-stone-800 text-amber-400 hover:text-amber-200'
                                    : 'hover:bg-stone-100 text-stone-500 hover:text-emerald-600'
                                }`}
                                title="Exporter ce texte brut avec tous ses calques et sa session"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>

                              {!isPreset && (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingCollectionId(col.id);
                                      setNewTextName(col.name);
                                      setNewTextContent(col.propositions.map(p => p.textFr).join('\n'));
                                      triggerToast(`Modifications chargées pour "${col.name}" 📝`);
                                    }}
                                    className={`p-1 rounded-md transition-all cursor-pointer ${
                                      isActive
                                        ? 'hover:bg-stone-800 text-stone-400 hover:text-stone-100'
                                        : 'hover:bg-[#fffaeb] text-stone-400 hover:text-amber-600'
                                    }`}
                                    title="Modifier ce texte"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={(e) => handleDeleteCustomCollection(col.id, e)}
                                    className={`p-1 rounded-md transition-all cursor-pointer ${
                                      isActive
                                        ? 'hover:bg-stone-800 text-stone-400 hover:text-stone-100'
                                        : 'hover:bg-[#fef2f2] text-stone-400 hover:text-rose-600'
                                    }`}
                                    title="Supprimer ce texte"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[9.5px] font-mono pt-1 text-stone-400 group-hover:text-stone-500">
                            <span>{col.propositions.length} proposition(s)</span>
                            {!isActive && <span className="text-[8px] uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-all font-sans">Charger &rarr;</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Colonne Droite: Outils de création et d'importation */}
                <div className="md:col-span-3 p-5 space-y-6 max-h-[60vh] overflow-y-auto">
                  
                  {/* Section 1: Créer un texte personnalisé */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Plus className="w-4 h-4 text-stone-600" />
                        <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-[#5e584f]">
                          {editingCollectionId ? 'MODIFIER LE TEXTE EXISTANT' : 'ÉCRIRE UN NOUVEAU TEXTE'}
                        </h4>
                      </div>
                      {editingCollectionId && (
                        <button
                          onClick={() => {
                            setEditingCollectionId(null);
                            setNewTextName('');
                            setNewTextContent('');
                            triggerToast("Édition annulée.");
                          }}
                          className="text-[9px] font-mono font-bold text-rose-600 hover:text-rose-850 cursor-pointer hover:underline"
                        >
                          Annuler l'édition
                        </button>
                      )}
                    </div>

                    <div className="bg-white border border-stone-200 rounded-2xl p-4 shadow-3xs space-y-3.5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-black text-stone-400">
                          Titre du texte ou livre :
                        </label>
                        <input
                          type="text"
                          value={newTextName}
                          onChange={(e) => setNewTextName(e.target.value)}
                          placeholder="Ex: Notes Logiques sur l'Éthique"
                          className="w-full text-xs font-medium text-stone-850 px-3 py-2 rounded-xl border border-stone-250 focus:border-stone-400 focus:outline-none bg-stone-50/50"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase font-mono font-black text-stone-400 block">
                          Propositions (une proposition ou paragraphe par ligne) :
                        </label>
                        <textarea
                          rows={4}
                          value={newTextContent}
                          onChange={(e) => setNewTextContent(e.target.value)}
                          placeholder="Tapez vos propositions ici. Chaque ligne non vide correspondra à une proposition numérotée dans l'éditeur sémantique."
                          className="w-full text-xs font-mono p-3 rounded-xl border border-stone-250 focus:border-stone-400 focus:outline-none bg-stone-50/50 resize-y leading-relaxed"
                        />
                      </div>

                      {/* Live Proposition detector badge */}
                      {newTextContent.trim() && (
                        <div className="text-[10px] font-mono text-emerald-600 bg-emerald-50 rounded-lg p-2 border border-emerald-150 inline-block font-bold">
                          💡 {newTextContent.split('\n').filter(Boolean).length} proposition(s) détectée(s) !
                        </div>
                      )}

                      <button
                        onClick={handleCreateCustomCollection}
                        className="w-full py-2 bg-stone-950 hover:bg-stone-800 text-stone-100 rounded-xl text-[10px] font-mono font-black transition-all cursor-pointer flex items-center justify-center gap-1.5 hover:shadow-xs"
                      >
                        {editingCollectionId ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {editingCollectionId ? 'METTRE À JOUR & ENREGISTRER' : 'CRÉER & CHARGER LE TEXTE'}
                      </button>
                    </div>
                  </div>

                  {/* Section 2: Importer un texte ou une session */}
                  <div className="space-y-3 border-t border-stone-150 pt-5">
                    <div className="flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-stone-600" />
                      <h4 className="text-[10px] font-mono font-black uppercase tracking-widest text-[#5e584f]">
                        IMPORTER UN FICHIER SEMANTIQUE (.JSON)
                      </h4>
                    </div>

                    <div className="border border-dashed border-stone-300 hover:border-amber-400 bg-stone-50/30 rounded-2xl p-5 text-center transition-all relative group cursor-pointer">
                      <input
                        type="file"
                        accept=".json"
                        onChange={importDataJson}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Download className="w-5 h-5 mx-auto text-stone-400 group-hover:text-amber-500 mb-2 transition-all" />
                      <span className="text-[10.5px] font-bold text-stone-700 block">
                        Cliquez ou Glissez un fichier JSON ici
                      </span>
                      <span className="text-[9px] font-mono text-stone-400 mt-1 block">
                        Prend en charge les exports de textes complets avec tous leurs calques (.json), les sessions d'allométrie ou les structures de livres libres.
                      </span>
                    </div>
                  </div>

                </div>

              </div>

              {/* Pied de page informatif */}
              <div className="p-4 border-t border-stone-150 bg-stone-100/50 text-center text-[10px] font-mono text-stone-500 italic">
                « Tous les textes de la bibliothèque ont leur propre session de progression isolée. »
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOUTON DE VALIDATION GLOBAL FLOTTANT ACCESSIBLE PARTOUT EN UN SEUL EXEMPLAIRE */}
      <AnimatePresence>
        {activeMode === 'mastermind' && (
          <motion.div
            initial={{ y: 80, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 80, x: "-50%", opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 left-1/2 z-40 w-full max-w-sm px-4"
          >
            <button
              onClick={handleGlobalVerify}
              className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-mono font-black text-xs rounded-2xl shadow-xl active:scale-97 select-none transition-all flex items-center justify-center gap-2.5 cursor-pointer border border-amber-300 group relative overflow-hidden"
              title="Vérifier instantanément toutes les propositions masquées du texte sémantique"
              id="global-verify-mastermind-button"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
              <Sparkles className="w-4 h-4 text-amber-200 group-hover:animate-spin duration-1000" />
              <span>ALCHIMIE : VÉRIFIER LE TEXTE</span>
              <span className="font-sans px-2 py-0.5 rounded text-[8.5px] font-bold bg-stone-900/40 text-stone-100">
                {validatedParagraphIds.length} / {activePropositions.filter(p => noms.some(n => n.propId === p.id)).length} RÉSOLUS
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING INCREMENTAL GAME TEXT POPUPS */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <AnimatePresence>
          {floatingTexts.map((f) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 1, y: f.y, x: f.x, scale: 0.8 }}
              animate={{ opacity: 0, y: f.y - 140, x: f.x + (Math.random() * 60 - 30), scale: 1.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute font-mono font-black text-[10px] select-none pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] text-center py-1.5 px-3 bg-stone-900/90 text-stone-100 rounded-full border border-stone-800"
              style={{ color: f.color }}
            >
              {f.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}
