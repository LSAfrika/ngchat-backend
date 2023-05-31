const express=require('express')
const router= express.Router()
const{register,login,sociallogin,getusers,getuser,updateuser}=require('../controllers/user.controller')
const{authentication,refreshtoken}=require('../middleware/auth.middleware')

router.post('/register',register)

router.post('/login',login)
router.post('/socialogin',sociallogin)
router.get('/allusers',authentication,getusers)
router.post('/refresh',refreshtoken)
router.get('/singleuser/:_id',getuser)
router.patch('/updateuser/',authentication,updateuser)


module.exports=router
