import { useState } from "react";
import "../styles/GovtSchemes.css";

function GovtSchemes() {
  const schemes = [
    {
      title: "PM Kisan Samman Nidhi",
      description: "Financial assistance of ₹6,000 per year for farmers.",
      eligibility: ["Landholding farmers", "Up to 2 hectares"],
      link: "https://pmkisan.gov.in/",
    },
    {
      title: "Krishi Sinchai Yojana",
      description: "Subsidies for irrigation equipment.",
      eligibility: ["Small and marginal farmers", "Bihar residents"],
      link: "https://pmksy.gov.in/",
    },
  ];

  const [landSize, setLandSize] = useState("");
  const [isResident, setIsResident] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState("");

  const checkEligibility = (e) => {
    e.preventDefault();
    if (landSize && isResident) {
      const eligibleSchemes = schemes.filter((scheme) =>
        scheme.eligibility.includes("Bihar residents") && parseFloat(landSize) <= 2
      );
      setEligibilityResult(
        eligibleSchemes.length > 0
          ? `You are eligible for: ${eligibleSchemes.map((s) => s.title).join(", ")}`
          : "You are not eligible for any schemes."
      );
    } else {
      setEligibilityResult("Please fill all fields.");
    }
  };

  return (
    <div className="govt-schemes">
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content glass-card fade-in">
          <h1>Government Schemes</h1>
          <p>Unlock subsidies and support for Bihar’s farmers.</p>
        </div>
      </section>

      <section className="schemes-content">
        <h2>Available Schemes</h2>
        <div className="schemes-grid">
          {schemes.map((scheme, index) => (
            <div key={index} className="scheme-item glass-card fade-in">
              <h3>{scheme.title}</h3>
              <p>{scheme.description}</p>
              <ul>
                {scheme.eligibility.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
              <a href={scheme.link} target="_blank" rel="noopener noreferrer" className="button apply-button">
                Apply Now
              </a>
            </div>
          ))}
        </div>

        <div className="eligibility-checker glass-card fade-in">
          <h2>Check Eligibility</h2>
          <form onSubmit={checkEligibility} className="eligibility-form">
            <input
              type="number"
              placeholder="Land Size (hectares)"
              value={landSize}
              onChange={(e) => setLandSize(e.target.value)}
              className="input"
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isResident}
                onChange={(e) => setIsResident(e.target.checked)}
              />
              Bihar Resident
            </label>
            <button type="submit" className="button">Check Eligibility</button>
          </form>
          {eligibilityResult && <p className="eligibility-result">{eligibilityResult}</p>}
        </div>
      </section>
    </div>
  );
}

export default GovtSchemes;