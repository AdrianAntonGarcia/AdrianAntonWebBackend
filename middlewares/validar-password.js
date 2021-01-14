const { response, request } = require('express');

/**
 * Middleware que valida que venga la contraseña en el password
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const validarPassword = (req = request, res = response, next) => {
  const { password } = req.body;
  if (!password) {
    return res.status(401).json({
      ok: false,
      errorMsg: 'No se ha especificado una nueva contraseña',
    });
  }
  next();
};

module.exports = {
  validarPassword,
};
