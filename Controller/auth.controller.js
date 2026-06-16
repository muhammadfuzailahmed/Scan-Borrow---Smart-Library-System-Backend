import sql from "../DB/db.js";
import bcrypt from "bcryptjs"

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
  
  await sql.query`insert into activity_logs (loginId, userId, actionType, description) values (${loginId}, ${user.userId}, 'LOGIN', 'User logged in successfully')`
  
  return res.status(200).json({
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

export { loginUser, getCurrentUser };
