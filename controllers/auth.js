const { response } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const User = require('../models/User');
const TokenEmail = require('../models/TokenEmail');
const { generarJWT } = require('../helpers/jwt');

/**
 * Función que crea un nuevo usuario en la base de datos
 * @param {*} req
 * @param {*} res
 */
const newUser = async (req, res = response) => {
  try {
    const { email, password } = req.body;
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

    let userSaved = await user.save();
    const confirmEmail = await sendConfirmationEmail(userSaved, req);
    if(!confirmEmail){
      return res.status(401).json({
        ok: false,
        errorMsg: 'Usuario no encontrado',
      });
    }
    // Generar JWT
    const token = await generarJWT(user.id, user.name);

    res.status(201).json({
      ok: true,
      uid: user.id,
      name: user.name,
      token,
    });
  } catch (error) {
    console.log(`Error en controllers/auth.js/newUser: ${error}`);

    return res.status(500).json({
      ok: false,
      errorMsg: 'Por favor, hable con el admin',
    });
  }
};

/**
 * Función que envía el correo de confirmación por email
 * @param {*} user
 */
const sendConfirmationEmail = async (user, req) => {
  // Generamos token para el email

  user.password = ':D';
  const usuarioEmail = await User.findOne({ _id: user._id });
  if (usuarioEmail) {
    const token = await generarJWT(usuarioEmail._id, usuarioEmail.name, '24h');
    const tokenEmail = new TokenEmail({
      _userId: usuarioEmail._id,
      token: token,
    });
    const tokenEmailSaved = await tokenEmail.save();

    /**
     * Creamos el email y lo enviamos
     */
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.IDACGMAIL,
        pass: process.env.PASSGMAIL,
      },
    });

    var mailOptions = {
      from: process.env.IDACGMAIL,
      to: user.email,
      subject: 'Verificación de correo AdriWeb',
      text:
        'Hola,\n\n' +
        'Verifica tu cuenta en la web de Adri haciendo click en: \nhttp://' +
        req.headers.host +
        '/api/auth/validateEmail/' +
        encodeURIComponent(tokenEmailSaved.token) +
        '.\n',
    };

    const datos = await transporter.sendMail(mailOptions);
    return true;
  }else{
    return false;
  }
};

/**
 * Servicio que valida el email del usuario y coloca el usuario como activo
 * @param {*} req
 * @param {*} res
 */
const validateEmail = async (req, res = response) => {
  try {
    // Buscamos el token en la base de datos
    const tokenDB = await TokenEmail.findOne({ token: req.token });
    if (!tokenDB) {
      return res.status(401).json({
        ok: false,
        errorMsg:
          'No verificado, token no encontrado, intente reenviar código de activación',
      });
    }
    // Buscamos el usuario del token
    const userToken = await User.findOne({ _id: tokenDB._userId });
    if (!userToken) {
      return res.status(401).json({
        ok: false,
        errorMsg:
          'No verificado, token no encontrado, intente reenviar código de activación',
      });
    }
    // Activamos el usuario
    userToken.valid = true;
    console.log(userToken);
    const userActivated = await userToken.save();
    return res.status(201).json({
      ok: true,
      uid: req.uid,
      name: req.name,
      token: tokenDB,
      userActivated,
    });
  } catch (error) {
    console.log(`Error en controllers/auth.js/validateEmail: ${error}`);
    return res.status(500).json({
      ok: false,
      errorMsg: 'Por favor, hable con el admin',
    });
  }
};

module.exports = { newUser, validateEmail };
