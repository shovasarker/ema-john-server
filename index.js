const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const express = require('express')
const cors = require('cors')
const { parse } = require('dotenv')
require('dotenv').config()

const app = express()
const port = process.env.PORT || 5000

app.use(cors())
app.use(express.json())

app.get('/', (req, res) => {
  res.send('Ema-John Server Initialized')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7lr6s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})

const run = async () => {
  try {
    await client.connect()

    const productsCollection = client.db('emaDb').collection('products')

    app.get('/products', async (req, res) => {
      const page = parseInt(req.query?.page)
      const perPage = parseInt(req.query?.perPage)

      const query = {}
      const cursor = productsCollection.find(query)
      let products
      if (page || perPage) {
        products = await cursor
          .skip((page - 1) * perPage)
          .limit(perPage)
          .toArray()
      } else {
        products = await cursor.toArray()
      }

      res.send({ products, page: page })
    })

    app.get('/productsCount', async (req, res) => {
      const count = await productsCollection.estimatedDocumentCount()
      res.send({ length: count })
    })

    // use Post to get products by id
    app.post('/productByKeys', async (req, res) => {
      const keys = req.body
      const ids = keys.map((key) => ObjectId(key))
      const query = { _id: { $in: ids } }
      const cursor = productsCollection.find(query)
      const products = await cursor.toArray()
      res.send(products)
    })
  } finally {
  }
}

run().catch(console.dir)

app.listen(port, () => console.log('Ema-John Server Running'))
