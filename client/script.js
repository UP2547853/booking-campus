console.log("✅ script.js loaded");

// 1) Wire up event listeners on load
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Booking page initialized");
  const facilityEl = document.getElementById("facility");
  const dateEl     = document.getElementById("bookingDate");
  const formEl     = document.getElementById("bookingForm");

  if (facilityEl && dateEl && formEl) {
    facilityEl.addEventListener("change", showAvailability);
    dateEl.addEventListener("change", showAvailability);
    formEl.addEventListener("submit", submitBooking);
  }

  // 2) Logout button
  const btn = document.getElementById("logoutBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      localStorage.removeItem("hogwartsId");
      localStorage.removeItem("role");
      window.location.href = "index.html";  // adjust if your homepage is named differently
    });
  }
});

// 2) Fetch availability and update UI
async function showAvailability() {
  const facility = document.getElementById("facility").value;
  const date = document.getElementById("bookingDate").value;
  const grid = document.getElementById("availabilityGrid");
  grid.innerHTML = "";            // clear previous heatmap
  resetTimeSlotOptions();         // re-enable all slots

  if (!facility || !date) return;

  try {
    const res = await fetch(`http://localhost:3000/api/availability?facility=${facility}&date=${date}`);
    const { booked } = await res.json();
    renderHeatmap(booked);
    updateTimeSlotOptions(booked);
  } catch (err) {
    console.error("Error loading availability:", err);
    grid.textContent = "Error loading availability";
  }
}

// 3) Render a simple red/green heatmap
function renderHeatmap(bookedSlots) {
  const slots = [
    "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
    "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00", "20:00-21:00", "21:00-22:00"
  ];
  const grid = document.getElementById("availabilityGrid");
  const table = document.createElement("table");
  table.className = "heatmap";

  slots.forEach(slot => {
    const tr = document.createElement("tr");
    const tdLabel = document.createElement("td");
    tdLabel.textContent = slot;
    const tdCell = document.createElement("td");
    tdCell.className = bookedSlots.includes(slot)
      ? "heatmap-cell booked"
      : "heatmap-cell free";
    tr.append(tdLabel, tdCell);
    table.append(tr);
  });

  grid.append(table);
}

// 4) Re-enable all time‐slot options
function resetTimeSlotOptions() {
  const select = document.getElementById("timeSlot");
  Array.from(select.options).forEach(opt => {
    opt.disabled = false;
    opt.textContent = opt.value || opt.textContent.replace(/\s*\(booked\)/, "");
  });
}

// 5) Disable & label booked slots in the dropdown
function updateTimeSlotOptions(bookedSlots) {
  const select = document.getElementById("timeSlot");
  Array.from(select.options).forEach(opt => {
    if (!opt.value) return;  // skip placeholder
    if (bookedSlots.includes(opt.value)) {
      opt.disabled = true;
      opt.textContent = `${opt.value} (booked)`;
    }
  });
}

// 6) Handle the booking submission
async function submitBooking(e) {
  e.preventDefault();
  console.log("▶️ submitBooking()");

  const hogwartsId = localStorage.getItem("hogwartsId");
  if (!hogwartsId) return alert("⚠️ Please log in first.");

  const facility = document.getElementById("facility").value;
  const date = document.getElementById("bookingDate").value;
  const timeSlot = document.getElementById("timeSlot").value;
  const resultDiv = document.getElementById("bookingResult");

  try {
    const res = await fetch("http://localhost:3000/api/book", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hogwartsId, facility, date, timeSlot })
    });
    const data = await res.json();

    if (res.ok && data.success) {
      resultDiv.style.color = "#b3ffb3";
      resultDiv.textContent = `✅ Booking confirmed! (ID: ${data.bookingId})`;
      // refresh availability & slots
      showAvailability();
    } else {
      resultDiv.style.color = "#ff9999";
      resultDiv.textContent = `❌ ${data.error || "Booking failed"}`;
    }
  } catch (err) {
    console.error("Booking error:", err);
    resultDiv.style.color = "#ff9999";
    resultDiv.textContent = "Network error—please try again.";
  }
}