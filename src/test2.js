const Api = require("./lib/RestApi");
authparams = {
'userid' : 'FA57167',
'password' : 'Trade0055@#',
'twoFA' : 'WFUAJ553LE3QO2E45D4234U6AD4RBJ54',
'vendor_code' : 'FA57167_U',
'api_secret' : '9f6ef601a88d1e61bc372eada259956f',
'imei' : 'abc1234'
}
api = new Api({});
api.login(authparams)
.then((res) => {
 console.log('Reply: ', res);
 return;
 }).catch((err) => {
 console.error(err);
 });