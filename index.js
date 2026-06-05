const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const express = require("express");
const app = express();

const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

app.use(
  cors({
    origin: [
      process.env.CLIENT_URL || "http://localhost:3000",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
  }),
);

app.use(express.json());

const port = process.env.PORT || 5000;
const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(
  /\/$/,
  "",
);

const uri = process.env.MONGO_DB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await client.connect();

    const db = client.db("jobprotal");
    const jobs = db.collection("jobs");
    const jobSeekers = db.collection("jobSeekers");

    app.get("/jobs", async (req, res) => {
      const data = jobs.find();
      const result = await data.toArray();
      res.send(result);
    });

    app.get("/jobs/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobs.findOne(query);
      res.send(result);
    });

    app.post("/job-seeker", async (req, res) => {
      const jobSeekerData = req.body;
      const result = await jobSeekers.insertOne(jobSeekerData);
      res.send(result);
    });

    app.get("/job-seeker-data", async (req, res) => {
      const data = jobSeekers.find();
      const result = await data.toArray();
      res.send(result);
    });

    // company json data

    app.get("/company", async (req, res) => {
      const result = await jobs
        .find(
          {},
          {
            projection: {
              name: 1,
              logo: 1,
            },
          },
        )
        .toArray();
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!",
    );
  } catch (error) {
    console.log(`Error now ${error}`);
  }
};

run();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const isValidHttpUrl = (value) => {
  if (typeof value !== "string" || !value.trim()) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const normalizePrice = (value) => {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;

  return Number(value.replace(/[$,\s]/g, ""));
};

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
