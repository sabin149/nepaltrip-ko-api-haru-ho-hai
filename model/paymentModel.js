const mongoose = require("mongoose")
const paymentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId, ref: 'user'
    },
    hotelId: {          
        type: mongoose.Types.ObjectId, ref: 'hotel'
    },
    roomId: {
        type: mongoose.Types.ObjectId, ref: 'room'
    },
    start_date:{
        type: Date,
        required: true
    },
    end_date:{
        type: Date,
        required: true
    },
    name:{
        type: String,
        required: true

    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: Number,
        maxlength:10,
        minlength:10,
        required: true

    },
    address:{
        type: String,
        required: true
    },
    paymentId:{
        type: String,
        required: true

    },
    payment_method:{
        type: String,
        required: true

    },
    total_amount:{  
        type: Number,
        required: true
    }
})
module.exports = mongoose.model("payment", paymentSchema)

