import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://triotrick0630:subedi7456@cluster0.yhac9lz.mongodb.net/TrioOrder')
    .then(() => console.log('DB connected'))
}