export type LearningStage = {
  age: number;
  mode: string;
  title: string;
  description: string;
  accent: string;
  soft: string;
  glyph: string;
};

/** Age progression copy — Library-agnostic; personalized by object + child name in UI. */
export function learningStagesForObject(objectName: string): LearningStage[] {
  const lower = objectName.toLowerCase();
  return [
    {
      age: 2,
      mode: "Sensing",
      title: `Colors, sounds, "${objectName}!"`,
      description: `Naming, pointing, and noticing a ${lower} in the world.`,
      accent: "#E45A5A",
      soft: "#FDE4E4",
      glyph: "●",
    },
    {
      age: 4,
      mode: "Wondering",
      title: `Where does a ${lower} belong?`,
      description: `Questions, vocabulary, and gentle connections to people and places.`,
      accent: "#F08A24",
      soft: "#FFE8D1",
      glyph: "?",
    },
    {
      age: 7,
      mode: "Reasoning",
      title: `${objectName} science & stories`,
      description: `Critical thinking, habitats, and playful problem solving.`,
      accent: "#3D6FBF",
      soft: "#D9E6FA",
      glyph: "✦",
    },
    {
      age: 10,
      mode: "Exploring",
      title: `Deeper ${lower} adventures`,
      description: `Systems thinking, creative projects, and sharing discoveries.`,
      accent: "#6B4FA0",
      soft: "#EDE4F8",
      glyph: "◎",
    },
  ];
}
