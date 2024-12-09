const express = require('express');
const {signUp,signIn,userDetails, logout, allUsers,deleteUser, updateUser} = require('../controllers/userController');
const checkAuth  = require('../middleware/auth')
const router = express.Router();

router.post('/signup' , signUp)
router.post('/signin' , signIn)
router.get('/user-details', checkAuth, userDetails)
router.get('/user-logout' , logout)

//admin-panel
router.get('/all-users', checkAuth, allUsers )
router.get('/delete-user/:userId', checkAuth, deleteUser )
router.post('/updateUser/:id', checkAuth, updateUser)


module.exports = router;