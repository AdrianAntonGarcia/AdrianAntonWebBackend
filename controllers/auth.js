const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generarJWT } = require('../helpers/jwt');

const newUser = async (req, res = response) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    /*Si el usuario existe mandamos error */
    if (user) {
      return res.status(400).json({
        ok: false,
        errorMsg: 'Ya existe un usuario con ese correo',
      });
    }
    user = new User(req.body);
    // Encriptamos la contraseña
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(password, salt);

    await user.save();
    // Generar JWT
    const token = await generarJWT(user.id, user.name);
    res.status(201).json({
      ok: true,
      uid: user.id,
      name: user.name,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      errorMsg: 'Por favor, hable con el admin',
    });
  }
};

module.exports = { newUser };
