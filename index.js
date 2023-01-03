const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');


const Product = require('./models/product');

mongoose.set('strictQuery', true); 
mongoose.connect('mongodb://localhost:27017/farmStand', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> {
    console.log("MONGO CONNECTION OPEN!!!")
})
.catch(err => {
    console.log("OH NO MONGO ERROR!!!")
    console.log(err)
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method')) 

const categories = ['fruit', 'vegetable', 'dairy'];

app.get('/products', async (req, res) => {
    
    // console.log(products)
    // res.send('All products will be here!');
    const { category } = req.query;
    if(category){
        const products = await Product.find({ category })
        res.render('products/index', { products, category })
    } else {
        const products = await Product.find({})
        res.render('products/index', { products, category: 'All' })    
    }
    
    
})

app.get('/products/new', (req, res) => {
    res.render('products/new', {categories})
})

app.post('/products', async (req, res) => {
    // console.log(req.body)
  const newProduct = new Product(req.body);
  await newProduct.save();
//   console.log(newProduct)
//     res.send('making your product!')
  res.redirect(`/products/${newProduct._id}`)

})

app.get('/products/:id', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)
    // console.log(product);
    // res.send('details page!')
    res.render('products/show', { product })
})

app.get('/products/:id/edit', async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id)    
    res.render('products/edit', { product, categories })
})

app.put('/products/:id', async (req, res) => {
   const { id } = req.params;
   const product = await  Product.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});
   
    // console.log(req.body);
    // res.send('PUT!!!!!!!!!!!');
   res.redirect(`/products/${product._id}`)
})

app.delete('/products/:id', async (req, res) => {
    // res.send('YOU MADE IT !!!')
    const { id } = req.params;
    const deleteProduct = await Product.findByIdAndDelete(id)
    res.redirect('/products');
})

app.listen(3000, () => {
    console.log("APP IS LISTIONING ON PORT 3000!")
})

