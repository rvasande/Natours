const Tour = require('./../models/tourModel')

class APIFeatures {
    constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
    }
  
    filter() {
      //BUILD QUERY FIRST
      // 1A) filtering
      const queryObj = { ...this.queryString };
      const excludesFields = ['page', 'sort', 'limit', 'fields'];
      excludesFields.forEach((el) => delete queryObj[el]);
  
      // 1B) advance filtering
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
      console.log(JSON.parse(queryStr));
      // { duration: { $gte: '5' } } mongoDB operator $
      // { duration: { gte: '5' } } express (convert into $gte)
      // gte gt lte lt
  
      // let query = Tour.find(JSON.parse(queryStr));
     this.query = this.query.find(JSON.parse(queryStr));
  
      return this;
    }
  
    sort() {
      // 2A) sorting
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
        // sort(price ratingAverage)
      } else {
        this.query = this.query.sort('-createdAt');
      }
      return this;
    }
  
    limitFields() {
      // 3) field limit
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(',').join(' ');
        console.log(fields);
        this.query = this.query.select(fields); //projecting
      } else {
        this.query = this.query.select('-__v');
      }
      return this;
    }
  
    paginate() {
      // 4) pagination
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 5;
      const skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
  
      if (this.queryString.page) {
        const numTour = Tour.countDocuments();  
      }
      return this;
    }
  }

  module.exports= APIFeatures