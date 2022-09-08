exports.customError = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.psqlErrors = (err, req, res, next) => {
  if (err.code === '22P02') {
    res.status(400).send({ msg: 'invalid input' });
  } else if (err.code === '23503') {
    console.log(err.detail);
    if (
      err.detail.includes('author') &&
      err.detail.includes('not present in table "users"')
    ) {
      res.status(404).send({ msg: `username not found` });
    } else if (
      err.detail.includes('article_id') &&
      err.detail.includes('not present in table "articles"')
    ) {
      res.status(404).send({ msg: `article id not found` });
    } else {
      res.status(404).send({ msg: `not found` });
    }
  } else {
    next(err);
  }
};

exports.serverError = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: 'Internal Server Error' });
};
