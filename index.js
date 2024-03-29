const express=require('express')
const app= express()
require('dotenv').config()
var cors=require('cors')
const jwt = require('jsonwebtoken');
const ObjectId = require("mongodb").ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');

//-------------payment stripe------------------
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


///////////////////nodemailer and mailgun

//const nodemailer = require('nodemailer');

//const mg = require("nodemailer-mailgun-transport");

app.use(cors())
app.use(express.json())
require('dotenv').config()

const port =process.env.PORT || 5000


app.get('/',(req,res)=>{
    res.send('successfully run');
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4veww.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




    //---------------jwt function---------------
    function verifyJWT(req, res, next) {
        const authHeader = req.headers.authorization;
       
        if (!authHeader) {
          return res.status(401).send({ message: 'UnAuthorized access' });
        }
        const token = authHeader.split(' ')[1];
       // console.log(token);
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        
            if (err) {
             // console.log(err);
            return res.status(403).send({ message: 'Forbidden access' })
          }
          req.decoded = decoded;
         
          next();
        });
      }







async function run() {
    try {
      await client.connect();
      const manufactureCollection = client.db("assignment12").collection("manufacture");
     
      const  orderCollection=client.db('assignment12').collection('order');
      const  reviewCollection=client.db('assignment12').collection('review');
      const  userInfoCollection=client.db('assignment12').collection('information');
      const  userCollection=client.db('assignment12').collection('user');
      const paymentCollection = client.db('doctors_portal').collection('payments');



       
      //api all products    
      app.get('/manufacture', async(req,res)=>{
        const query={}
        const manufacture=manufactureCollection.find(query)
        const result= await manufacture.toArray();
        res.send(result);
    })


    //---------purchase/:id-----------

    app.get('/product/:id', async (req, res) => {
        const id = req.params.id;
        
        const query = { _id: ObjectId(id) };
        const result = await manufactureCollection.findOne(query);
        res.send(result);

    });


    //----------------order insert item--------------------

        
    app.post('/order', async(req,res)=>{
        const newItem=req.body;
        const result = await orderCollection.insertOne(newItem);
        res.send(result);
      })


    //----------------review insert item--------------------

        
    app.post('/review', async(req,res)=>{
        const newItem=req.body;
        const result = await reviewCollection.insertOne(newItem);
        res.send(result);
      })


       //api all review   
       app.get('/review', async(req,res)=>{
        const query={}
        const manufacture=reviewCollection.find(query)
        const result= await manufacture.toArray();
        res.send(result);
    })


     // my order Collection API----------

     app.get('/myorder', verifyJWT, async (req, res) => {
        
        const email = req.query.email;
        const decodedEmail = req.decoded.email;
      //  console.log('email=',email,'decodedEmail=',decodedEmail,'req.decodedEmai=',req.decodedEmail);
          
            if (email === decodedEmail) {
                const query = {email:email};
                const cursor =await orderCollection.find(query).toArray();
              //  const items = await cursor.toArray();
                return res.send(cursor);
               
            }
            else {
              return res.status(403).send({ message: 'forbidden access' });
            }
        
    })


     //------------- Delete order from myorder---------------
     app.delete('/myorders/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await orderCollection.deleteOne(query);
        res.send(result);
    });
        


    //----------------my profile user info add--------------------

        
    app.post('/userinfo', async(req,res)=>{
        const newItem=req.body;
        const result = await userInfoCollection.insertOne(newItem);
        res.send(result);
      })



       // my profile info Collection API-----------

       app.get('/myprofileinfo', async (req, res) => {
        
        const email = req.query.email;
      
            const query = {email:email};
            const cursor = userInfoCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);

         
        
    })


    // update user information
    app.put('/updateuserinfo/:id', async(req, res) =>{
        const id = req.params.id;
        const updatedUser = req.body;
        const filter = {_id: ObjectId(id)};
        const options = { upsert: true };
        const updatedDoc = {
            $set: {
                email: updatedUser.email,
                name: updatedUser.name,
                address: updatedUser.address,
                phoneno: updatedUser.phoneno,
                profilelink: updatedUser.profilelink
            }
        };
        const result = await userInfoCollection.updateOne(filter, updatedDoc, options);
        res.send(result);

    })


     ///------------count toatal product--------------

     app.get('/productsCount', async(req,res)=>{
        

        const count = await manufactureCollection.estimatedDocumentCount();
        res.send({count});
     })


     //--------------new user create --------------

     app.put('/user/:email',async(req,res)=>{
        

        const email = req.params.email;
       // console.log('user/',email);
        const user=req.body;
       // console.log(user);
        const filter = {email:email};
        const options = { upsert: true };
        const updateDoc = {
            $set:user,
        }
        const result = await userCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        res.send({ result, token });
     })


     //api add  products by admin   
     app.post('/manufacture', async(req,res)=>{
        const newItem=req.body;
        const result = await manufactureCollection.insertOne(newItem);
        res.send(result);
    })

     //api all orders colllect for admin   
     app.get('/allorders', async(req,res)=>{
        const query={}
        const orders=orderCollection.find(query)
        const result= await orders.toArray();
        res.send(result);
    })


     //------------- Delete order by admin---------------
     app.delete('/allorder/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await orderCollection.deleteOne(query);
        res.send(result);
    });



     //------------- Delete tools by admin---------------
     app.delete('/deletetools/:id', async(req, res) =>{
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const result = await manufactureCollection.deleteOne(query);
        res.send(result);
    });
        

    // admin route do not visit any user
          
    app.get('/admin/:email', async(req, res) =>{
        const email = req.params.email;
        const user = await userCollection.findOne({email: email});
        const isAdmin = user.role === 'admin';
        res.send({admin: isAdmin})
      })



    //make admin for user and user get
