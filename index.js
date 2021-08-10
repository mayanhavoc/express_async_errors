const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override')


const Product = require('./models/product');
const Farm = require('./models/farm'); 
const categories = ['fruit', 'vegetables', 'dairy'];

mongoose.connect('mongodb://localhost:27017/farmStandTake2', { useNewUrlParser: true, useUnifiedTopology:true})
.then(() => {
    console.log('Mongo connection open.')
})
.catch((err) => {
    console.log('Mongo connection error')
    console.log(err);
})

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


function wrapAsync(fn) {
    return function(req, res, next){
        fn(req, res, next).catch(e => next(e))
    }
}

// FARM ROUTES

app.get('/farms', async (req, res)=> {
    const farms = await Farm.find({});
    res.render('farms/index', { farms });
})

app.get('/farms/new', (req, res) => {
    res.render('farms/new')
});

app.get('/farms/:id', async (req, res) => {
    const farm = await Farm.findById(req.params.id).populate('products');
    res.render('farms/show', { farm });
})

app.post('/farms', async (req, res) => {
    const farm = new Farm(req.body);
    await farm.save();
    res.redirect('/farms');
})

app.get('/farms/:id/products/new', async (req, res) => {
    const { id } = req.params; 
    const farm = await Farm.findById(id);
    res.render('products/new', { farm, categories })
})

app.post('/farms/:id/products', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const farm = await Farm.findById(id);
    const {name, price, category } = req.body;
    const product = new Product({name, price, category});
    farm.products.push(product);
    product.farm = farm;
    await farm.save();
    await product.save();
    res.redirect(`/farms/${id}`);
}))

app.delete('/farms/:id', async (req, res) => {
    const farm = await Farm.findByIdAndDelete(req.params.id);
    res.redirect('/farms');
})


// PRODUCT ROUTES

app.get('/products', async (req, res) => {
    const { category } = req.query;
    if(category) {
        const products = await Product.find({ category })
        res.render('products/index', { products, category })
    } else {
        const products = await Product.find({})
        res.render('products/index', { products, category: 'All' })
    }
})

// app.get('/products/new', (req, res) => {
//     res.render('products/new', { categories })
// })

// app.post('/products',  wrapAsync(async (req, res, next ) => {
//     const newProduct = new Product(req.body);
//     await newProduct.save();
//     res.redirect(`/products/${newProduct._id}`)
// }))


app.get('/products/:id', wrapAsync(async(req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id).populate('farm', 'name');
    res.render('products/details', { product });
}))


app.get('/products/:id/edit', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        return next(new AppError('Product not found', 404));
    }
    res.render('products/edit', { product, categories })
}));


app.put('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, { runValidators: true, useFindAndModify: false, new: true })
    if (!product) {
        return next(new AppError('Product not found', 404));
    }
    res.redirect(`/products/${product._id}`)
}))

app.delete('/products/:id', wrapAsync(async (req, res, next) => {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
        return next(new AppError('Product not found', 404));
    }
    res.redirect('/products');  
}))

const handleValidationErr = err => {
    console.dir(err);
    return (new AppError(`Validation failed... ${err.message}`, 400));
}


app.use((err, res, req, next) => {
    console.log(err.name)
    if (err.name === 'ValidationError') err = handleValidationErr(err)
    next(err);
})

app.use((err, req, res, next) => {
    const { status=500, message="Something went wrong" } = err;
    res.status(status).send(message);
})

app.listen(3000, ()=> {
    console.log('Server running on Port 3000')
})