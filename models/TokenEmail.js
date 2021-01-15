var mongoose = require('mongoose');

var Schema = mongoose.Schema;

/**
 * Guardamos en la base de datos el token del usuario con una fecha de espiración.
 * Uso este registro porque jwt no permite revocar tokens, por lo que para eliminar
 * un token hay que hacerlo a través de una tabla, el token como si no se revoca dentro
 * de jwt pero si en nuestras tablas
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
