import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import type { VideoMetadata } from "../../types/shorts";
import CopyButton from "../components/CopyButton";

const VideoDetails: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<VideoMetadata | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  const checkVideoStatus = useCallback(async () => {
    try {
      const response = await axios.get(`/api/short-video/${videoId}/status`);
      const videoData = response.data;

      if (isMounted.current) {
        setVideo(videoData);
        console.log("videoStatus", videoData.status);

        if (videoData.status !== "processing") {
          console.log("video is not processing");
          console.log("interval", intervalRef.current);

          if (intervalRef.current) {
            console.log("clearing interval");
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }

        setLoading(false);
      }
    } catch (error) {
      if (isMounted.current) {
        setError("Failed to fetch video details");
        setLoading(false);
        console.error("Error fetching video status:", error);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    }
  }, [videoId]);

  useEffect(() => {
    checkVideoStatus();

    intervalRef.current = setInterval(() => {
      checkVideoStatus();
    }, 5000);

    return () => {
      isMounted.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [checkVideoStatus]);

  const handleBack = () => {
    navigate("/");
  };

  const renderContent = () => {
    if (loading) {
      return (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="30vh"
        >
          <CircularProgress />
        </Box>
      );
    }

    if (error) {
      return <Alert severity="error">{error}</Alert>;
    }

    if (video?.status === "processing") {
      return (
        <Box textAlign="center" py={4}>
          <CircularProgress size={60} sx={{ mb: 2 }} />
          <Typography variant="h6">Your Video Is Being Created…</Typography>
          <Typography variant="body1" color="text.secondary">
            This may take a few minutes. Please wait.
          </Typography>
        </Box>
      );
    }

    if (video?.status === "ready") {
      return (
        <Box>
          <Box mb={3} textAlign="center">
            <Typography variant="h6" color="success.main" gutterBottom>
              Your Video Is Ready!
            </Typography>
          </Box>

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
      );
    }

    if (video?.status === "failed") {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          Video processing failed. Please try again with different settings.
        </Alert>
      );
    }

    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        Unknown video status. Please try refreshing the page.
      </Alert>
    );
  };

  const capitalizeFirstLetter = (str: string) => {
    if (!str || typeof str !== "string") return "Unknown";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Box maxWidth="md" mx="auto" py={4}>
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back to videos
        </Button>
        <Typography variant="h4" component="h1">
          Video Details
        </Typography>
      </Box>

      <Paper sx={{ p: 3 }}>
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
            <Typography
              variant="body1"
              color={
                video?.status === "ready"
                  ? "success.main"
                  : video?.status === "processing"
                    ? "info.main"
                    : video?.status === "failed"
                      ? "error.main"
                      : "text.primary"
              }
            >
              {capitalizeFirstLetter(video?.status || "unknown")}
            </Typography>
          </Grid>
          {video?.title && (
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
          )}
          {video?.description && (
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
          )}
        </Grid>

        {renderContent()}
      </Paper>
    </Box>
  );
};

export default VideoDetails;
