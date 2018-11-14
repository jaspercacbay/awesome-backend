const express = require('express');
const asyncHandler = require('express-async-handler')
const passport = require('passport');
const itemCtrl = require('../controllers/item.controller');

const router = express.Router();
module.exports = router;

router.post('/search', search);

// router.post('/login', passport.authenticate('local', { session: false }), login);
// router.get('/me', passport.authenticate('jwt', { session: false }), login);


async function search(req, res) {
  let result = await itemCtrl.search(req.body);
  res.json({ result });
  // req.body
}

async function register(req, res, next) {
  let user = await userCtrl.insert(req.body);
  user = user.toObject();
  delete user.hashedPassword;
  req.user = user;
  next()
}

function login(req, res) {
  let user = req.user;
  let token = authCtrl.generateToken(user);
  res.json({ user, token });
}
