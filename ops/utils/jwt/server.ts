import jwt from "jsonwebtoken";

const defaultExpireTime = "24h";

export const generateToken = (
  claims: Record<string, any>,
  secret: string,
  expiresIn = defaultExpireTime
) => {
  const token = jwt.sign(claims, secret, { algorithm: "HS256", expiresIn });
  return token;
};

export const decodeToken = (token: string, secret: string) => {
  let decodedToken = jwt.verify(token, secret);

  return decodedToken;
};

export const buildTokenForResetPassword = (
  userEmail: string,
  IsInternalRequest: string
) => {
  return {
    "https://hasura.io/jwt/claims": {
      "x-hasura-user-email": userEmail,
      "x-hasura-IsInternalRequest": IsInternalRequest,
    },
  };
};
