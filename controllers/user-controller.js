import mongoose from "mongoose";
import Bookings from "../models/Bookings";
import User from "../models/User";
import bcrypt from "bcryptjs"

//all users
export const getAllUsers = async (req, res, next) => {
    let users;
    try {
        users = await User.find();
    } catch (error) {
        return console.log(error);
    }
    if (!users) {
        return res.status(500).json({ message: "unexpected Error Occured" })
    }
    return res.status(200).json({ users });
};


// export const signup= async (req,res,next)=>{
//     const { name,email,password } = req.body;
//     if(
//         !name 
//         && name.trim()==="" && 
//         !email
//          && email.trim()==="" && 
//          !password 
//          && password.trim()==="")
//          {
//         return res.status(422).json({message:"Invaild Inputs"});
//     }
//     let user;
//     try {
//         user = new User({name,email,password});
//         user = await user.save();
//     } catch (error) {
//         return console.log(error)
//     }
//     if (!user) {
//         return res.status(500).json({ message: "unexpected Error Occured" })
//     }
//     return res.status(201).json({ user });
// }



//signup user
export const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  try {
    // Check if a user with the same email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(422).json({ message: 'Email address already in use' });
    }

    // Hash the password
    const saltRounds = 10; // You can adjust the number of salt rounds
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user with the hashed password
    const newUser = new User({ name, email, password: hashedPassword });
    const savedUser = await newUser.save();

    if (!savedUser) {
      throw new Error('Unexpected error occurred while saving the user');
    }

    return res.status(201).json({ id: savedUser._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
};


//update users
export const updateUser = async(req,res,next)=>{
    const id=req.params.id;
    const { name,email,password } = req.body;
    if(
        !name 
        && name.trim()==="" && 
        !email
         && email.trim()==="" && 
         !password 
         && password.trim()==="")
         {
        return res.status(422).json({message:"Invaild Inputs"});
    }
const hashedPassword= bcrypt.hashSync(password)
    let user;
    try {
        user = await User.findByIdAndUpdate(id,{
            name,
            email,
            password:hashedPassword
        });
    } catch (error) {
        return console.log(error)
    }
    if(!user){
        return res.status(500).json({message:"Something went wrong"})
    }
    res.status(200).json({message:"updated successfully"})
}

//delete user
export const deleteUser= async (req,res,next)=>{
    const id = req.params.id;
    let user;
    try {
        user = await User.findByIdAndRemove(id);
    } catch (error) {
        return console.log(error);
    }
    if(!user){
        return res.status(500).json({message:"Something went wrong"})
    }
    res.status(200).json({message:"deleted successfully"})
}


//user login
export const login = async (req, res, next) => {
    const { email, password } = req.body;
  
    try {
      if (!email.trim() || !password.trim()) {
        return res.status(422).json({ message: "Invalid Inputs" });
      }
  
      let existingUser;
      try {
        existingUser = await User.findOne({ email });
      } catch (error) {
        return console.log(error);
      }
  
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const isPasswordCorrect = bcrypt.compareSync(password, existingUser.password);
  
      if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect password" });
      }
  
      // Return the user's ID along with a success message
      return res.status(200).json({ message: "Logged in successfully", id: existingUser._id });
    } catch (error) {
      // Handle other errors, e.g., database connection issues
      console.error(error);
      return res.status(500).json({ message: "An error occurred" });
    }
  };
  


// export const getBookingsOfUser = async (req,res,next)=>{
//     const id = req.params.id;
//     let bookings;
//     try {
//         bookings = await Bookings.find({user:id});
//     } catch (error) {
//         return console.log(error)
//     }
//     if(!bookings){
//         return res.status(500).json({message:"Unable to get bookings"});
//     }
//     return res.status(200).json({bookings})
// }

export const getBookingsOfUser = async (req, res, next) => {
    const id = req.params.id;
  
    try {
      
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
      }
  
      
      const bookings = await Booking.find({ user: id });
  
      if (!bookings) {
        return res.status(404).json({ message: 'Bookings not found for this user' });
      }
  
      return res.status(200).json({ bookings });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Unable to get bookings' });
    }
  };