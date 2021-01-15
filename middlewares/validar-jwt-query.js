const { response, request } = require('express');
const jwt = require('jsonwebtoken');

/**
 * Middleware que valida el token si viene como parámetro de la petición
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const validarJWTQuery = (req = request, res = response, next) => {
  // token por param
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({
      ok: false,
      errorMsg: 'No hay token en la petición',
    });
  }
  try {
    // token = decodeURIComponent(token);
    // Validar el token
    const payload = jwt.verify(token, process.env.SECRET_JWT_SEED);
    req.uid = payload.uid;
    req.name = payload.name;
    req.token = token;
  } catch (error) {
    return res.status(401).json({
      ok: false,
      msg: 'Token no valido',
    });
  }
  next();
};

module.exports = {
  validarJWTQuery,
};
