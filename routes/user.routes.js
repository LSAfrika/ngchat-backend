const express=require('express')
const router= express.Router()
const{register,login,sociallogin,getusers,getuser,updateuser,totalusers,getpersonalcontactlist,addpersonalcontactlist}=require('../controllers/user.controller')
const{authentication,refreshtoken}=require('../middleware/auth.middleware')

router.post('/register',register)

router.post('/login',login)
router.post('/socialogin',sociallogin)
router.get('/allusers',authentication,getusers)
router.get('/personalusers',authentication,getpersonalcontactlist)
router.post('/personalusers',authentication,addpersonalcontactlist)
router.post('/refresh',refreshtoken)
router.get('/singleuser/:_id',getuser)
router.get('/count',authentication,totalusers)
router.patch('/updateuser/',authentication,updateuser)


module.exports=router
