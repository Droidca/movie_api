const express = require ('express'),
  morgan = require ('morgan');

const app = express ();

app.use(morgan('common'));


let topMovies = [
  {
    title: 'Wolf of Wall Street',
    genre: 'Comedy',
    director: 'Martin Scorsese'
  },
  {
    title: 'The Lord of the Rings: The Return of the King',
    genre: 'Adventure',
    director: 'Peter Jackson'
  },
  {
    title: 'Star Wars: Episode III – Revenge of the Sith',
    genre: 'Scy-fy',
    director: 'George Lucas'
  },
  {
    title: 'Shrek',
    genre: 'Animation',
    director: 'Vicky Jenson'
  },
  {
    title: "The Emperor's New Groove",
    genre: 'Animation',
    director: 'Mark Dindal'
  },
  {
    title: 'Monsters, Inc.',
    genre: 'Animation',
    director: 'Pete Docter'
  },
  {
    title: 'Avengers: Endgame',
    genre: 'Action',
    director: 'Anthony Russo'
  },
  {
    title: 'Harry Potter and the Prisoner of Azkaban',
    genre: 'Fantasy',
    director: 'Alfonso Cuarón'
  },
  {
    title: 'Aladdin',
    genre: 'Animation',
    director: 'Ron Clements'
  },
  {
    title: 'The Road to El Dorado',
    genre: 'Animation',
    director: 'Bibo Bergeron'
  }
];

//GET Welcome Message

app.get ('/', (req, res) => {
  res.send ('Welcome to my movie API');
});

//GET All Movies

app.get ('/movies', (req, res) => {
  res.json (topMovies);
});

//Get Movies by Title

app.get('/movies/:title', (req, res) => {
  res.json(
    topMovies.find(movie => {
      return movie.title === req.params.title;
    })
  );
});

//Get Movies by Genre

app.get("/genres/:genre", (req, res) => {
  res.json(
    topMovies.find(movie => {
      return movie.genre === req.params.genre;
    })
  );
});

//Get Movies by Director

app.get("/directors/:director", (req, res) => {
  res.json(
    topMovies.find(movie => {
      return movie.director === req.params.director;
    })
  );
});

//Get Documentation

app.use(express.static('public'));

//Add a New User

app.post("/users/:newUser", (req, res) => {
  res.send("New user added successfully!");
});

//Update User Information

app.put("/users/:username", (req, res) => {
  res.send("Username updated succesfully!");
});

// Add Movie to User's Favorite List

app.post("/favorite/:newMovie", (req, res) => {
  res.send("Movie added succesfully!");
});

//Delete Movie From User's Favorite List

app.delete("/favorite/:Title", (req, res) => {
  res.send("Movie deleted succesfully!");
});

//Delete User

app.delete("/users/:username", (req, res) => {
  res.send("User deleted succesfully!");
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ups! The tape broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
