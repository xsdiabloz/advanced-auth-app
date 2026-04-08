import { MailtrapClient } from "mailtrap";
import "dotenv/config";

const TOKEN = process.env.MAILTRAP_TOKEN;

if (!TOKEN) throw new Error("cannot find token");

export const mailtrapClient = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "Mailtrap Test",
};
