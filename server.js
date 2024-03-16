require("dotenv").config();

const express = require("express");
const { firestore } = require("firebase-admin");

const app = express();
app.use(express.json());

// Firebase connection wit express js
var { initializeApp } = require("firebase-admin/app");
const { applicationDefault } = require("firebase-admin/app");

const {
  getFirestore,
  collection,
  getDocs,
  Filter,
} = require("firebase-admin/firestore");

const firebaseApp = initializeApp({
  credential: applicationDefault(),
  databaseURL: "https://tenant-a8edb-default-rtdb.firebaseio.com",
});

//payment RazorPay
const RazorPay = require("razorpay");
var instance = new RazorPay({
  key_id: "rzp_test_Zc7uOMWhZdmTmK",
  key_secret: "Zk2sOIlwzOtsv4ttYFPwOgEp",
});

app.set("view engine", "ejs");

// Payment

app.post("/payment", async (req, res) => {
  try {
    let pay = await instance.paymentLink.create({
      amount: 500,
      currency: "INR",
      accept_partial: true,
      first_min_partial_amount: 100,
      expire_by: Date.now() + 50000,
      reference_id: "TS19891234567",
      description: "For XYZ purpose",
      customer: {
        name: "Anuj JI",
        email: "anuj.ji@example.com",
        contact: "+919826830071",
      },
      notify: {
        sms: true,
        email: true,
      },
      reminder_enable: true,
      notes: {
        policy_name: "Jeevan Bima",
      },
      callback_url: "https://example-callback-url.com/",
      callback_method: "get",
    });

    res.json({ pay });
  } catch (err) {
    console.log(err);
  }
});

// get all rooms
app.get("/rooms", async (req, res) => {
  const db = getFirestore(firebaseApp);
  console.log("all Rooms");
  let documentRef = db.collection("Rooms");

  const collectionRef = await documentRef.get();
  const docs = collectionRef.docs.map((doc) => doc.data());

  return res.json({ docs });
});

//Path param
app.get("/:id", async (req, res) => {
  const db = getFirestore(firebaseApp);

  console.log(await db.collection("Rooms").doc("0rRDvGScXvwNu9YCNJy2").get());

  res.send(`get method ${req.params.id}`);
});

//Query
app.get("/", function (req, res) {
  console.log("Query valaa");
  const db = getFirestore(firebaseApp);
  let query = db.collection("Rooms");

  query
    .where(Filter.where("roomNo", "==", "25"))
    .get()
    .then((querySnapshot) => {
      querySnapshot.forEach((documentSnapshot) => {
        console.log(`Found document at: ${documentSnapshot.ref.path}`);
      });
    });

  res.send("name: " + req.query.name);
});

//Post
app.post("/data", async (req, res) => {
  const db = getFirestore(firebaseApp);
  let collectionRef = db.collection("Rooms");
  const data = {
    address: req.body.address,
    rent: req.body.rent,
    roomNo: req.body.roomNo,
    roomSize: req.body.roomSize,
    unit: req.body.unit,
    window: req.body.window,
  };
  const docRef = await collectionRef.add(data);
  //console.log(req.body);
  res.send({ id: docRef.id });
});

app.listen(3000);
