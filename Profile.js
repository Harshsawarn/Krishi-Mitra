import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import particlesJS from "particles.js";

import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import biharDistricts from "../utils/districts";
import "../styles/Profile.css";

function Profile() {
  const [userData, setUserData] = useState(null);
  const [weather, setWeather] = useState(null);
  const [cropForm, setCropForm] = useState({
    title: "",
    price: "",
    quantity: "",
    isOrganic: false,
    district: "",
    image: null,
  });
  const [listedCrops, setListedCrops] = useState([]);
  const [messages, setMessages] = useState([]);
  const [replyMessages, setReplyMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          fetchWeather(data.district);
          fetchListedCrops();
          fetchMessages();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const fetchWeather = async (district = "Patna") => {
    const apiKey = "YOUR_OPENWEATHERMAP_API_KEY"; // Replace with your actual API key
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${district},IN&appid=${apiKey}&units=metric`
      );
      const data = await response.json();
      if (data.cod === 200) setWeather(data);
      else console.error("Weather API error:", data.message);
    } catch (error) {
      console.error("Weather fetch error:", error);
    }
  };

  const fetchListedCrops = async () => {
    try {
      const cropsRef = collection(db, "crops");
      const q = query(cropsRef, where("farmerId", "==", auth.currentUser.uid));
      const snapshot = await getDocs(q);
      const crops = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setListedCrops(crops);
    } catch (error) {
      console.error("Error fetching crops:", error);
    }
  };

  const fetchMessages = async () => {
    try {
      const uid = auth.currentUser.uid;
      const buyerQuery = query(collection(db, "messages"), where("buyerId", "==", uid));
      const farmerQuery = query(collection(db, "messages"), where("farmerId", "==", uid));

      const [buyerSnap, farmerSnap] = await Promise.all([
        getDocs(buyerQuery),
        getDocs(farmerQuery),
      ]);

      const allMessages = [...buyerSnap.docs, ...farmerSnap.docs].map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const grouped = {};
      for (const msg of allMessages) {
        const otherId = msg.buyerId === uid ? msg.farmerId : msg.buyerId;
        if (!grouped[otherId]) grouped[otherId] = { otherUser: null, messages: [] };
        grouped[otherId].messages.push(msg);
      }

      for (const userId of Object.keys(grouped)) {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) grouped[userId].otherUser = userDoc.data();
      }

      setMessages(grouped);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleCropInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setCropForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : files ? files[0] : value,
    }));
  };

  const handleAddCrop = async (e) => {
    e.preventDefault();
    const { title, price, quantity, district, isOrganic, image } = cropForm;

    if (!title || !price || !quantity || !district) {
      return alert("Fill in all required fields.");
    }

    setLoading(true);

    try {
      let imageURL = "https://via.placeholder.com/150";
      if (image) {
        const reader = new FileReader();
        imageURL = await new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(image);
        });
      }

      const cropData = {
        title,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        district,
        isOrganic,
        imageURL,
        farmerId: auth.currentUser.uid,
      };

      await addDoc(collection(db, "crops"), cropData);
      alert("Crop listed successfully!");
      setCropForm({
        title: "",
        price: "",
        quantity: "",
        isOrganic: false,
        district: "",
        image: null,
      });
      fetchListedCrops();
    } catch (err) {
      console.error("Add crop error:", err);
      alert("Error adding crop.");
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async (userId, isFarmer) => {
    const content = replyMessages[userId]?.trim();
    if (!content) return alert("Message is empty!");

    setLoading(true);
    try {
      const messageData = {
        buyerId: isFarmer ? userId : auth.currentUser.uid,
        farmerId: isFarmer ? auth.currentUser.uid : userId,
        content,
        timestamp: new Date().toISOString(),
      };

      await addDoc(collection(db, "messages"), messageData);
      setReplyMessages((prev) => ({ ...prev, [userId]: "" }));
      fetchMessages();
    } catch (error) {
      console.error("Reply error:", error);
      alert("Failed to send message.");
    } finally {
      setLoading(false);
    }
  };

  if (!userData) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile">
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-content glass-card fade-in">
          <h1>Your Profile</h1>
          <p>Connect with Bihar’s agriculture community.</p>
        </div>
      </section>

      <section className="profile-content">
        <div className="profile-details glass-card fade-in">
          <h3>Profile Details</h3>
          <p><strong>Name:</strong> {userData.name}</p>
          <p><strong>Email:</strong> {userData.email}</p>
          <p><strong>District:</strong> {userData.district}</p>
          <p><strong>Role:</strong> {userData.role}</p>
        </div>

        {weather && (
          <div className="weather glass-card fade-in">
            <h3>Weather in {userData.district}</h3>
            <p><strong>Temperature:</strong> {weather.main.temp}°C</p>
            <p><strong>Condition:</strong> {weather.weather[0].description}</p>
            <p><strong>Humidity:</strong> {weather.main.humidity}%</p>
          </div>
        )}

        {userData.role === "farmer" && (
          <>
            <div className="crop-form-section glass-card fade-in">
              <h3>List a Crop</h3>
              <form onSubmit={handleAddCrop} className="crop-form">
                <input name="title" type="text" placeholder="Crop Name" value={cropForm.title} onChange={handleCropInputChange} className="input" />
                <input name="price" type="number" placeholder="Price (₹/kg)" value={cropForm.price} onChange={handleCropInputChange} className="input" />
                <input name="quantity" type="number" placeholder="Quantity (kg)" value={cropForm.quantity} onChange={handleCropInputChange} className="input" />
                <label className="checkbox-label">
                  <input name="isOrganic" type="checkbox" checked={cropForm.isOrganic} onChange={handleCropInputChange} />
                  Organic
                </label>
                <select name="district" value={cropForm.district} onChange={handleCropInputChange} className="input">
                  <option value="">Select District</option>
                  {biharDistricts.map((dist) => (
                    <option key={dist} value={dist}>{dist}</option>
                  ))}
                </select>
                <input name="image" type="file" accept="image/*" onChange={handleCropInputChange} className="input-file" />
                <p className="note">Images are stored as Base64. Keep size &lt; 1MB.</p>
                <button type="submit" className="button" disabled={loading}>
                  {loading ? "Adding..." : "Add Crop"}
                </button>
              </form>
            </div>

            <div className="listed-crops glass-card fade-in">
              <h3>My Listed Crops</h3>
              {listedCrops.length > 0 ? (
                <div className="crops-grid">
                  {listedCrops.map((crop) => (
                    <div key={crop.id} className="crop-item">
                      <img src={crop.imageURL} alt={crop.title} className="crop-image" />
                      <h4>{crop.title}</h4>
                      <p>Price: ₹{crop.price}/kg</p>
                      <p>Quantity: {crop.quantity} kg</p>
                      <p>{crop.isOrganic ? "Organic" : "Non-Organic"}</p>
                      <p>District: {crop.district}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No crops listed yet.</p>
              )}
            </div>
          </>
        )}

        {userData.role === "buyer" && (
          <div className="purchase-history glass-card fade-in">
            <h3>Purchase History</h3>
            <p>No purchases yet. Start browsing crops!</p>
            <button onClick={() => navigate("/buyer")} className="button">Browse Crops</button>
          </div>
        )}

        <div className="message-inbox glass-card fade-in">
          <h3>Message Inbox</h3>
          {Object.keys(messages).length > 0 ? (
            Object.entries(messages).map(([otherUserId, convo]) => (
              <div key={otherUserId} className="conversation">
                <h4>Conversation with {convo.otherUser?.name || "Unknown"}</h4>
                <div className="chat-box">
                  {convo.messages
                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                    .map((msg, idx) => (
                      <p key={idx} className={msg.buyerId === auth.currentUser.uid ? "sent" : "received"}>
                        <span>{msg.content}</span>
                        <small>{new Date(msg.timestamp).toLocaleString()}</small>
                      </p>
                    ))}
                </div>
                <textarea
                  placeholder="Type your reply..."
                  value={replyMessages[otherUserId] || ""}
                  onChange={(e) => setReplyMessages({ ...replyMessages, [otherUserId]: e.target.value })}
                  className="input"
                />
                <button
                  onClick={() => sendReply(otherUserId, userData.role === "farmer")}
                  className="button"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            ))
          ) : (
            <p>No messages yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Profile;



