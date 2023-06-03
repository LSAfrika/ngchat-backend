const mongoose= require('mongoose')


exports.userchatlistmodel=mongoose.model(
  'userchatlist',
new mongoose.Schema({
 chatname:{type:String,required:true},
 isGroupChat:{type:Boolean,required:true,default:false},
 users:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
 latestmessage:{type:mongoose.Schema.Types.ObjectId, ref:"message"},
 GroupAdmin:{type:mongoose.Schema.Types.ObjectId,ref:'user'}

},{
  timestamps:true
}))
