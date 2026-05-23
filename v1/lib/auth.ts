export const authUser = {
  id: "usr_001",
  name: "Hami Teen Bhai",
  email: "hami@example.com",
  role: "customer",
  mfaEnabled: true,
  loginMethods: ["email/password", "otp"],
};

export const authFactors = [
  "Email/password login",
  "One-time passcode verification",
  "Remember-me session token",
  "Password reset email flow",
];