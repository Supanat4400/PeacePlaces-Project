const express = require("express");
const { check } = require("express-validator");
const fileUpload = require("../middleware/file-upload");
const placeControllers = require("../controllers/places-controllers");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/:pid", placeControllers.getPlaceById);

router.get("/user/:uid", placeControllers.getPlacesByUserId);

router.use(checkAuth);   /// To check if the request attached with the token or not

router.post(
  "/",
  fileUpload.single("imgUrl"),
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 6 }),
    check("address").not().isEmpty(),
  ],
  placeControllers.createPlace
);

router.patch(
  "/:pid",
  [check("title").not().isEmpty(), 
   check("description").isLength({ min: 6 })],
  placeControllers.editPlace
);

router.delete("/delete/:pid", placeControllers.deletePlace);

module.exports = router;
