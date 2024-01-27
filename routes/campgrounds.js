const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateCampground, isAuthor } = require("../middleware");
const campgrounds = require("../controllers/campgrounds");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router
  .route("/")
  .get(campgrounds.index)
  // .post(
  //   isLoggedIn,
  //   validateCampground,
  //   catchAsync(campgrounds.createCampground)
  .post(upload.array("campground-image"), (req, res) => {
    console.log(req.body, req.files);
  });

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.getCampground))
  .put(
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditCampground)
);

module.exports = router;
