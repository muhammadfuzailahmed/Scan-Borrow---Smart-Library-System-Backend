export const verifyStudent = async (req, res, next) => {
    if(req.user?.role !== "Student") {
        return res.status(200).json({
            success: true,
            message: "Student access only"
        })
    }
    next();
}

export const verifyAdmin = async (req, res, next) => {
    if(req.user?.role !== "Admin") {
        return res.status(200).json({
            success: true,
            message: "Admin access only"
        })
    }
    next();
}