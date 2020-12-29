const express = require('express');
const socketio = require('socket.io');
const http = require('http');
const {addUser, removeUser, getUser, getUsersInRoom} = require('./users');

const PORT = process.env.PORT || 5000;

const router = require('./router');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        orgin :"http://localhost:5000",
        credentials: true
    }
});

io.on('connection', (socket) => {
    console.log('a new connection');

    socket.on('join',({name, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, name, room});
        if(error) return callback(error);
        console.log(user);
        socket.emit('message', {user:'admin', text:`${user.name}, Welcome to the ${user.room}`})

        socket.broadcast.to(user.room).emit('message', {user: 'admin', text:`${user.name} has joined`});
        
        socket.join(user.room);

        io.to(user.room).emit('roomData',{room: user.room, users: getUsersInRoom(user.room)});

        callback();
    });

    socket.on('sendMessage', (message, callback)=>{
        console.log(socket.id);
        const user = getUser(socket.id);
        console.log(user);
        io.to(user.room).emit('message', {user:user.name, text:message});
        callback();
    });

    socket.on('disconnect', ()=>{
        const user =removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message',{user:'admin', text:`${user.name} has left`})
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    });
});

app.use(router);

server.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});