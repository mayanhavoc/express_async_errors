const mongoose = require('mongoose')
const Product = require('./models/product')

mongoose.connect('mongodb://localhost:27017/farmStand2', { useNewUrlParser: true, useUnifiedTopology:true})
.then(() => {
    console.log('Mongo connection open.')
})
.catch((err) => {
    console.log('Mongo connection error')
    console.log(err);
})

// const p = new Product({
//     name: 'Ruby grapefruit',
//     price: 1.99,
//     category: 'fruit'
// })
// p.save().then(p => {
//     console.log(p)
// })
// .catch(e => {
//     console.log(e)
// })
  
const seedProducts = [
      {
          name: 'Fairy eggplant',
          price: 1.00,
          category: 'vegetables'
      },
      {
          name: 'Organic goddess melon',
          price: 4.99,
          category: 'fruit'
      },
      {
          name: 'Organic mini seedless watermelon',
          price: 3.99,
          category: 'fruit'
      },
      {
          name: 'Organic celery',
          price: 1.50,
          category: 'vegetables'
      },
      {
          name: 'Chocolate whole milk',
          price: 2.69,
          category: 'dairy'
      },
]

Product.insertMany(seedProducts)
.then(res => {
    console.log(res)
})
.catch(e => {
    console.log(e)
})