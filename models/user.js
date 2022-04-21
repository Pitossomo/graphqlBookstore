const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 4,
  },
  favoriteGenre: {
    type: String,
    required: true,
  },
  // passwordHash: String,
});

/* TODO
schema.set("toObject", {
  transform: (document, returnedObject) => {
    delete returnedObject.passwordHash
  }
})
*/

const User = mongoose.model("User", schema);

module.exports = User;
