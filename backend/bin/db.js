const mongoose = require('mongoose')
const connectDb = async () => {
    try {
       await mongoose.connect('mongodb://127.0.0.1:27017/chat');
        //await mongoose.connect(process.env.MONGODb);
        console.log("MongoDb database connected");
    } catch (err) {
        console.log(err);
    }

}
module.exports=connectDb