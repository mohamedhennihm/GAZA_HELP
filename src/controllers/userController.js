import User from "../models/User.js"

export const getAllusers = (req,res)=>{
    const users = User.find()  ;
    if (!users){res.json({message:"no user found"});return;}
    res.status(201).json({message:"success",users});
}
export const getUserById = (req,res)=>{
    const {id} = req.id;
    const user = User.findById({id});
    if(!user){
        res.status(404).json({message:"user not found"});
        return;
    }
    res.status(201).json({message:"success",user});
}

