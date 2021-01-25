const User = require('../models/User');
const { response, request } = require('express');
/**
 *
 * @param {*} req
 * @param {*} res
 */
const getUsers = async (req = request, res = response) => {
  try {
    const { skip = 0, limit = 0 } = req.body;
    let users = await User.find().skip(skip).limit(limit);
    users = users.map((user) => {
      user.password = ':D';
      return user;
    });
    res.json({
      ok: true,
      users,
    });
  } catch (error) {
    console.error('Error en getUsers: ' + error);
    res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador',
    });
  }
};

module.exports = {
  getUsers,
};
