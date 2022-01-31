const router = require('express').Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.post('/register', async (req, res) => {
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist)
        return res.status(400).json("Email Already Exists");

    const hashPassword = await bcrypt.hash(req.body.password, 10);

    const newUser = new User({
        email: req.body.email,
        password: hashPassword
    });
    const newUserData = await newUser.save();
    return res.status(200).json(newUserData);
});

router.post('/login', async (req, res) => {
    const userData = await User.findOne({ email: req.body.email });
    if (!userData)
        return res.status(400).json("Email doesn't exist");

    const validPassword = await bcrypt.compare(req.body.password, userData.password);
    if (!validPassword)
        return res.status(400).json("Invalid Password");

    const userToken = jwt.sign({ email: userData.email }, process.env.JWT_SECRET_KEY);
    return res.header('auth', userToken).json({ userToken: userToken, user: userData });
});

const validateUser = (req, res, next) => {
    const token = req.header('auth');
    req.token = token;
    next();
}

router.get('/getUsers', validateUser, async (req, res) => {
    jwt.verify(req.token, process.env.JWT_SECRET_KEY, async (err, data) => {
        if (err)
            return res.status(400).json("Not a valid token - unauthenticated user");
        const usersData = await User.find().select(['-password']);
        return res.status(200).json(usersData);
    })
});

module.exports = router;
