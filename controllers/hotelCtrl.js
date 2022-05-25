const Hotel = require('../model/hotelModel');
const Room = require('../model/roomModel');
const Review = require('../model/reviewModel');
const User = require('../model/userModel');
const { APIfeatures } = require("../lib/features")

const hotelCtrl = {
    searchHotel: async (req, res) => {
        try {
            // const hotels=await Hotel.find({$or:[
            //     {
            //         address:{$regex:req.query.address}
            //     },{
            //         hotel_name:{$regex:req.query.hotel_name}
            //     }
            // ]}).limit(100).select("hotel_name address price hotel_images hotel_info hotel_facilities hotel_reviews");

            const hotels = await Hotel.find({ address: { $regex: req.query.address } }).limit(100).select("hotel_name address price hotel_images hotel_info hotel_facilities hotel_reviews");
            
            if (!hotels)
                return res.status(404).json({
                    success: "failed",
                    message: "No hotels found"
                })
            res.json({
                status: "success",
                count: hotels.length,
                hotels
            })
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }
    },
    getHotels: async (req, res) => {
        try {
            const features = new APIfeatures(Hotel.find(), req.query).paginating().sorting().searching().filtering();

            const result = await Promise.allSettled([
                features.query,
                Hotel.countDocuments() // count number of hotels
            ])

            const hotels = result[0].status === "fulfilled" ? result[0].value : [];
            const count = result[1].status === "fulfilled" ? result[1].value : 0;


            // const hotels = await Hotel.find();
            res.json({ status: 'success', count, hotels });
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }
    },
    getHotel: async (req, res) => {
        try {
            const hotel = await Hotel.findById(req.params.id);
            res.json({ status: 'success', hotel });
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }
    },
    createHotel: async (req, res) => {
        try {
            const {
                hotel_name, address, phone, hotel_email, pan_no, price, hotel_images, hotel_info, hotel_facilities, hotel_policies
            } = req.body
            if (hotel_name && address && phone && pan_no && hotel_info && hotel_facilities && hotel_policies && hotel_validity) {

                const hotelName = await Hotel.findOne({ hotel_name })
                if (hotelName)
                    return res.status(400).json({ status: "failed", msg: "Hotel already registered." })

                const phoneNumber = await Hotel.findOne({ phone })
                if (phoneNumber)
                    return res.status(400).json({ status: "failed", msg: "Phone number already registered." })

                if (phone.length > 10 || phone.length < 10)
                    return res.status(400).json({ msg: "Please enter a valid phone number." })

                if (pan_no.length > 8 || pan_no.length < 8)
                    return res.status(400).json({ msg: "Please enter a valid PAN number." })
                const panNo = await Hotel.findOne({ pan_no })
                if (panNo)
                    return res.status(400).json({ msg: "This pan number is already registered." })

                if (hotel_images.length === 0)
                    return res.status(400).json({ msg: "Please add your hotel images." })
                if (hotel_facilities.length === 0)
                    return res.status(400).json({ msg: "Please add your hotel facilities." })
                if (hotel_policies.length === 0)
                    return res.status(400).json({ msg: "Please add your hotel policies." })


                const newHotel = new Hotel({
                    hotel_name, address, phone, hotel_email, pan_no, price, hotel_images, hotel_info, hotel_facilities, hotel_policies,user:req.user._id
                })
                await newHotel.save();

                res.json({
                    status: 'success',
                    msg: 'Hotel Created!',
                    newHotel: {
                        ...newHotel._doc,
                        user: req.user
                    }
                })
            } else {
                return res.status(500).json({ status: "failed", msg: "Please fill all the fields" })
            }
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }
    },
    updateHotel: async (req, res) => {
        try {
            const {
                hotel_name, address, phone, hotel_email, pan_no, price, hotel_images, hotel_info, hotel_facilities, hotel_policies, hotel_validity
            } = req.body

            const phoneNumber = await Hotel.findOne({ phone })
            if (phoneNumber)
                return res.status(400).json({ status: "failed", msg: "Phone number already registered." })

            if (phone.length > 10 || phone.length < 10)
                return res.status(400).json({ msg: "Please enter a valid phone number." })

            if (pan_no.length > 8 || pan_no.length < 8)
                return res.status(400).json({ msg: "Please enter a valid PAN number." })

            if (hotel_images.length === 0)
                return res.status(400).json({ msg: "Please add your hotel images." })

            if (hotel_facilities.length === 0)
                return res.status(400).json({ msg: "Please add your hotel facilities." })

            if (hotel_policies.length === 0)
                return res.status(400).json({ msg: "Please add your hotel policies." })

            const hotel = await Hotel.findByIdAndUpdate(req.params.id, {
                hotel_name, address, phone, hotel_email, pan_no, price, hotel_images, hotel_info, hotel_facilities, hotel_policies, hotel_validity
            })
            res.json({
                status: 'success',
                msg: "Hotel details updated!",
                newHotel: {
                    ...hotel._doc,
                    hotel_name, address, phone, hotel_email, pan_no, price, hotel_images, hotel_info, hotel_facilities, hotel_policies, hotel_validity
                }
            })
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }
    },
    deleteHotel: async (req, res) => {
        try {
            const hotel = await Hotel.findOneAndDelete({ _id: req.params.id })
            await Room.deleteMany({
                _id: {
                    $in: hotel.rooms
                }
            })
            await Review.deleteMany({
                _id: {
                    $in: hotel.hotel_reviews
                }
            })
            res.json({
                msg: 'Hotel Deleted!',
                newHotel: {
                    ...hotel

                }
            })

        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }

    },
    saveFavouriteHotel: async (req, res) => {
        try {
            const user = await User.find({ _id: req.user._id, favourites: req.params.id })
            if (user.length > 0) {
                return res.status(400).json({ status: "failed", msg: "Hotel already added to favourites." })
            }
            const favourites = await User.findOneAndUpdate({ _id: req.user._id },
                { $push: { favourites: req.params.id } },
                { new: true })

            if (!favourites)
                return res.status(400).json({ status: "failed", msg: "This user does not exit." })

            res.json({ status: "success", msg: "Hotel added to favourites.", user: favourites })
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }
    },
    unSaveFavouriteHotel: async (req, res) => {
        try {
            const favourite = await User.findOneAndUpdate({ _id: req.user._id }, {
                $pull: { favourites: req.params.id }
            }, { new: true })

            if (!favourite) return res.status(400).json({ msg: 'This user does not exist.' })

            res.json({ status: "success", msg: 'Hotel removed from favourites.', user: favourite })


        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }
    },
    getFavouriteHotels: async (req, res) => {
        try {
            const features = new APIfeatures(Hotel.find({ _id: { $in: req.user.favourites } }), req.query).paginating();

            const favouriteHotels = await features.query.sort("-createdAt");
                // console.log(favouriteHotels);
            res.json({
                status: "success", favouriteHotels,
                count: favouriteHotels.length
            })
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }
    },
    approveHotel: async (req, res) => {
        try {
            const hotel = await Hotel.findOneAndUpdate({ _id: req.params.id }, {
                hotel_validity: true
            }, { new: true })
            res.json({
                status: "success",
                msg: "Hotel approved!",
                newHotel: {
                    ...hotel._doc
                }
            })
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })  
        }
    }
}
module.exports = hotelCtrl;