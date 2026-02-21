import type React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import VideoCreator from "./pages/VideoCreator";
import VideoDetails from "./pages/VideoDetails";
import VideoList from "./pages/VideoList";

const App: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<VideoList />} />
          <Route path="/create" element={<VideoCreator />} />
          <Route path="/video/:videoId" element={<VideoDetails />} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
