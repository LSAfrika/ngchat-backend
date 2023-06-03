const mongoose= require('mongoose')


// const userschema = new 

exports.usermodel = mongoose.model('user',mongoose.Schema({

    email:{type:String,required:true},
    username:{type:String,required:true},
    password:{type:String },
    firebaseuniqueid:{type:String},
    profileimg:{type:String,required:true,default:'http://localhost:3000/default/profile.png' },
     status:{type:String,required:true,default:'hello there am using NG Chat'},
    online:{type:Boolean,required:true,default:true},
    lastseen:{type:Number,required:true,default:Date.now()}

},{timestamps:true}

))
