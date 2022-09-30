const router = require('express').Router(); // создали роутер
const { celebrate, Joi } = require('celebrate');
const {
  getUserInfo, editUser,
} = require('../controllers/users'); // данные нужны для роутинга, поэтому импортируем их

router.get('/me', getUserInfo);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().email({ tlds: { allow: false } }),
  }),
}), editUser);

module.exports = router; // экспортировали роутер
