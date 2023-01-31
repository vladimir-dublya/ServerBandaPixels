const User = require('./models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { secret } = require('./config');
const ping = require('ping');

let type;
const EMAIL_REGEXP =
  /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/iu;
const NUMBER_REGEXP = /^(\s*)?(\+)?([- _():=+]?\d[- _():=+]?){10,14}(\s*)?$/;

const generateAccessToken = (id) => {
  const payload = {
    id,
  };
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '10m' });
};

class authController {
  async registration(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(400)
          .json({ message: 'Invalid username or password ', errors });
      }
      const { id, password } = req.body;
      const candidate = await User.findOne({ id });
      if (candidate) {
        return res
          .status(400)
          .json({ message: 'This user is already registered' });
      }
      const hashPassword = bcrypt.hashSync(password, 7);
      if (id.match(EMAIL_REGEXP)) {
        type = 'email';
      } else if (id.match(NUMBER_REGEXP)) {
        type = 'phone';
      } else {
        return res.status(400).json({ message: 'Invalid login' });
      }
      const user = new User({ id, id_type: type, password: hashPassword });
      await user.save();
      const token = generateAccessToken(user.id);
      return res
        .cookie('access_token', token, {
          httpOnly: true,
          sameSite: "None",
        })
        .status(200)
        .json({ token });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Registration failed' });
    }
  }

  async login(req, res) {
    try {
      const { id, password } = req.body;
      const user = await User.findOne({ id });
      if (!user) {
        return res
          .status(400)
          .json({ message: `User with id ${id} not found` });
      }
      const validPassword = bcrypt.compareSync(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ message: `User or password not valid` });
      }
      const token = generateAccessToken(user.id);
      return res
        .cookie('access_token', token, {
          httpOnly: true,
          SameSite: "None",
        })
        .json({ token });
    } catch (error) {
      console.log(error);
      res.status(400).json({ message: 'Login failed' });
    }
  }

  async info(req, res) {
    try {
      const access_token = req.cookies.access_token;
      const decodedData = jwt.verify(access_token, secret);
      const user = await User.findOne({ id: decodedData.id });
      const token = generateAccessToken(user.id);
      res.cookie('access_token', token, {
        httpOnly: true, 
        sameSite: "None",
      }).json({ id: user.id, id_type: user.id_type });
    } catch (error) {
      return res.status(500).json({ message: `Cant find user` });
    }
  }

  async latency(req, res) {
    try {
      let latency = await ping.promise.probe('google.com');
      const access_token = req.cookies.access_token;
      const decodedData = jwt.verify(access_token, secret);
      const user = await User.findOne({ id: decodedData.id });
      const token = generateAccessToken(user.id);
      return res
        .cookie('access_token', token, {
          httpOnly: true,
          sameSite: "None",
        })
        .json({ latency: latency.time });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: `Something wrong...` });
    }
  }

  async logout(req, res) {
    try { 
      res.clearCookie('access_token');
    } catch (error) {
      
    }
  }
}

module.exports = new authController();
