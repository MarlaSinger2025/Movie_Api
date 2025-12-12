const express = require('express'),
    morgan = require('morgan'),
    uuid = require('uuid'),
    bodyParser = require('body-parser');

const mongoose = require('mongoose');
const Models = require('./models.js');
const e = require('express');

const Movies = Models.Movie;
const Users = Models.User;

const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/cfDB');

app.use(bodyParser.json());

// log requests to server
app.use(morgan('common'));

app.use(express.static('public'));


// default text response when visiting /
app.get('/', (req, res) => {
    res.send('Welcome to MovieMento - The movie app!');
});

// GET JSON object with all movies when visiting /movies
app.get('/movies', async (req,res) => {
  await Movies.find()
    .then((movies) => {
        res.status(201).json(movies);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
    });
});;

// GET (=) JSON with movie Info when looking for specific title
app.get('/movies/:Title', async (req, res) => {
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
 app.get('/movies/genre/:Name', async (req, res) => {
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
  app.get('/movies/director/:Name', async (req, res) => {
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
/* We'll expect JSON in this format: 
{
ID: Integer (automatically generated),
Username: String,
Password: String,
Email: String,
Birthday: Date
} */
app.post('/users', async (req,res) => {
    await Users.findOne({ Username: req.body.Username })
    .then((user) => {
        if (user) {
            return res.status(400).send(req.body.Username + ' already exists');
        } else {
            Users
              .create({
                Username: req.body.Username,
                Password: req.body.Password,
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
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    });
});

// Get a user by username
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
        console.error(err);
        res.status(500).send('Error ' + err);
    });
});

//Update a user's info by username
    /* We'll expect JSON in this format: 
    {
    Username: String, (required)
    Password: String, (required)
    Email: String, (required)
    Birthday: Date
    } */
app.put('/users/:Username', async (req,res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {$set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
},
{ new: true}) // This line makes sure that the updated document is returned
.then((updatedUser) => {
  res.json(updatedUser);
})
.catch((err) => {
  console.error(err);
  res.status(500).send('Error: ' + err);
  })
});

// Add a movie to a user's list of favorite movies
app.post('/users/:Username/movies/:MovieID', async (req,res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username}, 
    { $push: { FavoriteMovies: req.params.MovieID} },
    { new: true}) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

// DELETE a movie from a USERS list of favorite movies
app.delete('/users/:Username/movies/:MovieID', async (req,res) => {
    await Users.findOneAndUpdate({ Username: req.params.Username}, 
      { $pull: { FavoriteMovies: req.params.MovieID} },
      { new: true}) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error ' + err);
    });
});

// DELETE a user by username
app.delete('/users/:Username', async (req,res) => {
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