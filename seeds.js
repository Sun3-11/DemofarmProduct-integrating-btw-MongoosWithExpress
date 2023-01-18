const mongoose = require('mongoose');
const Product = require('./models/product');

mongoose.set('strictQuery', true); 
mongoose.connect('mongodb://localhost:27017/farmsStand', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> {
    console.log("MONGO CONNECTION OPEN!!!")
})
.catch(err => {
    console.log("OH NO MONGO ERROR!!!")
    console.log(err)
})


// const p = new Product({
//     name: 'Noor Grapefruit',
//     price: 1.99,
//     category:'fruit',
// })

// p.save().then(p => {
//     console.log(p)
// })
//     .catch(e => {
//         console.log(e)
//     })

const seedProducts = [
    {
        name: 'Noor Grapefruit',
        price : 1.99,
        category: 'fruit',

    },
    {
        name: 'Sun Goddess Melon',
        price: 4.99,
        category: 'fruit',
    },
    {
        name: 'Sun Eggplant',
        price: 3.99,
        category: 'vegetable',
    },
    {
        name: 'Sun Celery',
        price: 1.59,
        category: 'vegetable',
    },
    {
        name: 'Chocolate Whole Milk',
        price: 2.69,
        category: 'dairy',
    },
]

Product.insertMany(seedProducts)
   .then(res => {
        console.log(res)
   })
   .catch(e => {
         console.log(e)
   })