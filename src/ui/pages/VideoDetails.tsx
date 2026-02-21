import type React from "react";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useParams } from "react-router-dom";
import type { VideoMetadata } from "../../types/shorts";
import CopyButton from "../components/CopyButton";
import VideoStatus from "../components/VideoStatus";

const VideoDetails: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();

  const {
    data: video,
    isLoading,
    error: fetchError,
  } = useQuery({
    queryKey: ["video", videoId],
    queryFn: async () => {
      const response = await axios.get(`/api/short-video/${videoId}/status`);
      return response.data as VideoMetadata;
    },
    refetchInterval: (query) => {
      return query.state.data?.status === "processing" ? 5000 : false;
    },
    enabled: !!videoId,
  });

  return (
    <Box>
      <Grid container spacing={2} mb={3}>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Video ID
          </Typography>
          <Typography variant="body1">{videoId || "Unknown"}</Typography>
        </Grid>
        <Grid
          size={{
            xs: 12,
            sm: 6,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Status
          </Typography>
          <VideoStatus
            status={video?.status || "unknown"}
            component="p"
            variant="body1"
          />
        </Grid>
        {video && (
          <>
            <Grid
              size={{
                xs: 12,
              }}
            >
              <TextField
                label="Title"
                value={video.title}
                fullWidth
                disabled
                slotProps={{
                  input: {
                    endAdornment: <CopyButton value={video.title} edge="end" />,
                  },
                }}
                helperText="Only supported by YouTube"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                label="Description"
                value={video.description}
                fullWidth
                multiline
                rows={4}
                disabled
                slotProps={{
                  input: {
                    endAdornment: (
                      <CopyButton value={video.description} edge="end" />
                    ),
                  },
                }}
                helperText="Supported by TikTok, YouTube, Instagram"
              />
            </Grid>
          </>
        )}
      </Grid>
      {isLoading && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="30vh"
        >
          <CircularProgress />
        </Box>
      )}
      {fetchError && (
        <Alert severity="error">
          {fetchError instanceof Error
            ? fetchError.message
            : "Failed to fetch video details"}
        </Alert>
      )}
      {video?.status === "processing" && (
        <Box textAlign="center" py={4}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Your Video Is Being Created…</Typography>
          <Typography variant="body1" color="text.secondary">
            This may take a few minutes. Please wait.
          </Typography>
        </Box>
      )}
      {video?.status === "failed" && (
        <Alert severity="error">
          Video processing failed. Please try again with different settings.
        </Alert>
      )}
      {video?.status === "ready" && (
        <Box>
          <Box
            sx={{
              position: "relative",
              paddingTop: "56.25%",
              mb: 3,
              backgroundColor: "#000",
            }}
          >
            <video
              controls
              autoPlay
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              src={`/api/short-video/${videoId}`}
            >
              <track kind="captions" />
            </video>
          </Box>

          <Box textAlign="center">
            <Button
              component="a"
              href={`/api/short-video/${videoId}`}
              download
              variant="contained"
              color="primary"
              startIcon={<DownloadIcon />}
              sx={{ textDecoration: "none" }}
            >
              Download Video
            </Button>
          </Box>
        </Box>
      )}
      {!video && !isLoading && !fetchError && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Unknown video status. Please try refreshing the page.
        </Alert>
      )}
    </Box>
  );
};

export default VideoDetails;
