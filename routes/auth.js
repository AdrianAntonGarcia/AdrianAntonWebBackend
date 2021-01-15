const express = require('express');
const { check } = require('express-validator');
const {
  newUser,
  validateEmail,
  resendEmail,
  sendEmailChangePass,
  login,
  renewToken,
  changePass,
} = require('../controllers/auth');
const router = express.Router();

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWT } = require('../middlewares/validar-jwt');
const { validarJWTParam } = require('../middlewares/validar-jwt-param');
const { validarPassword } = require('../middlewares/validar-password');
const { validarRole } = require('../middlewares/validarRole');
const { validarJWTQuery } = require('../middlewares/validar-jwt-query');

router.post(
  '/login',
  [
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password debe de ser de 6 caracteres').isLength({
      min: 6,
    }),
    validarCampos,
  ],
  login
);

/**
 * Ruta para crear usuarios
 */
router.post(
  '/newUser',
  [
    check('name', 'El nombre es obligatorio').not().isEmpty(),
    check('email', 'El email es obligatorio').isEmail(),
    check('password', 'El password debe de ser de 6 caracteres').isLength({
      min: 6,
    }),
    check('role', 'El role no es válido')
      .optional()
      .custom((value) => validarRole(value)),
    validarCampos,
  ],
  newUser
);

/**
 * Ruta para reenvio de email de confirmación
 */
router.post(
  '/resendEmail',
  [check('email', 'El email es obligatorio').isEmail(), validarCampos],
  resendEmail
);

/**
 * Revalidar token
 */
router.get('/renew', validarJWT, renewToken);

/**
 * Ruta para validar el email
 */
router.get('/validateEmail/:token', [validarJWTParam], validateEmail);

/**
 * Servicio que simplemente valida que el token sea corecto
 */
router.post('/validateToken', validarJWTQuery, (req, res = response) =>
  res.status(201).json({
    ok: true,
    uid: req.uid,
  })
);

/**
 * Ruta para cambiar el password de un usuario
 */
router.post(
  '/changePass/:token',
  [validarJWTParam, validarPassword],
  changePass
);

/**
 * Ruta para envio de cambio de contraseña
 */
router.post(
  '/sendChangePassEmail',
  [check('email', 'El email es obligatorio').isEmail(), validarCampos],
  sendEmailChangePass
);

module.exports = router;
