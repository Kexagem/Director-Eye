
export interface Shot {
  id: string;
  scene: string;
  type: string;
  description: string;
}

export interface Prompts {
  imageFx: string;
  midjourney: string;
  veo: string;
  sound: string;
  music: string;
}

export interface VisualConcept {
  colorPalette: string;
  lighting: string;
  wardrobe: string;
  setDressing: string;
}

// Ensure process.env.API_KEY is declared for TypeScript
// This is typically handled by build tools or a custom d.ts file in larger projects
// For this standalone structure, we can extend the ProcessEnv interface
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      API_KEY?: string;
    }
  }
}
