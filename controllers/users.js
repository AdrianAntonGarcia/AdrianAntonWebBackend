const User = require('../models/User');
const { response, request } = require('express');
/**
 *
 * @param {*} req
 * @param {*} res
 */
const getUsers = async (req = request, res = response) => {
  try {
    const users = await User.find();
    res.json({
      ok: true,
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: 'Hable con el administrador',
    });
  }
};

module.exports = {
  getUsers,
};