//verifyJWT
    app.get('/user', verifyJWT, async (req, res) => {
        const users = await userCollection.find().toArray();
        res.send(users);
      });


        //make admin delete admin
//verifyJWT
        app.put('/adminuser/admin/:email', verifyJWT, async (req, res) => {
            const email = req.params.email;
            const requester = req.decoded.email;
            const requesterAccount = await userCollection.findOne({ email: requester });
            if (requesterAccount.role === 'admin'){

                const filter = { email: email };
                const updateDoc = {
                  $set: { role: 'admin' },
                };

                const result = await userCollection.updateOne(filter, updateDoc);
                res.send(result);

            }else{
                res.status(403).send({message: 'forbidden'});
              }
             
            
            
      
          })


          //payment method get order by id----------

          app.get('/productorder/:id', verifyJWT, async(req, res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const booking = await orderCollection.findOne(query);
            res.send(booking);
          })
      


          //payment method----------------------------

          app.post('/create-payment-intent', verifyJWT, async(req, res) =>{
            const service = req.body;
          
           if(service.price){
            const price =service.price;
            const amount = price*100;
            const paymentIntent = await stripe.paymentIntents.create({
              amount : amount,
              currency: 'usd',
              payment_method_types:['card']
            });
            res.send({clientSecret: paymentIntent.client_secret})
           }
          });


          //------------------------------order payment-------------------
        //   app.patch('/orderpay/:id', verifyJWT, async(req, res) =>{
        //     const id  = req.params.id;
        //     const payment1 = req.body;
        //     const filter = {_id: ObjectId(id)};
        //     const updatedDoc = {
        //       $set: {
        //         paid: true,
        //         transactionId: payment1.transactionId
        //       }
        //     }
      
        //     const result = await paymentCollection.insertOne(payment1);
        //     const updatedOrder = await orderCollection.updateOne(filter, updatedDoc);
        //     res.send(updatedOrder);
        //   })
      
    } finally {
      
    }
  }
  run()




app.listen(port,()=>{

    console.log('run port ${port}')
    
    console.log(`run port ${port}`)
})