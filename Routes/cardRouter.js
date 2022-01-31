const router = require('express').Router();
const Card = require('../models/cardModel');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    }
});

var upload = multer({ storage: storage });

const validateUser = (req, res, next) => {
    const token = req.header('auth');
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
        if (err)
            return res.status(400).json({ message: 'Access Denied', err, token });
        next();
    });
}

router.get('/getAll', async (req, res) => {
    const cardData = await Card.find();
    return res.status(200).json(cardData);
});

router.get('/getAll/:gid', validateUser, async (req, res) => {
    const cardData = await Card.find({ groupId: req.params.gid });
    return res.status(200).json(cardData);
});

router.get('/getAll/user/:email', validateUser, async (req, res) => {
    const cardData = await Card.find({ email: req.params.email });
    return res.status(200).json(cardData);
});

router.post('/create', [validateUser, upload.single('imageUrl')], async (req, res) => {
    const newGroupExist = await Card.find().and([{ name: req.body.name }, { groupId: req.body.groupId }]);

    if (newGroupExist.length !== 0)
        return res.status(400).json({ message: "Card Already Exists", data: newGroupExist });

    const newCard = new Card({
        name: req.body.name,
        dob: new Date(req.body.dob),
        imageUrl: req.file ? req.file.filename : '',
        groupId: req.body.groupId,
        email: req.body.email
    });

    const newCardData = await newCard.save();
    return res.status(200).json(newCardData);
});

router.delete('/delete/:cardId', validateUser, async (req, res) => {
    const removedDoc = await Card.deleteOne({ _id: req.params.cardId });
    return res.status(200).json(removedDoc);
});

router.delete('/deleteAll/:gid', validateUser, async (req, res) => {
    const removedDocs = await Card.deleteMany({ groupId: req.params.gid });
    return res.status(200).json(removedDocs);
});

module.exports = router;