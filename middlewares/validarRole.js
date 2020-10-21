const { roleUsers } = require('../models/types/types');

const validarRole = (value) => Object.values(roleUsers).includes(value);
module.exports = { validarRole };
