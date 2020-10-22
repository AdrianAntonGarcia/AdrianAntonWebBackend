const nodemailer = require('nodemailer');

const User = require('../../models/User');
const TokenEmail = require('../../models/TokenEmail');
const { generarJWT } = require('../../helpers/jwt');

/**
 * Función que envía el correo de confirmación por email
 * @param {*} user
 */
const sendConfirmationEmail = async (user, req) => {
  user.password = ':D';
  const usuarioEmail = await User.findOne({ _id: user._id });
  if (usuarioEmail) {
    // Generamos un JWT
    const token = await generarJWT(usuarioEmail._id, usuarioEmail.name, '24h');
    // Generamos un token del usuario en la base de datos
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
    await transporter.sendMail(mailOptions);
    return true;
  } else {
    return false;
  }
};

/**
 * Función que envía el correo para cambiar la contraseña
 * @param {*} user
 */
const sendRecoverPasswordEmail = async (user) => {
  user.password = ':D';
  const usuarioEmail = await User.findOne({ _id: user._id });
  if (usuarioEmail) {
    // Generamos un JWT
    const token = await generarJWT(usuarioEmail._id, usuarioEmail.name, '24h');
    // Generamos un token del usuario en la base de datos
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
      subject: 'Cambio de contraseña AdriWeb',
      text:
        'Hola,\n\n' +
        'Recupera tu contraseña haciendo click en: \nhttp://' +
        process.env.SERVERWEB  +
        '/changePass/' +
        encodeURIComponent(tokenEmailSaved.token) +
        '.\n',
    };
    await transporter.sendMail(mailOptions);
    return true;
  } else {
    return false;
  }
};

module.exports = { sendConfirmationEmail, sendRecoverPasswordEmail };
