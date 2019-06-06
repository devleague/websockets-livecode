const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const bodyParser = require('body-parser');

const PORT = 8080;
const onlineUsers = {};

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/message', (req, res) => {});

// websocket connection
io.on('connection', (socket) => {
  console.log('a connection was made');

  // user identification
  socket.on('identification', (msg) => {
    console.log('ident', msg);

    // add socket to onlineUsers object
    onlineUsers[msg.id] = socket;
    socket.user = msg;

    // send back identification verification
    socket.emit('verified', true);
    io.emit('online', msg.id);
  });

  // disconnect event
  socket.on('disconnect', () => {
    const { user } = socket;

    if (user && user.id) {
      delete onlineUsers[user.id];
      io.emit('offline', user.id);
    }

    console.log('a user disconnected');
  });

  // user chat message
  socket.on('chat', (msg) => {
    console.log('chat message:', msg);
    // this is where you would save to a DB

    // then emit out to other chat members
    const intendedUser = onlineUsers[msg.to];

    if (intendedUser) {
      intendedUser.emit('chat', msg);
    }
  });

  // list of users
  socket.on('users', () => {
    socket.emit('users', Object.keys(onlineUsers));
  });
});

http.listen(PORT, () => {
  console.log(`Server started on PORT: ${PORT}`);
});
