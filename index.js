const express = require('express'),
      morgan = require('morgan'),
      bodyParser = require('body-parser');

const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const { check, validationResult } = require('express-validator');

const Models = require('./models.js');

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/cfDB');

// Allowing requests from ALL Origins 
app.use(cors());

/* Only the domains in this function are allowed to make requests to the API

let allowedOrigins = ['http://localhost:8080', 'http://testsite.com'];  

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isnt found on the list of allowed origins
      let message = 'The CORS policiy for this application does"t allow access from origin ' + origin;
      return callback(new Error(message ), false); 
      }
      return callback(null, true);
  }
})); */

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// log requests to server
app.use(morgan('common'));

app.use(express.static('public'));

let auth = require('./auth')(app);

require('./passport');

const Movies = Models.Movie;
const Users = Models.User;

// default text response when visiting "/"
app.get('/', (req, res) => {
    res.send('Welcome to MovieMento - The movie app!');
});

// GET JSON object with all movies when visiting /movies
app.get('/movies',passport.authenticate('jwt', { session: false}), async (req,res) => {
  await Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});;

// GET JSON with movie Info when looking for specific title
app.get('/movies/:Title', passport.authenticate('jwt', { session: false}), async (req, res) => {
    await Movies.findOne({ Title: req.params.Title})
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
 });

 // GET JSON with genre Info when looking for specific genre 
 app.get('/movies/genre/:Name', passport.authenticate('jwt', { session: false}), async (req, res) => {
    await Movies.find({ 'Genre.Name': req.params.Name  })
    .then((genre) => {
        res.json(genre);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
 });

 // GET JSON with info about a director, searching by name
  app.get('/movies/director/:Name', passport.authenticate('jwt', { session: false}), async (req, res) => {
    await Movies.find({ 'Director.Name': req.params.Name })
      .then((director) => {
         res.json(director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      });
 });

// Add a user
/* Expecting JSON in this format: 
{
(ID: Integer (automatically generated)),
Username: String,
Password: String,
Email: String,
Birthday: Date (format: DD-MM-YYYY)
} */
app.post('/users', 
  // Validation logic here for request: 
  [
    check('Username', 'Username is required and needs to be at least 5 characters long').isLength({min:5}), // Needs minimum of 5 characters
    check('Username', 'Only numbers, letters and underscore allowed for Username').matches(/^[\p{L}\p{N}_]+$/u), // Only letters, numbers and underscore allowed but all Unicode languages
    check('Password', 'Password is required and needs to be at least 5 characters long').isLength({min:5}),
    check('Email', 'Email does not appear to be valid').isEmail(), // Needs to be in Email format
    check('Birthday', 'Birthday needs to be in the format DD-MM-YYYY').isDate({format: 'DD-MM-YYYY', strictMode: true})
  ],
  async (req,res) => {

  // Check the validation object for errors: 
  let errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }

  let [day, month, year] = req.body.Birthday.split('-'); // Convert birthday string to ISO Date for JS
  req.body.Birthday = new Date(`${year}-${month}-${day}`);

  let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ $or: [ { Username: req.body.Username }, { Email: req.body.Email}]})
    .then((user) => {
        if (user) {
          if (user.Username === req.body.Username) {
            return res.status(400).send(req.body.Username + ' already exists');
          } if (user.Email === req.body.Email) {
            return res.status(400).send(req.body.Email + ' already exists');
          }
        } else {
            Users
              .create({
                Username: req.body.Username,
                Password: hashedPassword,
                Email: req.body.Email,
                Birthday: req.body.Birthday
              })
              .then((user) => {res.status(201).json(user) })
            .catch((error) => {
                console.error(error);
                res.status(500).send('Error: ' + error);
            })
        }
    })
    .catch ((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// Get all users 
app.get('/users', passport.authenticate('jwt', { session: false}), async (req, res) => {
  await Users.find( {}, 'Username FavoriteMovies')  // Only shows Json with Username and Favorite Movies
    .then((users) => {
      res.json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', passport.authenticate('jwt', { session: false}), async (req, res) => {
  await Users.findOne({ Username: req.params.Username }, 'Username FavoriteMovies')
    .then((user) => {
      if (!user) {
          res.status(400).send('No user with the name ' + req.params.Username + ' found');
        } else {
      res.json(user); // Only shows Json with Username and Favorite Movies
        }
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    });
});

//Update a user's info by username
    /* Expecting JSON in this format (Only the ones to be changed needed): 
    {
    Username: String,
    Password: String,
    Email: String,
    Birthday: Date (In the format DD-MM-YYYY)
    } */
app.put('/users/:Username', passport.authenticate('jwt', { session: false }),
[
  check('Username').optional().isLength({min: 5}).matches(/^[\p{L}\p{N}_]+$/u).withMessage('Username must contain at least 5 characters. Only letters, numbers and underscore allowed'),
  check('Password').optional().isLength({min: 5}).withMessage('New Password needs to be at least 5 characters long'),
  check('Email').optional().isEmail().withMessage(' Email does not appear to be valid'),
  check('Birthday').optional().isDate({format: 'DD-MM-YYYY', strictMode: true}).withMessage('Birthday must be in the format DD-MM-YYYY')
],
async (req,res) => {
  let errors = validationResult(req);

  if(!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  // Condition to check ADDED HERE
  if(req.user.Username !== req.params.Username){
    return res.status(403).send('Permission denied');
  } //Conditions ENDS
  
  let [day, month, year] = req.body.Birthday.split('-'); // Convert birthday string to ISO Date for JS
  req.body.Birthday = new Date(`${year}-${month}-${day}`);
  
  let updatedData =     {
      Username: req.body.Username,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    };

    if (req.body.Password) { // Only hashes Password if User updates it
      updatedData.Password = Users.hashPassword(req.body.Password);
    }
  await Users.findOneAndUpdate({ Username: req.params.Username }, {$set: updatedData },
{ new: true , select: '-Password' }) // This line makes sure that the updated document is returned, but without Password
.then((updatedUser) => {
  res.json(updatedUser);
})
.catch((err) => {
  console.error(err);
  res.status(500).send('Error: ' + err);
  })
});

// Add a movie to a user's list of favorite movies
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), async (req,res) => {
  if(req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }
  await Users.findOneAndUpdate({ Username: req.params.Username}, 
    { $push: { FavoriteMovies: req.params.MovieID} },
    { new: true, select: '-Password'}) // This line makes sure that the updated document is returned, but without Password
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

// DELETE a movie from a USERS list of favorite movies
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false}), async (req,res) => {
  if(req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }  
  await Users.findOneAndUpdate({ Username: req.params.Username}, 
      { $pull: { FavoriteMovies: req.params.MovieID} },
      { new: true , select: '-Password'}) // This line makes sure that the updated document is returned, but without Password
      .then((updatedUser) => {
        res.json(updatedUser);
      })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

// DELETE a user by username
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req,res) => {
  if(req.user.Username !== req.params.Username) {
    return res.status(400).send('Permission denied');
  }  
  await Users.findOneAndDelete({ Username: req.params.Username})
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + ' was not found');
        } else {
            res.status(200).send(req.params.Username + ' was succsessfull deleted.'); 
        }
      })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Sorry, something doesnt work right!');
});

app.listen(8080, () => {
    console.log('This app is listening on port 8080');
});