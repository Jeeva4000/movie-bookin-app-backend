import Admin from "../models/Admin";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const addAdmin = async (req, res, next) => {
    const { email, password } = req.body;
    if (

        !email
        && email.trim() === "" &&
        !password
        && password.trim() === "") {
        return res.status(422).json({ message: "Invaild Inputs" });
    }
    let existingAdmin;
    try {
        existingAdmin = await Admin.findOne({ email })
    } catch (error) {
        return console.log(error)
    }

    if (existingAdmin) {
        return res.status(500).json({ message: "Admin is already exists" })
    }
    let admin;
    const hashedPassword = bcrypt.hashSync(password);
    try {
        admin = new Admin({ email, password: hashedPassword });
        admin = await admin.save();
    } catch (error) {
        return console.log(error);
    }
    if (!admin) {
        return res.status(500).json({ message: "unable to store admin" })
    }
    return res.status(201).json({ admin })
}

//admin login
export const adminLogin = async (req, res, next) => {
    const { email, password } = req.body;
    if (

        !email
        && email.trim() === "" &&
        !password
        && password.trim() === "") {
        return res.status(422).json({ message: "Invaild Inputs" });
    }
    let existingAdmin;
    try {
        existingAdmin = await Admin.findOne({ email })
    } catch (error) {
        return console.log(error)
    }
    if (!existingAdmin) {
        return res.status(400).json({ message: "Admin not found" })

    }
    const isPasswordCorrect = bcrypt.compareSync(
        password,
        existingAdmin.password);

    if (!isPasswordCorrect) {
        return res.status(400).json({ message: "Incorrect Password" })
    }
    const token = jwt.sign({ id: existingAdmin._id }, process.env.SECRET_KEY, {
        expiresIn: "7d",
    });
    return res.status(200).json({
        message: "Admin Authentication Completed"
        , token,
        id: existingAdmin._id
    })


};


export const getAdmins = async (req,res,next)=>{
    let admins;
    try {
        admins = await Admin.find();
    } catch (error) {
        return console.log(error)
    }
    if(!admins){
        return res.status(500).json({message:"Internal server error"});
    }
    return res.status(200).json({admins});
}