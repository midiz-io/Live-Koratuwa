module.exports = {
  DATABASE_URL: process.env.DATABASE_URL || "mysql://root:password@localhost:3306/organic_garden",
  JWT_SECRET: process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || "development"
};
