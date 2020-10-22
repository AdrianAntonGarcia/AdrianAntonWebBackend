const express = require('express');
const { check } = require('express-validator');
const { newUser, validateEmail } = require('../controllers/auth');
const router = express.Router();

const { validarCampos } = require('../middlewares/validar-campos');
const { validarJWTParam } = require('../middlewares/validar-jwt-param');
const { validarRole } = require('../middlewares/validarRole');

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
 * Ruta para validar el email
 */
router.get('/validateEmail/:token', [validarJWTParam], validateEmail);

module.exports = router;
