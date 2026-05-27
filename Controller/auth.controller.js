import sql from "../DB/db.js";

const loginUser = async (req, res) => {
    const {loginId, password} = req.body;

    const result = await sql.query`select * from users where loginId = ${loginId} and password = ${password}`

    if(result.recordset.length === 0) {
        return res.status(401).json({
            success: false,
            message: "Invalid credentials"
        })
    }

    const user = result.recordset[0];

    if(result.isActive === false) {
        return res.status(401).json({
            success: false,
            message: "Your account is not active"
        })
    }

    return res.status(200).json({
        success: true,
        message: "login successfull!",
        user
    })

}

export {loginUser}