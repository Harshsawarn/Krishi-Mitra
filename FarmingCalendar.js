import "../styles/FarmingCalendar.css";

function FarmingCalendar() {
  const calendarData = [
    { month: "January", crops: ["Wheat", "Barley"], tasks: ["Sowing", "Irrigation"] },
    { month: "April", crops: ["Maize", "Rice"], tasks: ["Transplanting", "Weeding"] },
    { month: "July", crops: ["Rice", "Litchi"], tasks: ["Fertilizing", "Pest Control"] },
    { month: "October", crops: ["Wheat", "Sugarcane"], tasks: ["Harvesting", "Sowing"] },
  ];

  return (
    <div className="farming-calendar 🗓️">
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-content glass-card fade-in">
          <h1>Farming Calendar</h1>
          <p>Plan your crops with Bihar’s seasonal insights.</p>
        </div>
      </section>

      <section className="calendar-content">
        <h2>Bihar Farming Calendar</h2>
        <div className="calendar-grid">
          {calendarData.map((item, index) => (
            <div key={index} className="calendar-item glass-card fade-in">
              <h3>{item.month}</h3>
              <p><strong>Crops:</strong> {item.crops.join(", ")}</p>
              <p><strong>Tasks:</strong> {item.tasks.join(", ")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default FarmingCalendar;