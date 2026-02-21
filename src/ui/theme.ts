import { createTheme } from "@mui/material";

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#2563eb", // Deep blue
          light: "#60a5fa",
          dark: "#1d4ed8",
        },
        secondary: {
          main: "#7c3aed", // Indigo/Purple
          light: "#a78bfa",
          dark: "#5b21b6",
        },
        background: {
          default: "#f8fafc",
          paper: "#ffffff",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#60a5fa", // Lighter blue for better contrast on very dark bg
          light: "#93c5fd",
          dark: "#3b82f6",
        },
        secondary: {
          main: "#a78bfa",
          light: "#c4b5fd",
          dark: "#8b5cf6",
        },
        background: {
          default: "#020617", // Slate 950 (Very dark blue-black)
          paper: "#0f172a", // Slate 900 (Deep navy)
        },
      },
    },
  },
  typography: {
    fontFamily: [
      '"Inter"',
      '"Roboto"',
      '"Helvetica"',
      '"Arial"',
      "sans-serif",
    ].join(","),
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "none",
        },
      },
    },
  },
});

export default theme;
