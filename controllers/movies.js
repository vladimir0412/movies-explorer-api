const BadRequest = require('../errors/BadRequest');
const NotFound = require('../errors/NotFound');
const Movie = require('../models/movie');
const Forbidden = require('../errors/Forbidden');

const getMovies = (req, res, next) => {
  Movie.find({ owner: req.user._id })
    .then((movie) => res.send(movie))
    .catch(next);
};

const createMovies = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
  } = req.body;

  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    thumbnail,
    movieId,
    nameRU,
    nameEN,
    owner: req.user._id,
  })
    .then((movie) => res.send(movie))
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequest('Фильм не найден.'));
      } else {
        next(error);
      }
    });
};

const deleteMovies = (req, res, next) => {
  Movie.findById(req.params.movieId)
    .orFail(() => {
      throw new NotFound('Несуществующий id фильма');
    })
    .then((movie) => {
      const owner = movie.owner.toString();
      if (req.user._id === owner) {
        Movie.deleteOne(movie)
          .then(() => {
            res.send(movie);
          })
          .catch(next);
      } else {
        throw new Forbidden('Невозможно удалить фильм');
      }
    })
    .catch((error) => {
      if (error.name === 'CastError') {
        next(new BadRequest('Фильм не найден.'));
      } else {
        next(error);
      }
    });
};

module.exports = {
  getMovies, createMovies, deleteMovies,
};
