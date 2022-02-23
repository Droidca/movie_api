const mongoose = require('mongoose');

const bcryptjs = require('bcryptjs');

let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: {type: String, required: true},
  Birthday: Date,
  FavoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

userSchema.statics.hashPassword = (password) => {
  return bcryptjs.hashSync(password, 10);
};

userSchema.methods.validatePassword = function(password) {
  return bcryptjs.compareSync(password, this.Password);
};

let User = mongoose.model('User', userSchema);

module.exports.User = User;
