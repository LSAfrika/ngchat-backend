const {usermodel}=require('../../models/user.model')


exports.disconnect =(socket,onlineusers)=>{
  
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

  exports.logout =(socket,onlineusers)=>{
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

  exports.login =(socket,onlineusers)=>{
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