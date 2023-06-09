
const {messagesmodel,userchatsmodel} = require('../models/messages.model')
const{usermodel}=require('../models/user.model')
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
require('dotenv').config()

exports.fetchallchats=async(req,res)=>{

   try{
    let userschats=[]
    let chatcounter=0
    const {userid}=req.body
    const alluserchats = await userchatsmodel.find({chatparticipants:{$all:[userid],$size:2}}).sort({chatupdate:-1}).select('chatupdate unreadcounter chatparticipants lastmessage ')
    .populate({path:'chatparticipants',select:'profileimg username chatupdate'})

   

const filterchatlist= alluserchats.map((user)=>{
  
const indexofcurentchatlistowner_unread=user.unreadcounter.map(u=>u.userid).indexOf(userid)
const indexofcurentchatlistowner_participants=user.chatparticipants.map(u=>u._id.toString()).indexOf(userid)
// console.log('user index',indexofcurentchatlistowner);
if(indexofcurentchatlistowner_unread ==0) user.unreadcounter.splice(1,1)
if(indexofcurentchatlistowner_unread ==1) user.unreadcounter.splice(0,1)
if(indexofcurentchatlistowner_participants ==0) user.chatparticipants.splice(0,1)
if(indexofcurentchatlistowner_participants ==1) user.chatparticipants.splice(1,1)

return user


})
console.log('all user chats: ',filterchatlist);
return res.send(alluserchats)



   

   }
    catch (error) {

      console.log('fetching user chats list error:\n',error)
        return res.status(500).send({errormessage:error.message,servermessage:'an error occured'})


    }

}

exports.resetunreadchatcounter=async(req,res)=>{
  try {
    let readcounter=0
    const {userid}=req.body
    const chatparticipantid=req.params.id

    const unreadmessages = await messagesmodel.find({
      chatparticipants:{$all:[userid,chatparticipantid],$size:2},
      from:{$ne:userid},viewed:false
    })

    const userchat=  await userchatsmodel.findOne({chatparticipants:{$all:[userid,chatparticipantid],$size:2}})
    const user_index=userchat.unreadcounter.map(user=>user.userid).indexOf(userid)

    if(userchat !=null){

      userchat.unreadcounter[user_index].count=0
            await userchat.save()
  }      
    
    if(unreadmessages.length==0) return res.send({message:'all messages read'})

    unreadmessages.forEach(async(message) => {

      message.viewed=true
      await message.save()
      readcounter++
      if(readcounter>=unreadmessages.length){
        const userchat=  await userchatsmodel.findOne({chatparticipants:{$all:[userid,chatparticipantid],$size:2}})
        console.log('user chat model',userchat);
        console.log('user chat model unread counter',userchat.unreadcounter);
    
        res.send({message:'all messages viewed and chat model updated'})
      }
      // console.log('current message itteration: ',message);
      
    });
    // res.send({userid,chatparticipantid,unreadmessages})
  } catch (error) {
    console.log('error from reset of message counter',error.message);
    res.send({errmessage:error.message})
  }
}
exports.fetchsinglechat=async(req,res)=>{

  try{
    const {userid}=req.body
    const {chatingwith}=req.params
    const alluserchats = await messagesmodel.find({chatparticipants:{$all:[userid,chatingwith],$size:2}}).select('message from viewed createdAt ')
    // .populate({path:'chatparticipants',select:'profileimg username chatupdate'})

    if(alluserchats.length==0) return res.send(alluserchats)
//  console.log('current chatters',alluserchats);
//  alluserchats.forEach((user)=>{
  
//   const loggedinuserindex=user.chatparticipants.map(chatter=>chatter._id.toString()).indexOf(userid)
//   // console.log('user index: ',loggedinuserindex)
//   user.chatparticipants.splice(loggedinuserindex,1)
// })

// console.log('current user ',userid);

    res.send({chats:alluserchats})

   }
    catch (error) {

      console.log('fetching user chats error:\n',error)
        return res.status(500).send({errormessage:error.message,servermessage:'an error occured'})


    }

}

exports.updateviewedchats=async(req,res)=>{

  try{

  }
   catch (error) {

     console.log('registering new user error:\n',error)
       return res.status(500).send({errormessage:error.message,servermessage:'an error occured'})


   }

}

exports.deletechat=async(req,res)=>{

  try{

  }
   catch (error) {

     console.log('registering new user error:\n',error)
       return res.status(500).send({errormessage:error.message,servermessage:'an error occured'})


   }

}

exports.unreadcounter=async(req,res)=>{

  try{

  }
   catch (error) {

     console.log('registering new user error:\n',error)
       return res.status(500).send({errormessage:error.message,servermessage:'an error occured'})


   }

}
