const mongoose = require('mongoose');

const bcryptjs = require('bcryptjs');

let movieSchema = mongoose.Schema({
  Title: {type: String, required: true},
  Description:{type: String, required: true},
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

let Movie = mongoose.model('Movie', movieSchema);

module.exports.Movie = Movie;
