const {usermodel}=require('../models/user.model')

module.exports = (server)=> {


  async function newusermiddlware(socket,next){

       console.log('handshake: \n',socket.handshake.query);
      if (socket.handshake.query && socket.handshake.query.uid){
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



  io.use(newusermiddlware).on("connection", (socket) => {

    // console.log('new connection from ',socket.handshake.query.uid);

sendmessage(socket)

usernotifications(socket)
// disconnect(socket)







  });


  const disconnect=(socket)=>{

    socket.on("disconnect", (reason) => {
      console.log('user disconnected',reason);
    });

  }

const useroniline=(socket)=>{

}
  const sendmessage=(socket)=>{

  }

  const usernotifications=(socket)=>{

  }


}
