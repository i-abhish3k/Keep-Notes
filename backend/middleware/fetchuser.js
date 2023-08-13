var jwt = require('jsonwebtoken');
const JWT_SECRET = "abhinahito$kabhinhi";

const fetchuser = (req, res, next) => {
    // Get the user from the jwt token and add id to req object
    const token = req.header('auth-token');
    if (!token) {
        res.status(401).send({ error: "Please authenticate using a valid token1" })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET);
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).send({ error: "Please authenticate using a valid token2" })
    }

}


module.exports = fetchuser;// var jwt = require("jsonwebtoken");
// const JWT_SECRET = "abhinahito$kabhinhi";


// const fetchuser=(req, res, next)=>{
// //Get user from the jwt token and add id  to req object
//     const token =req.header('auth-token')
//     if(!token){
//         res.status(401).send({error:"Please authenticate using a vaild token"})
//     }
//     try {
//         const data=jwt.verify(token,JWT_SECRET);
//         req.user=data.user;
//         next();
//     } catch (error) {
//         res.status(401).send({error:"Please authenticate using a vaild token"})

//     }

// }

// module.exports=fetchuser;