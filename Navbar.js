import { useState, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaUser, FaLeaf, FaShoppingCart, FaCalendarAlt, FaBuilding, FaSignInAlt, FaUserPlus, FaSignOutAlt } from "react-icons/fa";
import "../styles/Navbar.css";

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="navbar glass-card">
      <div className="navbar-brand">
        <Link to="/" className="nav-link">
          <FaHome className="nav-icon" /> Bihar Agri
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/" className="nav-link">
          <FaHome className="nav-icon" /> Home
        </Link>
        <Link to="/profile" className="nav-link">
          <FaUser className="nav-icon" /> Profile
        </Link>
        <Link to="/buyer" className="nav-link">
          <FaLeaf className="nav-icon" /> Browse Crops
        </Link>
        <Link to="/cart" className="nav-link">
          <FaShoppingCart className="nav-icon" /> Cart
        </Link>
        <Link to="/calendar" className="nav-link">
          <FaCalendarAlt className="nav-icon" /> Farming Calendar
        </Link>
        <Link to="/schemes" className="nav-link">
          <FaBuilding className="nav-icon" /> Govt Schemes
        </Link>
        {user ? (
          <button onClick={handleLogout} className="button">
            <FaSignOutAlt className="nav-icon" /> Logout
          </button>
        ) : (
          <>
            <Link to="/login" className="nav-link">
              <FaSignInAlt className="nav-icon" /> Login
            </Link>
            <Link to="/signup" className="nav-link">
              <FaUserPlus className="nav-icon" /> Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;