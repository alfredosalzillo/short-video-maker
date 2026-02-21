import type React from "react";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import { useDialogs } from "@toolpad/core";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import type { VideoMetadata } from "../../types/shorts";
import VideoStatus from "../components/VideoStatus";

const VideoList: React.FC = () => {
  const navigate = useNavigate();
  const dialogs = useDialogs();
  const queryClient = useQueryClient();

  const {
    data: videos = [],
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const response = await axios.get("/api/short-videos");
      return (response.data.videos || []) as VideoMetadata[];
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await axios.delete(`/api/short-video/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });

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

    const confirmed = await dialogs.confirm(
      "Are you sure you want to delete this video?",
      {
        title: "Delete Video",
        okText: "Delete",
        cancelText: "Cancel",
        severity: "error",
      },
    );

    if (!confirmed) return;

    deleteMutation.mutate(id);
  };

  if (isLoading) {
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

  const error = fetchError || deleteMutation.error;

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error instanceof Error ? error.message : "An error occurred"}
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
              const videoTitle = `${video?.title ?? "Unknown"} (${videoId})`;
              const videoDescription = video?.description;
              const createdAt = video?.createdAt;

              return (
                <div key={videoId}>
                  {index > 0 && <Divider />}
                  <ListItem
                    disablePadding
                    secondaryAction={
                      <Box>
                        <IconButton
                          edge="end"
                          aria-label="Play Video"
                          onClick={() => handleVideoClick(videoId)}
                          color="primary"
                        >
                          <PlayArrowIcon />
                        </IconButton>
                        <IconButton
                          edge="end"
                          aria-label="Delete Video"
                          onClick={(e) => handleDeleteVideo(videoId, e)}
                          color="error"
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    }
                  >
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
                            {createdAt && (
                              <Typography
                                variant="caption"
                                color="text.disabled"
                                display="block"
                                sx={{ mb: 0.5 }}
                              >
                                {new Date(createdAt).toLocaleString()}
                              </Typography>
                            )}
                            <VideoStatus
                              status={videoStatus}
                              sx={{ display: "block", mb: 0.5 }}
                            />
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                </div>
              );
            })}
          </List>
        </Paper>
      )}

      <Fab
        color="primary"
        aria-label="add"
        onClick={handleCreateNew}
        sx={{
          position: "fixed",
          bottom: 32,
          right: 32,
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default VideoList;
