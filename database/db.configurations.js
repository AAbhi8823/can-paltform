/**
 * Mongodb configuration
 */

const mongoose = require('mongoose');
const dotenv=require('dotenv')
dotenv.config();

exports.connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // useFindAndModify: true
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

