export const generateOTP = (): string => {
    const digits = '0123456789';
    let otp = '';

    // Generate 6-digit OTP
    for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)];
    }

    // Ensure OTP has at least 2 distinct digits
    if (new Set(otp).size === 1) {
        return generateOTP(); // Recursively generate new OTP if all digits are same
    }

    return otp;
};
