const jwt = require("jsonwebtoken");

const Secret_key = process.env.JWT_SECRET;

const generateToken = ({_id, type}) => {
    const token =jwt.sign({_id, type}, Secret_key);
    return token;
};

const verifyToken =(token) =>{
    try{
        const payload = jwt.verify(token, Secret_key);
        return { status: true, payload};
    }catch(err){
        console.error(err);
        return {status: false, payload: undefined};
    }
};

module.exports = {generateToken, verifyToken};
