const router = require('express').Router();
const roomCtrl = require('../controllers/roomCtrl');
const auth=require("../middleware/auth")
const authVendor=require("../middleware/auth-vendor")


router.route("/room")
.post(auth, roomCtrl.createHotelRoom)
.get(auth,roomCtrl.getHotelRooms)


router.get("/allrooms",auth,roomCtrl.getAllHotelRooms)

router.route('/room/:id')
.get(auth,roomCtrl.getHotelRoom)
.patch(auth,roomCtrl.updateHotelRoom)
.delete(auth,roomCtrl.deleteHotelRoom)


module.exports = router;