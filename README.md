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

