const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const HttpError = require("../models/http-error");

const getUsers = async function (req, res, next) {
  let UsersFound;
  try {
    UsersFound = await User.find({}, "-password");
  } catch (err) {
    return next(
      new HttpError("Something went wrong, please try again later", 500)
    );
  }

  if (!UsersFound || UsersFound.length === 0) {
    return next(new HttpError("Could not find any users.", 404));
  }

  res.json({
    UsersFound: UsersFound.map((user) => user.toObject({ getters: true })),
  });
};

const signUsersUp = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid input, please enter a valid input to sign up", 422)
    );
  }
  const { name, email, password } = req.body;
  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Sign up failed, please try again later.", 500));
  }
  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12); // 12 = rounds of salting
  } catch (err) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    imgUrl: req.file.path,
    places: [],
  });
  // console.log(createdUser);
  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError("Signing up failed, please try again.", 500));
  }

  let token;

  try {
    token = jwt.sign(
      {
        userId: createdUser.id,
        email: createdUser.email,
        username: createdUser.name,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Signing up failed, please try again.", 500));
  }

  res.status(201).json({
    userId: createdUser.id,
    userName: createdUser.name,
    email: createdUser.email,
    imgUrl: createdUser.imgUrl,
    places: createdUser.places,
    token: token,
  }); /// send back if something is successfully done.
};

const logUsersIn = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid input, please enter a valid input to log in", 422)
    );
  }
  let findUserEmail;
  const { email, password } = req.body;

  try {
    findUserEmail = await User.findOne({ email: email });
  } catch (err) {
    return next(new HttpError("Log in failed, please try again later.", 500));
  }

  let isValidPassword = false;

  try {
    isValidPassword = await bcrypt.compare(password, findUserEmail.password); // this will return true or false
  } catch (err) {
    return next(
      new HttpError(
        "Could not log you in due to the server side problems, please try again.",
        500
      )
    );
  }

  let token;

  try {
    token = jwt.sign(
      {
        userId: findUserEmail.id,
        email: findUserEmail.email,
      },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    return next(new HttpError("Logging in failed, please try again.", 500));
  }

  if (findUserEmail) {
    if (isValidPassword) {
      return res
        .status(201)
        .json({
          userId: findUserEmail.id,
          email: findUserEmail.email,
          token: token,
        });
    } else {
      return res.status(422).json({ message: "Your password is incorrect!" });
    }
  }

  return next(
    new HttpError("Your email is incorrect or you have never signup.", 404)
  );
};

exports.getUsers = getUsers;
exports.signUsersUp = signUsersUp;
exports.logUsersIn = logUsersIn;
