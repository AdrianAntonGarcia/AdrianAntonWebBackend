var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * Guardamos en la base de datos el token del usuario con una fecha de espiración.
 */
var tokenEmail = new Schema({
  _userId: { type: Schema.Types.ObjectId, required: true, red: 'Usuario' },
  token: { type: String, required: true },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
    expires: 43200,
  },
});

module.exports = mongoose.model('TokenEmail', tokenEmail);
