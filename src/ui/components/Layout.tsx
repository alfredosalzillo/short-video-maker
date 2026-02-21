import type React from "react";
import { useMemo } from "react";
import AddIcon from "@mui/icons-material/Add";
import VideoIcon from "@mui/icons-material/VideoLibrary";
import {
  AppProvider,
  DashboardLayout,
  type Navigation,
  PageContainer,
  ThemeSwitcher,
} from "@toolpad/core";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import theme from "../theme";

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
