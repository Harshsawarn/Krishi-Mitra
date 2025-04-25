import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, addDoc, doc, getDoc } from "firebase/firestore";
import "../styles/BuyerDashboard.css";

function BuyerDashboard() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [farmerProfile, setFarmerProfile] = useState(null);

  useEffect(() => {
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
        console.log("Fetched crops (BuyerDashboard):", cropsData);
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

  const handleSellerInfo = async (crop) => {
    console.log("Selected crop for seller info (BuyerDashboard):", crop);
    setSelectedCrop(crop);
    if (crop.userId && crop.userId !== "Unknown") {
      try {
        const farmerDoc = await getDoc(doc(db, "users", crop.userId));
        if (farmerDoc.exists()) {
          setFarmerProfile({
            contactNumber: farmerDoc.data().contactNumber || "Not provided",
            email: farmerDoc.data().email || "Not provided",
            displayName: farmerDoc.data().displayName || "Unknown Farmer",
          });
        } else {
          console.log("No farmer profile found for userId:", crop.userId);
          setFarmerProfile(null);
        }
      } catch (error) {
        console.error("Error fetching farmer profile:", error);
        setFarmerProfile(null);
      }
    } else {
      setFarmerProfile(null);
    }
  };

  const initiateChat = async () => {
    if (!auth.currentUser) {
      alert("Please log in to start a chat.");
      console.log("Start Chat failed: No authenticated user");
      return;
    }
    if (!selectedCrop || !selectedCrop.userId || selectedCrop.userId === "Unknown") {
      alert("No valid seller information available.");
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
      setFarmerProfile(null);
    } catch (error) {
      console.error("Error initiating chat:", error);
      alert("Failed to initiate chat. Please try again.");
    }
  };

  return (
    <div className="buyer-dashboard">
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content glass-card fade-in">
          <h1>Browse Crops</h1>
          <p>Discover fresh produce from Bihar's farmers.</p>
        </div>
      </section>
      <section className="crops-content">
        {loading ? (
          <p className="loading">Loading...</p>
        ) : crops.length === 0 ? (
          <p>No crops available.</p>
        ) : (
          <div className="crops-grid">
            {crops.map((crop) => (
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
            {farmerProfile ? (
              <>
                <p>Farmer Name: {farmerProfile.displayName}</p>
                <p>District: {selectedCrop.district}</p>
                <p>Contact Number: {farmerProfile.contactNumber}</p>
                <p>Email: {farmerProfile.email}</p>
              </>
            ) : (
              <>
                <p>Farmer Name: Unknown Farmer</p>
                <p>District: {selectedCrop.district}</p>
                <p>Contact Number: Not provided</p>
                <p>Email: Not provided</p>
              </>
            )}
            <div className="modal-buttons">
              <button className="button" onClick={initiateChat}>
                Start Chat
              </button>
              <button className="button" onClick={() => {
                setSelectedCrop(null);
                setFarmerProfile(null);
              }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BuyerDashboard;