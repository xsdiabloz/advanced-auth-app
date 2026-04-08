import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplates.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string,
) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken,
      ),
      category: "Email verification",
    });
  } catch (error) {
    throw new Error(`Error while sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      template_uuid: "0ff5c757-a3c1-44de-bbea-a2d083006371",
      template_variables: {
        company_info_name: "Auth Company",
        name,
      },
    });
    console.log("Welcome email sent successfully", response);
  } catch (error) {
    console.error(`Error sending welcome email`, error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetURL: string,
) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Reset your Password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
      category: "Password Reset",
    });
  } catch (error) {
    console.error(`Error sending password reset email`, error);
    throw new Error(`Error sending password reset email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email: string) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Password reset successfull",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Password Reset",
    });
  } catch (error) {
    console.error(`Error sending password reset success email`, error);
    throw new Error(`Error sending password reset success email: ${error}`);
  }
};
