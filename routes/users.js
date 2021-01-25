const express = require('express');
const { getUsers } = require('../controllers/users');
const router = express.Router();
const { validarJWTAdmin } = require('../middlewares/validar-jwt-admin');

/**
 * Revalidar token
 */
router.get('/getUsers', validarJWTAdmin, getUsers);

module.exports = router;
