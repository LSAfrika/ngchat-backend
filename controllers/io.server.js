const {usermodel}=require('../models/user.model')
const {messagesmodel,userchatsmodel}=require('../models/messages.model')
// const{disconnect}=require('./')
// const {disconnect}=require('./io.server')

module.exports = (server)=> {


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

          const newuserlist=    onlineusers.filter(user=>user.uid!==socket.handshake.query.uid)
          onlineusers=newuserlist
          const onlineuser={soketid:socket.id,uid:socket.handshake.query.uid}
          onlineusers.push(onlineuser)
           console.log('current online user(s):\n',onlineusers);
          next();

      }
      else {

          console.log(socket);
        next(new Error('no unique user'));
      }
    }

  let onlineusers=[]

  const io = require("socket.io")(server,{pingTimeout:120000, cors:{origin:['http://localhost:4200']}});






  io.use(newusermiddlware).on("connection", async(socket) => {

    // console.log('new connection from ',socket.handshake.query.uid);

sendmessage(socket)

// usernotifications(socket)
 disconnect(socket) 

logout(socket)

login(socket)



  });


 

const useroniline=(socket)=>{

}
  const sendmessage=(socket)=>{
    // console.log('current socket',socket._events);
   socket.on('message-sent',async(message,response)=>{

    try {
      
      // console.log('current message',message);
      const userindex=onlineusers.map(user=>user.uid).indexOf(message.to)
      if(userindex !=-1){
        const onlineuser=onlineusers[userindex].soketid
        // const onlineuserdbrecord=onlineusers[userindex].uid

        const finduserchat=await userchatsmodel.findOne({chatparticipants:{$all:[message.from,message.to],$size:2}})

        console.log('user chat list:',finduserchat);


        const createnewmessage=await messagesmodel.create(
          {message:message.message,
          from:message.from,
          viewed:message.viewed,
          chatparticipants:[message.from,message.to]  
        })
        if(finduserchat==null) await userchatsmodel.create({chatparticipants:[message.from,message.to],lastmessage:createnewmessage.message})

      if(finduserchat!=null) {
        console.log('message to save before',finduserchat);

        finduserchat.chatupdate=Date.now();
        finduserchat.lastmessage=createnewmessage.message;
        console.log('message to save',finduserchat);
        await finduserchat.save()}

        console.log('user to send message to',onlineusers[userindex]);
        // console.log('saved message',createnewmessage);

        const messagepayload={
          from:createnewmessage.from,
          message:createnewmessage.message,
          createdAt:createnewmessage.createdAt,
          viewed:createnewmessage.viewed,
          _id:createnewmessage._id

        }
   

      response({sent:messagepayload})
      let chatcounter=0
      let userschats=[]
      const updateduserchats = await userchatsmodel.find({chatparticipants:{$all:[message.to],$size:2}}).sort({chatupdate:-1}).select('chatupdate unreadcounter chatparticipants lastmessage ')
      .populate({path:'chatparticipants',select:'profileimg username chatupdate'})

//  console.log('current user chat list: \n',updateduserchats);
      updateduserchats.forEach(async(user)=>{
  
       
        
          const unreadcounter = await messagesmodel.find({chatparticipants:{$all:[...user.chatparticipants],$size:2},from:{$ne:message.to},viewed:false}).count()
           console.log('total unread chats',unreadcounter);
         user.unreadcounter=unreadcounter
        
        console.log('unread counter per user: \n',user.unreadcounter)
        const currentuserindex=user.chatparticipants.map(chatter=>chatter._id.toString()).indexOf(message.to)
          // console.log('user index: ',currentuserindex)
          
          user.chatparticipants.splice(currentuserindex,1)
        

          // return user
           userschats.push(user)
        // // // return user
        
         chatcounter++
         if(chatcounter>=updateduserchats.length) {  
  
           await   console.log('updated chat list array :\n',userschats)
          socket.to(onlineuser).emit('message-received',messagepayload)
        return  await socket.to(onlineuser).emit('chatlist-update',{message:'message sent',userschats})

        }
        
        
        
        })

      
         
      }

      else{


      const finduserchat=await userchatsmodel.findOne({chatparticipants:{$all:[message.from,message.to],$size:2}})
      
      
      const createnewmessage=await messagesmodel.create(
        {message:message.message,
        from:message.from,
        viewed:message.viewed,
        chatparticipants:[message.from,message.to]  
      })
      if(finduserchat==null) await userchatsmodel.create({chatparticipants:[message.from,message.to],lastmessage:createnewmessage.message})

      if(finduserchat!=null) {finduserchat.chatupdate=Date.now();finduserchat.lastmessage=createnewmessage.message;await finduserchat.save()}

      const messagepayload={
        from:createnewmessage.from,
        message:createnewmessage.message,
        createdAt:createnewmessage.createdAt,
        viewed:createnewmessage.viewed,
        _id:createnewmessage._id
      }
 

    response({sent:messagepayload})

  }


    } catch (error) {
      
      console.log('sendmessage_fn error: ',error);
    }

   })

  }

  const fetchuserchatlist=async(uid)=>{

    try {
      
    } catch (error) {
      
    }

  }


  const disconnect =(socket)=>{
  
    socket.on("disconnect", async(reason) => {

      try {
        console.log('user disconnected:',reason);
        const indexlogedofuser= onlineusers.map(user=>user.soketid).indexOf(socket.id)
    
        if(indexlogedofuser !=-1){
          
              console.log('index of leaving user:',indexlogedofuser);
              const useroffline=  await usermodel.findById(onlineusers[indexlogedofuser].uid)
              useroffline.online=false
              useroffline.lastseen=Date.now()
              await useroffline.save()
          
              onlineusers.splice(indexlogedofuser,1)
              console.log(`${useroffline.username}, has disconnected`);
              return socket.emit('logged_off',{user:useroffline})
            }
  
      } catch (error) {

        console.log('error in disconnect socket',error.message);
        return socket.emit('logged_off',{errmessage:'error when user diconnrctiong'})

        
      }
 
      });
  
  }

  const logout =(socket)=>{
    socket.on('logout',async(message, logout)=>{
      try {
        const indexlogedofuser= onlineusers.map(user=>user.soketid).indexOf(socket.id)
  
        if(indexlogedofuser !=-1){

          console.log(message);
                console.log(' leaving user:',onlineusers[indexlogedofuser]);
                const user=  await usermodel.findById(onlineusers[indexlogedofuser].uid)
                user.online=false
                user.lastseen=Date.now()
                await user.save()
        
                userpayload={
                  _id:user._id,
                  profileimg:user.profileimg,
                  username:user.username,
                  lastseen:user.lastseen,
                  online:user.online
                }
            
        
                onlineusers.splice(indexlogedofuser,1)
                // console.log('current users:',onlineusers);
        
                // console.log('user has logedout:\n',message);
               logout({loggedout:true})
               socket.broadcast.emit('logoutresponse',{message:'user has loged out',user:userpayload})
        }
      } catch (error) {

        console.log('error from logout socket:',error.message);
       socket.broadcast.emit('logoutresponse',{errormessage:'error while lgout emit',err:error.message})

        
      }
    // console.log(onlineusers)
    })
  }

  const login =(socket)=>{
    socket.on('login',async(message)=>{
      try {

        const indexlogedofuser= onlineusers.map(user=>user.soketid).indexOf(socket.id)
  
  
        console.log(' joining user:',indexlogedofuser);
        if(indexlogedofuser !=-1){

          const user=  await usermodel.findById(onlineusers[indexlogedofuser].uid).select("profileimg username lastseen online")
      

         
          console.log('current user:',user.username);
  
          console.log('user has loged in:\n',message);
        
         socket.broadcast.emit('loginresponse',{message:'user has loged in',user})
        }
      } catch (error) {
        console.log('error from login socket:',error.message);
        socket.broadcast.emit('logoutresponse',{errormessage:'error while lgout emit',err:error.message})
        
      }
    // console.log(onlineusers)
    })
  }
}


