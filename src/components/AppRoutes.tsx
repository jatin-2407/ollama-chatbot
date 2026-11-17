import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { SignIn } from "./auth/SignIn";
import { Signup } from "./auth/Signup";
import { Chat } from "./pages/Chat";

export const AppRoutes = () => {
  const { isLoggedIn } = useAuth();
  return (
    <BrowserRouter>
      {isLoggedIn ? (
        <Routes>
          <Route path="/chat/:chat_id?" element={<Chat />} />
          <Route path="*" element={<Navigate to="/chat" replace />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      )}
    </BrowserRouter>
  );
};
