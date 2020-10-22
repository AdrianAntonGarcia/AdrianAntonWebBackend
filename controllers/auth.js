const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const TokenEmail = require('../models/TokenEmail');
var nodemailer = require('nodemailer');

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
    await sendConfirmationEmail(userSaved, req);
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
  const token = await generarJWT(user._id, user.name, '24h');
  const tokenEmail = new TokenEmail({
    _userId: user._id,
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
      '/verificacion/confirmacion/' +
      encodeURIComponent(tokenEmailSaved.token) +
      '.\n',
  };

  const datos = await transporter.sendMail(mailOptions);
  console.log(datos);
};

module.exports = { newUser };
