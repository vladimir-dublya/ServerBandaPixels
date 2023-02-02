const jwt = require('jsonwebtoken');
const { secret } = require('../config');
const User = require('../models/User');
const Token = require('../models/Token');

module.exports = async function (req, res, next) {
  if (req.method === 'OPTIONS') {
    next();
  }

  try {
    const token = req.cookies.access_token;
    if (!token) {
      return res
        .status(403)
        .json({ message: 'You must be loggining in to continue' });
    }
    const decodedData = jwt.verify(token, secret);
    const { id } = decodedData;
    const user = await User.findOne({ id });
    const tokenFromDB = await Token.findOne({ user: user._id });
    if (tokenFromDB !== null) {
      req.user = decodedData;
      next();
    }
  } catch (error) {
    console.log(error);
    return res
      .status(403)
      .json({ message: 'You must be loggining in to continue' });
  }
};
