const {usermodel}=require('../models/user.model')
// const{disconnect}=require('./')
// const {disconnect}=require('./io.server')

module.exports = async(server)=> {


  async function newusermiddlware(socket,next){

    if (socket.handshake.query && socket.handshake.query.uid){
        console.log('handshake: \n',socket.handshake.query.uid);
      //   console.log('current uid', socket.handshake.query.uid);
          if (socket.handshake.query.uid===undefined ||socket.handshake.query.uid===''){
              console.log('missing uid');
              return next(new Error('Authentication error'));

          }
        const useronline=  await usermodel.findById(socket.handshake.query.uid)
        useronline.online=true
        await useronline.save()

          const newuserlist=    onlineusers.filter(user=>user.uid!==socket.handshake.query.uid)
          onlineusers=newuserlist
          const onlineuser={soketid:socket.id,uid:socket.handshake.query.uid}
          onlineusers.push(onlineuser)
          console.log(onlineusers);
          next();

      }
      else {

          console.log(socket);
        next(new Error('no unique user'));
      }
    }

  let onlineusers=[]

  const io = require("socket.io")(server,{cors:{origin:['http://localhost:4200']}});


//



  io.use(newusermiddlware).on("connection", async(socket) => {

    // console.log('new connection from ',socket.handshake.query.uid);

sendmessage(socket)

usernotifications(socket)
disconnect(socket,onlineusers) 

logout(socket)





  });


 

const useroniline=(socket)=>{

}
  const sendmessage=(socket)=>{

  }

  const usernotifications=(socket)=>{

  }


  const disconnect =(socket,onlineusers)=>{
  
    socket.on("disconnect", async(reason) => {
      console.log('user disconnected:',reason);
      const indexlogedofuser= onlineusers.map(user=>user.soketid).indexOf(socket.id)
  
  
      console.log('index of leaving user:',indexlogedofuser);
      const useroffline=  await usermodel.findById(onlineusers[indexlogedofuser].uid)
      useroffline.online=false
      useroffline.lastseen=Date.now()
      await useroffline.save()
  
      onlineusers.splice(indexlogedofuser,1)
      console.log('current users:',onlineusers);
      return socket.emit('logged_off',{user:useroffline})
    });
  
  }

  const logout =(socket)=>{
    socket.on('logout',(message)=>{
      console.log('user has logedout:\n',message);

      socket.emit('logoutresponse',{message:'user has loged out'})
    // console.log(onlineusers)
    })
  }
}

