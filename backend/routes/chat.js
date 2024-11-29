const express = require("express");
const Chat = require("../models/Chat");
const router = express.Router();

//POST
router.post("/add", async (req, res) => {
  const { chatid, sender, message } = req.body;

  try {
    let chat = await Chat.findOne({ chatid });

    if (!chat) {
      chat = new Chat({ chatid, chats: [{ sender, message }] });
    } else {
      chat.chats.push({ sender, message });
    }

    const savedChat = await chat.save();
    res.status(201).json(savedChat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//GET
router.get("/:chatid", async (req, res) => {
  const { chatid } = req.params;

  try {
    const chat = await Chat.findOne({ chatid }).populate(
      "chats.sender",
      "username email"
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json(chat);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


//DELETE
// Route to clear all messages in a chat
router.delete("/:chatid/chats/clear", async (req, res) => {
  const { chatid } = req.params;

  try {
    // Find the chat by chatid and clear the chats array
    const chat = await Chat.findOneAndUpdate(
      { chatid },
      { $set: { chats: [] } }, // Clear the chats array
      { new: true }
    );

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res.status(200).json({ message: "All messages cleared", chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
