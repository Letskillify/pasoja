import nodemailer from "nodemailer";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    const {
        type,          // "welcome", "otp", or "order"
        to_email,
        to_name,
        otp_code,
        order_id,
        order_total,
        items_summary,
        temp_password,
        account_created
    } = req.body;

    if (!to_email) {
        return res.status(400).json({ error: "Email is required" });
    }

    const user = process.env.VITE_GMAIL_USER || process.env.GMAIL_USER;
    const pass = process.env.VITE_GMAIL_PASS || process.env.GMAIL_PASS;

    if (!user || !pass) {
        console.warn("Gmail credentials missing. Skipping email send.");
        return res.status(200).json({ message: "Mock email sent (credentials missing)" });
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user,
            pass
        }
    });

    const logo_url = "https://res.cloudinary.com/dcjn4y284/image/upload/v1786029668/p3jd3nuet4vkqbfd5qaz.png";
    const website_url = "https://pasoja.in";
    const support_email = "pasoja.help@gmail.com";

    let subject = "";
    let html = "";

    if (type === "welcome") {
        subject = `Welcome to Pasoja Atelier, ${to_name}`;
        html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f5f4f1;font-family:sans-serif;">
  <div style="background-color:#0a0a0a;padding:28px 40px;text-align:center;">
    <img src="${logo_url}" alt="Pasoja Atelier" height="36" style="height:36px;filter:invert(1);"/>
  </div>
  <div style="background-color:#c9a962;height:3px;"></div>
  <div style="padding:48px 40px;text-align:center;background:#fff;">
    <h1 style="margin:0 0 24px;font-size:28px;text-transform:uppercase;">Welcome, ${to_name}</h1>
    <p style="color:#3f3f46;line-height:1.7;">Your Pasoja Atelier account has been created. You now have exclusive access to our curated collections, order history, and your personal style profile.</p>
    <br/>
    <a href="${website_url}/shop" style="display:inline-block;background:#000;color:#fff;padding:14px 36px;text-decoration:none;text-transform:uppercase;font-weight:bold;">Explore Collections</a>
  </div>
</body>
</html>`;
    } else if (type === "otp") {
        subject = `Your Pasoja Login Code: ${otp_code}`;
        html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f5f4f1;font-family:sans-serif;">
  <div style="background-color:#0a0a0a;padding:28px 40px;text-align:center;">
    <img src="${logo_url}" alt="Pasoja Atelier" height="36" style="height:36px;filter:invert(1);"/>
  </div>
  <div style="background-color:#c9a962;height:3px;"></div>
  <div style="padding:48px 40px;text-align:center;background:#fff;">
    <h1 style="margin:0 0 8px;font-size:26px;text-transform:uppercase;">Your Login Code</h1>
    <div style="background:#f4f4f5;padding:24px 0;margin:24px auto;max-width:280px;font-size:42px;font-weight:bold;letter-spacing:12px;">${otp_code}</div>
    <p style="color:#71717a;">This code is valid for 10 minutes.</p>
  </div>
</body>
</html>`;
    } else if (type === "order") {
        subject = `Order Confirmed – #${order_id} | Pasoja Atelier`;
        html = `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background-color:#f5f4f1;font-family:sans-serif;">
  <div style="background-color:#0a0a0a;padding:28px 40px;text-align:center;">
    <img src="${logo_url}" alt="Pasoja Atelier" height="36" style="height:36px;filter:invert(1);"/>
  </div>
  <div style="background-color:#c9a962;height:3px;"></div>
  <div style="padding:40px 40px;background:#fff;">
    <h2 style="font-size:22px;text-transform:uppercase;">Thank you, ${to_name}</h2>
    <p>Your order <strong>#${order_id}</strong> is confirmed. Total: ${order_total}</p>
    <br/>
    <p><strong>Items Ordered:</strong></p>
    <pre style="font-family:sans-serif;color:#3f3f46;background:#fafaf9;padding:16px;">${items_summary}</pre>
    ${temp_password ? `<div style="background:#fefce8;padding:20px;margin-top:20px;">
      <p style="margin:0;"><strong>Account Auto-Created:</strong></p>
      <p>Password: <strong>${temp_password}</strong></p>
    </div>` : ""}
    <br/><br/>
    <a href="${website_url}/track" style="display:inline-block;background:#000;color:#fff;padding:14px 36px;text-decoration:none;text-transform:uppercase;font-weight:bold;">Track Order</a>
  </div>
</body>
</html>`;
    } else {
        return res.status(400).json({ error: "Invalid email type" });
    }

    try {
        await transporter.sendMail({
            from: `"Pasoja Atelier" <${user}>`,
            to: to_email,
            replyTo: support_email,
            subject,
            html
        });
        return res.status(200).json({ message: "Email sent successfully" });
    } catch (error) {
        console.error("Nodemailer error:", error);
        return res.status(500).json({ error: "Failed to send email" });
    }
}
