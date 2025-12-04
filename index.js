const express = require('express'),
    morgan = require('morgan'),
    uuid = require('uuid'),
    bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());

let movies = [
  {
    "Title": "Amelie",
    "OriginalTitle": "Le Fabuleux Destin d'Amélie Poulain",
    "Description": "(Amelie, 2001). At a tiny Parisian café, the adorable yet painfully shy Amélie accidentally discovers a gift for helping others. Soon Amelie is spending her days as a matchmaker, guardian angel, and all-around do-gooder. But when she bumps into a handsome stranger, will she find the courage to become the star of her very own love story?",
    "Genre": {
        "Name": "Romantic Comedy",
        "Description": "Romantic comedy (commonly shortened to romcom or rom-com) is a sub-genre of comedy and romance fiction, focusing on lighthearted, humorous plot lines centered on romantic ideas, such as how love is able to surmount all obstacles"
    },
    "Director":{
        "Name": "Jean-Pierre Jeunet",
        "Bio": "Jean-Pierre Jeunet is a French film director and screenwriter known for the films Delicatessen, The City of Lost Children, Alien: Resurrection and Amélie.",
        "Birthyear": "1953"
    },
    "imageURL": "https://media.themoviedb.org/t/p/w300_and_h450_face/vZ9NhNbQQ3yhtiC5sbhpy5KTXns.jpg"
},
{
    "Title": 'Shaun of the Dead',
    "Description": "(Shaun of the Dead, 2004). Shaun lives a supremely uneventful life, which revolves around his girlfriend, his mother, and, above all, his local pub. This gentle routine is threatened when the dead return to life and make strenuous attempts to snack on ordinary Londoners.",
    "Genre": {
        "Name": "Horror Comedy",
        "Description": "Horror comedy, or comedy Horror, is a genre that combines elements of comedy and horror fiction. Comedy horror has been described as having three types: black comedy, parody and spoof. Comedy horror can also parody or subtly spoof horror clichés as its main source of humour or use those elements to take a story in a different direction."
    },
    "Director":{
        "Name": "Edgar Wright",
        "Bio": "Edgar Howard Wright is an English filmmaker. He is known for his fast-paced and kinetic, satirical genre films, which feature extensive utilisation of expressive popular music, Steadicam tracking shots, dolly zooms and a signature editing style that includes transitions, whip pans and wipes. In 2004, Wright directed the zombie comedy Shaun of the Dead, starring Pegg and Frost, the first film in Wright's Three Flavours Cornetto trilogy. The film was co-written with Pegg—as were the next two entries in the trilogy, the buddy cop film Hot Fuzz (2007) and the science fiction comedy The World's End (2013). ",
        "Birthyear": "1974"
    },
    "imageURL": "https://image.tmdb.org/t/p/w600_and_h900_face/dgXPhzNJH8HFTBjXPB177yNx6RI.jpg"
},
{
    title: 'Labyrinth'
},
{
    title: 'Constantine'
},
{
    title: 'Princess Mononoke'
},
{
    title: 'Number 6'
},
{
    title: 'Number 7'
},
{
    title: 'Number 8'
},
{
    title: 'Number 9'
},
{
    title: 'Number 10'
}
];

let users = [
    {
        "Name": "Toni",
        "Favorites": [],
        "id": 1
    },
    {
        "Name": "Hans",
        "Favorites": [],
        "id": 2
    }
];

app.use(morgan('common'));

app.use(express.static('public'));

//CREATE = POST
app.post('/users', (req,res) => {
    let newUser = req.body;

    if (newUser.Name) {
        newUser.id = uuid.v4();
        users.push(newUser);
        res.status(201).json(newUser)
    } else {
        res.status(400).send('Please enter a name')
    }
});

//UPDATE = PUT
app.put('/users/:id', (req,res) => {
    let { id } = req.params;
    let updatedUser = req.body;

    let user = users.find(user => user.id == id );

    if (user) {
        user.Name = updatedUser.Name;
        res.send(`Username successfully updated to ${updatedUser.Name}`)
    } else {
        res.status(400).send('No such user found')
    }

    });

//CREATE = POST
app.post('/users/:id/:movieTitle', (req,res) => {
    let { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id );

    if (user) {
        user.Favorites.push(movieTitle);
        res.send(`${movieTitle} successfully added to favorites`);
    } 
    });

// DELETE = DELETE
app.delete('/users/:id/:movieTitle', (req,res) => {
    let { id, movieTitle } = req.params;

    let user = users.find(user => user.id == id );

    if (user) {
        user.Favorites = user.Favorites.filter( title => title != movieTitle);
        res.send(`${movieTitle} successfully deleted from favorites`);
    } 

    });

// DELETE = DELETE
app.delete('/users/:id', (req,res) => {
    let { id } = req.params;

    let user = users.find( user => user.id == id );

    if (user) {
        users = users.filter( user => user.id != id);
        res.send(`The user with id: ${id} has been successfully deleted`);
    } 

    });

// READ = GET
app.get('/', (req, res) => {
    res.send('Welcome to MovieMento - The movie app!');
});

app.get('/movies', (req,res) => {
    res.json(movies);
});

app.get('/movies/:title', (req, res) => {
    let title = req.params.title;
    let movie = movies.find(movie => movie.Title === title);

    if (movie) {
        res.json(movie);
    } else {
        res.status(400).send("Sorry, there is no such movie in our list")
    }  
 });

 app.get('/movies/genre/:genreName', (req, res) => {
    let genreName = req.params.genreName;
    let genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

    if (genre) {
        res.json(genre);
    } else {
        res.status(400).send("Sorry, there is no such genre in our list")
    }  
 });

  app.get('/movies/director/:directorName', (req, res) => {
    let { directorName } = req.params;
    let director = movies.find(movie => movie.Director.Name === directorName ).Director;

    if (director) {
        res.json(director);
    } else {
        res.status(400).send("Sorry, there is no such name in our list")
    }  
 });



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Sorry, something doesnt work right!');
});

app.listen(8080, () => {
    console.log('This app is listening on port 8080');
});