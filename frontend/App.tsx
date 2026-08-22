import { Routes, Route } from "react-router";

function Home() {
  return null;
}

export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chat" element={<Home />} />
      <Route path="/chat/:id" element={<Home />} />
    </Routes>
  );
}

export default App;
