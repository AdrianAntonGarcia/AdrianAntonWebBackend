const express = require('express');
const { check } = require('express-validator');
const { newUser } = require('../controllers/auth');
const router = express.Router();

const { validarCampos } = require('../middlewares/validar-campos');
const { validarRole } = require('../middlewares/validarRole');


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
      .custom((value, { req }) => validarRole(value)),
    validarCampos,
  ],
  newUser
);

module.exports = router;
