const mongoose=require('mongoose')

exports.contactlistmodel= mongoose.model(
  "contactlist",
  new mongoose.Schema(
    {
      _id:{type:mongoose.Schema.Types.ObjectId,required:true},
   usercontacts:[{type:mongoose.Schema.Types.ObjectId,ref:'user'}]

    },
    { timestamps: true }
  )
);
