import jwt from "jsonwebtoken"
import sql from "../DB/db.js";

const verifyJWT = async (req, res, next) => {
    const token = req.cookies?.accessToken;
    if(!token) {
        return res.status(401).json({
            success: false,
            message: "Token not found"
        })
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const userResult = await sql.query`select userId, name, loginId, role, isActive from users where userId = ${decodedToken.userId}`;
        req.user = userResult.recordset[0];
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Error decoding token"
        })
    }
}

export default verifyJWT