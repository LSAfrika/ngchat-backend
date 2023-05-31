
const {usermodel} = require('../models/user.model')
const bcrypt = require('bcrypt')
const JWT = require('jsonwebtoken')
require('dotenv').config()


exports.register=async(req,res)=>{

    try {
        const {email,phone,username,password,repassword}=req.body



        const finduser = await usermodel.findOne({email:email})
        if(finduser){
          return  res.status(409).send({message: 'email already exists'})
        }
        if(password!==repassword){
            return res.status(500).send('password are not similar')
        }

       const hash=await bcrypt.hash(password,10)

        console.log('hash password: ',hash);
       const newuser = new usermodel({

        email,
        phone,username,
        password:hash

    })

    const newuserresult = await newuser.save()

  const userresponse={
        id:newuserresult._id,
       email: newuserresult.email,
       phone:newuserresult.phone,
       username:newuserresult.username
    }

    res.status(200).send({message:'user created successfully',...userresponse})



       // next()
    } catch (error) {

        return res.status(500).send({errormessage:error.message,servermessage:'an error occured'})


    }

}

exports.login=async (req,res)=>{

    try {
        const {email,password}=req.body
        // console.log(email,password);
        const finduser = await usermodel.findOne({email:email})
        if(!finduser){
          return  res.status(404).send({message: 'please check email and password'})
        }
         console.log(finduser)
         const passwordcompare= await bcrypt.compare(password, finduser.password)

         if(passwordcompare!==true){

            return res.status(500).send({message:'please check email and password'})
         }

         const payload ={
             id:finduser._id,
             email:finduser.email,
             username:finduser.username,
             exp: Date.now()  + (60 * 60*1000)
         }

         console.log(payload.exp,'-',);
         console.log(Date.now())

         // create env key
       const sigintoken=  JWT.sign(payload,process.env.HASHKEY)
          res.status(200).send({sigintoken})


    } catch (error) {
        res.send(error.message)

    }


}

exports.sociallogin=async (req,res)=>{

    try {
        const {firebasetoken}=req.body
        // console.log(email,password);
      const firebaseuser=await JWT.decode(firebasetoken)
// console.log('')
      const {user_id ,email,name,picture,iss}=firebaseuser
      // console.log('received firebase user:\n',user_id ,email,name,picture,iss);

      const finduserbyemail = await usermodel.findOne({email:email})
    //   const finduseruser_id = await usermodel.findOne({firebaseuniqueid:user_id})

      // console.log('useremail in db: \n',finduserbyemail);
    //   console.log('userid in db: \n',finduseruser_id);

      if(finduserbyemail===null ){
       const newuser= await usermodel.create({email:email,firebaseuniqueid:user_id,username:name})

       const payload={
        username:newuser.username,
        email:newuser.email,
        profileimg:newuser.profileimg,
        createdAt:newuser.createdAt,
        _id:newuser._id
      }


    const token=await JWT.sign(payload,process.env.HASHKEY,{
       expiresIn: '1w' ,issuer:'http://localhost:3000'
    })

    const refreshtoken=JWT.sign({  _id:payload._id},process.env.REFRESHTOKEN,{
      expiresIn:'1m'
    })

       return res.send({message:`welcome ${name}`,token,refreshtoken})
      }

      const payload={
        username:finduserbyemail.username,
        email:finduserbyemail.email,
        profileimg:finduserbyemail.profileimg,
        createdAt:finduserbyemail.createdAt,
        status:finduserbyemail.status,
        _id:finduserbyemail._id
      }

      const token=await JWT.sign(payload,process.env.HASHKEY,{
        expiresIn: '7d' ,issuer:'localhost:3000'
     })

     const refreshtoken=JWT.sign({  _id:payload._id},process.env.REFRESHTOKEN,{
      expiresIn:'30d'
    })
      return res.send({message:`welcome back ${name}`,token,refreshtoken})


    } catch (error) {

      console.log('error sign social in:\n',error);
        res.send(error.message)

    }


}

