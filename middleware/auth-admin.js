const Users= require("../model/userModel")
const authAdmin = async (req, res, next) => {
    try {
        // Get user information by id
        const user = await Users.findOne({
            _id: req.user.id
        })
        if (user.role === "user" || user.role === "vendor") 
            return res.status(400).json({status:"failed", msg: "Admin resources access denied" })
        next()

    } catch (err) {
        return res.status(500).json({ msg: err.message })
    }
}

module.exports = authAdmin 