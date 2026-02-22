import type { FC } from "react";
import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import type { DialogProps } from "@toolpad/core";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createMistral } from "@ai-sdk/mistral";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel as LanguageModelV3 } from "ai";
import { generateText } from "ai";
import { useLocalStorageState } from "../plugins/storage/useLocalStorageState";

export type AskAiDialogResponse = {
  title: string;
  description: string;
  scenes: {
    text: string;
    searchTerms: string;
  }[];
};

const MODELS = [
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

const AskAiDialog: FC<DialogProps<void, AskAiDialogResponse | null>> = ({
  open,
  onClose,
}) => {
  const [model, setModel] = useLocalStorageState("ai-model", "gpt-4o");
  const [apiKey, setApiKey] = useLocalStorageState("ai-api-key", "");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedModel = MODELS.find((m) => m.value === model);

  const getAiModel = (
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

  const handleGenerate = async () => {
    if (!apiKey || !description) {
      setError("Please provide both API key and video description");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const aiModel = getAiModel(selectedModel?.provider || "", model, apiKey);

      const { text } = await generateText({
        model: aiModel,
        prompt: `Generate a video script and metadata for a short video based on this description: "${description}".
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
        Provide at least 3 scenes and at most 6 scenes. Return ONLY the JSON object.`,
      });

      const parsedResult = JSON.parse(
        text.replace(/```json\n?|\n?```/g, "").trim(),
      );
      onClose(parsedResult as AskAiDialogResponse);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(null)} fullWidth maxWidth="sm">
      <DialogTitle>Ask AI to Generate Video</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Provide your AI model details and a description of what you want the
            video to be about.
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            select
            label="AI Model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            fullWidth
            disabled={loading}
          >
            {MODELS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={
              selectedModel?.provider === "openai"
                ? "OpenAI API Key"
                : selectedModel?.provider === "mistral"
                  ? "Mistral API Key"
                  : "Gemini API Key"
            }
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            fullWidth
            placeholder={
              selectedModel?.provider === "openai"
                ? "sk-..."
                : selectedModel?.provider === "mistral"
                  ? "api-key"
                  : "AIza..."
            }
            disabled={loading}
          />

          <TextField
            label="Video Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            placeholder="e.g. A motivational video about technology and the future"
            disabled={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(null)} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} variant="contained" loading={loading}>
          Generate
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AskAiDialog;
