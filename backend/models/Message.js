const mongoose = require('mongoose');
const messageschema = new mongoose.Schema({
    // roomid : {}
    sender : {type : mongoose.Schema.Types.ObjectId , ref : 'User',required : true},
    receiver : {type : mongoose.Schema.Types.ObjectId , ref : 'User',required : true},
    content : {type: String},
    timestamp : {type:Date,default:Date.now},
    seen : {type : Boolean,default:false}
})
module.exports = mongoose.model('Message',messageschema);