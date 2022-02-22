const fs = require("fs");

const { validationResult } = require("express-validator");
const getCoordsForAddress = require("../util/location");
const HttpError = require("../models/http-error");
const mongoose = require("mongoose");
const Place = require("../models/Place");
const User = require("../models/User");

const getPlaceById = async function (req, res, next) {
  const placeId = req.params.pid;

  let placeFound;
  try {
    placeFound = await Place.findById(placeId).exec();
  } catch (err) {
    return next(
      new HttpError(
        "Something went wrong, could not find a place for the provided id.",
        500
      )
    );
  }

  if (!placeFound) {
    return next(
      new HttpError("Could not find a place for the provided id.", 404)
    );
  }
  res.json({ placeFound: placeFound.toObject({ getters: true }) });
};

const getPlacesByUserId = async function (req, res, next) {
  const userId = req.params.uid;
  let placesFound;
  try {
    placesFound = await Place.find({ creator: userId });
  } catch (err) {
    return next(
      new HttpError(
        "Something went wrong, could not find a place for the provided user id.",
        500
      )
    );
  }

  if (!placesFound || placesFound.length === 0) {
    return next(
      new HttpError("Could not find places for the provided user id.", 404)
    );
  }

  res.json({
    places: placesFound.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        "Invalid input, please enter a valid input to create place",
        422
      )
    );
  }

  const { title, description, address} = req.body;
  const coordinates = await getCoordsForAddress(address);
  const createdPlace = new Place({
    title,
    description,
    address,
    location: coordinates,
    imgUrl: req.file.path,
    creator: req.userData.userId
  });
  // console.log(createdPlace);
  let user;
  try {
    user = await User.findById(req.userData.userId);
    // console.log(user);
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  if (!user) {
    return next(
      new HttpError("Could not find user for the provided user id.", 404)
    );
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdPlace.save({ session: sess });
    user.places.push(createdPlace);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating place failed, please try again.", 500));
  }

  res.status(201).json({ place: createdPlace }); /// send back if something is successfully done.
};

const editPlace = async function (req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError(
        "Invalid input, please enter a valid input to update place.",
        422
      )
    );
  }



  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place;
  try{
    place = await Place.findById(placeId);
  }catch(err){
    return next(
      new HttpError("Something went wrong, please try again.", 500)
    );

  }
  
  if(place.creator.toString() !== req.userData.userId){
    return next(
      new HttpError("You are not allowed to edit this place.", 401)
    );

  }


  let updatedPlace;
  try {
    updatedPlace = await Place.findByIdAndUpdate(placeId, {
      title:title,
      description:description,
    });
  } catch (err) {
    return next(
      new HttpError("Could not edit the place, please try again.", 500)
    );
  }
 
  res.status(201).json({ place: updatedPlace.toObject({ getters: true }) });
  
};


const deletePlace = async function (req, res, next) {
  const placeId = req.params.pid;
  let deletedPlace;
  try {
    deletedPlace = await Place.findById(placeId).populate("creator");
  } catch (err) {
    return next(
      new HttpError("Could not delete the place, please try again.", 500)
    );
  }
  if (!deletedPlace) {
    return next(
      new HttpError("Could not find the place for this place id.", 404)
    );
  }

  
  if(deletedPlace.creator.id !== req.userData.userId){
    return next(
      new HttpError("You are not allowed to delete this place.", 401)
    );

  }

  const imagePath = deletedPlace.imgUrl;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await deletedPlace.remove({ session: sess });
    deletedPlace.creator.places.pull(deletedPlace);
    await deletedPlace.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(new HttpError("Deleting place failed, please try again.", 500));
  }
 fs.unlink(imagePath, err =>{  /// delete image file in the backend.
   console.log(err);
 })
  res.status(201).json({ message: "Place deleted!" });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.editPlace = editPlace;
exports.deletePlace = deletePlace;
