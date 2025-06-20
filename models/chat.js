// models/chat.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({
  title: { type: String, required: true },
  startedAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
  messages: [{ type: Schema.Types.ObjectId, ref: 'Message' }]
});

module.exports = mongoose.model('Chat', chatSchema);
