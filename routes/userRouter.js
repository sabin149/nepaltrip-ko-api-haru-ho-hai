const router = require('express').Router()
const auth = require("../middleware/auth")
const authAdmin = require("../middleware/auth-admin")
const userCtrl = require("../controllers/userCtrl")

router.get('/user', auth, authAdmin, userCtrl.getUsers)
router.get('/user/:id', auth, userCtrl.getUser)
router.patch('/user', auth, userCtrl.updateUser)
router.post('/changepassword', auth, userCtrl.changeUserPassword);
router.post("/send-reset-password-email", userCtrl.sendUserPaswordResetEmail);
router.post("/reset-password/:id/:token", userCtrl.resetUserPassword);
router.delete("/user/:id", auth, authAdmin, userCtrl.deleteUser);
router.patch("/user/:id", auth, authAdmin, userCtrl.changeUserRole);

module.exports = router