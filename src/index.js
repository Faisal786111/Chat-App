const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
const { generateMesage, generateLocationMessage } = require("./utils/messages");
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

io.on("connection", (socket) => {
  console.log("New user connected");

  socket.on("join", ({ username, room }, callback) => {
    const { error, user } = addUser({
      id: socket.id,
      username: username,
      room: room,
    });

    if (error) {
      callback(error);
    }

    if (user && user.room) {
      socket.join(user.room);

      //It is used to send events to only one client.
      socket.emit("message", generateMesage("Admin" , "Welcome!"));
      socket.broadcast
        .to(user.room)
        .emit(
          "message",
          generateMesage("Admin",`${user.username} has joined the room.`)
        );

      io.to(user.room).emit("roomData" , {
        room : user.room,
        users : getUsersInRoom(user.room)
      })
    }

    callback();
  });

  //It is used to receive events.
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();

    const { error, user } = getUser(socket.id);

    if (error) {
      callback(error);
    }

    if (filter.isProfane(message)) {
      return callback("Profanity words are not allowed.");
    }

    if (user && user.room) {
      // It is used to send events to all clients.
      io.to(user.room).emit("message", generateMesage(user.username , message));
    }
    callback();
  });

  socket.on("sendLocation", (data, callback) => {
    const { error, user } = getUser(socket.id);

    if (error) {
      callback(error);
    }

    if (user && user.room) {
      io.to(user.room).emit(
        "locationMessage",
        generateLocationMessage(
          user.username , `https://google.com/maps?q=${data.lat},${data.lon}`
        )
      );
    }

    callback();
  });

  socket.on("disconnect", () => {
    // When the user is disconnected we cannot user socket methods
    // that's why we have to use io.emit() method to send all the connected users
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        generateMesage("Admin" , `${user.username} has left`)
      );

      io.to(user.room).emit("roomData" , {
        room : user.room,
        users : getUsersInRoom(user.room)
      })
    }
  });
});

server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
