const route = require("express").Router();

const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/user");
const { getAllDonate, paymentHandling } = require("../controllers/donate");
const {
  getHomePage,
  createCampaign,
  editCampaign,
  deleteCampaign,
} = require("../controllers/campaign");
const { signinFb, signinGoogle } = require("../controllers/signinFbOrGoogle");
const { getTokenCardPayment } = require("../controllers/donate");
const { createCategory } = require("../controllers/category");

const user = require("./user");
const comment = require("./comment");
const donate = require("./donate");
const campaign = require("./campaign");
const category = require("./category");
const update = require("./update");

const authentication = require("../middlewares/auth/auth");
const { createUserValidators } = require("../middlewares/validators/user");
const {
  createCampaignValidator,
  editCampaignValidator,
} = require("../middlewares/validators/campaign");
const {
  createCategoryValidator,
} = require("../middlewares/validators/category");

route.post("/login", login);
route.post("/register", createUserValidators, register);
route.get("/signinFb", signinFb);
route.get("/signinGoogle", signinGoogle);
route.post("/forgotPassword", forgotPassword);
route.patch("/resetPassword/:token", resetPassword);
route.use("/comment", comment);
route.get("/allDonate", getAllDonate);
route.get("/", getHomePage);
route.post("/paymentHandling", paymentHandling);
route.use("/discover", campaign);
route.use("/category", category);

route.use(authentication);

route.post("/category", createCategoryValidator, createCategory);
route.use("/profile", user);
route.use("/charge", donate);
route.post("/token/:id", getTokenCardPayment);
route.post("/campaign", createCampaignValidator, createCampaign);
route.patch("/discover/edit/:id", editCampaignValidator, editCampaign);
route.use("/update", update);
route.delete("/deleteCampaign/:id", deleteCampaign);

module.exports = route;
