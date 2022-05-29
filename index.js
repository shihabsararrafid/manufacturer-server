const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { ObjectID } = require("bson");
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
    // api for loading all data
    app.get("/tools", async (req, res) => {
      const query = {};
      const cursor = toolCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // api to load single data based on id
    app.get("/purchase/:id", async (req, res) => {
      const itemId = req.params.id;
      const query = { _id: ObjectId(itemId) };

      const result = await toolCollection.findOne(query);
      //console.log(itemId);
      res.send(result);
    });
    // api to add a order to a specific user

    app.put("/purchase/:id", async (req, res) => {
      const itemId = req.params.id;
      const userEmail = req.query.email;
      const quantity = req.query.quantity;

      const filter = { _id: ObjectId(itemId) };

      const options = { upsert: true };

      let distinctValues = [];
      distinctValues = await toolCollection.distinct("email", filter);
      let newEmail = [...distinctValues];
      if (distinctValues.indexOf(userEmail) === -1) {
        newEmail = [...distinctValues, userEmail];
      }
      const updateDoc = {
        $set: {
          email: newEmail,
        },
      };
      const result = await toolCollection.updateOne(filter, updateDoc, options);
      res.send(newEmail);
      console.log(itemId, userEmail);
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
