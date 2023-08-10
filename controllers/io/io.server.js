const {usermodel}=require('../../models/user.model')

const{disconnect,login,logout}=require('./io.conection')
const{messagereceived,sendmessage}=require('./io.messaging')
// const{disconnect}=require('./')
// const {disconnect}=require('./io.server')

module.exports = (server)=> {

  let onlineusers=[]

  async function newusermiddlware(socket,next){

    if (socket.handshake.query && socket.handshake.query.uid){
        // console.log('handshake: \n',socket.handshake.query.uid);
      //   console.log('current uid', socket.handshake.query.uid);
          if (socket.handshake.query.uid===undefined ||socket.handshake.query.uid===''){
              console.log('missing uid');
              return next(new Error('Authentication error'));

          }
        const useronline=  await usermodel.findById(socket.handshake.query.uid)
        useronline.online=true
        await useronline.save()

          // const newuserlist=    onlineusers.filter(user=>user.uid!==socket.handshake.query.uid)
          indexofconnectingsocket=onlineusers.map(user=>user.uid).indexOf(socket.handshake.query.uid)
          if(indexofconnectingsocket !=-1)onlineusers.splice(indexofconnectingsocket,1)
          // onlineusers=newuserlist
          const onlineuser={soketid:socket.id,uid:socket.handshake.query.uid}
          onlineusers.push(onlineuser)

        
          //  console.log('current online user(s):\n',onlineusers);
          next();

      }
      else {

          console.log(socket);
        next(new Error('no unique user'));
      }
    }


  const io = require("socket.io")(server,{ cors:{origin:['http://localhost:4200']}});






  io.use(newusermiddlware).on("connection", async(socket) => {

    console.log('global online users:',onlineusers);
    sendmessage(socket,onlineusers)
    disconnect(socket,onlineusers) 
    
    logout(socket,onlineusers)
    
    login(socket,onlineusers)
    messagereceived(socket,onlineusers)
    //sernotifications(socket)


  });


 




}


