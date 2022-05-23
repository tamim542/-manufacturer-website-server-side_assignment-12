const express=require('express')
const app= express()
require('dotenv').config()
var cors=require('cors')

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

      //api all products    
      app.get('/manufacture', async(req,res)=>{
        const query={}
        const manufacture=manufactureCollection.find(query)
        const result= await manufacture.toArray();
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