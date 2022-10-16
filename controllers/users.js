const { NODE_ENV, JWT_SECRET } = process.env;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const NotFound = require('../errors/NotFound');
const BadRequest = require('../errors/BadRequest');
const Conflict = require('../errors/Conflict');
const User = require('../models/user');

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      // создадим токен
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET : 'some-secret-key', { expiresIn: '7d' });

      // вернём токен
      res.send({ token });
    })
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail(() => {
      throw new NotFound('Пользователь не найден');
    })
    .then((user) => {
      res.send({ name: user.name, email: user.email });
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequest('Нерпавильный запрос'));
      } else {
        next(error);
      }
    });
};

const createUser = (req, res, next) => {
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      email: req.body.email,
      password: hash, // записываем хеш в базу
      name: req.body.name,
    }))
    .then((user) => {
      const data = {
        email: user.email,
        name: user.name,
        _id: user._id,
      };
      res.status(201).send(data);
    })
    .catch((error) => {
      if (error.code === 11000) {
        next(new Conflict('Такой пользователь уже существует'));
      } else if (error.name === 'ValidationError') {
        next(new BadRequest('Некорректные данные для создании пользователя'));
      } else {
        next(error);
      }
    });
};

const editUser = (req, res, next) => {
  const { name, email } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true })
    .orFail(() => {
      throw new NotFound();
    })
    .then((user) => res.send({ name: user.name, email: user.email }))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        next(new BadRequest('Некорректные данные редактирования пользователя'));
      } else {
        next(error);
      }
    });
};

module.exports = {
  login, getUserInfo, createUser, editUser,
};
