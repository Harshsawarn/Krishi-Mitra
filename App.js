import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Chatbot from "./components/Chatbot";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import BuyerDashboard from "./pages/BuyerDashboard";
import FarmingCalendar from "./pages/FarmingCalendar";
import GovtSchemes from "./pages/GovtSchemes";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";
import "./styles/global.css";

function App() {
  return (
    <Router>
      <Navbar />
      <Chatbot />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/buyer" element={<BuyerDashboard />} />
        <Route path="/calendar" element={<FarmingCalendar />} />
        <Route path="/schemes" element={<GovtSchemes />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </Router>
  );
}

export default App;


 