const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const AppError = require('./AppError');

const Product = require('./models/product');
const Farm = require('./models/farm')

mongoose.set('strictQuery', true); 
mongoose.connect('mongodb://localhost:27017/farmsStand', {useNewUrlParser: true, useUnifiedTopology: true})
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



// func Async-Error
function wrapAsync(fn) {
    return function (req, res, next) {
        fn(req, res, next).catch(e => next(e))
    }
}


// FARM  ROUTES 
app.get('/farms', wrapAsync(async(req, res, next) => {
    const farms = await Farm.find({});
    res.render('farms/index', {farms});
}));

app.get('/farms/new', (req, res) =>{
    res.render('farms/new');
});

app.get('/farms/:id', wrapAsync(async (req, res, next) => {
    const farm = await Farm.findById(req.params.id).populate('products');
    if (!farm) {
        throw new AppError('Product Not Found', 404);
    }
   // console.log(farm)
    res.render('farms/show', {farm})
}))

//Delete

app.delete('/farms/:id', async (req, res) => {
    const farm = await Farm.findByIdAndDelete(req.params.id);

    res.redirect('/farms');
})


app.post('/farms', wrapAsync( async (req, res, next) => {
    // res.send(req.body)
    const farm = new Farm(req.body);
    await farm.save();

    res.redirect('/farms');
}));




// ROUTES PRODUCTS FOR A FARM 
app.get('/farms/:id/products/new', async (req, res) =>{ 
    const {id} = req.params;
    const farm = await Farm.findById(id);

    res.render('products/new', { categories, farm })
})

app.post('/farms/:id/products', wrapAsync( async(req, res, next) => {
    const {id} = req.params;
    const farm = await Farm.findById(id);
    const { name, price, category } = req.body;
    const product = new Product({ name, price, category});
    farm.products.push(product)
    product.farm = farm;
    await farm.save();
    await product.save();
    // res.send(farm)
    // res.send(req.body)
    res.redirect(`/farms/${id}`)
}))




//PRODUCTS ROUTSE
const categories = ['fruit', 'vegetable', 'dairy'];

app.get('/products', wrapAsync( async (req, res, next) => {
    
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
    
    
}))

app.get('/products/new', (req, res) => {
    res.render('products/new', {categories})
})

app.post('/products', wrapAsync( async (req, res, next) => {
    // console.log(req.body)
  const newProduct = new Product(req.body);
  await newProduct.save();
//   console.log(newProduct)
//     res.send('making your product!')
  res.redirect(`/products/${newProduct._id}`)

}))

app.get('/products/:id', wrapAsync( async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('farm', 'name');
    // console.log(product);
    // res.send('details page!')
    if (!product) {
        throw new AppError('Product Not Found', 404);
    }
    res.render('products/show', { product })
}))

app.get('/products/:id/edit', wrapAsync( async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id)   
    if (!product) {
        throw new AppError('Product Not Found', 404);
    } 
    res.render('products/edit', { product, categories })
}))

app.put('/products/:id', wrapAsync( async (req, res, next) => {
   const { id } = req.params;
   const product = await  Product.findByIdAndUpdate(id, req.body, {runValidators: true, new: true});
   
    // console.log(req.body);
    // res.send('PUT!!!!!!!!!!!');
   res.redirect(`/products/${product._id}`)
}))

app.delete('/products/:id',wrapAsync( async (req, res, next) => {
    // res.send(' MADE IT !!!')
    const { id } = req.params;
    const deleteProduct = await Product.findByIdAndDelete(id)
    res.redirect('/products');
}))


const handleValidationErr = err => {
    console.dir(err);
    
    return new AppError(`Validation Failed...${err.message}`, 400)
}

app.use((err, req, res, next) => {
    console.log(err.name);
    // single out particular types of Mongoose Errors:
    if (err.name === 'ValidationError') err = handleValidationErr(err)
    next(err);
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'Something  wrong' } = err;
    res.status(status).send(message);
})


app.listen(3000, () => {
    console.log("APP IS LISTENING ON PORT 3000!")
})

