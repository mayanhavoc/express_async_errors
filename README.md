# Async error handling in express
> For errors returned from asynchronous functions invoked by route handlers and middleware, you must pass them to the `next()` function, where Express will catch and process them. For example:
```Javascript
app.get('/', function (req, res, next){
    fs.readFile('/file-does-not-exist', function (err, data) {
        if (err) {
            next(err) // Pass errors to Express.
        } else {
            res.send(data)
        }
    })
})
```
## Mongoose errors

Validation errors

Cast-object errors

## Mongoose middleware
Middleware in mongoose are functions that we can tell mongoose to run before certain commands (such as CRUD commands) or for specific queries (before/after the query).

Middleware in mongoose can be a bit confusing because the name of the middleware does not necessarily match the name of the model method. For example, the middleware `findOneAndDelete` does **NOT** exist in the mongoose model. However, we can look at the mongoose model method, for example `findByIdAndDelete` and refer to the documentation and it will reference the appropriate middleware to use, in this case `findOneAndDelete`. 
![Mongoose middleware](/mongoose%20middleware.png)
[Source: Mongoose docs](https://mongoosejs.com/docs/api.html#model_Model.findByIdAndDelete)

## Types of middleware
Mongoose has 4 types of middleware: 
1. Document middleware - In document middleware functions, `this` refers to the **document**.
2. Model middleware
3. Aggregate middleware
4. Query middleware - In query middleware functions, `this` refers to the **query**.
[Source: Mongoose docs](https://mongoosejs.com/docs/middleware.html#types-of-middleware)

Basically when we set up a middleware, and it's a query middleware (which `findOneAndDelete` is, it's not a choice, you need to refer to the documentation to figure out which type of middleware you are using), we need to wait until **after** our query has completed, so that we have access to the **document** that was found.

Mongoose middleware are **ENTIRELY DISTINCT** from Express middleware. 

### Pre  and post mongoose middleware
> Pre middleware functions are executed one after another, when each middleware calls `next`. 
```Javascript
const schema = new Schema(..);
schema.pre('save', function(next) {
  // do stuff
  next();
});
```
> In mongoose 5.x, instead of calling next() manually, you can use a function that returns a promise. In particular, you can use async/await.
```Javascript
schema.pre('save', function() {
  return doStuff().
    then(() => doMoreStuff());
});

// Or, in Node.js >= 7.6.0:
schema.pre('save', async function() {
  await doStuff();
  await doMoreStuff();
});
```

[Source: Mongoose docs](https://mongoosejs.com/docs/middleware.html#types-of-middleware)


*In our example...*

```Javascript
farmSchema.pre('findOneAndDelete', async function(data){
    console.log('pre middleware')
    console.log(data);
});

farmSchema.post('findOneAndDelete', async function (data) {
    console.log('Post middleware');
    console.log(data);
});

const Farm = mongoose.model('Farm', farmSchema);
module.exports = Farm;
```

```Javascript
pre middleware
[Function (anonymous)]
Post middleware
{
  products: [],
  _id: 6112fe023f3df792b5f72351,
  name: 'Test farm',
  city: 'Test',
  email: 'Test@test.com',
  __v: 0
}
```

Our pre middleware ran, but the data that was passed in was not real data, it was a function, we do not have access to the farm that was deleted. 
In the post, however, we do have access to that data. 

This is how we can use mongoose middleware to delete all id's (i.e. products, comments) associated with a parent element, in our case, the farm. If we delete our farm, we can now also delete all the products belonging to that farm.  

All we have to do now is take all of the ids in the products array and delete each of them in the post middleware. 

```Javascript
farmSchema.post('findOneAndDelete', async function (farm) {
    if (farm.products.length){
        const res = await Product.deleteMany({_id: {$in: farm.products}})
        console.log(res);
    }
});
```

`if (farm.products.length)` checks that the array of products is **NOT** empty. 
We want to take each one of those products and delete them. 
In order to do this, we need the Product model: `const Product = require('./product)` and we call the `deleteMany()`.
Now, we are looking at an array that will look like this: 
`products: [148c0b9b41u30, 4cb12ad9n0a]`
In order to delete all products in the products array, we can use a **Mongo** operator called `in`.  

