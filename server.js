import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import connection from "./db/config.js"; // MySQL connection file

const app = express();
const PORT = 3000;

// === ES Module dirname setup ===
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// === Middleware ===
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Serve static files

// === ROUTES FOR HTML PAGES ===
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});
app.get("/doctor-profile", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "doctor_profile.html"));
});


app.get("/book-appointment", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "book_appointment.html"));
});

app.get("/cancel-appointment", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "cancel_appointment.html"));
});

app.get("/hospital", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "hospital.html"));
});

app.get("/stores", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "stores.html"));
});

app.get("/doctors", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "doctors.html"));
});

app.get("/organs", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "organs.html"));
});

app.get("/blood", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "views", "blood.html"));
});

// === API: Book Appointment (with slot limit per time) ===
app.post("/api/book", async (req, res) => {
  const { name, phone, doctor, date, time, department } = req.body;

  // ✔ Added doctor to validation
  if (!name || !phone || !doctor || !date || !time || !department) {
    return res.status(400).json({ success: false, message: "All fields are required!" });
  }

  try {
    // Check how many appointments already booked for that time slot
    const [rows] = await connection
      .promise()
      .query("SELECT COUNT(*) AS count FROM appointments WHERE date = ? AND time = ?", [date, time]);

    const count = rows[0].count;

    if (count >= 3) {
      return res
        .status(400)
        .json({ success: false, message: "❌ This time slot is full! Please choose another." });
    }

    // ✔ Updated insert query to include doctor
    await connection
      .promise()
      .query(
        "INSERT INTO appointments (name, phone, doctor, date, time, department) VALUES (?, ?, ?, ?, ?, ?)",
        [name, phone, doctor, date, time, department]
      );

    res.json({ success: true, message: "✅ Appointment booked successfully!" });
  } catch (err) {
    console.error("❌ Database insert failed:", err);
    res.status(500).json({ success: false, message: "Database insert failed!" });
  }
});

// === API: Cancel Appointment (by phone) ===
app.post("/api/cancel", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ success: false, message: "Phone number required." });
  }

  try {
    const [result] = await connection
      .promise()
      .query("DELETE FROM appointments WHERE phone = ? LIMIT 1", [phone]);

    if (result.affectedRows > 0) {
      res.json({ success: true, message: "🗑️ Appointment cancelled successfully!" });
    } else {
      res.status(404).json({ success: false, message: "No appointment found for that phone number." });
    }
  } catch (err) {
    console.error("❌ Delete failed:", err);
    res.status(500).json({ success: false, message: "Database error occurred." });
  }
});

// === API: Fetch Available Blood ===
app.get("/api/blood/available", async (req, res) => {
  try {
    const [rows] = await connection.promise().query("SELECT * FROM blood_availability");
    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch blood data:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// === API: Donate Blood ===
app.post("/api/blood/donate", async (req, res) => {
  const { name, blood_group, age, contact, location } = req.body;

  if (!name || !blood_group || !contact) {
    return res.status(400).json({ success: false, message: "Please fill all required fields." });
  }

  try {
    await connection
      .promise()
      .query(
        "INSERT INTO blood_donors (name, blood_group, age, contact, location) VALUES (?, ?, ?, ?, ?)",
        [name, blood_group, age || null, contact, location || null]
      );

    res.json({ success: true, message: "🩸 Thank you for donating blood!" });
  } catch (err) {
    console.error("❌ Failed to insert donor:", err);
    res.status(500).json({ success: false, message: "Database error" });
  }
});

// === API: Fetch Available Organs ===
app.get("/api/organs/available", async (req, res) => {
  try {
    const [rows] = await connection.promise().query("SELECT * FROM organ_availability");
    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch organ data:", err);
    res.status(500).json({ message: "Database error" });
  }
});

// === API: Fetch Doctors ===
app.get("/api/doctors", async (req, res) => {
  try {
    const [rows] = await connection.promise().query("SELECT * FROM doctors");
    res.json(rows);
  } catch (err) {
    console.error("❌ Failed to fetch doctors:", err);
    res.status(500).json({ message: "Database error" });
  }
});


// === 404 Fallback ===
app.use((req, res) => {
  res.status(404).send("Page not found");
});

// === Start Server ===
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log("🟢 Waiting for MySQL connection...");
  connection.connect((err) => {
    if (err) {
      console.error("❌ MySQL connection failed:", err);
    } else {
      console.log("✅ MySQL Connected...");
    }
  });
});
