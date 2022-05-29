const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
//coonecting with mongo db

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.43sj9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const toolCollection = client.db("toolex").collection("tools");
    app.get("/tools", async (req, res) => {
      const query = {};
      const cursor = toolCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
    ///
  }
}
run().catch(console.dir);
//
app.get("/", (req, res) => {
  res.send("Running Successfully");
});
app.listen(port, () => {
  console.log("Server is running on", port);
});
