import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
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
  { value: "gpt-4o", label: "GPT-4o", provider: "openai" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini", provider: "openai" },
  { value: "o3-mini", label: "o3-mini", provider: "openai" },
  { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", provider: "google" },
  {
    value: "gemini-1.5-flash-latest",
    label: "Gemini 1.5 Flash (latest)",
    provider: "google",
  },
  { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", provider: "google" },
  {
    value: "gemini-1.5-pro-latest",
    label: "Gemini 1.5 Pro (latest)",
    provider: "google",
  },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", provider: "google" },
  {
    value: "gemini-2.0-flash-lite",
    label: "Gemini 2.0 Flash Lite",
    provider: "google",
  },
  {
    value: "gemini-2.0-pro-exp-02-05",
    label: "Gemini 2.0 Pro Exp (02-05)",
    provider: "google",
  },
  {
    value: "gemini-2.0-flash-thinking-exp-01-21",
    label: "Gemini 2.0 Flash Thinking Exp",
    provider: "google",
  },
  {
    value: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    provider: "google",
  },
  {
    value: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    provider: "google",
  },
  {
    value: "mistral-large-latest",
    label: "Mistral Large (latest)",
    provider: "mistral",
  },
  {
    value: "mistral-medium-latest",
    label: "Mistral Medium (latest)",
    provider: "mistral",
  },
  {
    value: "mistral-small-latest",
    label: "Mistral Small (latest)",
    provider: "mistral",
  },
  {
    value: "pixtral-large-latest",
    label: "Pixtral Large (latest)",
    provider: "mistral",
  },
  {
    value: "mistral-embed",
    label: "Mistral Embed",
    provider: "mistral",
  },
];

export const getAiModel = (
  provider: string,
  modelId: string,
  apiKey: string,
): LanguageModelV3 => {
  if (provider === "openai") {
    return createOpenAI({ apiKey })(modelId);
  }
  if (provider === "google") {
    return createGoogleGenerativeAI({
      apiKey,
    })(modelId);
  }
  if (provider === "mistral") {
    return createMistral({ apiKey })(modelId);
  }
  throw new Error("Unsupported provider");
};

type GenerateVideoScriptParams = {
  provider: string;
  model: string;
  apiKey: string;
  description: string;
  videoType: string;
  duration: string;
  numScenes: string;
};

export const generateVideoScript = async ({
  provider,
  model,
  apiKey,
  description,
  videoType,
  duration,
  numScenes,
}: GenerateVideoScriptParams): Promise<AskAiDialogResponse> => {
  const aiModel = getAiModel(provider, model, apiKey);

  const durationSeconds = Number.parseInt(duration, 10);
  const wordsPerSecond = 2.5;
  const totalWords = Math.floor(durationSeconds * wordsPerSecond);

  const { text } = await generateText({
    model: aiModel,
    prompt: `Generate a video script and metadata for a video based on this description: "${description}".
        The video should have a ${videoType} tone and a total duration of approximately ${duration} seconds.
        The script should contain a total of approximately ${totalWords} words to fit the duration.
        In the scene text, use only standard punctuation (e.g. . , ! ?) and do not use special characters that cannot be synthesized by voice (e.g. * # _ -).
        Return the result as a JSON object with the following structure:
        {
          "title": "A catchy title",
          "description": "A brief description for the video, including tags for the platforms (ex. #curiosity)",
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
