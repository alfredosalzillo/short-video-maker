import type React from "react";
import AddIcon from "@mui/icons-material/Add";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import VideoIcon from "@mui/icons-material/VideoLibrary";
import {
  AppBar,
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  ThemeProvider,
  Toolbar,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useColorMode } from "../hooks/useColorMode";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { mode, toggleColorMode, theme } = useColorMode();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <AppBar position="static">
          <Toolbar>
            <VideoIcon sx={{ mr: 2 }} />
            <Typography
              variant="h6"
              component="div"
              sx={{ flexGrow: 1, cursor: "pointer" }}
              onClick={() => navigate("/")}
            >
              Short Video Maker
            </Typography>
            <Button
              color="inherit"
              startIcon={<AddIcon />}
              onClick={() => navigate("/create")}
              sx={{ mr: 2 }}
            >
              Create Video
            </Button>
            <IconButton onClick={toggleColorMode} color="inherit">
              {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Container component="main" sx={{ flexGrow: 1, py: 4 }}>
          {children}
        </Container>
        <Box
          component="footer"
          sx={{
            py: 3,
            mt: "auto",
            backgroundColor: (theme) =>
              theme.palette.mode === "light"
                ? theme.palette.grey[200]
                : theme.palette.grey[900],
            textAlign: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Short Video Maker &copy; {new Date().getFullYear()}
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Layout;
