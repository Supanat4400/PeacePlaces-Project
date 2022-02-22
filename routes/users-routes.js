const express = require("express");
const { check } = require("express-validator");

const usersControllers = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", usersControllers.getUsers);

router.post(
  "/signup",
  fileUpload.single("imgUrl"),
  [
    check("name").not().isEmpty(),
    check("email").isEmail(),
    check("password").isLength({ min: 8 }),
  ],
  usersControllers.signUsersUp
);

router.post(
  "/login",
  [check("email").isEmail(), check("password").isLength({ min: 8 })],
  usersControllers.logUsersIn
);

module.exports = router;
