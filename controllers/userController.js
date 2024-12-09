const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const signUp = async (req, res) => {
    try {
        const { name, email, password, profilePic } = req.body;

        if (!name) {
            return res.status(400).send({
                "success": false,
                "message": "name is required!",
                "error": true
            })
        }
        if (!email) {
            return res.status(400).send({
                "success": false,
                "message": "email is required!",
                "error": true
            })
        }
        if (!password) {
            return res.status(400).send({
                "success": false,
                "message": "password is required!",
                "error": true
            })
        }

        const isExistUser = await User.findOne({ email });
        if (isExistUser) {
            return res.status(400).send({
                "success": false,
                "message": "user already exists!",
                "error": true
            })
        }
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = await bcrypt.hashSync(password, salt);
        if (!hashedPassword) {
            throw new Error("Something went wrong!");
        }

        const user = new User({
            name: name,
            email: email,
            password: hashedPassword,
            profilePic: profilePic
        });
        const newUser = await user.save();
        if (newUser) {
            res.status(201).send({
                success: true,
                message: "user created successfully.",
                data: newUser
            })
        } else {
            res.status(500).send({
                success: false,
                message: "Internal Server Error!",
                error: true
            })
        }
    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
}


const signIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).send({
                "success": false,
                "message": "email is required!",
                "error": true
            })
        }
        if (!password) {
            return res.status(400).send({
                "success": false,
                "message": "password is required!",
                "error": true
            })
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).send({
                "success": false,
                "message": "user not found!",
                "error": true
            })
        }
        const checkPassword = bcrypt.compareSync(password, user.password);
        if (checkPassword) {
            const tokenPayload = {
                id: user._id,
                email: user.email
            }
            const token = await jwt.sign(tokenPayload, process.env.TOKEN_SECRET_KEY, { expiresIn: '1d' })
            res.cookie("token", token, { httpOnly: true, secure: true }).status(200).send({
                success: true,
                message: "Login Successfully.",
                data: token,
                error: false
            })
        } else {
            return res.status(401).send({
                "success": false,
                "message": "Invalid Credentials!",
                "error": true
            })
        }

    } catch (err) {
        console.log(err);
        throw new Error(err);
    }
}

const userDetails = async (req, res) => {
    try {
        const id = req.user.id;

        let user = await User.findOne({ _id: id }).select("-password");
        if (!user) {
            throw new Error("User not found!");
        }

        return res.status(200).send({
            success: true,
            message: "user found successfully.",
            data: user,
            error: false
        })

    } catch (err) {
        res.status(400).send({
            success: false,
            message: err.message || err,
            error: true
        })
    }
}

const logout = async (req, res) => {
    try {
        res.clearCookie("token");

        res.status(200).send({
            success: true,
            message: "Logged out successfully.",
            data: [],
            error: false
        })
    } catch (err) {
        res.send({
            success: false,
            message: err.message || err,
            error: true
        })
    }
}

const allUsers = async (req, res) => {
    try {
        const { currentPage, perPage, userType, searchValue, dateRange } = req.query;
        let date_Range = JSON.parse(dateRange);
        const limit = Math.min(perPage, 20);
        const skip = perPage * (currentPage - 1);
        
        const lware = {}
        if (userType) {
            lware.userType = userType;
        }
        if (searchValue) {
            lware.$text = { $search: searchValue }
        }
        if(date_Range.from && date_Range.to){
            const start_date = new Date(date_Range.from).setDate(new Date(date_Range.from).getDate() + 1)
            const end_date =  new Date(date_Range.to).setDate( new Date(date_Range.to)?.getDate() + 1)
            lware.createdAt = {
                $gte: new Date(start_date) ,  // Greater than or equal to startDate
                $lte: new Date(end_date)   // Less than or equal to endDate
              }
        }
       
        const allUsers = await User.aggregate([
                                                { $match : lware},
                                                { $sort: { createdAt: -1 } },
                                                { $facet: {
                                                    metadata: [
                                                        {$count: "totalCount"}, 
                                                    ],
                                                    results: [
                                                        { $skip: skip}, { $limit: limit }, { $project : {
                                                            password : 0, profilePic : 0
                                                        }}   
                                                    ],
                                                    },
                                                },
        ]);
        res.send({
            success: true,
            message: "Users found successfully.",
            data: {
                metadata : { totalCount : allUsers[0].metadata[0]?.totalCount,limit,skip},
                data : allUsers[0].results
            },
            error: false
        })
    } catch (err) {
        res.status(400).send({
            success: false,
            message: err.message || err,
            error: true
        })
    }
}

const deleteUser = async (req, res) => {
    try{
            const {userId} = req.params;
            const deletedUser = await User.findByIdAndDelete(userId);
            res.status(200).send({
                success: true,
                message: "User deleted successfully.",
                data: deletedUser,
                error: false
            })
    }catch(error) {
        res.status(400).send({
            success: false,
            message: err.message || err,
            error: true
        })
    }
     
}

const updateUser = async (req, res) => {
    try{
            const sessionId = req.user.id;
            const {id} = req.params;
            const {name,email,userType} = req.body;
            if(!name || !email ){
                return res.status(400).send({
                    "success": false,
                    "message": "all fields are required!",
                    "error": true
                })
            }

            payload = {
                ...(name && {name : name}),
                ...(email && {email : email}),
                ...(userType && {userType : userType}),
            }

            const user = await User.findById(sessionId);

            const updatedUser = await User.findByIdAndUpdate(id,payload);
            res.status(200).send({
                success: true,
                message: "User updated successfully.",
                data: updatedUser,
                error: false
            })
    }catch(err) {
        res.status(400).send({
            success: false,
            message: err.message || err,
            error: true
        })
    }
     
} 
module.exports = {
    signUp,
    signIn,
    userDetails,
    logout,
    allUsers,
    deleteUser,
    updateUser
}