const mongoose= require('mongoose')


exports.usermessagesmodel=mongoose.model(
  'usermessagelist',
new mongoose.Schema({
  _id:{type:mongoose.Schema.Types.ObjectId,required:true},
  userchats:[{
    chatid:{type:String,required:true},
    chatingwith:{type:mongoose.Schema.Types.ObjectId,required:true,ref:"user"},
    lastmessage:{type:String,required:true},
    timestamp:{type:Number,required:true,default:Date.now()},
    unreadcounter:{type:Number,required:true,default:0}
  }]

}))
