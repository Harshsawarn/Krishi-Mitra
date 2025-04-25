import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc } from "firebase/firestore";
import "../styles/Home.css";

function Home() {
  const [text, setText] = useState("");
  const fullText = "Krishi-Mitra🌾";
  const [index, setIndex] = useState(0);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
    // Typing effect
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setText(text + fullText[index]);
        setIndex(index + 1);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  useEffect(() => {
    // Fetch crops
    const fetchCrops = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "crops"));
        const cropsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          userId: doc.data().userId || "Unknown",
          name: doc.data().name || doc.data().title || "Unnamed Crop",
          price: doc.data().price || 0,
          quantity: doc.data().quantity || 0,
          district: doc.data().district || "Unknown",
          imageBase64: doc.data().imageBase64 || "",
        }));
        console.log("Fetched crops (Home):", cropsData); // Debug crop data
        setCrops(cropsData);
      } catch (error) {
        console.error("Error fetching crops:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCrops();
  }, []);

  const handleAddToCart = async (crop) => {
    if (!auth.currentUser) {
      alert("Please log in to add items to cart.");
      console.log("Add to Cart failed: No authenticated user");
      return;
    }
    if (!crop.id || !crop.name) {
      alert("Invalid crop data. Please try another crop.");
      console.log("Invalid crop:", crop);
      return;
    }
    console.log("Adding to cart:", { crop, userId: auth.currentUser.uid });
    try {
      await addDoc(collection(db, "cart"), {
        userId: auth.currentUser.uid,
        cropId: crop.id,
        name: crop.name,
        price: crop.price,
        quantity: 1,
        imageBase64: crop.imageBase64,
        timestamp: new Date().toISOString(),
      });
      alert(`${crop.name} added to cart!`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
    }
  };

  const handleSellerInfo = (crop) => {
    console.log("Selected crop for seller info (Home):", crop); // Debug seller info
    setSelectedCrop(crop);
  };

  const initiateChat = async () => {
    if (!auth.currentUser || !selectedCrop) {
      alert("Please log in to start a chat.");
      return;
    }
    if (!selectedCrop.userId || selectedCrop.userId === "Unknown") {
      alert("No seller information available.");
      console.log("Missing userId:", selectedCrop);
      return;
    }
    try {
      await addDoc(collection(db, "messages"), {
        buyerId: auth.currentUser.uid,
        farmerId: selectedCrop.userId,
        cropId: selectedCrop.id,
        message: `Hi, I'm interested in your ${selectedCrop.name}!`,
        timestamp: new Date().toISOString(),
      });
      alert("Chat initiated! Check your Message Inbox.");
      setSelectedCrop(null);
    } catch (error) {
      console.error("Error initiating chat:", error);
      alert("Failed to initiate chat.");
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content glass-card fade-in">
          <h1>{text}</h1>
          <p>Discover fresh produce from Bihar's farmers.</p>
          <div className="hero-buttons">
            <Link to="/buyer" className="button">
              Browse Crops
            </Link>
            <Link to="/farmer" className="button">
              Sell Crops
            </Link>
          </div>
        </div>
      </section>
      <section className="quick-links">
        <h2>Quick Links</h2>
        <div className="links-grid">
          <Link to="/calendar" className="link-card glass-card fade-in">
            <h3>Crop Calendar</h3>
            <p>Plan your farming with seasonal insights.</p>
          </Link>
          <Link to="/schemes" className="link-card glass-card fade-in">
            <h3>Government Schemes</h3>
            <p>Explore subsidies and support for farmers.</p>
          </Link>
          <Link to="/weather" className="link-card glass-card fade-in">
            <h3>Weather Forecast</h3>
            <p>Stay updated with local weather.</p>
          </Link>
        </div>
      </section>
      <section className="featured-crops">
        <h2>Featured Crops</h2>
        {loading ? (
          <p className="loading">Loading...</p>
        ) : crops.length === 0 ? (
          <p>No crops available.</p>
        ) : (
          <div className="crops-grid">
            {crops.slice(0, 4).map((crop) => (
              <div key={crop.id} className="crop-card glass-card fade-in">
                <img
                  src={crop.imageBase64}
                  alt={crop.name}
                  className="crop-image"
                  onError={(e) => {
                    e.target.src = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAAAAAAD/4QAuRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAKADAAQAAAABAAAAADAAAAABAAAAAAAAAA==";
                  }}
                />
                <h3>{crop.name}</h3>
                <p>Price: ₹{crop.price}/kg</p>
                <p>Quantity: {crop.quantity}kg</p>
                <p>District: {crop.district}</p>
                <div className="crop-buttons">
                  <button className="button" onClick={() => handleAddToCart(crop)}>
                    Add to Cart
                  </button>
                  <button className="button" onClick={() => handleSellerInfo(crop)}>
                    Seller Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedCrop && (
        <div className="seller-modal glass-card fade-in">
          <div className="modal-content">
            <h3>Seller Info: {selectedCrop.name}</h3>
            <p>Farmer ID: {selectedCrop.userId}</p>
            <p>District: {selectedCrop.district}</p>
            <div className="modal-buttons">
              <button className="button" onClick={initiateChat}>
                Start Chat
              </button>
              <button className="button" onClick={() => setSelectedCrop(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;



