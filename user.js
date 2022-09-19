const express = require("express");
const path = require('path');
const mysql = require('mysql');
const { body, check, validationResult } = require('express-validator')

const app = express();
const port = process.env.PORT || 3001;
const router = express.Router()

//// Sending the registration page.
app.get("/",(req, res) => {
  res.sendFile(path.join(__dirname+'/user.html'));
})

//// Sending the "style page".
app.use(express.static(__dirname + '/public'));

//// converted "user.html" input data into json(bodyparser)
app.use(express.urlencoded({
  extended: true
}));


//------------------------------ Database connection ------------------------------//
// Mysql pool connection.
var pool_con = mysql.createPool({
   host : "localhost",
   user : "ScrapData",
   password : "Root#12345",
   database : "aniruddha",
});
  
pool_con.getConnection(function(err) {
  if(!err)
   {
    console.log("Database connection successful!");
    return true;
   }
   else
    {
      console.log("Datebase connection failed!");
      return false;
    }
})
  
  
//------------------------------ Validation ------------------------------//
app.post("/", [
    check('name', 'Enter valid name!')
        .exists()
        .matches(/[a-zA-Z][a-zA-Z\s]*/),
    
    check('email', 'Email is not valid')
        .exists()
        .isEmail()
        .normalizeEmail(),
        
    check('pass', 'Password must contain input 1 uppercase, 1 lowercase,1 number and 1 special characters (min:8)!')
        .exists()
        .matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/),
        
    check('age', 'Age must be above 10 and below 120!')
        .exists()
        .isFloat({ min: 10, max: 120 }),
        
    check('Phone', 'Enter valid mobile number!')
        .exists()
        .matches(/[6789][0-9]{9}/),

    check('gender', 'Select you gender!')
        .exists()
        
],(req, res) => {
  
  ////This data will display on browser after clicking "submit" button.
  // console.log(req.body);

  // Getting my user data from registreation page. 
  var name = req.body.name;
  var email = req.body.email;
  var pass = req.body.pass;
  var confirm_pass = req.body.confirm_pass;
  var age = req.body.age;
  var phone = req.body.Phone;
  var gender = req.body.gender;


  const errors = validationResult(req)
  if(!errors.isEmpty()) {
    res.send(errors.errors[0].msg);
  }
  // else if (req.body.pass !== req.body.confirm_pass ) {
  else if (pass !== confirm_pass ) {
    res.send('Password confirmation does not match password!');
  } 
  else {
    var Duplicate_data =`SELECT * from userdata WHERE email='${email}'`;
    pool_con.query(Duplicate_data,(err,result)=>{ 
      // res.send('result:', result);
      if (result && result[0]) {
        res.send('Duplicate data found!');
      }    
      else{
        // Data insertion query.
        var add_new_data=`INSERT INTO userdata (name, email, pass, age, phone, gender) VALUES ("${name}","${email}","${pass}","${age}","${phone}","${gender}")`;
        pool_con.query(add_new_data,(err,result)=>{
          res.send('Validation Successful!')
        })
      }
    })
  }    

})

//------------------------------ Connecting to port(3001) ------------------------------//
app.listen(port, () => {
  console.log(`Your App is running on port ${port}!`);
});

