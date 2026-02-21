import type React from "react";
import { useCallback, useEffect, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { VideoMetadata } from "../../types/shorts";

const VideoList: React.FC = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const response = await axios.get("/api/short-videos");
      setVideos(response.data.videos || []);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch videos");
      setLoading(false);
      console.error("Error fetching videos:", err);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleCreateNew = () => {
    navigate("/create");
  };

  const handleVideoClick = (id: string) => {
    navigate(`/video/${id}`);
  };

  const handleDeleteVideo = async (
    id: string,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.stopPropagation();

    try {
      await axios.delete(`/api/short-video/${id}`);
      fetchVideos();
    } catch (err) {
      setError("Failed to delete video");
      console.error("Error deleting video:", err);
    }
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str || typeof str !== "string") return "Unknown";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        height="80vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box maxWidth="md" mx="auto" py={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Typography variant="h4" component="h1">
          Your Videos
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
        >
          Create New Video
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {videos.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            You haven't created any videos yet.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleCreateNew}
            sx={{ mt: 2 }}
          >
            Create Your First Video
          </Button>
        </Paper>
      ) : (
        <Paper>
          <List>
            {videos.map((video, index) => {
              const videoId = video?.id || "";
              const videoStatus = video?.status || "unknown";
              const videoTitle = `${video?.title ?? "Unknown"} (Video ${videoId.substring(0, 8)}…)`;
              const videoDescription = video?.description;

              return (
                <div key={videoId}>
                  {index > 0 && <Divider />}
                  <ListItemButton
                    onClick={() => handleVideoClick(videoId)}
                    sx={{
                      py: 2,
                      "&:hover": {
                        backgroundColor: "rgba(0, 0, 0, 0.04)",
                      },
                    }}
                  >
                    <ListItemText
                      primary={videoTitle}
                      secondary={
                        <Box component="span">
                          {videoDescription && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              noWrap
                              sx={{ maxWidth: "80%" }}
                            >
                              {videoDescription}
                            </Typography>
                          )}
                          <Typography
                            component="span"
                            variant="body2"
                            color={
                              videoStatus === "ready"
                                ? "success.main"
                                : videoStatus === "processing"
                                  ? "info.main"
                                  : videoStatus === "failed"
                                    ? "error.main"
                                    : "text.secondary"
                            }
                            sx={{ display: "block", mb: 0.5 }}
                          >
                            {capitalizeFirstLetter(videoStatus)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {videoStatus === "ready" && (
                        <IconButton
                          edge="end"
                          aria-label="Play Video"
                          onClick={() => handleVideoClick(videoId)}
                          color="primary"
                        >
                          <PlayArrowIcon />
                        </IconButton>
                      )}
                      <IconButton
                        edge="end"
                        aria-label="Delete Video"
                        onClick={(e) => handleDeleteVideo(videoId, e)}
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItemButton>
                </div>
              );
            })}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default VideoList;
