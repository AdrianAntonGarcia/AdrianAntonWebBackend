const jwt = require('jsonwebtoken');

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
