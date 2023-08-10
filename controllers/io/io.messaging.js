
const {messagesmodel,userchatsmodel}=require('../../models/messages.model')

exports.sendmessage=(socket,onlineusers)=>{
   try {
    console.log('sendmessage function online users',onlineusers);
   
    socket.on('message-sent',async(message,response)=>{
 
    console.log('sendmessage function online users in socket instance',onlineusers);
    // console.log('current socket emitter',socket);
     try {
       
       const userindex=onlineusers.map(user=>user.uid).indexOf(message.to)
       if(userindex !=-1){
        console.log('current message being sent online:',message);
       

         const onlineuser=onlineusers[userindex].soketid
 
        // console.log('user to receive chat: ',onlineusers[userindex]);
         // const onlineuserdbrecord=onlineusers[userindex].uid
 
         const finduserchat=await userchatsmodel.findOne({chatparticipants:{$all:[message.from,message.to],$size:2}})
 
        // console.log('user chat list:',finduserchat);
 
 
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
             unreadcounter:[{userid:message.from,count:0},{userid:message.to,count:1}],
             userdelete:[]
 
           })
         }
 
       if(finduserchat!=null) {
       //  console.log('message to save before',finduserchat);
 
         finduserchat.chatupdate=Date.now();
         finduserchat.lastmessage=createnewmessage.message;
         const fromid_index=finduserchat.unreadcounter.map(user=>user.userid).indexOf(message.from)
         const toid_index=finduserchat.unreadcounter.map(user=>user.userid).indexOf(message.to)
 
         finduserchat.unreadcounter[fromid_index].count=0
         finduserchat.unreadcounter[toid_index].count=finduserchat.unreadcounter[toid_index].count+1
         // console.log('message to save',finduserchat);
         finduserchat.userdelete=[]
         await finduserchat.save()
        }
 
         console.log('user to send message to',onlineusers[userindex]);
         // console.log('saved message',createnewmessage);
 
         const messagepayload={
           from:createnewmessage.from,
           message:createnewmessage.message,
           createdAt:createnewmessage.createdAt,
           viewed:createnewmessage.viewed,
           _id:createnewmessage._id
 
         }
    
 
       // response({sent:messagepayload})
      
 
       const senderuserschatslist = await userchatsmodel.find({
         chatparticipants:{$all:[message.from],$size:2},userdelete:{$nin:[message.from]}}).sort({chatupdate:-1}).select('chatupdate unreadcounter chatparticipants lastmessage ')
       .populate({path:'chatparticipants',select:'_id profileimg username  online lastseen status'})
 
 
      //  console.log('sender chat participants:',senderuserschatslist)
 
 
       const receiveruserschatslist = await userchatsmodel.find({
         chatparticipants:{$all:[message.to],$size:2},userdelete:{$nin:[message.to]}}).sort({chatupdate:-1}).select('chatupdate unreadcounter chatparticipants lastmessage ')
       .populate({path:'chatparticipants',select:'_id profileimg username  online lastseen status'})
 
   // console.log('current user chat list: \n',updateduserchats);
   receiveruserschatslist.forEach((user)=>{
   
         
       
         
         const currentuserindexchatparticipantarray=user.chatparticipants.map(chatter=>chatter._id.toString()).indexOf(message.to)
         const senderindexunreadcounterarray=user.unreadcounter.map(chatter=>chatter.userid).indexOf(message.from)
       // console.log('recepient unread counter position');
           
           user.chatparticipants.splice(currentuserindexchatparticipantarray,1)
            user.unreadcounter.splice(senderindexunreadcounterarray,1)
         
 
         
         
         
         })
 
   senderuserschatslist.forEach((user) => {
     const currentuserindexchatparticipantarray = user.chatparticipants
       .map((chatter) => chatter._id.toString())
       .indexOf(message.from);
     const senderindexunreadcounterarray = user.unreadcounter
       .map((chatter) => chatter.userid)
       .indexOf(message.to);
     // console.log('recepient unread counter position');
 
     user.chatparticipants.splice(currentuserindexchatparticipantarray, 1);
     user.unreadcounter.splice(senderindexunreadcounterarray, 1);
   });
 
     //  console.log('current user in array',onlineusers);
     response({sent:messagepayload,userchats:senderuserschatslist})
       
 
         socket.to(onlineuser).emit('message-received',messagepayload)
         return  await socket.to(onlineuser).emit('chatlist-update',{message:'message sent',receiveruserschatslist})
          
       }
 
       else{
 
        console.log('current message being sent offline',message);
 
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
         userdelete:[],        
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
 finduserchat.userdelete=[]
         await finduserchat.save()
       }
 
 
       const messagesenderchatlist= await userchatsmodel.find({chatparticipants:{$all:[message.from],$size:2},userdelete:{$nin:[message.from]}}).sort({chatupdate:-1}).select('chatupdate unreadcounter chatparticipants lastmessage ')
       .populate({path:'chatparticipants',select:'profileimg username chatupdate  online lastseen status'})
       const messagepayload={
         from:createnewmessage.from,
         message:createnewmessage.message,
         createdAt:createnewmessage.createdAt,
         viewed:createnewmessage.viewed,
         _id:createnewmessage._id
       }
 
       messagesenderchatlist.forEach(chat=>{
     const  participantindex=  chat.chatparticipants.map(p=>p._id.toString()).indexOf(message.from)
     const  unreadcounterindex=  chat.unreadcounter.map(p=>p.userid).indexOf(message.from)
 
 
     if(participantindex !=-1) chat.chatparticipants.splice(participantindex,1)
     if(unreadcounterindex ==0) chat.unreadcounter.splice(1,1)
     if(unreadcounterindex ==1) chat.unreadcounter.splice(0,1)
     
       })
  //console.log('filtered chatlist',messagesenderchatlist);
 
     response({sent:messagepayload,userchats:messagesenderchatlist})
 
   }
 
 
     } catch (error) {
       
       console.log('sendmessage_fn error: ',error);
     }
 
    })
   } catch (error) {
    console.log('error occured triggering send message: ',error);
    
   }

  }

  exports.messagereceived=(socket,onlineusers)=>{

    try {
     console.log('messagereceived function online users',onlineusers);

      socket.on('messagereceived',async(message,response)=>{

         console.log('current emitted/received chat',message);
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
        find({
          chatparticipants:{$all:[message.to],$size:2},
          userdelete:{$nin:[message.to]}
        })
          .sort({chatupdate:-1}).
        populate({path:'chatparticipants',select:'lastseen online  profileimg status username'})


        //*   WORK ON FILTERING CURRENT USER FROM FILTERED ARRAY
    // const filterparticipantsarray=   chatlist.chatparticipants.map(participant=>{

    //   //  const indexofchatlistowner=
    //    })

    chatlist.forEach(chat=>{

     const messagerceiverindexinchatparticipants= chat.chatparticipants.map(_chat=>_chat._id.toString()).indexOf(message.to)
     if(messagerceiverindexinchatparticipants !=-1)chat.chatparticipants.splice(messagerceiverindexinchatparticipants,1)

    })

        // console.log('message found in db after being saved:\n',chatmessagetomarkasviewed);
        // console.log('user to chat list:\n',chatmessagetomarkasviewed);
        // console.log('filtered chat list:\n',chatmessagetomarkasviewed);
        console.log('online users messegaing controler ln 235:\n',onlineusers);

        const indexofmessagesender=onlineusers.map(user=>user.uid).indexOf(message.from)
// console.log('index of sender',indexofmessagesender);
        if(indexofmessagesender != -1){
          const sendersocket=onlineusers[indexofmessagesender].soketid

          // console.log('sender socket id',sendersocket);
          // socket.to(sendersocket).emit('delivered',{message:'delivered'})
          response({chatmessagetomarkasviewed,chatlist})

        }




      })
    } catch (error) {
      console.log('error occured while delivering delivery report: ',error);
    }

  }