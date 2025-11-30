const express = require('express');
    morgan = require('morgan');

const app = express();

let topMovies = [
  {
    title: 'Amelie'
},
{
    title: 'Shaun of the Dead'
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

app.use(morgan('common'));

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.send('Welcome to MovieMento - The movie app!');
});

app.get('/movies', (req,res) => {
    res.json(topMovies);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Sorry, something doesnt work right!');
});

app.listen(8080, () => {
    console.log('This app is listening on port 8080');
});