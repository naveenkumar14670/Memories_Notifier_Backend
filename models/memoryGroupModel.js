const mongoose = require('mongoose');

const memoryGroupSchema = mongoose.Schema({
    name: { type: String, required: true },
    uid: { type: String, required: true }
});

module.exports = mongoose.model('MemoryGroup', memoryGroupSchema);