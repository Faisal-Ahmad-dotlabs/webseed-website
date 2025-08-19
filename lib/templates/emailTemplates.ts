export function createOTPEmailTemplate(userName: string, otp: string, purpose: string): string {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f4f6fa; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 30px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="width: 60px; height: 60px; background-color: #0d1f3c; border-radius: 50%; margin: 0 auto;">
          <span style="display: inline-block; font-size: 32px; color: #ffffff; line-height: 60px;">✔</span>
        </div>
      </div>
      <h2 style="text-align: center; color: #0d1f3c; margin-bottom: 10px;">WebSeed ${purpose === "login" ? "Login" : "Password Reset"} OTP</h2>
      <p style="text-align: center; color: #333333; font-size: 16px; margin-bottom: 8px;">
        Dear ${userName},
      </p>
      <p style="text-align: center; color: #333333; font-size: 16px; margin-bottom: 24px;">
        Your One-Time Password (OTP) for WebSeed ${purpose} is: <strong style="font-size: 24px; color: #0d1f3c;">${otp}</strong>
      </p>
      <p style="text-align: center; color: #999; font-size: 14px; margin-bottom: 24px;">
        This OTP is valid for 5 minutes. Do not share it with anyone.
      </p>
      <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
        If you did not request this, please ignore this email.<br>
        Best Regards,<br><strong>DOT LABs Development Team - WebSeed</strong>
      </p>
    </div>
    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 30px;">
      WEBSEED – <a href="mailto:no-reply@dotlabs.ai" style="color: #999;">no-reply@dotlabs.ai</a>
    </p>
  </div>
  `
}