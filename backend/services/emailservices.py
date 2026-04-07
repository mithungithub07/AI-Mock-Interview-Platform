# import smtplib
# from email.mime.text import MIMEText
# from email.mime.multipart import MIMEMultipart
# import os
# from dotenv import load_dotenv

# load_dotenv()

# SMTP_EMAIL = os.getenv("SMTP_EMAIL")
# SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
# FRONTEND_URL = "https://ai-mock-interview-platform-mu.vercel.app"

# def send_interview_link(to_email: str, role: str, level: str, token: str):
#     """Send interview link email via Gmail SMTP"""
    
#     # Create interview link
#     interview_url = f"{FRONTEND_URL}/interview?role={role}&level={level}&token={token}"
    
#     # Email content
#     subject = "Your Mock Interview is Ready! 🎯"
    
#     html_body = f"""
#     <html>
#         <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
#             <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
#                 <h2 style="color: #667eea;">Your Mock Interview is Ready!</h2>
#                 <p>Hello,</p>
#                 <p>You have been invited to take a <strong>{role}</strong> mock interview at <strong>{level}</strong> level.</p>
                
#                 <div style="margin: 30px 0; text-align: center;">
#                     <a href="{interview_url}" 
#                        style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
#                               color: white; 
#                               padding: 15px 40px; 
#                               text-decoration: none; 
#                               border-radius: 8px;
#                               display: inline-block;
#                               font-weight: 600;">
#                         Start Interview
#                     </a>
#                 </div>
                
#                 <p style="color: #666; font-size: 14px;">
#                     ⏰ This link will expire in 7 days.<br>
#                     📝 The interview contains 15 questions<br>
#                     🎤 You can answer via voice or code editor
#                 </p>
                
#                 <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
#                     If the button doesn't work, copy this link:<br>
#                     <a href="{interview_url}" style="color: #667eea;">{interview_url}</a>
#                 </p>
#             </div>
#         </body>
#     </html>
#     """
    
#     # Create message
#     message = MIMEMultipart("alternative")
#     message["Subject"] = subject
#     message["From"] = SMTP_EMAIL
#     message["To"] = to_email
    
#     html_part = MIMEText(html_body, "html")
#     message.attach(html_part)
    
#     # Send email
#     try:
#         with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
#             server.login(SMTP_EMAIL, SMTP_PASSWORD)
#             server.sendmail(SMTP_EMAIL, to_email, message.as_string())
#         return True
#     except Exception as e:
#         print(f"Email send failed: {e}")
#         raise Exception(f"Failed to send email: {str(e)}")


#==============

# import os
# from dotenv import load_dotenv
# import resend

# load_dotenv()

# # ✅ Load API key from environment
# resend.api_key = os.getenv("RESEND_API_KEY")

# # ✅ Your frontend URL
# FRONTEND_URL = "https://ai-mock-interview-platform-mu.vercel.app"


# def send_interview_link(to_email: str, role: str, level: str, token: str):
#     """Send interview link email using Resend API"""

#     print("📧 Sending email to:", to_email)

#     # ✅ Validate API key
#     if not resend.api_key:
#         raise Exception("RESEND_API_KEY not configured")

#     # ✅ Create interview link
#     interview_url = f"{FRONTEND_URL}/interview?role={role}&level={level}&token={token}"

#     # ✅ Email subject
#     subject = "Your Mock Interview is Ready! 🎯"

#     # ✅ HTML email (your styled version)
#     html_body = f"""
#     <html>
#         <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
#             <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
#                 <h2 style="color: #667eea;">Your Mock Interview is Ready!</h2>
#                 <p>Hello,</p>
#                 <p>You have been invited to take a <strong>{role}</strong> mock interview at <strong>{level}</strong> level.</p>

#                 <div style="margin: 30px 0; text-align: center;">
#                     <a href="{interview_url}" 
#                        style="background: #667eea;
#                               color: white; 
#                               padding: 15px 40px; 
#                               text-decoration: none; 
#                               border-radius: 8px;
#                               display: inline-block;">
#                         Start Interview
#                     </a>
#                 </div>

#                 <p style="color: #666; font-size: 14px;">
#                     ⏰ This link will expire in 7 days.<br>
#                     📝 The interview contains 15 questions<br>
#                     🎤 You can answer via voice or code editor
#                 </p>

#                 <p style="color: #999; font-size: 12px; margin-top: 30px;">
#                     If the button doesn't work, copy this link:<br>
#                     <a href="{interview_url}">{interview_url}</a>
#                 </p>
#             </div>
#         </body>
#     </html>
#     """

#     try:
#         # ✅ Send email via Resend
#         response = resend.Emails.send({
#             "from": "onboarding@resend.dev",  # default sender (works immediately)
#             "to": to_email,
#             "subject": subject,
#             "html": html_body
#         })

#         print("✅ Email sent successfully:", response)
#         return True

#     except Exception as e:
#         print("❌ Email send failed:", str(e))
#         raise Exception(f"Failed to send email: {str(e)}")
    


#=============================================

import os
import requests
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")

FRONTEND_URL = "https://ai-mock-interview-platform-mu.vercel.app"


def send_interview_link(to_email: str, role: str, level: str, token: str):
    """Send interview link using Brevo API"""

    print("📧 Sending email to:", to_email)

    if not BREVO_API_KEY:
        raise Exception("BREVO_API_KEY not configured")

    interview_url = f"{FRONTEND_URL}/interview?role={role}&level={level}&token={token}"

    url = "https://api.brevo.com/v3/smtp/email"

    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
        "content-type": "application/json"
    }

    payload = {
        "sender": {
            "name": "AI Mock Interview",
            "email": "mithun.kumar.careers@gmail.com"   # use YOUR VERIFIED email in Brevo
        },
        "to": [
            {
                "email": to_email
            }
        ],
        "subject": "Your Mock Interview is Ready! 🎯",
        "htmlContent": f"""
        <html>
            <body style="font-family: Arial; padding:20px;">
                <h2>Your Mock Interview is Ready!</h2>
                <p>Role: <b>{role}</b></p>
                <p>Level: <b>{level}</b></p>

                <a href="{interview_url}" 
                   style="background:#667eea;color:white;padding:10px 20px;text-decoration:none;">
                   Start Interview
                </a>

                <p>Link: {interview_url}</p>
            </body>
        </html>
        """
    }

    try:
        response = requests.post(url, json=payload, headers=headers)

        print("Brevo response:", response.text)

        if response.status_code not in [200, 201]:
            raise Exception(response.text)
        print("✅ Email sent successfully")
        return True

    except Exception as e:
        print("❌ Email send failed:", str(e))
        raise Exception(f"Failed to send email: {str(e)}")