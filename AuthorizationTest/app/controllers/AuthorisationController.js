//MODULE REQUIRE
const AuthorisationModel = require("../models/AuthorisationModel");

//LOG IN AND REGISTRATION CONTROLLER
class AuthorisationController {
  // Function AuthorisationModel.isLogedIn check is user loged in and returns or user data or false-> and then render proper page
  async CheckUserStatusAndPageRender(req , res , PageToAccess , FallBackPage) {
    const userInfo =  await AuthorisationModel.isLogedIn(req);
    if(userInfo) {
      res.render(PageToAccess, { userInfo });
    } else {
      res.render(FallBackPage);
    }
  }

  //IF LOGED IN PROVIDES "USER INFO" PAGE , IF NOT - PROVIDES REGISTRATION FORM
  async regNewUser(req, res) {
    this.CheckUserStatusAndPageRender(req , res , "pages/userInfo" , "pages/Reg");
  }

  //IF LOGED IN PROVIDES "USER INFO" PAGE , IF NOT -PROVIDES LOG IN FORM
  async logIn(req, res) {
    this.CheckUserStatusAndPageRender(req , res , "pages/userInfo" , "pages/login");
  }

  //ON REGISTRATION ATTEMPT (POST)
  async RegPost(req, res) {
    const ConditionRes = await AuthorisationModel.RegNewUser(req , req.body);
    if(ConditionRes) {
      res.render("pages/Reg", { Error: ConditionRes });
    } else {
      this.CheckUserStatusAndPageRender(req , res , "pages/userInfo" , "pages/Reg");
    }
  }

  //ON LOG IN ATTEMPT (POST)
  async logInPost(req, res) {
    const ConditionRes = await AuthorisationModel.LogIn(req , req.body); 
    if(ConditionRes) {
      res.render("pages/login", { Error: ConditionRes });
    } else {
      this.CheckUserStatusAndPageRender(req , res , "pages/userInfo" , "pages/Reg");
    }
  }

  //LOG OUT , DESTROY SESSION
  async logOut(req, res) {
    await AuthorisationModel.LogOut(req); 
    res.render("pages/login");
  } 
}

module.exports = AuthorisationController;