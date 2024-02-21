const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.route("/signup").post(authController.signUp);
router.route("/login").post(authController.login);

router.route("/forgotPassword").post(authController.forgotPassword);
router.route("/resetPassword/:token").patch(authController.resetPassword);

// protect all routes after this middleware 
router.use(authController.protect);

router.route("/me").get(userController.getMe, userController.getUser);
router.route("/updateMe").patch(userController.updateMe);
router.route("/deleteMe").delete(userController.deleteMe);
router.route("/updatePassword").patch(authController.updatePassword);

//allow only for admin
router.use(authController.restrictTo('admin'))
router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
