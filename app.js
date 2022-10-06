require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const router = require('./routes/index');
const handler = require('./middlewares/handler');
const { requestLogger, errorLogger } = require('./middlewares/logger');

// Слушаем 3000 порт
const { PORT = 3000 } = process.env;

const app = express();

// подключаемся к серверу mongo
mongoose.connect(process.env.NODE_ENV === 'production' ? process.env.DB_CONN : 'mongodb://localhost:27017/moviesdb', {
  useNewUrlParser: true,
});

app.use(cors());
app.use(bodyParser.json()); // для собирания JSON-формата
app.use(bodyParser.urlencoded({ extended: true })); // для приёма веб-страниц внутри POST-запроса

app.use(express.static(path.join(__dirname, 'public')));

app.use(requestLogger);

app.use(router);

app.use(errorLogger);

app.use(errors());

app.use(handler);

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
