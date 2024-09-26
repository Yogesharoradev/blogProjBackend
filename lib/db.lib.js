import mongoose from "mongoose";

const dbConnect = async ()=>{
    try{    
     const db =  await mongoose.connect(process.env.DB_URL)
        console.log(" db connected")
        return db
    }catch(err){
        console.log(err)
        process.exit(1)
    }
}

export default dbConnect