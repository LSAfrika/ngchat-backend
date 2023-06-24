const mongoose= require('mongoose')

exports.messagesmodel = mongoose.model(
  "message",
  new mongoose.Schema(
    {
      message: { type: String, required: true},
   
      from:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'USER'},

      viewed:{type:Boolean,required:true,default:false},
      deletechat:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
      chatparticipants:[{type:mongoose.Schema.Types.ObjectId,required:true,ref:'user'}],
      isGroupchat:{type:Boolean,default:false}
    

    },
    { timestamps: true }
  )
);


exports.userchatsmodel = mongoose.model(
  "userchats",
  new mongoose.Schema(
    {
     
      chatupdate:{type:Number,required:true,default:Date.now()},
      chatparticipants:[{type:mongoose.Schema.Types.ObjectId,required:true,ref:'user'}],
      userdelete:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}],
      lastmessage:{type:String,required:true},
      unreadcounter:{type:Number,required:true,default:0}

    },
    { timestamps: true }
  )
);