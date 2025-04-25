import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { FaRobot } from "react-icons/fa";
import "../styles/Chatbot.css";

const translations = {
  en: {
    greeting: "How are you? How can I help you?",
    options: [
      "I want to sell my crop",
      "I want to buy crops",
      "I want to know about govt schemes",
      "Others",
    ],
    sellCrop: "To sell your crop, follow these steps:\n1. Go to Login or Signup page.\n2. Create an account as a farmer.\n3. Go to Profile section.\n4. In 'List a Crop', enter crop details (name, price, quantity, district, image).\n5. Click 'Add Crop' to list it.",
    buyCrop: "To buy crops, follow these steps:\n1. Go to Browse Crops page.\n2. Select your desired crop and quantity.\n3. Click 'Add to Cart'.\n4. Go to Cart page and click 'Buy Now' to complete the purchase.",
    govtSchemes: "To learn about government schemes, go to the Govt Schemes page from the navbar.",
    othersPrompt: "Please type your query:",
    submit: "Submit",
    querySubmitted: "Your query has been submitted!",
  },
  hi: {
    greeting: "आप कैसे हैं? मैं आपकी कैसे मदद कर सकता हूँ?",
    options: [
      "मैं अपनी फसल बेचना चाहता हूँ",
      "मैं फसल खरीदना चाहता हूँ",
      "मैं सरकारी योजनाओं के बारे में जानना चाहता हूँ",
      "अन्य",
    ],
    sellCrop: "अपनी फसल बेचने के लिए, इन चरणों का पालन करें:\n1. लॉगिन या साइनअप पेज पर जाएँ।\n2. किसान के रूप में खाता बनाएँ।\n3. प्रोफाइल सेक्शन में जाएँ।\n4. 'फसल सूचीबद्ध करें' में फसल विवरण (नाम, मूल्य, मात्रा, जिला, छवि) दर्ज करें।\n5. 'फसल जोड़ें' पर क्लिक करें।",
    buyCrop: "फसल खरीदने के लिए, इन चरणों का पालन करें:\n1. फसल ब्राउज़ करें पेज पर जाएँ।\n2. अपनी इच्छित फसल और मात्रा चुनें।\n3. 'कार्ट में जोड़ें' पर क्लिक करें।\n4. कार्ट पेज पर जाएँ और 'अभी खरीदें' पर क्लिक करें।",
    govtSchemes: "सरकारी योजनाओं के बारे में जानने के लिए, नैवबार से सरकारी योजनाएँ पेज पर जाएँ।",
    othersPrompt: "कृपया अपनी क्वेरी टाइप करें:",
    submit: "जमा करें",
    querySubmitted: "आपकी क्वेरी जमा हो गई है!",
  },
  ur: {
    greeting: "آپ کیسے ہیں؟ میں آپ کی کیا مدد کر سکتا ہوں؟",
    options: [
      "میں اپنی فصل بیچنا چاہتا ہوں",
      "میں فصلیں خریدنا چاہتا ہوں",
      "میں سرکاری اسکیموں کے بارے میں جاننا چاہتا ہوں",
      "دیگر",
    ],
    sellCrop: "اپنی فصل بیچنے کے لیے، ان مراحل پر عمل کریں:\n1. لاگ ان یا سائن اپ صفحہ پر جائیں۔\n2. کسان کے طور پر اکاؤنٹ بنائیں۔\n3. پروفائل سیکشن میں جائیں۔\n4. 'فصل hunting کراپ لسٹ کریں' میں فصل کی تفصیلات (نام، قیمت، مقدار، ضلع، تصویر) درج کریں۔\n5. 'کریپ شامل کریں' پر کلک کریں۔",
    buyCrop: "فصلیں خریدنے کے لیے، ان مراحل پر عمل کریں:\n1. فصلوں کو براؤز کریں صفحہ پر جائیں۔\n2. اپنی مطلوبہ فصل اور مقدار منتخب کریں۔\n3. 'کارٹ میں شامل کریں' پر کلک کریں۔\n4. کارٹ صفحہ پر جائیں اور 'ابھی خریدیں' پر کلک کریں۔",
    govtSchemes: "سرکاری اسکیموں کے بارے میں جاننے کے لیے، نیویگیشن بار سے سرکاری اسکیمیں صفحہ پر جائیں۔",
    othersPrompt: "براہ کرم اپنی کویری ٹائپ کریں:",
    submit: "جمع کروائیں",
    querySubmitted: "آپ کی کویری جمع کر دی گئی ہے!",
  },
  mai: {
    greeting: "आप कs ठीक छी? हम आपक की तरह सहायता कs सकी?",
    options: [
      "हम अपन फसल बेचनाइ चाही",
      "हम फसल खरीदनाइ चाही",
      "हम सरकारी योजना के बारे मे जाननाइ चाही",
      "अन्य",
    ],
    sellCrop: "अपन फसल बेचनाइ लेल, ई चरण सभ के पालन करू:\n1. लॉगिन अथवा साइनअप पेज पर जाउ।\n2. किसान के रूप मे खाता बनाउ।\n3. प्रोफाइल सेक्शन मे जाउ।\n4. 'फसल सूचीबद्ध करू' मे फसल के विवरण (नाम, मूल्य, मात्रा, जिला, छवि) दर्ज करू।\n5. 'फसल जोड़ू' पर क्लिक करू।",
    buyCrop: "फसल खरीदनाइ लेल, ई चरण सभ के पालन करू:\n1. फसल ब्राउज़ करू पेज पर जाउ।\n2. अपन इच्छित फसल आ मात्रा चुनू।\n3. 'कार्ट मे जोड़ू' पर क्लिक करू।\n4. कार्ट पेज पर जाउ आ 'अब खरीदू' पर क्लिक करू।",
    govtSchemes: "सरकारी योजनाक बारे मे जाननाइ लेल, नैवबार सs सरकारी योजनाक पेज पर जाउ।",
    othersPrompt: "कृपया अपन क्वेरी टाइप करू:",
    submit: "जमा करू",
    querySubmitted: "आपक क्वेरी जमा भs गेल!",
  },
  bho: {
    greeting: "का हाल बा? हम तहरा के का मदद कs सकीला?",
    options: [
      "हम अपन फसल बेचे के चाहत बानी",
      "हम फसल खरीदे के चाहत बानी",
      "हम सरकारी योजना के बारे मे जाने के चाहत बानी",
      "अउर कुछ",
    ],
    sellCrop: "अपन फसल बेचे खातिर, ई सभ चरण के पालन करीं:\n1. लॉगिन भा साइनअप पेज पर जाईं।\n2. किसान के रूप मे खाता बनाईं।\n3. प्रोफाइल सेक्शन मे जाईं।\n4. 'फसल लिस्ट करीं' मे फसल के डिटेल (नाम, दाम, मात्रा, जिला, फोटो) डालीं।\n5. 'फसल जोड़ीं' पर क्लिक करीं।",
    buyCrop: "फसल खरीदे खातिर, ई सभ चरण के पालन करीं:\n1. फसल ब्राउज़ करे वाला पेज पर जाईं।\n2. अपन पसंद के फसल आ मात्रा चुनीं।\n3. 'कार्ट मे जोड़ीं' पर क्लिक करीं।\n4. कार्ट पेज पर जाईं आ 'अब खरीदीं' पर क्लिक करीं।",
    govtSchemes: "सरकारी योजनाक बारे मे जाने खातिर, नैवबार सs सरकारी योजना वाला पेज पर जाईं।",
    othersPrompt: "कृपया अपन सवाल टाइप करीं:",
    submit: "जमा करीं",
    querySubmitted: "तहरा सवाल जमा हो गइल बा!",
  },
  mag: {
    greeting: "आप कs हाल बा? हम तs कs मदद कs सकी?",
    options: [
      "हम अपन फसल बेचे के चाही",
      "हम फसल खरीदे के चाही",
      "हम सरकारी योजना के बारे मे जाने के चाही",
      "अउर कुछ",
    ],
    sellCrop: "अपन फसल बेचे ला, ई सभ चरण के पालन करीं:\n1. लॉगिन भा साइनअप पेज पर जाईं।\n2. किसान के रूप मे खाता बनाईं।\n3. प्रोफाइल सेक्शन मे जाईं।\n4. 'फसल लिस्ट करीं' मे फसल के डिटेल (नाम, दाम, मात्रा, जिला, फोटो) डालीं।\n5. 'फसल जोड़ीं' पर क्लिक करीं।",
    buyCrop: "फसल खریदे ला, ई सभ चरण के पालन करीं:\n1. फसल ब्राउज़ करे वाला پेज पर जाईं।\n2. अपन पسंद के फसल आ मात्रा चुनीं।\n3. 'कार्ट मे जोड़ीं' पर کلिक करीं।\n4. कार्ट پेज पर जाईں آ 'अब खरीदीں' पर क्लिक کرीں।",
    govtSchemes: "सरकारी योजनाक बारे मे जाने ला, नैवبار सs सरकारी योजना वाला पेज पर जाईं।",
    othersPrompt: "कृपया अपन सवाल टाइप करीं:",
    submit: "जमा करीं",
    querySubmitted: "तs सवाल जमा हो गइल बा!",
  },
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [state, setState] = useState("greeting");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOption = (option) => {
    if (option === translations[language].options[0]) {
      setState("sellCrop");
    } else if (option === translations[language].options[1]) {
      setState("buyCrop");
    } else if (option === translations[language].options[2]) {
      setState("govtSchemes");
    } else {
      setState("others");
    }
  };

  const submitQuery = async () => {
    if (!query.trim()) {
      alert("Please enter a query.");
      return;
    }
    setLoading(true);
    try {
      await addDoc(collection(db, "queries"), {
        userId: auth.currentUser?.uid || "anonymous",
        query,
        language,
        timestamp: new Date().toISOString(),
      });
      setQuery("");
      setState("querySubmitted");
    } catch (error) {
      console.error("Error submitting query:", error);
      alert("Failed to submit query: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot">
      <button onClick={() => setIsOpen(!isOpen)} className="button chatbot-toggle">
        <FaRobot className="chatbot-icon" />
        {isOpen ? "Close Chat" : "Chat with Us"}
      </button>
      {isOpen && (
        <div className="chatbot-window glass-card fade-in">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="input language-selector"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="ur">Urdu</option>
            <option value="mai">Maithili</option>
            <option value="bho">Bhojpuri</option>
            <option value="mag">Magahi</option>
          </select>
          <div className="chat-content">
            {state === "greeting" && (
              <>
                <p>{translations[language].greeting}</p>
                {translations[language].options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOption(option)}
                    className="button option-button"
                  >
                    {option}
                  </button>
                ))}
              </>
            )}
            {state === "sellCrop" && <p>{translations[language].sellCrop}</p>}
            {state === "buyCrop" && <p>{translations[language].buyCrop}</p>}
            {state === "govtSchemes" && <p>{translations[language].govtSchemes}</p>}
            {state === "others" && (
              <>
                <p>{translations[language].othersPrompt}</p>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type your query..."
                  className="input"
                />
                <button
                  onClick={submitQuery}
                  className="button"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : translations[language].submit}
                </button>
              </>
            )}
            {state === "querySubmitted" && <p>{translations[language].querySubmitted}</p>}
            {(state !== "greeting" && state !== "others") && (
              <button onClick={() => setState("greeting")} className="button">
                Back
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Chatbot;