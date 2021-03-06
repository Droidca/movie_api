const mongoose = require('mongoose');
const req = require('express/lib/request');
const res = require('express/lib/response');
const cors = require('cors');
const passport = require('passport');
const { check, validationResult } = require('express-validator');
const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const Movie_list = require('./movies.js');
const User = require('./user.js');

const app = express();
// Requires the express-validator package

const Movies = Movie_list.Movie;
const Users = User.User;

mongoose.connect('mongodb+srv://pacAdmin:walrus-has-rollerskates@popcorns-and-coke.kwg2d.mongodb.net/popcorns-and-coke?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

//mongoose.connect('mongodb://localhost:27017/myflix', { useNewUrlParser: true, useUnifiedTopology: true }); (For test proposes)

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('common'));

app.use(cors({ origin: '*' }));

// imports the auth.js file into the project
// the (app) argument ensures that Express is availible in auth.js file as well
let auth = require('./auth')(app);

// requires the Passport module and imports passport.js
require('./passport');

/**
 * redirects roo to index.html
 * @param {express.request} req
 * @param {express.response} res
 */

app.get('/', (req, res) => {
  res.send('Welcome to my movie API');
});

//GET All Movies

/**
 * /movies end-point
 * method: get
 * get all movies
 * @param {express.request} req
 * @param {express.response} res
 */

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
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

/**
 * /movies/:Title end-point
 * method: get
 * movies by title
 * @param {express.request} req
 * @param {express.response} res
 */

app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error' + err);
    });
});

//Get Genre Description by Name

/**
 * /genres end-point
 * method: get
 * get description of a genre by name
 * @param {express.request} req
 * @param {express.response} res
 */

app.get('/genres/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      res.json(movie.Genre.Description);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send('Error' + err);
    });
});



//Get Info about Director by Name

/**
 * /directors end-point
 * method: get
 * director by name
 * @param {express.request} req
 * @param {express.response} res
 */

app.get("/directors/:Name", passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
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

/* We???ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
/**
 * /users end-point
 * method: post
 * register user profile
 * expects Username, Password, Email, Birthday
 * @param {express.request} req
 * @param {express.response} res
 */

app.post('/users',
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
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
            .then((user) => { res.status(201).json(user) })
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

/**
 * /users end-point
 * method: get
 * get user by username
 * @param {express.request} req
 * @param {express.response} res
 */

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

/**
 * /users/ end-point
 * method: put
 * update user's profile
 * @param {express.request} req
 * @param {express.response} res
 */

app.put("/users/:Username", passport.authenticate('jwt', { session: false }),
  [
    check('Username', 'Username is required').isLength({ min: 5 }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    Users.findOneAndUpdate({ Username: req.params.Username }, {
      $set:
      {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
      { new: true },
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
  });

// Add Movie to User's Favorite List

/**
 * /users end-point
 * method: post
 * add movie to user's favorites
 * @param {express.request} req
 * @param {express.response} res
 */

app.post("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

//Delete Movie From User's Favorite List

/**
 * /users end-point
 * method: delete
 * delete a movie from user's favorites
 * @param {express.request} req
 * @param {express.response} res
 */

app.delete("/users/:Username/movies/:MovieID", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.log(err);
        res.status(500).send('Error ' + err);
      } else {
        res.json(updatedUser);
      }
    });
});

//Delete User

/**
 * /users end-point
 * method: delete
 * delete user's profile
 * @param {express.request} req
 * @param {express.response} res
 */

app.delete("/users/:Username", passport.authenticate('jwt', { session: false }), (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
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
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
