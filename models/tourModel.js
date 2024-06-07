const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
// const User = require('./userSchema');

//first object is schema defination
// second object is option
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a price'], //validator
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have less or equals to 40 characters'],
      minlength: [10, 'A tour name must have more or equals to 40 characters'],
      // validate:[validator.isAlpha, ' A tour name is must only contains characters']
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'difficulty is either : easy, medium, difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'ratingAverage must be above 1.0'],
      max: [5, 'ratingAverage must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only work with current document on NEW document creation not working with update
          return val < this.price;
        },
        message: 'price discount must be less than price ',
      },
    },
    summary: {
      type: String,
      required: [true, 'A tour must have a summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      // geoJSON object used to specify geospatial data
      type: {
        // this type specify geoJSON object type
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //first longitude then latitude
      address: String,
      description: String,
    },
    //embedded documents(location documents created in parent documents)
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number,
      },
    ],
    // guides: Array,
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
  },
  {
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

//compound index
tourSchema.index({price:1,ratingsAverage:-1})
tourSchema.index({slug:1})
tourSchema.index({startLocation:"2dsphere"})

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});


//virtual populate
tourSchema.virtual('reviews',{
  ref:'Review',
  foreignField:'tour',
  localField:'_id'
})

//DOCUMENT middleware : runs before .save() and .create()
tourSchema.pre('save', function (next) {  
  this.slug = slugify(this.name, { lower: true });
  next();
});

//embedded users in tours collection
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id)); //return array with promise
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function(next){
//   console.log('will save document....');
//   next()
// })

// tourSchema.post('save', function(doc, next){
//   console.log(doc);
//   next()
// })

// QUERY middleware : this is query obeject
tourSchema.pre(/^find/, function (next) {
  //all string starting with find then execute this middleware
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`query took time ${Date.now() - this.start} miliseconds `);
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({ path: 'guides', select: '-__v' });
  next(); 
});
// AGGRIGATION middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   console.log(this.pipeline());
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
