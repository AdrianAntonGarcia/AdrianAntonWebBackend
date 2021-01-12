const { roleUsers } = require('../models/types/types');

/**
 * Valida que el role del usuario sea válido
 * @param {*} value
 */
const validarRole = (value) => Object.values(roleUsers).includes(value);
module.exports = { validarRole };
