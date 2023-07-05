const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers} = require('./utils/users');


const app= express();
const server = http.createServer(app);
const io =socketio(server);
//static
app.use(express.static(path.join(__dirname,'public')));
const botname='ChatEase Bot';
//run when client connects
io.on('connection',socket=>{

    socket.on('joinRoom',({username,room})=>{

        const user= userJoin(socket.id,username,room);
        socket.join(user.room);

        socket.emit('message',formatMessage(botname,'Welcome to Chatease!'));

        socket.broadcast.to(user.room).emit('message',formatMessage(botname,`${user.username} has joined`));
        //send user and room info

        io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
    });
  
  
   
    socket.on('chatMessage',msg=>{
        const user = getCurrentUser(socket.id);
       io.to(user.room).emit('message',formatMessage(user.username,msg));
        
        });

        socket.on('disconnect',()=>{

            const user = userLeave(socket.id);
            if(user){

                io.to(user.room).emit('message',formatMessage(botname,`${user.username} has left the chat`));


                io.to(user.room).emit('roomUsers',{
                    room:user.room,
                    users:getRoomUsers(user.room)
                });


            }

    
        });
    

});


const PORT= 3000 || process.env.PORT;

server.listen(PORT,()=> console.log(`server is running on port ${PORT}`));