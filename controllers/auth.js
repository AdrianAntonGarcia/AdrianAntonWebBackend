const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const TokenEmail = require('../models/TokenEmail');
const { generarJWT } = require('../helpers/jwt');
const path = require('path');
const {
  sendConfirmationEmail,
  sendRecoverPasswordEmail,
} = require('../helpers/email/emailTools');

/**
 * Función que realiza el login del usuario,
 * devolviendo el usuario y el token generado
 * @param {*} req
 * @param {*} res
 */
const login = async (req, res = response) => {
  try {
    const { email, password } = req.body;
    user = await User.findOne({ email });
    /*Si el usuario no existe mandamos error */
    if (!user) {
      return res.status(400).json({
        ok: false,
        errorMsg:
          'No existe ningún usuario con ese correo, por favor, registrese',
      });
    }
    if (!user.valid) {
      return res.status(400).json({
        ok: false,
        errorMsg: 'El usuario no esta activado, revise su correo',
      });
    }
    /*Comprobamos la contraseña */
    const correctPassword = await bcrypt.compare(password, user.password);
    if (!correctPassword) {
      return res.status(400).json({
        ok: false,
        errorMsg: 'La contraseña es incorrecta',
      });
    }
    /*Generamos el token */

    const token = await generarJWT(user.id, user.name);
    user.password = ':D';
    res.status(201).json({
      ok: true,
      user,
      token,
    });
  } catch (error) {
    console.log(`Error en controllers/auth.js/login: ${error}`);

    return res.status(500).json({
      ok: false,
      errorMsg: 'Por favor, hable con el admin',
    });
  }
};
/**
 * Función que crea un nuevo usuario en la base de datos
 * @param {*} req
 * @param {*} res
 */
const newUser = async (req, res = response) => {
  let userSaved = {};
  try {
    const { email, password } = req.body;
    user = await User.findOne({ email });
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

    userSaved = await user.save();
    const confirmEmail = await sendConfirmationEmail(userSaved, req);
    if (!confirmEmail) {
      // Si hay error, borramos el usuario
      await userSaved.deleteOne();
      return res.status(401).json({
        ok: false,
        errorMsg: 'Error en el servicio, intentelo de nuevo',
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
    // Si hay algún error borramos el usuario creado
    try {
      await userSaved.deleteOne();
    } catch {
      console.log(`Error en controllers/auth.js/newUser: ${error}`);
    }

    console.log(`Error en controllers/auth.js/newUser: ${error}`);

    return res.status(500).json({
      ok: false,
      errorMsg: 'Por favor, hable con el admin',
    });
  }
};

/**
 * renewToken: Realiza la renovación del token del usuario
 * @param {*} req
 * @param {*} res
 */
const renewToken = async (req, res) => {
  try {
    const uid = req.uid;
    const name = req.name;
    // Generar un nuevo JWT
    const token = await generarJWT(uid, name);

    // Obtener el usuario por uid
    const usuario = await User.findById(uid);
    usuario.password = ':D';
    res.json({
      ok: true,
      usuario,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador',
    });
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
    const tokenDB = await TokenEmail.findOne(
      { token: req.token },
      {},
      { sort: { created_at: -1 } }
    );
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
    const userActivated = await userToken.save();
    userActivated.password = ':D';
    return res.sendFile(
      path.join(__dirname + '../../public/userValidate.html')
    );
  } catch (error) {
    console.log(`Error en controllers/auth.js/validateEmail: ${error}`);
    return res.status(500).json({
      ok: false,
      errorMsg: 'Por favor, hable con el admin',
    });
  }
};

/**
 * Servicio que reenvía el correo de confirmación del email
 * @param {*} req
 * @param {*} res
 */
const resendEmail = async (req, res = response) => {
  try {
    const { email } = req.body;
    const userDB = await User.findOne({ email: email });
    if (!userDB) {
      return res.status(400).json({
        ok: false,
        errorMsg: 'No existe un usuario con ese correo',
      });
    }
    if (userDB.valid) {
      return res.status(400).json({
        ok: false,
        errorMsg: 'El usuario ya está activo',
      });
    }
    await sendConfirmationEmail(userDB, req);
    return res.status(201).json({
      ok: true,
      userDB,
    });
  } catch (error) {
    console.log(`Error en controllers/auth.js/resendEmail: ${error}`);
    return res.status(500).json({
      ok: false,
      errorMsg: 'Por favor, hable con el admin',
    });
  }
};

/**
 * Servicio que envía un email para cambiar la contraseña
 * @param {*} req
 * @param {*} res
 */
const sendEmailChangePass = async (req, res = response) => {
  try {
    const { email } = req.body;
    const userDB = await User.findOne({ email: email });
    if (!userDB) {
      return res.status(400).json({
        ok: false,
        errorMsg: 'No existe un usuario con ese correo',
      });
    }
    await sendRecoverPasswordEmail(userDB);
    return res.status(201).json({
      ok: true,
      userDB,
    });
  } catch (error) {
    console.log(`Error en controllers/auth.js/resendEmail: ${error}`);
    return res.status(500).json({
      ok: false,
      errorMsg: 'Por favor, hable con el admin',
    });
  }
};

/**
 * Función que cambia la contraseña de un usuario
 * @param {*} req
 * @param {*} res
 */
const changePass = async (req, res = response) => {
  let userSaved = {};
  try {
    // Buscamos el token en la base de datos
    const tokenDB = await TokenEmail.findOne(
      { token: req.token },
      {},
      { sort: { created_at: -1 } }
    );
    if (!tokenDB) {
      return res.status(401).json({
        ok: false,
        errorMsg:
          'No verificado, token no encontrado, intente reenviar código de activación',
      });
    }

    // Buscamos el usuario del token al que hay que cambiar la contraseña
    const user = await User.findOne({ _id: tokenDB._userId });

    // Encriptamos la nueva contraseña
    const salt = bcrypt.genSaltSync();
    user.password = bcrypt.hashSync(req.body.password, salt);
    userSaved = await user.save();
    userSaved.password = ':D';
    // Borramos el token para que no se pueda volver a usar
    await tokenDB.deleteOne();
    // Generar JWT
    const token = await generarJWT(user.id, user.name);

    res.status(201).json({
      ok: true,
      userSaved,
      token,
    });
  } catch (error) {
    console.log(`Error en controllers/auth.js/ChangePass: ${error}`);
    return res.status(500).json({
      ok: false,
      errorMsg: 'Por favor, hable con el admin',
    });
  }
};

module.exports = {
  changePass,
  login,
  newUser,
  renewToken,
  resendEmail,
  sendEmailChangePass,
  validateEmail,
};
