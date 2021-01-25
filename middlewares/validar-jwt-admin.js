const { response, request } = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { roleUsers } = require('../models/types/types');
/**
 * Middleware que valida el token si vienen como header
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const validarJWTAdmin = async (req = request, res = response, next) => {
  // x-token headers
  const token = req.header('x-token');
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
    /**Comprobamos que el usuario del token sea un admin */
    const admin = await User.findById(req.uid);
    if (admin.role !== roleUsers.admin) {
      return res.status(401).json({
        ok: false,
        errorMsg: 'No es un admin',
      });
    }
  } catch (error) {
    return res.status(401).json({
      ok: false,
      msg: 'Token no valido',
    });
  }
  next();
};

module.exports = {
  validarJWTAdmin,
};
