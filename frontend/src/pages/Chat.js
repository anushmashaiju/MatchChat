import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { io } from "socket.io-client";
import axios from "axios";
import moment from "moment"; // Import moment.js for timestamp formatting

const Chat = () => {
  const { chatid } = useParams(); // Get chatid from URL
  const { user } = useContext(AuthContext); // Get logged-in user from context
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  // Establish socket connection
  useEffect(() => {
    const newSocket = io("http://localhost:5002"); // Connect to your backend
    setSocket(newSocket);

    // Clean up on component unmount
    return () => newSocket.close();
  }, []);

  // Fetch chat history
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5002/api/chats/${chatid}`
        );
        // Filter out messages with missing sender or recipient information
        const validMessages = response.data.chats.filter(
          (msg) => msg.sender?.username && msg.message
        );
        setMessages(validMessages);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMessages();
  }, [chatid]);

  // Listen for new messages from the server
  useEffect(() => {
    if (socket) {
      socket.on("receiveMessage", (message) => {
        // Only add valid messages to the chat
        if (message.sender?.username && message.message) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });
    }
  }, [socket]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return; // Prevent sending empty messages

    const newMsg = {
      chatid,
      sender: user._id,
      message: newMessage,
      timestamp: new Date().toISOString(), // Add timestamp
    };

    // Emit the message to the server via Socket.io
    socket.emit("sendMessage", newMsg);

    // Add the message to local state to show it immediately
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: { username: user.username, _id: user._id }, message: newMessage, timestamp: newMsg.timestamp },
    ]);

    setNewMessage(""); // Clear the input field
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Chat</h1>
      <div className="bg-gray-100 p-4 rounded shadow-md mb-4" style={{ height: "400px", overflowY: "auto" }}>
        {messages.map((msg, index) => {
          const { sender, message, timestamp } = msg;
          const isCurrentUser = sender._id === user._id;

          return (
            <div key={index} className={`mb-4 ${isCurrentUser ? "text-right" : "text-left"}`}>
              <div
                className={`inline-block p-2 rounded ${
                  isCurrentUser ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
                }`}
              >
                <strong>{sender.username}</strong>: {message}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                {moment(timestamp).format("h:mm A, MMM D YYYY")}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex">
        <input
          type="text"
          className="w-full px-3 py-2 border rounded"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          className="bg-blue-500 text-white py-2 px-4 rounded ml-2"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
