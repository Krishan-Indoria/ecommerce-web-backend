const jwt =  require('jsonwebtoken');

const checkAuth = async (req,res,next) => {
            try{
                   
                    const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
                    // console.log("token    - ", token)
                    if(!token){
                        return res.status(401).send({
                            success : false,
                            message : "Unauthorized user!",
                            error : true
                        })
                    }
                        // console.log("token    - ", token)
                    jwt.verify(token, process.env.TOKEN_SECRET_KEY, function(err,decoded){
                            if(err) console.log(err)

                            req.user = decoded || null;

                            next();
                    })
            }catch(err){
               res.status(400).send({
                 success : false,
                 message : err.message || err,
                 data : [],
                 error : true
               })
            }
}

module.exports = checkAuth;