var express = require('express');
var router = express.Router();
const moment = require('moment');
const auth = require('../config/auth');
const web3 = require('web3');
const crypto = require('crypto');
const Tx = require('ethereumjs-tx');
const userServices = require("../services/userServices");
const userControllers = require('../controllers/userControllers');
const blockchainController = require('../controllers/blockchainController');
const blockchainServices = require("../services/blockchainServices");
const { calculateHours } = require('../helper/userHelper');
const { mail } = require('../helper/mailer');
const { Registration } = require('../models/userModel');

var isUser = auth.isUser;

//************ to get user data on header using session **********//
router.use(userControllers.sessionHeader);

router.get('/login', userControllers.loginPage);

router.get('/buy-coin', userControllers.buyPage);

router.get('/receive', userControllers.ReceivePage);

router.get('/send-uwct', userControllers.sendPage);

router.get('/signup', userControllers.signupPage);

router.get('/forgot-pass', userControllers.forgotPage);

router.get('/transaction-table', userControllers.transactionPage);

router.get('/profile', userControllers.settingPage);

router.get('/kyc',isUser, userControllers.kycPage);

//***************** verify email **************// 
router.get('/verify-account', userControllers.verifyPage);

router.post('/login', userControllers.LoginPost);

//***************** get dashboard **************//
router.get('/dashboard', isUser, userControllers.dashboardPage);

//***************** get referral-table*************//
router.get('/referral-table', userControllers.referral);

router.get('/terms-condition', function (req, res) {
  res.render('terms-condition');
});


//***************** get create wallet **************//
router.get('/Create-wallet', isUser, blockchainController.createWallet);

/***************** get verfify key **************/
router.post('/Verify-key', isUser, blockchainController.verifyWallet);


//***************** post create wallet **************//
router.post('/submit-create-wallet', isUser, blockchainController.submitWallet);



//***************** get Wallet-success **************//

// router.get('/Create-wallet-success', isUser, function (req, res) {
//   res.render('Create-wallet');
// });

router.get('/Create-wallet-success', userControllers.walletSuccess);


router.get('/change-password', isUser, function (req, res) {
  var test = req.session.is_user_logged_in;
  if (test != true) {
    res.redirect('/login');
  } else {
    err_msg = req.flash('err_msg');
    success_msg = req.flash('success_msg');
    res.render('change-password', { err_msg, success_msg, layout: false, session: req.session, })
  }
});

//***************** post changes password **************//
router.post('/submit-change-pass', isUser, function (req, res) {
  console.log("change password")
  var user_id = req.session.re_us_id;
  var old_pass = req.body.password;
  var mykey1 = crypto.createCipher('aes-128-cbc', 'mypass');
  var mystr1 = mykey1.update(old_pass, 'utf8', 'hex')
  mystr1 += mykey1.final('hex');
  Registration.find({ '_id': user_id, 'password': mystr1 }, function (err, result) {
    if (err) {
      req.flash('err_msg', 'Something is worng');
      res.redirect('/change-password');
    } else {
      if (result.length > 0 && result.length == 1) {
        var check_old_pass = result[0].password;
        var mykey2 = crypto.createCipher('aes-128-cbc', 'mypass');
        var new_pass = mykey2.update(req.body.new_password, 'utf8', 'hex')
        new_pass += mykey2.final('hex');

        if (mystr1 != new_pass) {
          console.log(result);
          Registration.update({ _id: user_id }, { $set: { password: new_pass } }, { upsert: true }, function (err) {
            if (err) {
              req.flash('err_msg', 'Something went wrong.');
              res.redirect('/change-password');
            } else {
              req.flash('success_msg', 'Password changed successfully.');
              res.redirect('/change-password');
            }
          });
        }
        else {
          req.flash('err_msg', 'New password can not be same as current password.');
          res.redirect('/change-password');
        }
      }
      else {
        req.flash('err_msg', 'Please enter correct current password.');
        res.redirect('/change-password');
      }
    }
  });
});


router.post('/forgot-pass', userControllers.submitForgot);



router.post('/signup', userControllers.submitUser);

//***************** post login **************//
router.post('/verify-account', userControllers.verifyUser);


module.exports = router;
