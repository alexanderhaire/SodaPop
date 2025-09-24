import { BrowserRouter, Routes, Route, Navigate, useParams } from "react-router-dom";
import TokenPage from "./pages/TokenPage";

function TokenToHorseRedirect() {
  const { symbol } = useParams();
  return <Navigate to={`/horse/${symbol}`} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/horse/TROLL" replace />} />
        <Route path="/horse/:symbol" element={<TokenPage />} />
        <Route path="/token/:symbol" element={<TokenToHorseRedirect />} />
        <Route path="*" element={<div className="p-6 text-zinc-400">Not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
