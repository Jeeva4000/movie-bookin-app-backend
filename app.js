import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRouter from './routes/user-routes.js';
import adminRouter from './routes/admin-routes.js';
import movieRouter from './routes/movie-routes.js';
import bookingsRouter from './routes/booking-routes.js';
import cors from "cors"


dotenv.config();


const app = express();
//middleware
app.use(express.json());
app.use(cors());


//middlewares
app.use("/user",userRouter);
app.use("/admin",adminRouter);
app.use("/movie",movieRouter);
app.use("/booking",bookingsRouter)

const PORT = process.env.PORT || 5050;

mongoose.connect("mongodb+srv://Jeeva:Jeeva12345@cluster0.7wb6jvt.mongodb.net/movie?retryWrites=true&w=majority")
.then(()=>app.listen(PORT,()=>console.log(`connected to Database and server running localhost:${PORT}`)))
.catch((e)=>console.log(e));
