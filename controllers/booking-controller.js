import mongoose from "mongoose";
import Bookings from "../models/Bookings";
import Movie from "../models/Movie";
import User from "../models/User";

export const newBooking = async (req, res, next) => {
    const { movie, date, seatNumber, user } = req.body;

    let existingMovie;
    let existingUser;
    let booking; 

    try {
        existingMovie = await Movie.findById(movie);
        existingUser = await User.findById(user);

        if (!existingMovie) {
            return res.status(404).json({ message: "Movie not found with the given Id" });
        }

        if (!existingUser) {
            return res.status(404).json({ message: "User not found with the given Id" });
        }

        // Check if date is a valid Date object
        if (isNaN(Date.parse(date))) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        // Check if user and seatNumber are provided
        if (!user || !seatNumber) {
            return res.status(400).json({ message: "User and seat number are required" });
        }

        const session = await mongoose.startSession(); // Use 'await' to get the session

        session.startTransaction();

        booking = new Bookings({ movie, date, seatNumber, user });

        existingUser.bookings.push(booking);
        existingMovie.bookings.push(booking);

        await existingUser.save({ session });
        await existingMovie.save({ session });
        await booking.save({ session });

        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to create a booking" });
    }

    if (!booking) {
        return res.status(500).json({ message: "Unable to create a booking" });
    }

    return res.status(201).json({ booking });
};


export const getBookingById= async (req,res,next)=>{
    const id = req.params.id;
    let booking;
    try {
        booking = await Bookings.findById(id)
        
    } catch (error) {
        return console.log
        (error)
    }
    if(!booking){
        return res.status(500).json({message:"Unexpected Error"});
    }
    return res.status(200).json({booking})
}

// export const deleteBooking = async (req,res,next)=>{
//     const id = req.params.id;
//     let booking;
//     try {
//         booking= await Bookings.findByIdAndRemove().populate("user movie");
//         console.log(booking);
//         const session = await mongoose.startSession();
//         session.startTransaction();
//         await booking.user.bookings.pull(booking);
//         await booking.movie.bookings.pull(booking);
//         await booking.movie.save({session});
//         await booking.user.save({session});
//         session.commitTransaction();

//     } catch (error) {
//         return console.log(error);
//     }

//     if(!booking){
//         return res.status(500).json({message:"Unable to Delete"});
//     }
//     return res.status(200).json({message:"successfully deleted"})
// }

export const deleteBooking = async (req, res, next) => {
    const id = req.params.id;
    let booking;
    try {
        booking = await Bookings.findByIdAndRemove(id).populate("user movie"); // Added 'id' to findByIdAndRemove
        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }
        const session = await mongoose.startSession();
        session.startTransaction();
        if (booking.user) {
            await booking.user.bookings.pull(booking);
            await booking.user.save({ session });
        }
        if (booking.movie) {
            await booking.movie.bookings.pull(booking);
            await booking.movie.save({ session });
        }
        await session.commitTransaction();
        session.endSession();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Unable to delete booking" });
    }

    return res.status(200).json({ message: "Successfully deleted" });
};