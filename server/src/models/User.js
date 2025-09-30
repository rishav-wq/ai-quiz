// src/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true, // No two users can share an email
  },
  password: {
    type: String,
    required: true,
  },
}, {
  timestamps: true, // Automatically adds 'createdAt' and 'updatedAt' fields
});

// This is a "pre-save hook". Before a user document is saved...
userSchema.pre('save', async function (next) {
  // ...only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  // Generate a "salt" to make the hash more secure
  const salt = await bcrypt.genSalt(10);
  // Hash the password with the salt
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare entered password with the hashed password in the database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;