import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../styles/FarmerDashboard.css";

function FarmerDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/profile");
  }, [navigate]);

  return null;
}

export default FarmerDashboard;