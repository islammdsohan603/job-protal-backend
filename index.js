import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();




app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://jobswebsite-sooty.vercel.app",
    ],
    credentials: true,
  })
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
      try {
        const data = jobs.find();
        const result = await data.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send({ error: "Failed to fetch jobs" });
      }
    });

    app.get("/jobs/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await jobs.findOne(query);
        if (!result) {
          return res.status(404).send({ error: "Job not found" });
        }
        res.send(result);
      } catch (error) {
        console.error("Error fetching job:", error);
        res.status(500).send({ error: "Failed to fetch job" });
      }
    });

    app.post("/job-seeker", async (req, res) => {
      try {
        const jobSeekerData = req.body;
        const result = await jobSeekers.insertOne(jobSeekerData);
        res.send(result);
      } catch (error) {
        console.error("Error creating job seeker:", error);
        res.status(500).send({ error: "Failed to create job seeker" });
      }
    });

    app.get("/job-seeker-data", async (req, res) => {
      try {
        const data = jobSeekers.find();
        const result = await data.toArray();
        res.send(result);
      } catch (error) {
        console.error("Error fetching job seekers:", error);
        res.status(500).send({ error: "Failed to fetch job seekers" });
      }
    });

    // company json data
    app.get("/company", async (req, res) => {
      try {
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
      } catch (error) {
        console.error("Error fetching companies:", error);
        res.status(500).send({ error: "Failed to fetch companies" });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "✅ Successfully connected to MongoDB!",
    );
  } catch (error) {
    console.error(`❌ Database connection error: ${error}`);
    process.exit(1);
  }
};

// Initialize database connection before starting server
await run();

app.get("/", (req, res) => {
  res.send("✅ Backend is running!");
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send({ error: "Internal server error" });
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
  console.log(`🚀 Server listening on port ${port}`);
});

export default app;