exports.getusers=async(req,res)=>{

  try {
    const{userid}=req.body
    const search=req.query.search ? {$or:[
      {username:{$regex:req.query.search,$options:'i'}},
      {email:{$regex:req.query.search,$options:'i'}}

    ]}:{}
//todo filter logedin user .find({_id:{$ne:userid}})
    const users = await await usermodel.find(search).select('username profileimg status lastseen')
      return res.send({users})

    // if(search!=undefined&&search.length==0){
    //   console.log('search term length',search.length);

    //   const users = await usermodel.find().select('username profileimg status lastseen')
    //  return res.send({users})
    // }

  } catch (error) {

  }

}
exports.getuser=async(req,res)=>{

  const {_id}=req.params
  console.log(_id);
  const user = await usermodel.findById(_id).select('username profileimg status lastseen')
  res.send({message:'register route working',user})
}

exports.updateuser=async(req,res)=>{

  try {
   const {userid,username,status}=req.body

   console.log('user id',userid);
   console.log('username',username)
   console.log('status',status)
  //  console.log('files',req.files.profilepic.mimetype)

   const updateuser= await usermodel.findById(userid)
   console.log('user to update',updateuser);

   //  return
   if(updateuser==null) return res.status(404).send({message:'no user found'})

   if(req.files){


      if(status !=undefined && status!='')updateuser.status=status
      if(username !=undefined && username!='')updateuser.username=username

      let picfile=req.files.profilepic
// console.log('update image',picfile);
      extension=req.files.profilepic.mimetype.split('/')[1]
      // if(picfile.length === undefined) {
          // let trimmedfilename=picfile.name.replace(/ /g,'')
          let filename= userid+'.'+extension

          console.log(filename);
          let uploadPath = `public/user/` +filename;
          let viewpath='http://localhost:3000/'+`user/${filename}`
          // filespatharraytosave.push(viewpath)

          picfile.mv(uploadPath, function(err) {
              if (err) {
                return res.status(500).send(err);
              }

                   console.log('updated profile path: ',viewpath);
                  //  res.send('File successfully uploaded ' );




                  });

      // console.log('single file save: \n',filespatharraytosave);
      updateuser.profileimg=viewpath
      console.log('user to save', updateuser);

await updateuser.save()

console.log('updated profile',updateuser);
const payload={
  _id:updateuser._id,
  email:updateuser.email,
  profileimg:updateuser.profileimg,
  username:updateuser.username,
  lastseen:updateuser.lastseen,
  status:updateuser.status
}

const token = JWT.sign(payload,process.env.HASHKEY,{
  expiresIn:'1w'
})
// console.log('REFRESH: ',process.env.REFRESH_TOKEN);

const refreshtoken=JWT.sign({  _id:payload._id},process.env.REFRESHTOKEN,{
  expiresIn:'3d'
})


// console.log('token: ',token,'refresh: ',refreshtoken);

      return    res.send({
        updateuser,
          token,
          refreshtoken,
          message:'user updated successfully'})



      }else{

          if(username !=undefined && username!='')updateuser.username=username
      if(status !=undefined && status!='')updateuser.status=status

          console.log(updateuser.username);

  await updateuser.save()

  const payload={
    _id:updateuser._id,
    email:updateuser.email,
    profileimg:updateuser.profileimg,
    username:updateuser.username,
    lastseen:updateuser.lastseen,
    status:updateuser.status
  }

  const token = JWT.sign(payload,process.env.HASHKEY,{
    expiresIn:'1w'
  })
  // console.log('REFRESH: ',process.env.REFRESH_TOKEN);

  const refreshtoken=JWT.sign({  _id:payload._id},process.env.REFRESHTOKEN,{
    expiresIn:'3d'
  })


              res.send({
                updateuser,
              token,
              refreshtoken,
              message:'user updated successfully'})
      }



  } catch (error) {

      console.log(error);
      res.send({errormessage:error.message})

  }

}



