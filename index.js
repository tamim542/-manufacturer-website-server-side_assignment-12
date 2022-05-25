const express=require('express')
const app= express()
require('dotenv').config()
var cors=require('cors')
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


      
    } finally {
      
    }
  }
  run()












app.listen(port,()=>{

    console.log('run port ${port}')
    
    console.log(`run port ${port}`)
})