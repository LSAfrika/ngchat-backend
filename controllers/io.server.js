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
messagereceived(socket)


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
        if(finduserchat==null) {
          await userchatsmodel.create({
            chatparticipants:[message.from,message.to],
            lastmessage:createnewmessage.message,
            unreadcounter:[{userid:message.from,count:0},{userid:message.to,count:1}]

          })
        }

      if(finduserchat!=null) {
        console.log('message to save before',finduserchat);

        finduserchat.chatupdate=Date.now();
        finduserchat.lastmessage=createnewmessage.message;
        const fromid_index=finduserchat.unreadcounter.map(user=>user.userid).indexOf(message.from)
        const toid_index=finduserchat.unreadcounter.map(user=>user.userid).indexOf(message.to)

        finduserchat.unreadcounter[fromid_index].count=0
        finduserchat.unreadcounter[toid_index].count=finduserchat.unreadcounter[toid_index].count+1
        // console.log('message to save',finduserchat);
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
     
      const userschatslist = await userchatsmodel.find({chatparticipants:{$all:[message.to],$size:2}}).sort({chatupdate:-1}).select('chatupdate unreadcounter chatparticipants lastmessage ')
      .populate({path:'chatparticipants',select:'_id profileimg username  online lastseen status'})

  // console.log('current user chat list: \n',updateduserchats);
  userschatslist.forEach((user)=>{
  
        
      
        
        const currentuserindexchatparticipantarray=user.chatparticipants.map(chatter=>chatter._id.toString()).indexOf(message.to)
        const senderindexunreadcounterarray=user.unreadcounter.map(chatter=>chatter.userid).indexOf(message.from)
      // console.log('recepient unread counter position');
          
          user.chatparticipants.splice(currentuserindexchatparticipantarray,1)
           user.unreadcounter.splice(senderindexunreadcounterarray,1)
        

        
        
        
        })

      //  console.log('current user in array',userschatslist);

        socket.to(onlineuser).emit('message-received',messagepayload)
        return  await socket.to(onlineuser).emit('chatlist-update',{message:'message sent',userschatslist})
         
      }

      else{


      const finduserchat=await userchatsmodel.findOne({chatparticipants:{$all:[message.from,message.to],$size:2}})
      
      
      const createnewmessage=await messagesmodel.create(
        {message:message.message,
        from:message.from,
        viewed:message.viewed,
        chatparticipants:[message.from,message.to]  
      })
      if(finduserchat==null){
         await userchatsmodel.create({
        chatparticipants:[message.from,message.to],
        lastmessage:createnewmessage.message,
        
        unreadcounter:[{userid:message.from,count:0},{userid:message.to,count:1}]
      })
    }

      if(finduserchat!=null) {
        finduserchat.chatupdate=Date.now();
        finduserchat.lastmessage=createnewmessage.message;

        const fromid_index=finduserchat.unreadcounter.map(user=>user.userid).indexOf(message.from)
        const toid_index=finduserchat.unreadcounter.map(user=>user.userid).indexOf(message.to)

        finduserchat.unreadcounter[fromid_index].count=0
        finduserchat.unreadcounter[toid_index].count=finduserchat.unreadcounter[toid_index].count+1

        await finduserchat.save()
      }

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

  const messagereceived=(socket)=>{

    try {
      socket.on('messagereceived',async(message,response)=>{

         console.log('current emitted chat',message);
        const chatmessagetomarkasviewed=await messagesmodel.findById(message._id)

        if( chatmessagetomarkasviewed == null)return
        // console.log('message found in db',chatmessagetomarkasviewed);

        chatmessagetomarkasviewed.viewed=true
        await chatmessagetomarkasviewed.save()

        const chatdata= await userchatsmodel.findOne({chatparticipants:{$all:[message.to,message.from],$size:2}})
        if(chatdata){
          const messagereeiverindex=chatdata.unreadcounter.map(u=>u.userid).indexOf(message.to)
          chatdata.unreadcounter[messagereeiverindex].count=0
          await chatdata.save()

        }

        const chatlist= await userchatsmodel.
        find({chatparticipants:{$all:[message.to],$size:2}}).
        populate({path:'chatparticipants',select:'lastseen online  profileimg status username'})


        //*   WORK ON FILTERING CURRENT USER FROM FILTERED ARRAY
    const filterparticipantsarray=   chatlist.chatparticipants.map(participant=>{

      //  const indexofchatlistowner=
       })

        console.log('message found in db after being saved:\n',chatmessagetomarkasviewed);
        console.log('user to chat list:\n',chatmessagetomarkasviewed);

        const indexofmessagesender=onlineusers.map(user=>user.uid).indexOf(message.from)
console.log('index of sender',indexofmessagesender);
        if(indexofmessagesender != -1){
          const sendersocket=onlineusers[indexofmessagesender].soketid

          console.log('sender socket id',sendersocket);
          socket.to(sendersocket).emit('delivered',{message:'delivered'})
          response({chatmessagetomarkasviewed,chatlist})

        }




      })
    } catch (error) {
      console.log('error occured while delivering delivery report: ',error);
    }

  }


  const disconnect =(socket)=>{
  
    socket.on("disconnect", async(reason) => {

      try {
        console.log('user disconnected:',reason);
        console.log('current users:',onlineusers);
        console.log('current socket:',socket.id);

        //messagereceived
        const indexlogedofuser= onlineusers.map(user=>user.soketid).indexOf(socket.id)
    
        console.log('index of user disconnected',indexlogedofuser);
        if(indexlogedofuser !=-1){
          
              console.log('index of leaving user:',indexlogedofuser);
              const useroffline=  await usermodel.findById(onlineusers[indexlogedofuser].uid)
              useroffline.online=false
              useroffline.lastseen=Date.now()
              await useroffline.save()
          
              onlineusers.splice(indexlogedofuser,1)
              console.log(`${useroffline.username}, has disconnected`,useroffline);
              console.log(`${useroffline.username}, has disconnected`);
              return socket.emit('logged_off',{user:useroffline})
            }else{

              console.log('user has logged off properly');
              return socket.emit('logged_off',{message:"user logged off"})

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
        
                // console.log('log out user update',user);
                userpayload={
                  _id:user._id,
                  profileimg:user.profileimg,
                  username:user.username,
                  lastseen:user.lastseen,
                  online:user.online
                }
            
        
                onlineusers.splice(indexlogedofuser,1)
                 console.log('current users:',onlineusers);
        
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


