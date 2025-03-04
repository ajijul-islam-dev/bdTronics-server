import { MongoClient, ServerApiVersion } from'mongodb';
import express from 'express';
import cors from 'cors'
import dotenv from 'dotenv'

const app = express();
const PORT = process.env.PORT || 5000;
dotenv.config();
//midlewares
app.use(cors({
  origin : 'http://localhost:5173'
}));
app.use(express.json());


const uri = process.env.MONGO_DB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

//create DB 
const db = client.db('bdTronics');

//collections
const productCollection = db.collection('products');


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    
    //apis
    
    //initial get api 
    app.get('/', async(req,res)=>{
       res.send('bdTronics Server is connected')
    })
    
    //api for getting all products
    app.get('/products',async(req,res)=>{
      const products = await productCollection.find().toArray();
      res.send(products);
    })
    
    //api for getting best sellers products
    app.get('/products/best',async(req,res)=>{
     const bestSellers = await productCollection.aggregate([
      {$match : {stock : {$gt : 0}}},
      {$sort : {rating : -1}},
      {$limit : 10}
     ]).toArray()
      res.send(bestSellers)
    })
    
    //api for getting specific product by id
    app.get('/product/:id',async(req,res)=>{
      const id = Number(req.params.id);
      const product = await productCollection.findOne({id : id });
      res.send(product)
    })
    
    //bulk api for post all data
    app.post('/products/add',async (req,res)=>{
      const data = await req.body;
      res.send(data)
    })
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.listen(PORT,()=>{
  console.log('server is running under PORT ',PORT)
})