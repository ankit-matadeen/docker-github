const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/users", (req, res) => {
  res.json([{ name: "Ankit", age: 22 }]);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
