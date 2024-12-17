const Category = require('../models/categoryModel.js');



const allCategories = async (req,res) => {
    try{
           const allCategory  = await Category.find();
           res.status(200).send({
            success : true,
            data : allCategory,
            message: "Found all categories",
            error : true
           })
    }catch(err){
        res.status(500).send({
            success: false,
            message: "Internal Server Error!",
            error: true
        })
    }
}


module.exports = {
    allCategories
}