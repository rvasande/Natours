const Tour = require("../models/tourModel");
const catchAsync = require("../utils/catchAsync");

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1) get data from Tour collection
  const tours = await Tour.find();

//   2) build template 

// 3) render that template using data from step 1

  res.status(200).render("overview", {
    title: "All tours",
    tours,
  });
});

exports.getTour = catchAsync(async (req, res, next) => {
  res.status(200).render("tour", {
    title: "The forest hiker",
  });
});
