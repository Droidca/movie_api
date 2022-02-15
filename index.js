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

const cors = require('cors');
app.use(cors());

// imports the auth.js file into the project
// the (app) argument ensures that Express is availible in auth.js file as well
let auth = require('./auth')(app);

// requires the Passport module and imports passport.js
const passport = require('passport');
require('./passport');

// Requires the express-validator package

const { check, validationResult } = require('express-validator');


//GET Welcome Message

app.get ('/', passport.authenticate('jwt', { session: false }), (req, res) => {
  res.send ('Welcome to my movie API');
});

//GET All Movies

app.get ('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.get('/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.get("/directors/:Name", passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.post('/users',
[
  check('Username', 'Username is required').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Email', 'Email does not appear to be valid').isEmail()
], (req, res) => {

  let errors = validationResult(req);

  if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

  let hashedPassword = Users.hashPassword(req.body.Password);
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({
            Username: req.body.Username,
            Password: hashedPassword,
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

app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.put("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.post("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.delete("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), (req, res) => {
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

app.delete("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
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

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});
