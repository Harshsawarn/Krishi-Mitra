import { useState } from "react";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import biharDistricts from "../utils/districts";
import "../styles/Signup.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [district, setDistrict] = useState("");
  const [role, setRole] = useState("farmer");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !name || !contactNumber || !district) {
      alert("Please fill all fields.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        email,
        name,
        contactNumber,
        district,
        role,
      });
      alert("Account created successfully!");
      navigate("/profile");
    } catch (error) {
      console.error("Error signing up:", error);
      alert("Signup failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup">
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content glass-card fade-in">
          <h1>Create Account</h1>
          <p>Join Bihar’s agricultural marketplace today!</p>
        </div>
      </section>

      <section className="signup-content">
        <div className="signup-form glass-card fade-in">
          <h3>Signup</h3>
          <form onSubmit={handleSignup}>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
            <input
              type="tel"
              placeholder="Contact Number (e.g., +919876543210)"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
            <select value={district} onChange={(e) => setDistrict(e.target.value)} className="input">
              <option value="">Select District</option>
              {biharDistricts.map((district) => (
                <option key={district} value={district}>{district}</option>
              ))}
            </select>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="input">
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
            </select>
            <button type="submit" className="button" disabled={loading}>
              {loading ? "Creating..." : "Signup"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

export default Signup;