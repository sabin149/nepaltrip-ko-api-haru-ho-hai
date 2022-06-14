require("dotenv").config();
const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
});
// transporter.verify((err, success) => {
//     if (err) console.error(err);
//    else {console.log('Nodemailer config is correct');
// }});


 module.exports=transporter; 