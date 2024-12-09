const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
     name : {
        type : String,
        required : true
     },
     email : {
        type : String,
        required : true,
        unique : true
     },
     password : {
        type : String,
        required : true,
        min : 5
     },
     userType : {
        type : String,
        enum : ["Admin", "General"],
        default : "General"
     },
     profilePic : String
},{timestamps : true});

// Duplicate the ID field.
userSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
userSchema.set('toJSON', {
    virtuals: true
});
userSchema.index({ name: "text", email: "text"});
const User = mongoose.model('User', userSchema);

module.exports =  User;