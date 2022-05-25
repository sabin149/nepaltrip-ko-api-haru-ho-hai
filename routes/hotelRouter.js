const router = require('express').Router();
const hotelCtrl=require("../controllers/hotelCtrl")
const auth=require("../middleware/auth")
const authVendor=require("../middleware/auth-vendor")
const authAdmin=require("../middleware/auth-admin")


router.get("/search",hotelCtrl.searchHotel)

router.route("/hotel")
.post(auth, hotelCtrl.createHotel)
.get(hotelCtrl.getHotels)

router.route('/hotel/:id')
.patch(auth,authVendor,hotelCtrl.updateHotel)
.get(hotelCtrl.getHotel)
.delete(auth,hotelCtrl.deleteHotel)

router.patch("/saveFavourite/:id",auth,hotelCtrl.saveFavouriteHotel)
router.patch("/unSaveFavourite/:id",auth,hotelCtrl.unSaveFavouriteHotel)
router.get("/getFavouriteHotels",auth,hotelCtrl.getFavouriteHotels)

router.patch("/approveHotel/:id",auth,authAdmin,hotelCtrl.approveHotel)

module.exports = router;