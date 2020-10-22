const jwt = require('jsonwebtoken');

/**
 * Función que crea un token para el usuario introducido
 * @param {*} uid id del usuario que crea el tokeb
 * @param {*} name nombre del usuario
 * @param {*} time tiempo de expiración del token
 */
const generarJWT = (uid, name, time = '2h') => {
  return new Promise((resolve, reject) => {
    const payload = { uid, name };
    jwt.sign(
      payload,
      process.env.SECRET_JWT_SEED,
      {
        expiresIn: time,
      },
      (err, token) => {
        if (err) {
          console.log(error);
          reject('No se pudo generar el token');
        }
        resolve(token);
      }
    );
  });
};

module.exports = { generarJWT };
