const express= require('express')
const app=express()
const socketserve = require("http").createServer(app);
const cors=require('cors')
const mongoose = require('mongoose')
const expressuploader=require('express-fileupload')

const LocalDBconnection =`mongodb://localhost:27017/ngchat`
const PORT=process.env.PORT || 3000

app.use(cors('*'))
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));
app.use(expressuploader())

app.get('/',async(req,res)=>{

    res.send({message:'root route working'})
})

app.use('/user',require('./routes/user.routes'))
app.use('/chat',require('./routes/messages.routes'))




// mongoose.connect(LocalDBconnection,{useNewUrlParser:true,useunifiedtopology:true}).
// then(()=>{
//     console.log('connected succesfully')

//     const server=app.listen(3000,()=>{
//         console.log('app listening on port ',server.address().port);
//     })
// }).catch(err=>console.log(err))


const entry=async()=>{

  try {
console.log('app entry point');
    await mongoose.connect(LocalDBconnection, { useNewUrlParser: true,useunifiedtopology: true})
    await socketserve.listen(PORT)
    require('./controllers/io/io.server')(socketserve)
    console.log(`SERVER RUNNING ONN PORT ${PORT}`);

  } catch (error) {
    console.log(error.message);
  }

}

entry()
