import type React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import Layout from "./components/Layout";
import VideoCreator from "./pages/VideoCreator";
import VideoDetails from "./pages/VideoDetails";
import VideoList from "./pages/VideoList";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route
              index
              path="/"
              element={<Navigate to="/video" replace={true} />}
            />
            <Route path="/video" element={<VideoList />} />
            <Route path="/video/:videoId" element={<VideoDetails />} />
            <Route path="create" element={<VideoCreator />} />
          </Routes>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
};

export default App;
