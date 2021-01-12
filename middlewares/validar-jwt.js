const { response, request } = require('express');
const jwt = require('jsonwebtoken');

/**
 * Middleware que valida el token si vienen como header
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const validarJWT = (req = request, res = response, next) => {
  // x-token headers
  const token = req.header('x-token');
  console.log(`token: ${token}`);
  if (!token) {
    return res.status(401).json({
      ok: false,
      errorMsg: 'No hay token en la petición',
    });
  }

  try {
    // Validar el token
    const payload = jwt.verify(token, process.env.SECRET_JWT_SEED);
    req.uid = payload.uid;
    req.name = payload.name;
  } catch (error) {
    return res.status(401).json({
      ok: false,
      msg: 'Token no valido',
    });
  }
  next();
};

module.exports = {
  validarJWT,
};
