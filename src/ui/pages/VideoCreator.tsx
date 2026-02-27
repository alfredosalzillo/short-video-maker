import type React from "react";
import { type FC, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Alert,
  Box,
  Button,
  Divider,
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  styled,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { MuiColorInput } from "mui-color-input";
import { useNavigate } from "react-router-dom";
import {
  CaptionPositionEnum,
  MusicMoodEnum,
  MusicVolumeEnum,
  OrientationEnum,
  type RenderConfig,
  type SceneInput,
  VoiceEnum,
} from "../../types/shorts";
import AskAiForm from "../plugins/ai-generation/AskAiForm";
import type { AskAiDialogResponse } from "../plugins/ai-generation/ai-utils";
import { useLocalStorageState } from "../plugins/storage/useLocalStorageState";

interface SceneFormData {
  text: string;
  searchTerms: string; // Changed to string
}

const drawerWidth = 400;

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create("margin", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginRight: 0,
  ...(open && {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginRight: `${drawerWidth}px`,
  }),
}));

const VideoCreator: FC = () => {
  const navigate = useNavigate();
  const [scenes, setScenes] = useState<SceneFormData[]>([
    { text: "", searchTerms: "" },
  ]);
  const [config, setConfig] = useLocalStorageState<RenderConfig>(
    "video_creator_config",
    {
      paddingBack: 1500,
      music: MusicMoodEnum.chill,
      captionPosition: CaptionPositionEnum.bottom,
      captionBackgroundColor: "#0000FFFF",
      voice: VoiceEnum.af_heart,
      orientation: OrientationEnum.portrait,
      musicVolume: MusicVolumeEnum.high,
    },
  );
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isAskAiOpen, setIsAskAiOpen] = useState(false);

  const createMutation = useMutation({
    mutationFn: async (data: {
      scenes: SceneInput[];
      config: RenderConfig;
      title: string;
      description: string;
    }) => {
      const response = await axios.post("/api/short-video", data);
      return response.data;
    },
    onSuccess: (data) => {
      navigate(`/video/${data.videoId}`);
    },
  });

  const handleAddScene = () => {
    setScenes([...scenes, { text: "", searchTerms: "" }]);
  };

  const handleRemoveScene = (index: number) => {
    if (scenes.length > 1) {
      const newScenes = [...scenes];
      newScenes.splice(index, 1);
      setScenes(newScenes);
    }
  };

  const handleSceneChange = (
    index: number,
    field: keyof SceneFormData,
    value: string,
  ) => {
    const newScenes = [...scenes];
    newScenes[index] = { ...newScenes[index], [field]: value };
    setScenes(newScenes);
  };

  const handleConfigChange = (
    field: keyof RenderConfig,
    value: RenderConfig[keyof RenderConfig],
  ) => {
    setConfig({ ...config, [field]: value });
  };

  const handleAskAi = () => {
    setIsAskAiOpen(true);
  };

  const handleAskAiClose = (result: AskAiDialogResponse | null) => {
    setIsAskAiOpen(false);
    if (result) {
      setTitle(result.title);
      setDescription(result.description);
      setScenes(result.scenes);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    createMutation.mutate({
      scenes: scenes.map((scene) => ({
        text: scene.text,
        searchTerms: scene.searchTerms
          .split(",")
          .map((term) => term.trim())
          .filter((term) => term.length > 0),
      })),
      config,
      title,
      description,
    });
  };

  const error =
    createMutation.error instanceof Error
      ? createMutation.error.message
      : createMutation.error;

  return (
    <Box sx={{ display: "block", position: "relative" }}>
      <Main open={isAskAiOpen}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {typeof error === "string" ? error : "An error occurred"}
          </Alert>
        )}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box />
          <Button
            variant="outlined"
            onClick={handleAskAi}
            startIcon={<AddIcon />}
            sx={[isAskAiOpen && { display: "none" }]}
          >
            Ask AI
          </Button>
        </Box>

        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Title"
                  value={title}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[<>]/g, "");
                    setTitle(val.slice(0, 100));
                  }}
                  helperText={
                    <>
                      Only supported by YouTube
                      <br />
                      Max 100 characters. Cannot contain &lt; or &gt; symbols.
                    </>
                  }
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  required
                  label="Description"
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  helperText="Supported by TikTok, YouTube, Instagram"
                />
              </Grid>
            </Grid>
          </Paper>

          <Typography variant="h5" component="h2" gutterBottom>
            Scenes
          </Typography>

          {scenes.map((scene, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: order of scenes is preserved
            <Paper key={`scene-${index}`} sx={{ p: 3, mb: 3 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">Scene {index + 1}</Typography>
                {scenes.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveScene(index)}
                    color="error"
                    size="small"
                    aria-label={`Delete Scene ${index + 1}`}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Text"
                    multiline
                    rows={4}
                    value={scene.text}
                    onChange={(e) =>
                      handleSceneChange(index, "text", e.target.value)
                    }
                    required
                  />
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <TextField
                    fullWidth
                    label="Search Terms (comma-separated)"
                    value={scene.searchTerms}
                    onChange={(e) =>
                      handleSceneChange(index, "searchTerms", e.target.value)
                    }
                    helperText="Enter keywords for background video, separated by commas"
                    required
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Box display="flex" justifyContent="center" mb={4}>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddScene}
            >
              Add Scene
            </Button>
          </Box>

          <Divider sx={{ mb: 4 }} />

          <Typography variant="h5" component="h2" gutterBottom>
            Video Configuration
          </Typography>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  type="number"
                  label="End Screen Padding (ms)"
                  value={config.paddingBack}
                  onChange={(e) =>
                    handleConfigChange(
                      "paddingBack",
                      parseInt(e.target.value, 10),
                    )
                  }
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">ms</InputAdornment>
                      ),
                    },
                  }}
                  helperText="Duration to keep playing after narration ends"
                  required
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Music Mood</InputLabel>
                  <Select
                    value={config.music}
                    onChange={(e) =>
                      handleConfigChange("music", e.target.value)
                    }
                    label="Music Mood"
                    required
                  >
                    {Object.values(MusicMoodEnum).map((tag) => (
                      <MenuItem key={tag} value={tag}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Caption Position</InputLabel>
                  <Select
                    value={config.captionPosition}
                    onChange={(e) =>
                      handleConfigChange("captionPosition", e.target.value)
                    }
                    label="Caption Position"
                    required
                  >
                    {Object.values(CaptionPositionEnum).map((position) => (
                      <MenuItem key={position} value={position}>
                        {position}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <MuiColorInput
                  fullWidth
                  label="Caption Background Color"
                  value={config.captionBackgroundColor || ""}
                  onChange={(value) =>
                    handleConfigChange("captionBackgroundColor", value)
                  }
                  helperText="Any valid CSS color (name, hex, rgba)"
                  required
                  format="hex8"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Default Voice</InputLabel>
                  <Select
                    value={config.voice}
                    onChange={(e) =>
                      handleConfigChange("voice", e.target.value)
                    }
                    label="Default Voice"
                    required
                  >
                    {Object.values(VoiceEnum).map((voice) => (
                      <MenuItem key={voice} value={voice}>
                        {voice}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Orientation</InputLabel>
                  <Select
                    value={config.orientation}
                    onChange={(e) =>
                      handleConfigChange("orientation", e.target.value)
                    }
                    label="Orientation"
                    required
                  >
                    {Object.values(OrientationEnum).map((orientation) => (
                      <MenuItem key={orientation} value={orientation}>
                        {orientation}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Volume of the background audio</InputLabel>
                  <Select
                    value={config.musicVolume}
                    onChange={(e) =>
                      handleConfigChange("musicVolume", e.target.value)
                    }
                    label="Volume of the background audio"
                    required
                  >
                    {Object.values(MusicVolumeEnum).map((voice) => (
                      <MenuItem key={voice} value={voice}>
                        {voice}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>

          <Box display="flex" justifyContent="center">
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              loading={createMutation.isPending}
            >
              Create Video
            </Button>
          </Box>
        </form>
      </Main>
      <Drawer
        open={isAskAiOpen}
        onClose={() => handleAskAiClose(null)}
        anchor="right"
        variant="persistent"
        sx={{
          width: isAskAiOpen ? drawerWidth : 0,
        }}
        slotProps={{
          paper: {
            sx: {
              width: drawerWidth,
              boxSizing: "border-box",
              p: 2,
            },
          },
        }}
      >
        <Toolbar />
        <AskAiForm onClose={handleAskAiClose} />
      </Drawer>
    </Box>
  );
};

export default VideoCreator;
