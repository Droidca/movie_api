const mongoose = require('mongoose');
const Models = require ('./models.js');

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myflix', { useNewUrlParser: true, useUnifiedTopology: true });

const express = require ('express'),
  morgan = require ('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');
  const req = require('express/lib/request');
  const res = require('express/lib/response');


const app = express ();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('common'));


//GET Welcome Message

app.get ('/', (req, res) => {
  res.send ('Welcome to my movie API');
});

//GET All Movies

app.get ('/movies', (req, res) => {
  Movies.find()
  .then((movie) => {
    res.status(201).json(movie);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send('Error' + err);
  });
});

//Get Movies by Title

app.get('/movies/:Title', (req, res) => {
  Movies.findOne({Title: req.params.Title})
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send('Error' + err);
  });
});

//Get Genre Description by Name

app.get('/genres/:Name', (req, res) => {
  Movies.findOne({'Genre.Name': req.params.Name})
  .then((movie) => {
    res.json(movie.Genre.Description);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send('Error' + err);
  });
});



//Get Info about Director by Name

app.get("/directors/:Name", (req, res) => {
  Movies.findOne({'Director.Name': req.params.Name})
  .then((movie) => {
    res.json(movie.Director);
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send('Error' + err);
  });
});

//Get Documentation

app.use(express.static('public'));

//Add a New User

app.post('/users', (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

// gets a user by username

app.get('/users/:Username', (req, res) => {
    Users.findOne({ Username: req.params.Username })
        .then((users) => {
            res.json(users);
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send('Error: ' + err);
        });
});

//Update User Information

app.put("/users/:Username", (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {$set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true },
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Add Movie to User's Favorite List

app.post("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {
    $push: {FavoriteMovies: req.params.MovieID}
  },
  {new: true},
  (err, updatedUser) => {
    if(err) {
      console.log(err);
      res.status(500).send('Error ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Delete Movie From User's Favorite List

app.delete("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate({Username: req.params.Username}, {
    $pull: {FavoriteMovies: req.params.MovieID}
  },
  {new: true},
  (err, updatedUser) => {
    if(err) {
      console.log(err);
      res.status(500).send('Error ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Delete User

app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({Username: req.params.Username})
  .then((user) => {
    if (!user) {
      res.status(400).send(req.parms.Username + ' was not found!');
    } else {
      res.status(200).send(req.params.Username + ' was deleted!');
    }
  })
  .catch((err) => {
    console.log(err);
    res.status(500).send('Error' + err);
  });
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Ups! The tape broke!');
});

app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
});
