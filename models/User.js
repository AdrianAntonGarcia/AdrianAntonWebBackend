const { Schema, model } = require('mongoose');
const { roleUsers } = require('./types/types');

const UserSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    default: roleUsers.user,
  },
  valido: {
    type: Boolean,
    required: true,
    default: false,
  },
});

module.exports = model('User', UserSchema);
