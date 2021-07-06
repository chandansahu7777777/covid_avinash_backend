const express = require("express");
const router = express.Router();

// User Route Point
const user = require('../routes/userRoute')



router.use('/user', user)


module.exports = router;
