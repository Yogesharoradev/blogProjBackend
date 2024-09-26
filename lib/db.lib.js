import mongoose from "mongoose";

const dbConnect = async ()=>{
    try{    
     const db =  await mongoose.connect("mongodb://localhost:27017/blogs")
        console.log(" db connected")
        return db
    }catch(err){
        console.log(err)
        process.exit(1)
    }
}

export default dbConnect