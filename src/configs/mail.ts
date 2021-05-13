export default {
  apiKey: process.env.SENDGRID_KEY || "BAD_API_KEY",
  from: process.env.SENDGRID_FROM || "test@test.test",
};
