const mongoose= require('mongoose')

exports.messagesmodel = mongoose.model(
  "message",
  new mongoose.Schema(
    {
      message: { type: String, required: true},
     chatid:{type:String,required:true},
    //  from_to:{type:String,required:true},
      from:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'USER'},
      to:{type:mongoose.Schema.Types.ObjectId,required:true,ref:'USER'},
      viewed:{type:Boolean,required:true,default:false},
      deletechat:[{type:mongoose.Schema.Types.ObjectId}]
      // deletechat:[]
      // edited:{type:Boolean,required:true,default:false},

    },
    { timestamps: true }
  )
);
