export default {
  secret: process.env.JWT_SECRET || "",
  saltRounds: 10,
  expiration: "2h",
  refreshToken: {
    expirationInMillis: 864000000, // 10 días
  },
};
