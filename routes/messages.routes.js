const express=require('express')
const router= express.Router()
const{authentication}=require('../middleware/auth.middleware')
const{fetchallchats,deletechat,updateviewedchats,fetchsinglechat}=require('../controllers/usermessages.contrroller')






router.get('/allchats/',authentication,fetchallchats)
router.get('/singlechat/:userid',authentication,fetchsinglechat)
router.get('/count',authentication,)
router.patch('/chatviewed',authentication,)


module.exports=router
