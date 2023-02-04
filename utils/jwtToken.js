const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { TokenIssueError, } = require("../error/error");
const path = require("path");
dotenv.config({path : path.join(__dirname, '../.env')});

module.exports.issueToken = async (reqId, expire = "7d") =>{
    try{
        const signedJwt = jwt.sign(
            { // payload
                id : reqId,
            },
            process.env.TOKEN_SECRET_KEY,
            { // options
                expiresIn: expire,
                issuer : "sparc",
            }
        )
        return signedJwt;
    }
    catch(error){
        throw new TokenIssueError(error);
    }
};

module.exports.parseToken = (token) =>{
    return token.split(" ")[1];
}

module.exports.openToken = (token) => {
    const base64Payload = token.split('.')[1];
    const payload = Buffer.from(base64Payload, 'base64');
    const result = JSON.parse(payload.toString());
    
    return result;
}