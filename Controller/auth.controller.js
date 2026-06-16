import sql from "../DB/db.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const generateAccessToken = (userId) => {
  return jwt.sign({
    userId: userId
  },
  process.env.ACCESS_TOKEN_SECRET,
  {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY
  }
)
}

const generateRefreshToken = (userId) => {
  return jwt.sign({
    userId: userId
  },
  process.env.REFRESH_TOKEN_SECRET,
  {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY
  }
)
}

const loginUser = async (req, res) => {
  const { loginId, password } = req.body;

  const result =
    await sql.query`select * from users where loginId = ${loginId}`;

  if (result.recordset.length === 0) {
    await sql.query`insert into activity_logs (loginId, userId, actionType, description) values (${loginId}, NULL, 'LOGIN FAILED', 'Invalid login attempt')`
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  const user = result.recordset[0];

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if(!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    })
  }

  if (user.isActive === false) {
    return res.status(401).json({
      success: false,
      message: "Your account is not active",
    });
  }

  const accessToken = generateAccessToken(user.userId);
  const refreshToken = generateRefreshToken(user.userId);
  
    await sql.query`update users set refreshToken = ${refreshToken} where userId = ${user.userId}`
  
  await sql.query`insert into activity_logs (loginId, userId, actionType, description) values (${loginId}, ${user.userId}, 'LOGIN', 'User logged in successfully')`
  
  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json({
    success: true,
    message: "login successfull!",
    user,
  });
};

const getCurrentUser = async (req, res) => {
  const { userId } = req.params;
  const result = await sql.query`select * from users where userId = ${userId}`;
  
  if (result.recordset.length === 0) {
    return res.status(404).json({
      success: false,
      message: "user not found",
    });
  }
  
  const user = result.recordset[0];

  return res.status(200).json({
    success: true,
    message: "User fetched successfully!",
    user,
  });
};

const logoutUser = async (req, res) => {
  const {userId} = req.body;

  if(!userId) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    })
  }

  await sql.query`update users set refreshToken = NULL where userId = ${userId}`

  const options = {
    httpOnly: true,
    secure: true
  }

  return res.status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json({
    success: true,
    message: "Logout successfull"
  })

}

export { loginUser, getCurrentUser, logoutUser };
