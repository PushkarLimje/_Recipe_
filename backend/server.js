import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import mysql from "mysql2";
import cors from "cors";
console.log("Loaded DB_USER:", process.env.DB_USER);
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// ✅ Test connection
db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to MySQL database");
});

// ✅ API route
app.post("/recipes", (req, res) => {
  //console.log("Incoming request body:", req.body);  // <--- should log ingredients + action

  const { ingredients, action, page = 1, pageSize = 10  } = req.body; // e.g. { ingredients: ["tomato","onion"], action:"all" }

  if (!ingredients || ingredients.length === 0) {
    return res.status(400).json({ error: "No ingredients provided" });
  }

  // Build conditions
  let conditions = "";
  if (action === "all") {
    conditions = ingredients.map(() => "recipeIngredientParts LIKE ?").join(" AND ");
  } else if (action === "any") {
    conditions = ingredients.map(() => "recipeIngredientParts LIKE ?").join(" OR ");
  } else {
    return res.status(400).json({ error: "Invalid action (use 'all' or 'any')" });
  }

  const query = `
    SELECT name, description, recipeIngredientParts, recipeInstructions
    FROM info
    WHERE ${conditions}
    LIMIT ? OFFSET ?
  `;

  // Add wildcards for LIKE
  const values = [
    ...ingredients.map((i) => `%${i.toLowerCase()}%`),
     Number(pageSize),
    (Number(page) - 1) * Number(pageSize),
  ];
  //values.push(Number(pageSize), (page - 1) * pageSize);
    console.log("SQL Query:", query);
    console.log("Values:", values); // 👀 check offset

  db.query(query, values, (err, results) => {
    if (err) {
      console.error("MySQL error:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json(results);
  });
});

// ✅ Start server
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
