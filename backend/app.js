require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
// const app = express();
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const projectRoutes = require('./routes/projectRoutes');

// const { createServer } = require('node:http'); // same thing const http = require('http');

const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

io.on('connection',(socket)=>{
    console.log('New client connected',socket.id);

    socket.on('joinRoom',({roomId})=>{
        socket.join(roomId);
        console.log(`User joined room : ${roomId}`);
    })
});


const PORT = process.env.PORT || 8000;
// Connect to DB
connectDB();
console.log(process.env.PORT);
console.log(process.env.MONGO_URI);

app.use(cors());
app.use(express.json()); 

app.use(express.urlencoded({extended:true}));
// app.use();

app.get('/Home',(req,res)=>{
    res.send('Hy HOME');
});

app.use('/freelancer/users', userRoutes);
app.use('/project',projectRoutes);

app.listen(PORT,()=>{
    console.log('listening to PORT http://localhost:8000');
});