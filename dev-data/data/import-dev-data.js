const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config({path:'./config.env'})
const Tour = require('./../../models/tourModel')
const fs = require('fs')

const DB = process.env.DATABASE.replace('<password>',process.env.DATABASE_PASSWORD)

mongoose.connect(DB,{
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  useUnifiedTopology: true
}).then(() => console.log('DB connection successful!'))

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`))

const importData = async() =>{
    try {
        await Tour.create(tours)
        console.log('Data successfully loaded!');
    } catch (error) {
        console.log(error);
    }
    process.exit()
}

const deleteData = async () =>{
    try {
        await Tour.deleteMany()
        console.log('Data successfully deleted!');
    } catch (error) {
        console.log(error);
    }
    process.exit()
}


if(process.argv[2] === '--import'){
    importData()
}else if(process.argv[2] === '--delete'){
    deleteData()
}