interface Auth {
  secret: string;
  expirationTime: string;
}

export default {
  secret: process.env.JWT_SECRET,
  expirationTime: process.env.JWT_EXPIRATION_TIME,
} as Auth;
