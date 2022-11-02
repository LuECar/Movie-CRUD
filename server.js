const express = require('express') //Lets us use express
const app = express() //Allows us to create a session on top without creating a new session

// What is the difference between these two?
// app.get(/* */) -> we need to work on the same "instance" of the object and build on top of it 
// Instance => session / initialized version of the object. 
// express().get(/* */)  -> if we call express() everytime we will be creating a new object we dont want that !== instance object 

const bodyParser = require('body-parser') //Helps you to be able to use or read the requsest.body

const methodOverride = require('method-override') //We use this for the Delete
/*when using req.body, you must fully parse the request body
//       before you call methodOverride() in your middleware stack,
//       otherwise req.body will not be populated. */

const fetch = require('node-fetch') // lets us use fetch on the server side (using version @2)
const { ObjectId } = require('mongodb')
// npm install node-fetch@2 => how to install

const PORT = process.env.PORT || 3000 // 3000 for local host but "process.env.PORT" for hosting sites

const MongoClient = require('mongodb').MongoClient //Lets us use MongoDB

const dotenv = require('dotenv').config()// process an environment so you can put sensitive data while omitting it from the public - protects our information

const MONGODB_URL = process.env.MONGODB_URL
if(!MONGODB_URL) throw new Error('Triggered')

const client = new MongoClient(MONGODB_URL)


client.connect().then(client =>{

    console.log('Its alive!')

    const db = client.db('movies') //Makes our folder / database in MongoDB
    const movieCollection = db.collection('details') //creates a collection inside the database in our MongoDB


    app.set('view engine', 'ejs'); //'app.set()' sets the Express application settings, 'view engine' is the property that controls which view engine is used


    app.use(bodyParser.urlencoded({extended: true})); // Express lets us use middleware with .use method 
    // bodyParser => they help tidy up the request object
    // urlencoded => tells the bodyparser to extract data from the <form> element and attach them to the body property of the request object


    // Taken from https://expressjs.com/en/resources/middleware/method-override.html#custom-logic
    app.use(methodOverride(function(req, res){
        if(req.body && typeof req.body === 'object' && '_method' in req.body){
            var method = req.body._method
            delete req.body._method
            return method
        }
    }))


    app.use(express.static('public'));

    app.get('/', (req, res) => {
        movieCollection.find().toArray().then(results =>{
          res.render('index.ejs',{
            movie: results 
             })  
        }) 
    .catch(/* */)
    });
        /*  
        let movie =    [
                            {
                                _id: adjlhfa,
                                title: Shrek,
                                img: Poster,

                            }
                        ]



            for(let i = 0; i < movie.length; i++){
                <h1> movie[i].title </h1>
                <img src ="movie[i].img">
            }
         */

    app.post('/movies', async (req, res)=> {
        const userInput = req.body.title

        const response = await fetch(`http://www.omdbapi.com/?t=${userInput.toLowerCase()}&apikey=1921700e`)// We are trying to access the title of the object
        //req.body = {
            //title: spiderman
            //req.body.title
        //}

        const data = await response.json() //changes the data to a JSON file

        const attributePath = data.Title //path of the api data
        console.log(attributePath)

        //creates an object data that we will pass on the insertOne method
         const obj = {
            title: userInput,
            img: data.Poster
            
         }
        console.log(obj)
        //posting the object that we created using the insertOne method in the ghibliCollection
         movieCollection.insertOne(obj)
            .then(() => res.redirect('/'))
            .catch(error => console.error(error))   

    app.delete('/movies', async (req, res)=> {
        movieCollection.deleteOne({
            _id: ObjectId(req.body.id)
        }).then(result => {
            console.log(`Deleted ObjectId(${req.body.id})`)
            res.redirect('/') //We redirect it to the root
        }).catch(error => console.log(`Error: ${error}`))
    })
})



    app.listen(PORT, () => {
        console.log('I see you 3000')
    }); //'node server.js' to start listening in the terminal

})

