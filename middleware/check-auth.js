const HttpError = require("../models/http-error")
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) =>{
    if (req.method === "OPTIONS"){
        return next();
    } 

    try{
        const token = req.headers.authorization.split(" ")[1]; // Authorization: "Bearer TOKEN"
        console.log(token);
        if(!token){
            return next(
                new HttpError(
                  "Authentication failed!",
                  401
                )
              );
        }
        const decodedToken =  jwt.verify(token, process.env.JWT_KEY)
        req.userData = {userId: decodedToken.userId};

        next();

    }catch(err){
        return next(
            new HttpError(
              "Authentication failed!",
              401
            )
          );


    }
    
   
} 