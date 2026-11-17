
import { GoogleGenAI, GenerateContentResponse, GenerateContentParameters, Contents } from "@google/genai";
import { Shot, Prompts, VisualConcept } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set. Please ensure it's available in your environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const modelName = 'gemini-2.5-flash-preview-04-17'; // Using the recommended model

const parseJsonResponse = <T,>(responseText: string): T => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s; // Matches ```json ... ``` or ``` ... ```
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response. Original responseText:", responseText);
    console.error("Attempted to parse jsonStr (after markdown fence removal):", jsonStr);
    console.error("Parsing error:", e);
    
    const snippetLength = 500; // Increased length for more context
    const problematicSnippet = jsonStr.length > snippetLength ? `${jsonStr.substring(0, snippetLength)}...` : jsonStr;
    
    throw new Error(`Failed to parse JSON response from Gemini. Ensure the model returns valid JSON. Problematic content snippet: ${problematicSnippet}`);
  }
};

const callGeminiGenerateContent = async <T,>(
  prompt: string | Contents,
  isJsonOutput: boolean = false
): Promise<T> => {
  try {
    const params: GenerateContentParameters = {
      model: modelName,
      contents: typeof prompt === 'string' ? [{ parts: [{ text: prompt }] }] : prompt,
    };
    if (isJsonOutput) {
      params.config = { responseMimeType: "application/json" };
    }

    const response: GenerateContentResponse = await ai.models.generateContent(params);
    
    if (isJsonOutput) {
      return parseJsonResponse<T>(response.text);
    }
    return response.text as unknown as T; // Be careful with this cast if not expecting string

  } catch (error) {
    console.error('Gemini API call failed:', error);
    if (error instanceof Error) {
        // Attempt to extract more specific error message if available from Gemini SDK
        const googleError = error as any; // Cast to any to check for specific properties
        if (googleError.message && googleError.message.includes('API key not valid')) {
             throw new Error("Gemini API key is not valid. Please check your API_KEY environment variable.");
        }
         if (googleError.message && googleError.message.includes('quota')) {
             throw new Error("Gemini API quota exceeded. Please check your quota or try again later.");
        }
    }
    throw error; // Re-throw the original or a more generic error
  }
};


export const analyzeScript = async (script: string): Promise<Shot[]> => {
  const prompt = `Analyze the following film script and break it down into individual shots.
Output the result as a valid JSON array of objects.
Each object MUST have the following properties:
- "id": A unique string identifier (e.g., "shot_001").
- "scene": A string describing the scene (e.g., "SCENE 1 - INT. COFFEE SHOP - DAY").
- "type": A string for the shot type (e.g., "CLOSE UP", "WIDE SHOT").
- "description": A string providing a brief description of the shot. Ensure any special characters (like quotes or backslashes) or newlines within this description are properly escaped (e.g., use \\" for a quote, \\\\ for a backslash, \\n for a newline) to maintain valid JSON string format.

The entire output MUST be a single, valid JSON array. Do not include any text, explanations, or formatting outside of this JSON array.
Example of a single shot object within the array:
{
  "id": "shot_example_001",
  "scene": "EXT. EXAMPLE LOCATION - DAY",
  "type": "MEDIUM SHOT",
  "description": "An example description. This might contain a newline character like so: first line\\nsecond line. It could also contain \\"escaped quotes\\"."
}

Script to analyze:
---
${script}
---
Please provide ONLY the JSON array as your response.`;
  const result = await callGeminiGenerateContent<Shot[]>(prompt, true);
  // Ensure IDs are unique if Gemini doesn't guarantee it, or add them if missing
  return result.map((shot, index) => ({ ...shot, id: shot.id || `shot_${Date.now()}_${index}` }));
};

export const generatePromptsForShot = async (shot: Shot, style: string): Promise<Prompts> => {
  const prompt = `Based on the following film shot and visual style, generate detailed creative prompts for various AI generation tools.
  Shot Details:
  - Scene: ${shot.scene}
  - Type: ${shot.type}
  - Description: ${shot.description}
  Visual Style: ${style}

  Generate prompts for:
  1. ImageFX (for generating a still image based on the shot)
  2. Midjourney (alternative still image prompt, focus on artistic interpretation)
  3. Veo (for generating a short video clip of the shot, describe camera movement and action)
  4. Sound Design (describe key sound effects and ambient sounds)
  5. Music (suggest mood, genre, or specific musical cues)

  Output as a single, valid JSON object with keys: "imageFx", "midjourney", "veo", "sound", and "music".
  Each value should be a string containing the respective prompt. Ensure all strings are properly escaped for valid JSON.
  Example for Veo: "Dynamic tracking shot following the character as they walk, moody synthwave music."
  Example for ImageFX: "Photorealistic close-up of a character's determined eyes, ${style} lighting, shallow depth of field."
  
  The entire output MUST be a single, valid JSON object.
  `;
  return callGeminiGenerateContent<Prompts>(prompt, true);
};

export const generateVisualConcept = async (shot: Shot, style: string): Promise<VisualConcept> => {
  const prompt = `Act as a creative director. For the film shot described below, and considering the specified visual style, develop a detailed visual concept.
  Shot Description: ${shot.description}
  Visual Style: ${style}

  Provide a JSON object with the following keys. Ensure all string values are properly escaped for valid JSON:
  - "colorPalette": Describe the dominant colors, mood, and any specific color relationships (e.g., "Muted blues and grays with occasional stark red highlights, creating a somber and tense atmosphere").
  - "lighting": Detail the lighting style, key light sources, and desired effect (e.g., "Low-key lighting with strong chiaroscuro, motivated by a single window, emphasizing mystery").
  - "wardrobe": Suggest costume styles, fabrics, and colors for characters in this shot, consistent with the style (e.g., "Characters in tailored, dark woolen suits for Film Noir; or flowing, ethereal fabrics for Fantasy Art").
  - "setDressing": Describe key props, set elements, and overall environment design (e.g., "Minimalist set with sleek, metallic surfaces for Cyberpunk; or cluttered, antique-filled room for Vintage").
  
  The entire output MUST be a single, valid JSON object.
  `;
  return callGeminiGenerateContent<VisualConcept>(prompt, true);
};

export const generateStoryboardSequence = async (shot: Shot, style: string): Promise<string[]> => {
  const prompt = `Act as a storyboard artist. For the film shot detailed below, and in the specified visual style, create a concise 3-step storyboard sequence.
  Each step should describe a key frame or moment within the shot.
  Shot Description: ${shot.description}
  Visual Style: ${style}

  Output a JSON array of 3 strings. Each string represents one frame description.
  Ensure all strings within the array are properly escaped for valid JSON.
  Focus on visual composition, character posing/action, and any significant camera angle or movement if applicable within the single shot.
  For example:
  [
    "Frame 1: Establishing wide shot of the desolate landscape, character small in frame. Text with a \\"quote\\" or a newline\\n should be handled.",
    "Frame 2: Medium shot, character turns, reacting to an off-screen sound, expression of fear.",
    "Frame 3: Close-up on character's hand reaching for a hidden object."
  ]
  The entire output MUST be a single, valid JSON array.
  `;
  return callGeminiGenerateContent<string[]>(prompt, true);
};
