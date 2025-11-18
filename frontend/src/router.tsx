import { BrowserRouter, Route, Routes } from "react-router";
import Index from "./pages/Index";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

export default function Router() {
  return (
    <BrowserRouter>
    <Routes>
     <Route index element={<Index/>}></Route>
     <Route path="/login" element={<LoginPage />} />
     <Route path="/Register" element={<RegisterPage />} />
    </Routes>
    
    </BrowserRouter>
  );
}