import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere } from "@react-three/drei";
import jsPDF from "jspdf";
import "../styles/CropCard.css";

function CropModel({ position }) {
  return (
    <Sphere position={position} args={[0.5, 32, 32]}>
      <meshStandardMaterial color="#f4b400" />
    </Sphere>
  );
}

function CropCard({ crop }) {
  const [quantity, setQuantity] = useState(1);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [sellerData, setSellerData] = useState(null);
  const [sellerCrops, setSellerCrops] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showSellerModal) {
      fetchSellerInfo();
      fetchMessages();
    }
  }, [showSellerModal]);

  const fetchSellerInfo = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", crop.farmerId));
      if (userDoc.exists()) {
        setSellerData(userDoc.data());
        const q = query(collection(db, "crops"), where("farmerId", "==", crop.farmerId));
        const querySnapshot = await getDocs(q);
        const crops = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setSellerCrops(crops);
      }
    } catch (error) {
      console.error("Error fetching seller info:", error);
    }
  };

  const fetchMessages = async () => {
    if (auth.currentUser) {
      try {
        const q = query(
          collection(db, "messages"),
          where("buyerId", "==", auth.currentUser.uid),
          where("farmerId", "==", crop.farmerId)
        );
        const querySnapshot = await getDocs(q);
        const messageData = querySnapshot.docs.map((doc) => doc.data());
        setMessages(messageData);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  const sendMessage = async () => {
    if (!auth.currentUser) {
      alert("Please log in to send a message.");
      return;
    }
    if (!message.trim()) {
      alert("Please enter a message.");
      return;
    }
    setLoading(true);
    try {
      const messageData = {
        buyerId: auth.currentUser.uid,
        farmerId: crop.farmerId,
        content: message,
        timestamp: new Date().toISOString(),
      };
      await addDoc(collection(db, "messages"), messageData);
      setMessages([...messages, messageData]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Invoice", 20, 20);
    doc.setFontSize(12);
    doc.text(`Crop: ${crop.title}`, 20, 40);
    doc.text(`Price: ₹${crop.price}/kg`, 20, 50);
    doc.text(`Quantity: ${quantity} kg`, 20, 60);
    doc.text(`Total: ₹${crop.price * quantity}`, 20, 70);
    doc.text(`District: ${crop.district}`, 20, 80);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 90);
    doc.save(`${crop.title}_invoice.pdf`);
  };

  const addToCart = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.cropId === crop.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        cropId: crop.id,
        title: crop.title,
        price: crop.price,
        quantity: quantity,
        district: crop.district,
        imageURL: crop.imageURL,
      });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    alert(`${crop.title} added to cart!`);
  };

  return (
    <div className="crop-card glass-card fade-in">
      <div className="crop-3d">
        {typeof window !== "undefined" && window.WebGLRenderingContext ? (
          <Canvas style={{ height: "200px" }} camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <CropModel position={[0, 0, 0]} />
            <OrbitControls enableZoom={false} enablePan={false} />
          </Canvas>
        ) : (
          <img src={crop.imageURL} alt={crop.title} className="crop-image" />
        )}
      </div>
      <h3>{crop.title}</h3>
      <p>Price: ₹{crop.price}/kg</p>
      <p>District: {crop.district}</p>
      <p>{crop.isOrganic ? "Organic" : "Non-Organic"}</p>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
        className="input"
        style={{ width: "60px", margin: "10px 0" }}
      />
      <button onClick={addToCart} className="button">Add to Cart</button>
      <button onClick={generateInvoice} className="button invoice-button">Download Invoice</button>
      <button onClick={() => setShowSellerModal(true)} className="button seller-button">Seller Info</button>

      {showSellerModal && (
        <div className="modal">
          <div className="modal-content glass-card fade-in">
            <button onClick={() => setShowSellerModal(false)} className="button close-button">Close</button>
            {sellerData ? (
              <>
                <h3>Seller Information</h3>
                <p><strong>Name:</strong> {sellerData.name}</p>
                <p><strong>District:</strong> {sellerData.district}</p>
                <p><strong>Contact:</strong> {sellerData.contactNumber}</p>
                <h4>Other Crops by Seller</h4>
                {sellerCrops.length > 0 ? (
                  <div className="seller-crops">
                    {sellerCrops.map((crop) => (
                      <div key={crop.id} className="seller-crop-item">
                        <img src={crop.imageURL} alt={crop.title} className="seller-crop-image" />
                        <p>{crop.title} - ₹{crop.price}/kg</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>No other crops listed.</p>
                )}
                <h4>Chat with Seller</h4>
                <div className="chat-box">
                  {messages.map((msg, index) => (
                    <p key={index} className={msg.buyerId === auth.currentUser?.uid ? "sent" : "received"}>
                      {msg.content}
                    </p>
                  ))}
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="input"
                />
                <button onClick={sendMessage} className="button" disabled={loading}>
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </>
            ) : (
              <p>Loading seller info...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CropCard;