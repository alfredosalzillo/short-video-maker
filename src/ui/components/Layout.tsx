import type React from "react";
import { useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import VideoIcon from "@mui/icons-material/VideoLibrary";
import { createTheme } from "@mui/material";
import {
  AppProvider,
  DashboardLayout,
  type Navigation,
  PageContainer,
  ThemeSwitcher,
} from "@toolpad/core";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Main items",
  },
  {
    segment: "video",
    pattern: "video{/:orderId}*",
    title: "Video List",
    icon: <VideoIcon />,
  },
  {
    segment: "create",
    title: "Create Video",
    icon: <AddIcon />,
  },
];

const theme = createTheme({
  cssVariables: {
    colorSchemeSelector: "data-toolpad-color-scheme",
  },
  colorSchemes: {
    light: {
      palette: {
        primary: {
          main: "#1976d2",
        },
        secondary: {
          main: "#f50057",
        },
      },
    },
    dark: {
      palette: {
        primary: {
          main: "#90caf9",
        },
        secondary: {
          main: "#f48fb1",
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
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
});

interface LayoutProps {
  children?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const router = useMemo(() => {
    return {
      pathname: location.pathname,
      searchParams: new URLSearchParams(location.search),
      navigate: (path: string | URL) => navigate(path.toString()),
    };
  }, [navigate, location]);

  return (
    <AppProvider
      navigation={NAVIGATION}
      router={router}
      theme={theme}
      branding={{
        logo: <VideoIcon color="primary" />,
        title: "Short Video Maker",
      }}
    >
      <DashboardLayout
        slotProps={{
          toolbarActions: {
            children: <ThemeSwitcher />,
          },
        }}
      >
        <PageContainer>{children ?? <Outlet />}</PageContainer>
      </DashboardLayout>
    </AppProvider>
  );
};

export default Layout;
