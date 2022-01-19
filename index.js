const express = require ('express'),
  morgan = require ('morgan');

const app = express ();

app.use(morgan('common'));


let topMovies = [
  {
    title: 'Wolf of Wall Street',
    year: '2013'
  },
  {
    title: 'The Lord of the Rings: The Return of the King',
    year: '2003'
  },
  {
    title: 'Star Wars: Episode III – Revenge of the Sith',
    year: '2005'
  },
  {
    title: 'Shrek',
    year: '2001'
  },
  {
    title: "The Emperor's New Groove",
    year: '2000'
  },
  {
    title: 'Monsters, Inc.',
    year: '2001'
  },
  {
    title: 'Avengers: Endgame',
    year: '2019'
  },
  {
    title: 'Harry Potter and the Prisoner of Azkaban',
    year: '2004'
  },
  {
    title: 'Aladdin',
    year: '1992'
  },
  {
    title: 'The Road to El Dorado',
    year: '2000'
  }
];

app.get ('/', (req, res) => {
  res.send ('Welcome to my movie API');
});

app.get ('/movies', (req, res) => {
  res.json (topMovies);
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ups! The tape broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
