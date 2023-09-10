import { decrypt } from "dotenv";
import jwt from "jsonwebtoken";
import Movie from "../models/Movie";
import Admin from "../models/Admin";
import mongoose from "mongoose";

export const addMovie = async (req,res,next)=>{
    const extractedToken = req.headers.authorization.split(" ")[1]; //Bearer token
    if(!extractedToken && extractedToken.trim()===""){
        return res.status(404).json({message:"Token Not Found"})
    }
    let adminId;
    //admin id
    //verify token
    jwt.verify(extractedToken,process.env.SECRET_KEY,(err,decrypted)=>{
        if(err){
            return res.status(400).json({message:`${err.message}`})
        }else{
            adminId = decrypted.id;
            return;
        }
    });

    //create new movie
    const { tittle,description,releaseDate,posterUrl,featured,actors}=req.body;
    if(!tittle && tittle.trim()==="" &&
    !description && description.trim()==="" &&
    !posterUrl && posterUrl.trim()==="" &&
    !featured && featured.trim()==="" 
    ){
        return res.status(422).json({message:"Invalid Inputs"})
    }

    let movie;
    try {
        movie = new Movie({
            tittle,
            description,
            releaseDate:new Date(`${releaseDate}`),
            featured,
            actors,
            admin:adminId,
            posterUrl,

        });

        const session= await mongoose.startSession();
        const adminUser = await Admin.findById(adminId);
        session.startTransaction();
        await movie.save({session});
        adminUser.addedMovies.push(movie);
        await adminUser.save({session});
        await session.commitTransaction();

            // movie = await movie.save();
    } catch (error) {
        return console.log(error)
    }
    if(!movie){
        return res.status(500).json({message:"Request Failed"});
    }
    return res.status(201).json({movie});
};


//getall movies

export const getAllMovies= async(req,res,next)=>{
    let movies;

    try {
        movies= await Movie.find();
    } catch (error) {
        return console.log(error)
    }
    if(!movies){
        return res.status(500).json({message:"Request Failed"})
    }

    return res.status(200).json({movies})
}

export const getMovieById=async(req,res,next)=>{
    const id = req.params.id;
    let movie;
    try{
        movie= await Movie.findById(id);
    }
    catch(error){
        return console.log(error)
    }

    if(!movie){
        return res.status(404).json({message:"Invaild Movie ID"});
    }
    return res.status(200).json({movie});
}