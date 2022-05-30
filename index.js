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
      const price = req.query.price;
      const img = req.query.img;
      const name = req.query.name;

      const filter = { _id: ObjectId(itemId) };

      const options = { upsert: true };

      let distinctValues = [];
      let newQuantities = [];
      distinctValues = await toolCollection.distinct("email", filter);
      newQuantities = await toolCollection.distinct("orderedquantity", filter);
      const userQuantity = client.db("toolex").collection(`${userEmail}`);
      const newDoc = {
        _id: ObjectId(itemId),
        quantity: quantity,
        price: price,
        img: img,
        name: name,
      };
      const newerDoc = {
        $set: {
          quantity: quantity,
        },
      };
      // const newresult = await userQuantity.insertOne(newDoc);
      const findresult = await userQuantity.findOne(filter);
      if (findresult?.quantity) {
        const newresult = await userQuantity.updateOne(
          filter,
          newerDoc,
          options
        );
      } else {
        const newresult = await userQuantity.insertOne(newDoc);
      }
      //api to update quantity
      app.put("/tools", async (req, res) => {
        const quantity1 = req.query.quantity;
        const itemId = req.query.id;
        const availQuan = req.query.available;
        const newquantity = parseInt(availQuan) - parseInt(quantity1);
        const query = { _id: ObjectId(itemId) };
        const options = { upsert: true };
        const updateDoc = {
          $set: {
            quantity: newquantity,
          },
        };
        //console.log(quantity, availQuan, newquan);
        const result = await userQuantity.updateOne(query, updateDoc, options);
        res.send(result);
        console.log(result);
      });
      //console.log(findresult);
      let newEmail = [...distinctValues];
      let newerQuantity = userEmail + quantity;
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
    //api to load review data
    app.get("/review", async (req, res) => {
      const reviewCollection = client.db("toolex").collection("review");
      const query = {};
      const cursor = reviewCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    const userCollection = client.db("toolex").collection("users");
    //api for getting all users
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = userCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get("/users/addadmin", async (req, res) => {
      const userEmail = req.query.email;
      const query = { email: userEmail };
      const result = await userCollection.findOne(query);
      // const result = await cursor.toArray();
      const isadmin = result.role === "admin";
      res.send({ admin: isadmin });
      console.log(isadmin);
    });
    // api to add a user as admin
    app.put("/users/addadmin", async (req, res) => {
      const userEmail = req.query.email;
      console.log(userEmail);
      const requester = req.query.requster;
      console.log(requester);
      const resultnew = await userCollection.findOne({ email: requester });
      if (resultnew?.role) {
        const query = { email: userEmail };
        const optoins = { upsert: true };
        const updateDoc = {
          $set: {
            role: "admin",
          },
        };
        const result = await userCollection.updateOne(
          query,
          updateDoc,
          optoins
        );
      }

      //console.log(result);
    });
    //api for posting all users
    app.put("/users", async (req, res) => {
      const userEmail = req.query.email;
      const filter = { email: userEmail };
      const findresult = await userCollection.findOne(filter);
      const doc = {
        email: userEmail,
      };
      console.log(findresult?.email === userEmail);
      if (findresult?.email) {
        const options = { upsert: true };
        const updatedDoc = {
          $set: {
            email: userEmail,
          },
        };
        const result = await userCollection.updateOne(
          filter,
          updatedDoc,
          options
        );
      } else {
        const result = await userCollection.insertOne(doc);
      }

      console.log(findresult);
    });
    //api for putting review data
    app.post("/review", async (req, res) => {
      const reviewCollection = client.db("toolex").collection("review");
      const newReview = req.body.review;
      const userMail = req.query.email;
      const img = req.query.img;
      const name = req.query.name;
      const startingIndex = req.query.start;
      const doc = {
        review: newReview,
        email: userMail,
        img: img,
        name: name,
        start: startingIndex,
      };
      const result = await reviewCollection.insertOne(doc);
      res.send(result);
      console.log(result);
    });

    // api to load orders according to user
    app.get("/myorders", async (req, res) => {
      const userEmail = req.query.email;
      const userQuantity = client.db("toolex").collection(`${userEmail}`);
      const query = {};
      const cursor = userQuantity.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    // api to delete items from my item
    app.delete("/myorders", async (req, res) => {
      const itemid = req.query.id;
      const userEmail = req.query.email;
      const query = { _id: ObjectId(itemid) };
      const userQuantity = client.db("toolex").collection(`${userEmail}`);
      const result = await userQuantity.deleteOne(query);
      res.send(result);
      console.log(result);
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
