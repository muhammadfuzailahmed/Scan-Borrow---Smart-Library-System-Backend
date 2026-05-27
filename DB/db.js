import sql from "mssql/msnodesqlv8.js";

const config = {
  connectionString:
    "Driver={ODBC Driver 18 for SQL Server};Server=.\\SQLEXPRESS;Database=scan_borrow_smart_library_app;Trusted_Connection=Yes;TrustServerCertificate=Yes;"
};

export const connectDB = async () => {
  try {
    const pool = await sql.connect(config);
    console.log("Database connected successfully!");
    return pool;
  } catch (error) {
    console.log("Can't connect database", error);
  }
};

export default sql;
