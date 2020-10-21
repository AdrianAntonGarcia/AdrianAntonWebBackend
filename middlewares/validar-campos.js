const { response } = require('express');
const { validationResult } = require('express-validator');
/**
 * Middleware que comprueba que los campos introducidos son correctos.
 * Si hay un error llamamos al return y nunca al next
 * @param {} req request de la petición
 * @param {*} res response de la petición
 * @param {*} next esta función se llama cuándo el middleware termina correctamente
 */
const validarCampos = (req, res = response, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      ok: 'false',
      errors: errors.mapped(),
    });
  }
  next();
};

module.exports = { validarCampos };
