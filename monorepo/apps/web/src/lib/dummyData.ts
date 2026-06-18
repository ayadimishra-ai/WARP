export const dummyUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  mobile: "9876543210",
  company: "Acme Corporation",
  password: "Password123",
  confirmPassword: "Password123",
};

export const dummyVerifiedUser = {
  ...dummyUser,
  emailVerified: true,
  mobileVerified: true,
};

export const dummyOTP = {
  email: "123456",
  mobile: "654321",
};

export const dummyCompanies = [
  "Acme Corporation",
  "Tech Solutions Inc",
  "Global Industries",
  "Innovation Labs",
  "Future Systems",
];

export const dummyErrorMessages = {
  name: "Name is required",
  email: "Invalid email address",
  mobile: "Mobile number must be 10 digits",
  company: "Company name is required",
  password: "Password must be at least 6 characters",
  confirmPassword: "Passwords do not match",
  otp: "Please enter the 6-digit OTP",
};

export const dummySuccessMessages = {
  register: "Registered successfully!",
  emailVerify: "Email verified successfully!",
  mobileVerify: "Mobile number verified successfully!",
  otpSent: "OTP sent successfully!",
};

export const invalidUser = {
  name: "J", // too short
  email: "not-an-email",
  mobile: "12345", // too short
  company: "",
  password: "123",
  confirmPassword: "321", // does not match
};

export const partialUser = {
  name: "Jane",
  email: "jane.doe@example.com",
  // missing mobile, company, password, confirmPassword
};

export const usersArray = [
  dummyUser,
  dummyVerifiedUser,
  invalidUser,
  partialUser,
  {
    name: "A Very Very Long Name That Exceeds Normal Lengths For Testing Purposes",
    email: "long.name+test@example.com",
    mobile: "9999999999",
    company: "Edge Case Enterprises",
    password: "SuperSecurePassword!@#",
    confirmPassword: "SuperSecurePassword!@#",
  },
  {
    name: "Special Ch@r$ & Emoji 😊",
    email: "special.chars@example.com",
    mobile: "8888888888",
    company: "Emoji & Co.",
    password: "P@ssw0rd!",
    confirmPassword: "P@ssw0rd!",
  },
];

export const otpScenarios = {
  correct: "123456",
  incorrect: "654321",
  expired: "000000",
}; 