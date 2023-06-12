const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
require("dotenv").config();

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

// MongoDB part

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2jzgz56.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // Database collections
    const studentCollection = client.db("summerFun").collection("students");
    const classCollection = client.db("summerFun").collection("classes");

    // Student related API
    // Posting student data to server
    app.post("/students", async (req, res) => {
      const student = req.body;
      console.log(student, "Google");
      const query = { email: student.email };
      const existingUser = await studentCollection.findOne(query);
      if (existingUser) {
        res.send({ message: "User already exists." });
      } else {
        const result = await studentCollection.insertOne(student);
        res.send(result);
      }
    });

    // Get student data from server
    app.get("/students", async (req, res) => {
      const result = await studentCollection.find().toArray();
      res.send(result);
    });

    // Get instructor from server
    app.get("/students/instructor", async (req, res) => {
      const query = { role: "instructor" };
      const result = await studentCollection.find(query).toArray();
      res.send(result);
    });

    // Get specific admin for admin role (for useAdmin hook)
    app.get("/students/admin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await studentCollection.findOne(query);
      res.send(result);
    });

    // Get specific instructor for admin role (for useInstructor hook)
    app.get("/students/instructor/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await studentCollection.findOne(query);
      res.send(result);
    });

    // Class related api
    // Posting class data to the server
    app.post("/classes", async (req, res) => {
      const newClass = req.body;
      const result = await classCollection.insertOne(newClass);
      res.send(result);
    });

    // get class data from server
    app.get("/classes", async (req, res) => {
      const result = await classCollection.find().toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running!");
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
