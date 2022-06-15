const Users = require('../model/userModel')
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const transporter = require('../config/emailConfig');
const Rooms = require('../model/roomModel');
const Hotels = require('../model/hotelModel');
const Bookings = require('../model/bookingModel');
const Reviews = require('../model/reviewModel');


const userCtrl = {
    getUsers: async (req, res) => {
        try {
            // const users = await Users.find({}).select('-password')
            // res.json({ status: "success", users })

            const features = new APIfeatures(Users.find(), req.query).paginating().sorting().searching().filtering();

            const result = await Promise.allSettled([
                features.query,
                Users.countDocuments() // count number of users
            ])

            const users = result[0].status === "fulfilled" ? result[0].value : [];
            const count = result[1].status === "fulfilled" ? result[1].value : 0;

            res.json({ status: 'success', count, users });
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    getUser: async (req, res) => {
        try {

            console.log(req.params);
            const user = await Users.findById(req.params.id).select('-password')
            if (!user) return res.status(400).json({ status: "failed", msg: "User does not exist." })
            res.json({ status: "success", user })
            // const userId = await Users.findById(req.params.id).select("_id"); 
            // const hotel = await Hotels.findOne({ userId });
            // const room = await Rooms.findOne({ userId });
            // const booking = await Bookings.findOne({ userId });
            // const review = await Reviews.findOne({ userId });



        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },
    updateUser: async (req, res) => {
        try {
            const { avatar, fullname, phone, address, email, gender } = req.body
            if (!fullname) return res.status(400).json({ status: "failed", msg: "Please add your full name." })

            await Users.findOneAndUpdate({ _id: req.user._id }, {
                avatar, fullname, phone, address, email, gender
            })

            res.json({ status: "success", msg: "Update Success!" })

        } catch (err) {
            return res.status(500).json({ status: "failed", msg: err.message })
        }
    },
    changeUserPassword: async (req, res) => {
        try {
            const { old_password, password, password_confirmation } = req.body;

            if (old_password && password && password_confirmation) {
                if (password.length < 6) return res.status(400).json({ status: "failed", msg: "Password must be at least 6 characters." })

                const isMatch = await bcrypt.compare(old_password, req.user.password)
                if (!isMatch) return res.status(400).json({ status: "failed", msg: " Old Password is incorrect." })

                if (password !== password_confirmation) return res.status(400).json({ status: "failed", msg: "Password and Confirmation Password Doesn't Match" })
                const newHashedPassword = await bcrypt.hash(password, 12)

                await Users.findByIdAndUpdate(req.user._id, { $set: { password: newHashedPassword } });

                res.json({
                    status: "success",
                    msg: 'Password Changed Successfully'
                })

            } else {
                res.status(400).json({ status: "failed", msg: "All fields are required" })

            }
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }
    },
    sendUserPaswordResetEmail: async (req, res) => {
        try {
            const { email } = req.body;
            if (email) {
                const user = await Users.findOne({ email: email });
                if (user) {
                    const secret = user._id + process.env.ACCESS_TOKEN_SECRET;
                    const token = jwt.sign({ userID: user._id }, secret, { expiresIn: '15m' });
                    const link = `http://localhost:3000/api/reset-password/${user._id}/${token}`;
                    console.log(link)

                    console.log("<------------------------------------------>")

                    let info = await transporter.sendMail({
                        from: process.env.EMAIL_FROM,
                        to: user.email,
                        subject: 'Password Reset Link',
                        html: `<h1>
                            <a href="${link}">Click Here</a> to Reset Your Password</h1>`
                    });

                    res.status(200).json({ status: "success", msg: "Password Reset Link Sent Successfully, Check Your Mail",  info });
                } else {
                    res.status(400).json({ status: "failed", msg: "Email doesn't exist" });
                }
            } else {
                res.status(400).json({ status: "failed", msg: "Email field is required" })
            }
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }
    },
    resetUserPassword: async (req, res) => {
        try {
            const { password, password_confirmation } = req.body;
            const { id, token } = req.params;

            const user = await Users.findById(id);
            const newSecret = user._id + process.env.ACCESS_TOKEN_SECRET;
            jwt.verify(token, newSecret)
            if (password && password_confirmation) {
                if (password.length < 6) return res.status(400).json({ status: "failed", msg: "Password must be at least 6 characters." })
                if (password === password_confirmation) {

                    const salt = await bcrypt.genSalt(12);
                    const hashedPassword = await bcrypt.hash(password, salt);
                    await Users.findByIdAndUpdate(user._id, { $set: { password: hashedPassword } });

                    res.status(200).json({ status: "failed", msg: "Password Reset Successfully" });

                } else {
                    res.status(400).json({ status: "failed", msg: "Password and Confirmation Password Doesn't Match" });
                }
            } else {
                res.status(400).json({ status: "failed", msg: "All fields are required" });
            }
        } catch (error) {
            res.status(500).send({ "status": "failed", "message": error.message })

        }
    },
    deleteUser: async (req, res) => {
        try {
            const userId = req.params.id;
            const user = await Users.findById(userId);
            if (!user) return res.status(400).json({ status: "failed", msg: "User does not exist." })

            await Users.findOneAndDelete({ _id: userId });
            await Hotels.findOneAndDelete({ user: userId });
            await Hotels.findOne({ user: userId });
            await Rooms.findOneAndDelete({ user: userId });
            await Bookings.findOneAndDelete({ user: userId });
            await Reviews.findOneAndDelete({ user: userId });
            res.json({ status: "success", msg: "User Deleted Successfully" })
        } catch (err) {
            return res.status(500).json({ msg: err.message })
        }
    },


    changeUserRole: async (req, res) => {
        try {
            const { role } = req.body;
            if (!role)
                return res.status(400).json({ status: "failed", msg: "Role field is required" })

            if (role === "admin" || role === "user" || role === "vendor") {
                const newUser = await Users.findByIdAndUpdate(req.params.id, { $set: { role } });
                res.json({
                    status: "success", msg: `Role changed to ${role} successfully`, newUser: {
                        ...newUser._doc
                    }
                })
            } else {
                res.status(400).json({ status: "failed", msg: "This role does not exist" })
            }
        } catch (error) {
            return res.status(500).json({ status: "failed", msg: error.message })
        }
    }
}

module.exports = userCtrl