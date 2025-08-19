require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// const app = express();
const Razorpay = require('razorpay'); //  1. Import Razorpay
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');
const messageRoutes = require('./routes/messagesRoutes')
const paymentRoutes = require('./routes/paymentroutes')

const Message = require('./models/Message')
// const { createServer } = require('node:http'); // same thing const http = require('http');

const http = require('http');
const { Server } = require('socket.io');

const app = express();




const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: 'http://localhost:5173',
    credentials: true
  }
});


// socket.io    
io.on('connection',(socket)=>{
    console.log('New client connected',socket.id);

    socket.on('joinRoom',({roomId})=>{
        socket.join(roomId);
        console.log(`User joined room : ${roomId}`);
    })


    socket.on('sendMessage', async ({ roomid, content, sender, receiver }) => {
    const messageData = { roomid, content, sender, receiver, timestamp: new Date() };

    // Emit real-time
    io.to(roomid).emit('receiveMessage', messageData);

    // Save to DB
    try {
        const newMessage = new Message(messageData);   // Use correct model name here
        await newMessage.save();
    } catch (err) {
        console.error('Failed to save message:', err);
    }
    });


    socket.on('disconnect', () => {
        console.log(' A user disconnected:', socket.id);
    });
});


const PORT = process.env.PORT || 8000;
// Connect to DB
connectDB();
// just i am checking that is env working or not///



/// 
// middlewares for allowing urls from frontend and 
app.use(cors(
    {
    origin : 'http://localhost:5173',

    }
));
// to detect the json response from frontend
app.use(express.json()); 
// if frontend return some submitted form than to get that response
app.use(express.urlencoded({extended:true}));

// just for the testing that is backend on or not otherwise frontend will not go ahead in most files
// example login sign up first checks if backend started ?
app.get('/health',(req,res)=>{
    res.send('Hy HOME');
});

//routes that will redirect to my routes i have defined in routes
app.use('/freelancer/users', userRoutes);
app.use('/project',projectRoutes);
app.use('/messages', messageRoutes);
app.use('/payment', paymentRoutes);

// default port i gave in env is 8000
server.listen(PORT,()=>{
    console.log(`Backend running on port ${PORT}`);
});
