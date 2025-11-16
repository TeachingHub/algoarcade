import { BrowserRouter, Route, Routes } from "react-router";
import Index from "./pages/Index";

export default function Router() {
  return (
    <BrowserRouter>
    <Routes>
     <Route index element={<Index/>}></Route>
    </Routes>
    
    </BrowserRouter>
  );
}