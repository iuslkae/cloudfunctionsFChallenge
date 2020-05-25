const functions = require("firebase-functions")
import * as express from "express";
const cors = require("cors");
import * as admin from "firebase-admin";

var serviceAccount = require("./crudrestapi-firebase-adminsdk-bbacq-e5e228e101.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://crudrestapi.firebaseio.com"
});

/* Express */
const app1: express.Application = express();
app1.use(cors({origin:true}))
const db: FirebaseFirestore.Firestore  = admin.firestore();

interface Customer {
  id?: number,
  firstName: string,
  lastName: string,
  email: string,
  price: number
}
app1.post("/api/create", (req,res)=>{
  (async () => {
    try{
      await db.collection("customers").doc(`/${req.body.id}/`)
      .create(<Customer>{
        id: req.body.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        price: req.body.price
      })
      return res.status(200).send();
    }
    catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })().then(x=>console.log(x),x=>console.log(x));
})
app1.get("/api/read/:id", (req,res)=>{
  (async () => {
    try{
      const document: FirebaseFirestore.DocumentData = db.collection("customers").doc(req.params.id);
      let customer = await document.get();
      let response = customer.data();
      return res.status(200).send(response);

    }
    catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })().then(x=>console.log(x),x=>console.log(x));
})
/**
 * Read All
 */
app1.get("/api/read", (req,res)=>{
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 100;
  const startIndex = (page-1)*limit;
  const endIndex = page*limit;

  (async () => {
    try{
      let query = db.collection("customers");
      let response: Array<Customer> = [];
      await query.orderBy("id").startAt(startIndex).endBefore(endIndex).get().then(querySnapshot=>{
        console.log(querySnapshot);
        let docs = querySnapshot.docs;
        for (let doc of docs){
          const selectedItem: Customer = {
            id: doc.data().id,
            firstName: doc.data().firstName,
            lastName: doc.data().lastName,
            email: doc.data().email,
            price: doc.data().price
          };
          response.push(selectedItem);
        }
        return response;//docs
      })
      return res.status(200).send(response);
    }
    catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })().then(x=>console.log(x),x=>console.log(x));
})

app1.put("/api/update/:id", (req,res)=>{
  (async () => {
    try{
      const document = db.collection("customers").doc(req.params.id);
      await document.update(<Customer>{
        // id: req.body.id,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        price: req.body.price
      })
      return res.status(200).send();
    }
    catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })().then(x=>console.log(x),x=>console.log(x));
})
app1.delete("/api/delete/:id", (req,res)=>{
  (async () => {
    try{
      const document = db.collection("customers").doc(req.params.id);
      await document.delete();
      return res.status(200).send();
    }
    catch (error) {
      console.log(error);
      return res.status(500).send(error);
    }
  })().then(x=>console.log(x),x=>console.log(x));
})

export const v1 = functions.https.onRequest(app1);
