const express = require('express');
const router = express.Router();
const user = require('../middlewares/user');

router.post('/kakaoLogin',user.kakaoLogin);

module.exports = router;