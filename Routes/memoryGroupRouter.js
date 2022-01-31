const router = require('express').Router();
const MemoryGroup = require('../models/memoryGroupModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const validateUser = (req, res, next) => {
    const token = req.header('auth');
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, data) => {
        if (err)
            return res.status(400).json({ message: 'Access Denied', err, token });
        next();
    });
}

router.get('/getAll/:uid', validateUser, async (req, res) => {
    const memoryGroupsData = await MemoryGroup.find({ uid: req.params.uid });
    return res.status(200).json(memoryGroupsData);
});

router.get('/getGroupName/:gid', validateUser, async (req, res) => {
    const groupData = await MemoryGroup.findOne({ _id: req.params.gid });
    return res.status(200).json(groupData.name);
});

router.post('/create', validateUser, async (req, res) => {
    const newGroupExist = await MemoryGroup.find().and([{ name: req.body.name }, { uid: req.body.uid }]);

    if (newGroupExist.length !== 0)
        return res.status(400).json({ message: "Group Name Already Exists", data: newGroupExist });

    const newMemoryGroup = new MemoryGroup({
        name: req.body.name,
        uid: req.body.uid
    });

    const newMemoryGroupData = await newMemoryGroup.save();
    return res.status(200).json(newMemoryGroupData);
});

router.put('/update', validateUser, async (req, res) => {
    if (req.body.name === undefined || req.body.name === '')
        return res.status(400).json("Invalid Name or Name field doesn't present");

    const doc = await MemoryGroup.findOne({ _id: req.body.groupId });
    doc.name = req.body.name;

    const updatedDoc = await doc.save();
    return res.status(200).json(updatedDoc);
});

router.delete('/delete/:gid', validateUser, async (req, res) => {
    const removedDoc = await MemoryGroup.deleteOne({ _id: req.params.gid });
    return res.status(200).json(removedDoc);
});

module.exports = router;