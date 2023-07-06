
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

    if(alluserchats.length==0) return res.send(alluserchats)

 alluserchats.forEach(async(user)=>{
  
// console.log(chatcounter);

console.log('counter',chatcounter,'\n lenght',alluserchats.length);
  const usersinchat=user.chatparticipants.map(chatter=>chatter._id.toString())
  // console.log('current users in chat',usersinchat);

  const unreadcounter = await messagesmodel.find({chatparticipants:{$all:[...usersinchat],$size:2},from:{$ne:userid},viewed:false}).count()
  // console.log('total chats',unreadcounter);
user.unreadcounter=unreadcounter

const loggedinuserindex=user.chatparticipants.map(chatter=>chatter._id.toString()).indexOf(userid)
  // console.log('user index: ',loggedinuserindex)
  
  user.chatparticipants.splice(loggedinuserindex,1)
  // console.log('update unread counter \n',user)

 userschats.push(user)

 chatcounter++
 if(chatcounter>=alluserchats.length) {  res.send({chats:userschats})}


})




   

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

    const unreadmessages = await messagesmodel.find({chatparticipants:{$all:[userid,chatparticipantid],$size:2},from:{$ne:userid},viewed:false})

    if(unreadmessages.length==0) return res.send({message:'all messages read'})

    unreadmessages.forEach(async(message) => {

      message.viewed=true
      await message.save()
      readcounter++
      if(readcounter>=unreadmessages.length){
res.send({message:'all messages viewed'})
      }
      // console.log('current message itteration: ',message);
      
    });
    // res.send({userid,chatparticipantid,unreadmessages})
  } catch (error) {
    
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
