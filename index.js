const { MongoClient, ServerApiVersion } = require("mongodb");

const express = require("express");
const app = express();

const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();
app.use(express.json());

const port = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
