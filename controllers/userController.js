const AppError = require('../utils/appError');
const User = require('./../models/userSchema')
const catchAsync = require('./../utils/catchAsync')

const filterObj = (obj, ...allowedFields) =>{
  const newObj = {}
  Object.keys(obj).forEach((el) => {
    if(allowedFields.includes(el)) newObj[el] = obj[el]
  })
  return newObj
}

exports.getAllUsers = catchAsync(async(req, res) => {
  const users = await User.find()
  res.status(500).json({
    status: 'success',
    users
  });
});

exports.updateMe = catchAsync(async (req,res,next) =>{
  // 1) create error if user update password 
  if(req.body.password || req.body.passwordConfirm){
    return next(new AppError('This route use not for updating password! Please use /updatePassword route',400))
  }

  // 2) filter out unwanted fileds 
  const filteredBody = filterObj(req.body,'name','email')

  // 3) update user details 
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody,{
    new:true,
    runValidators:true
  })

  res.status(200).json({
    status:'success',
    data:updatedUser
  })
})

exports.deleteMe = catchAsync(async (req,res, next) =>{
  await User.findByIdAndUpdate(req.user.id, { active:false})

  res.status(204).json({
    status:'success',
    data:null
  })
})

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is yet not defined ',
  });
};

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is yet not defined ',
  });
};

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is yet not defined ',
  });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is yet not defined ',
  });
};
