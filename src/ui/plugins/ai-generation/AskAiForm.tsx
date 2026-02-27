import type { FC } from "react";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useLocalStorageState } from "../storage/useLocalStorageState";
import {
  type AskAiDialogResponse,
  generateVideoScript,
  MODELS,
} from "./ai-utils";

type AskAiFormProps = {
  onClose: (result: AskAiDialogResponse | null) => void;
};

const AskAiForm: FC<AskAiFormProps> = ({ onClose }) => {
  const [model, setModel] = useLocalStorageState("ai-model", "gpt-4o");
  const [apiKey, setApiKey] = useLocalStorageState("ai-api-key", "");
  const [description, setDescription] = useState("");
  const [suggestion, setSuggestion] = useState("");
  const [duration, setDuration] = useState("60");
  const [numScenes, setNumScenes] = useState("6");
  const [videoType, setVideoType] = useState("fun");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedModel = MODELS.find((m) => m.value === model);

  const handleGenerate = async () => {
    if (!apiKey || !description) {
      setError("Please provide both API key and video description");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const parsedResult = await generateVideoScript({
        provider: selectedModel?.provider || "",
        model,
        apiKey,
        description,
        suggestion,
        videoType,
        duration,
        numScenes,
      });

      onClose(parsedResult);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">Ask AI to Generate Video</Typography>
        <IconButton
          onClick={() => onClose(null)}
          disabled={loading}
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          flexGrow: 1,
          overflowY: "auto",
        }}
      >
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

        <TextField
          label="Scene Suggestions"
          multiline
          rows={2}
          value={suggestion}
          onChange={(e) => setSuggestion(e.target.value)}
          fullWidth
          placeholder="e.g. Include specific facts about AI progress"
          disabled={loading}
        />

        <Box sx={{ display: "flex", gap: 2 }}>
          <TextField
            select
            label="Duration"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            fullWidth
            disabled={loading}
          >
            {[
              { value: "30", label: "30s" },
              { value: "60", label: "1m" },
              { value: "90", label: "1m 30s" },
              { value: "600", label: "10m" },
              { value: "900", label: "15m" },
            ].map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Number of Scenes"
            value={numScenes}
            onChange={(e) => setNumScenes(e.target.value)}
            fullWidth
            disabled={loading}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <MenuItem key={num} value={num.toString()}>
                {num}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          select
          label="Video Type"
          value={videoType}
          onChange={(e) => setVideoType(e.target.value)}
          fullWidth
          disabled={loading}
        >
          {[
            { value: "fun", label: "Fun" },
            { value: "dark", label: "Dark" },
            { value: "motivational", label: "Motivational" },
            { value: "educational", label: "Educational" },
            { value: "professional", label: "Professional" },
          ].map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
        <Button onClick={() => onClose(null)} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleGenerate} variant="contained" loading={loading}>
          Generate
        </Button>
      </Box>
    </Box>
  );
};

export default AskAiForm;
