const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
            name : {
                type : String,
                required : true
            }
},{timestamps : true})


categorySchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
categorySchema.set('toJSON', {
    virtuals: true
});

const Category = mongoose.model('Category', categorySchema);

module.exports =  Category;