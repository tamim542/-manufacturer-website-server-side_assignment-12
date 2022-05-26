const express=require('express')
const app= express()
require('dotenv').config()
var cors=require('cors')
const jwt = require('jsonwebtoken');
const ObjectId = require("mongodb").ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');



app.use(cors())
app.use(express.json())
require('dotenv').config()

const port =process.env.PORT || 5000


app.get('/',(req,res)=>{
    res.send('successfully run');
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.4veww.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
      await client.connect();
      const manufactureCollection = client.db("assignment12").collection("manufacture");
     
      const  orderCollection=client.db('assignment12').collection('order');
      const  reviewCollection=client.db('assignment12').collection('review');
      const  userInfoCollection=client.db('assignment12').collection('information');
      const  userCollection=client.db('assignment12').collection('user');



         // AUTH------------------------------------
         app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '1d'
            });
            res.send({ accessToken });
        })


        //---------------------------------------------


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

     app.get('/myorder', async (req, res) => {
        
        const email = req.query.email;
      
            const query = {email:email};
            const cursor = orderCollection.find(query);
            const items = await cursor.toArray();
            res.send(items);

         
        
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

        const email = req.query.email;
        const user=req.body;
        const filter = {email:email};
        const options = { upsert: true };
        const updateDoc = {
            $set:user,
        }
        const result = await userCollection.updateOne(filter, updateDoc, options);
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
        res.send({ result, token });
     })



      
    } finally {
      
    }
  }
  run()












app.listen(port,()=>{

    console.log('run port ${port}')
    
    console.log(`run port ${port}`)
})