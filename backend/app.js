require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const userRoutes = require('./routes/userRoutes')

app.use(cors());
app.use(express.json());
async function main(){
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}
main().then((result) => {
    console.log('mongoose connected');
}).catch((err) => {
    console.log('error connecting mongoose');
});
// app.use(express.urlencoded({extended:true}));
// app.use();

let PORT = process.env.PORT || 8000;
app.get('/Home',(req,res)=>{
    res.send('Hy HOME');
})

app.use('/api/users', userRoutes);

app.listen(PORT,()=>{
    console.log('listening to PORT http://localhost:8000');
});