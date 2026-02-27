import { createMistral } from "@ai-sdk/mistral";
import { generateText, type LanguageModel as LanguageModelV3 } from "ai";

export type AskAiDialogResponse = {
  title: string;
  description: string;
  scenes: {
    text: string;
    searchTerms: string;
  }[];
};

export const MODELS = [
  {
    value: "mistral-large-latest",
    label: "Mistral Large (latest)",
    provider: "mistral",
  },
];

export const getAiModel = (apiKey?: string): LanguageModelV3 => {
  const finalApiKey = apiKey || import.meta.env.VITE_MISTRAL_API_KEY;

  if (!finalApiKey) {
    throw new Error(
      "Mistral API key is missing. Please set VITE_MISTRAL_API_KEY in your .env file.",
    );
  }

  return createMistral({ apiKey: finalApiKey })("mistral-large-latest");
};

type GenerateVideoScriptParams = {
  description: string;
  suggestion?: string;
  videoType: string;
  duration: string;
  numScenes: string;
};

export const generateVideoScript = async ({
  description,
  suggestion,
  videoType,
  duration,
  numScenes,
}: GenerateVideoScriptParams): Promise<AskAiDialogResponse> => {
  const aiModel = getAiModel();

  const durationSeconds = Number.parseInt(duration, 10);
  const wordsPerSecond = 2.5;
  const totalWords = Math.floor(durationSeconds * wordsPerSecond);

  const suggestionText = suggestion
    ? `Suggestion for the scenes: "${suggestion}".`
    : "";

  const videoTypeSuggestion = `The video should have a ${videoType} tone and style. Ensure that the script and search terms reflect this ${videoType} atmosphere.`;

  const { text } = await generateText({
    model: aiModel,
    prompt: `Generate a video script and metadata for a video based on this description: "${description}".
        ${suggestionText}
        ${videoTypeSuggestion}
        The total duration should be approximately ${duration} seconds.
        The script should contain a total of approximately ${totalWords} words to fit the duration.
        In the scene text, use only standard punctuation (e.g. . , ! ?) and do not use special characters that cannot be synthesized by voice (e.g. * # _ -).
        Return the result as a JSON object with the following structure:
        {
          "title": "A catchy title",
          "description": "A brief description for the video, including tags for the platforms (ex. #curiosity, max 3 tags)",
          "scenes": [
            {
              "text": "The text to be spoken and displayed in this scene",
              "searchTerms": "comma-separated search terms for pexels video"
            }
          ]
        }
        Provide exactly ${numScenes} scenes. Return ONLY the JSON object.`,
  });

  return JSON.parse(text.replace(/```json\n?|\n?```/g, "").trim());
};
