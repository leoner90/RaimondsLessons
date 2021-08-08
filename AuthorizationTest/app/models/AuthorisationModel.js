//LIBRARIES
const bcrypt = require('bcrypt');
const db = require("../../mysql-connection");
const jwt = require('jsonwebtoken');
//require('dotenv').config(); not in use!

//REGISTRATION / LOGIN/ CHECK IS USER LOGED IN / LOG OUT
class AuthorisationModel {
  //DB CONNECT
  constructor() {
    this.__connection = new db('users');
  }

  /*IS CALLED ON REGISTRATION OR ON LOG IN ATTEMPT , 
  ASSIGNS PUBLIC KEY AND USER ID TO SESSION AND PRIVATE KEY TO DATABASE, ALSO USER DATA TO JWT */
  async AssignPrivateAndPublicKey(login, email, userId,req) {
    //Get new Secret Api key for encrypting and decrypting (TO STORE IN DB)
    const SecretKey = require('crypto').randomBytes(64).toString('hex');
    //Data for insertion in "jwt" function
    const userInfo = {name: login , email: email } 
    //GENERATE NEW PUBLIC KEY (TO STORE IN USER SESSION) AND ASSIGN USER INFO TO JWT
    const accessToken = jwt.sign(userInfo , SecretKey);
    //USER API KEY UPDATE
    await this.__connection.update('ApiKey', SecretKey , userId);
    //ASSIGN "PUBLIC KEY" AND "USER ID" TO SESSION VARIABLES
    req.session.token = accessToken;
    req.session.userId = userId;
  }

  // REGISTRATION
  async RegNewUser(req , newStudentData) {
    //CHECK FOR ERRORS
    const errors = [];
      //If empty fields provided -> error
    if(newStudentData.login == '' || newStudentData.password == '' || newStudentData.email == ''){
      errors.push("Fields Can't be empty");
    }
      //If user with such login exists -> error
    const DbUserData = await this.__connection.selectUser('Login',newStudentData.login);
    if(DbUserData.length > 0){
      errors.push("This login already exist");
    }
    // IF NO ERRORS -> ATTEMPT TO REGISTER USER
    if(errors.length == 0){
      //password hashing
      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(newStudentData.password, salt);
      //password assign to object
      newStudentData.password = hashedPassword;
      //PUSH DATA TO DB AND RETURN LAST INSERTED ID (API KEY FIELD DEFAULT NULL)
      const lastUserInsertedId = await this.__connection.create(newStudentData);
      //ASSIGN PUBLIC KEY AND USER ID TO SESSION AND PRIVATE KEY TO DATABASE, ALSO USER DATA TO JWT 
      await this.AssignPrivateAndPublicKey(newStudentData.login, newStudentData.email , lastUserInsertedId, req);
    } else {
      return errors;
    }
  }

  //LOGIN
  async LogIn(req,user) {
    //CHECK FOR ERROR 
    const errors = [];
      //If empty fields provided -> error
    if(user.login == '' || user.password == ''){
        errors.push("Fields Can't be empty");
    }
      //If login or password is incorect -> error
    const DbUserData = await this.__connection.selectUser('Login',user.login);
    if(DbUserData.length == 0){
      errors.push("login Or Password is incorrect");
    } else {
      if (!await bcrypt.compare(user.password,DbUserData[0].Password)){
        errors.push("login Or Password is incorrect");
      }
    }
    // IF NO ERRORS -> ATTEMPT TO REGISTER USER
    if(errors.length == 0) {
      //ASSIGN PUBLIC KEY AND USER ID TO SESSION AND PRIVATE KEY TO DATABASE, ALSO USER DATA TO JWT 
      await this.AssignPrivateAndPublicKey(user.login,  DbUserData[0].Email , DbUserData[0].id_User , req);
    } else {
      return errors;
    }
  }

  //CHECK IS USER LOGED IN OR NOT BY API KEY
  async isLogedIn(req) {
    //GET USER ID AND PUBLIC KEY FROM SESSION STORAGE
    var id = req.session.userId;
    var token = req.session.token;
    //IF TOKEN EXISTS
    if (token) {
      //GET PRIVATE KEY FROM USER DB
      const getUser = await this.__connection.selectUser('id_User',id);
      const apikey = await getUser[0].ApiKey;
      //VERIFY IS USER PRIVATE KEY == USER PUBLIC KEY
      return jwt.verify(token, apikey , (err, user) => {
        if (err == null) {
          //RETURN USER INFORMATION IF VERIFICATION SUCCEEDED
          return user;
        } else {
          //IS VERIFICATION FAILED RETURN FALSE
          return false;
        }
      })
    //IF NO TOKEN RETURN FALSE
    } else {
      return false;
    }
  }

 // LOG OUT
 async LogOut(req) {
    //Destroy Session
    req.session.destroy(function(error){
      console.log("Session Destroyed")
    })
  }
}

//EXPORT CLASS
module.exports = new AuthorisationModel();