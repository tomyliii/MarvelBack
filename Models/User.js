const mongoose = require("mongoose");
const opts = { toJSON: { virtuals: true }, toObject: { virtuals: true } };

const UserSchema = mongoose.Schema(
  {
    firstname: { type: String, require: true },
    lastname: { type: String, require: true },
    nickname: { type: String, require: true },
    mail: { type: String, require: true, unique: true },
    salt: { type: String, require: true },
    hash: { type: String, require: true },
    token: { type: String, require: true },
    dateOfBirth: { type: Date, require: true },
    avatar: { secure_url: { type: String } },
    dateOfSusbcription: { type: Date, default: new Date(), require: true },
    favorites: { comics: Array, characters: Array },
  },
  {
    virtuals: {
      fullname: {
        get() {
          return this.firstname + " '" + this.nickname + "' " + this.lastname;
        },
      },
    },
  }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
