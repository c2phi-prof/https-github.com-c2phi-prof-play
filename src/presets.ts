import { Proposition } from './types';
import { PROPOSITIONS as TRACTATUS_PROPS } from './data';

export interface PresetCollection {
  id: string;
  name: string;
  propositions: Proposition[];
}

export const PRESET_COLLECTIONS: PresetCollection[] = [
  {
    id: 'tractatus',
    name: 'Logique & Ontologie Structurale (Texte de Référence)',
    propositions: TRACTATUS_PROPS
  },
  {
    id: 'descartes',
    name: 'Méditations Métaphysiques — René Descartes',
    propositions: [
      { id: "1", textFr: "Tout ce que j'ai reçu jusqu'à présent pour le plus vrai, je l'ai appris des sens." },
      { id: "1.1", textFr: "Mais j'ai éprouvé que ces sens étaient parfois trompeurs." },
      { id: "1.2", textFr: "Il est de la prudence de ne se fier jamais entièrement à ceux qui nous ont trompés une fois." },
      { id: "2", textFr: "Je pense, donc je suis (Cogito, ergo sum)." },
      { id: "2.1", textFr: "Mais qu'est-ce donc que je suis ? Une chose qui pense." },
      { id: "2.2", textFr: "Qu'est-ce qu'une chose qui pense ? C'est-à-dire une chose qui doute, qui entend, qui conçoit, qui affirme, qui nie, qui veut, qui ne veut pas, qui imagine aussi, et qui sent." },
      { id: "3", textFr: "La cause de l’idée d’un être parfait ne peut être qu’un être parfait." }
    ]
  },
  {
    id: 'poe',
    name: 'Le Corbeau — Edgar Allan Poe',
    propositions: [
      { id: "1", textFr: "Une fois, sur le minuit lugubre, tandis que je m'y appliquais, faible et fatigué." },
      { id: "1.1", textFr: "Je cherchais à tromper mon chagrin, le chagrin de ma Lénore perdue." },
      { id: "1.2", textFr: "Soudain, il y eut un battement de quelqu'un frappant doucement à la porte." },
      { id: "2", textFr: "Alors le corbeau entra, majestueux, aux jours d'autrefois." },
      { id: "2.1", textFr: "Perché sur un buste de Pallas juste au-dessus de la porte de ma chambre." },
      { id: "3", textFr: "Et le Corbeau, oiseau de malheur, ne disait qu'un seul mot immobile : Jamais plus (Nevermore)." }
    ]
  },
  {
    id: 'nietzsche',
    name: 'Ainsi parlait Zarathoustra — Friedrich Nietzsche',
    propositions: [
      { id: "1", textFr: "L'Homme est une corde tendue entre la bête et le Surhumain — une corde sur l'abîme." },
      { id: "1.1", textFr: "Un passage dangereux, un voyage dangereux, un frisson dangereux." },
      { id: "2", textFr: "Ce qui est grand dans l'homme, c'est d'être un pont et non un but." },
      { id: "2.1", textFr: "Ce qui peut être aimé dans l'homme, c'est son déclin et son sacrifice." },
      { id: "3", textFr: "Il faut encore avoir du chaos en soi pour pouvoir enfanter une étoile qui danse." }
    ]
  }
];
