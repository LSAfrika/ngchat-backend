const mongoose= require('mongoose')

exports.messagesmodel = mongoose.model(
  "message",
  new mongoose.Schema(
    {
      message: { type: String, required: true},
   
      sender:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'USER'},
      // to:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'USER'},
      viewed:{type:Boolean,required:true,default:false},
      deletechat:[{type:mongoose.Schema.Types.ObjectId}]
    

    },
    { timestamps: true }
  )
);
