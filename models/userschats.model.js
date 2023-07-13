const mongoose= require('mongoose')


exports.userchatlistmodel=mongoose.model(
  'userchatlist',
new mongoose.Schema({
//  chatname:{type:String,required:true},
// o                                           
 users:{type:mongoose.Schema.Types.ObjectId,ref:'user'},
 latestmessage:{type:mongoose.Schema.Types.ObjectId, ref:"message"},
//  GroupAdmin:{type:mongoose.Schema.Types.ObjectId,ref:'user'}
unreadcounter:[{
  userid:{type:String,required:true},
  count:{type:Number,required:true}
}]

},{
  timestamps:true
}))
