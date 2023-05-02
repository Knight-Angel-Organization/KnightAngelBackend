const User = require('../model/User');
const sgMail = require('@sendgrid/mail');
const { response } = require('express');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken)
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const emailNewUser = async(req,_res) => {
    const {fnIn, emailIn} = req.body;
    const msg = {
        from: 'xdb19981@gmail.com', // Change to your verified sender
        to: emailIn,
        template_id: 'd-3081d16052474c0f9660b21437057b4a',
        dynamicTemplateData:{
          subject: 'Welcome to Knight Angel, ' + fnIn
        }
        /* subject: 'Welcome to Knight Angel!',
        text: 'and easy to do anywhere, even with Node.js',
        html: '<strong>and easy to do anywhere, even with Node.js</strong>', */
    }
    await sgMail
    .send(msg)
    .then((response) => {
      console.log(response[0].statusCode)
      console.log(response[0].headers)
    })
    .catch((error) => {
      console.error(error)
    })
}

const TwoFAEmail = async (req,res) =>{
  const {emailIn} = req.body;
  //check if email was sent in the request
  if (!emailIn) return res.status(401).json({'message': 'Please enter an email'})
  //checks to see if user is a user
  const findUser = await User.findOne({email: emailIn}).exec()
  if(findUser){
    client.verify.v2.services('VAbbb1c2712a87ffd226dff8243038418f')
    .verifications
    .create({channelConfiguration: {
      template_id: 'd-0a396d4935bc49a3bbfce01a9089dbfe',
      from: 'xdb19981@gmail.com',
      from_name: 'Xavier Baldwin'
  }, to: emailIn, channel: 'email'})
  .then(verification => res.json({verification}) | console.log(verification))
  //.then(verification => console.log(verification)) //original text that shows it in console only
  }else{
  res.status(500).json({'message': `${emailIn} isn't a user. Please enter a valid email`})
  }
  
}

const ConfirmTwoFAEmail = async (req,res) =>{
  const {emailIn,codeIn} = req.body;
  client.verify.v2.services('VAbbb1c2712a87ffd226dff8243038418f')
  .verificationChecks
  .create({to: emailIn, code: codeIn})
  .then(verification_check => res.json({verification_check}) | console.log(verification_check)); 
}




module.exports = {emailNewUser, TwoFAEmail, ConfirmTwoFAEmail}