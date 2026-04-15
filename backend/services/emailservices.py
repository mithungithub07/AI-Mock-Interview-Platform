import os
import requests
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")

FRONTEND_URL = "https://ai-mock-interview-platform-mu.vercel.app"


def send_interview_link(to_email: str, role: str, level: str, token: str):
    """Send interview link using Brevo API with beautiful email design"""

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
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                * {{
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }}
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
                    line-height: 1.6;
                    color: #2c3e50;
                    background-color: #f8f9fa;
                }}
                .container {{
                    max-width: 600px;
                    margin: 0 auto;
                    background: white;
                    border-radius: 12px;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
                }}
                .header {{
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 40px 30px;
                    text-align: center;
                    color: white;
                }}
                .header h1 {{
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 10px;
                    letter-spacing: -0.5px;
                }}
                .header p {{
                    font-size: 14px;
                    opacity: 0.95;
                }}
                .content {{
                    padding: 40px 30px;
                }}
                .greeting {{
                    font-size: 16px;
                    margin-bottom: 20px;
                    color: #2c3e50;
                }}
                .interview-details {{
                    background: #f0f4ff;
                    border-left: 4px solid #667eea;
                    padding: 20px;
                    border-radius: 6px;
                    margin: 25px 0;
                }}
                .detail-row {{
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 0;
                    border-bottom: 1px solid rgba(102, 126, 234, 0.1);
                }}
                .detail-row:last-child {{
                    border-bottom: none;
                }}
                .detail-label {{
                    font-size: 14px;
                    color: #667eea;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }}
                .detail-value {{
                    font-size: 16px;
                    font-weight: 600;
                    color: #2c3e50;
                }}
                .cta-container {{
                    text-align: center;
                    margin: 30px 0;
                }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 16px 50px;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 16px;
                    transition: transform 0.2s, box-shadow 0.2s;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                    border: none;
                    cursor: pointer;
                }}
                .cta-button:hover {{
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                }}
                .info-box {{
                    background: #f0f7ff;
                    border: 1px solid #d1e7ff;
                    border-radius: 6px;
                    padding: 15px;
                    margin: 25px 0;
                }}
                .info-item {{
                    display: flex;
                    align-items: center;
                    padding: 8px 0;
                    font-size: 14px;
                    color: #555;
                }}
                .info-icon {{
                    margin-right: 10px;
                    font-size: 16px;
                }}
                .fallback-link {{
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid #e0e0e0;
                    font-size: 12px;
                    color: #999;
                }}
                .fallback-link a {{
                    color: #667eea;
                    text-decoration: none;
                    word-break: break-all;
                }}
                .footer {{
                    background: #f8f9fa;
                    padding: 25px 30px;
                    text-align: center;
                    border-top: 1px solid #e0e0e0;
                    font-size: 12px;
                    color: #999;
                }}
                .footer p {{
                    margin: 5px 0;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🎯 Interview Ready</h1>
                    <p>Your mock interview session is prepared and waiting</p>
                </div>

                <div class="content">
                    <p class="greeting">Hi there! 👋</p>
                    
                    <p>Congratulations! You've been invited to take a mock interview session. This is your opportunity to practice and prepare for real interview scenarios.</p>

                    <div class="interview-details">
                        <div class="detail-row">
                            <span class="detail-label">📍 Role</span>
                            <span class="detail-value">{role.title()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">📊 Level</span>
                            <span class="detail-value">{level.title()}</span>
                        </div>
                    </div>

                    <p>This interview session includes:</p>
                    <div class="info-box">
                        <div class="info-item">
                            <span class="info-icon">📝</span>
                            <span>15 carefully curated questions</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">🎤</span>
                            <span>Answer via voice or code editor</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">⏱️</span>
                            <span>Access valid for 7 days</span>
                        </div>
                        <div class="info-item">
                            <span class="info-icon">✨</span>
                            <span>Real-time feedback & analytics</span>
                        </div>
                    </div>

                    <div class="cta-container">
                        <a href="{interview_url}" class="cta-button">Start Interview Now</a>
                    </div>

                    <p style="font-size: 14px; color: #666; margin-top: 20px;">
                        Ready to ace your interview? Click the button above to begin your session. Good luck! 💪
                    </p>

                    <div class="fallback-link">
                        <p style="margin-bottom: 8px;">If the button doesn't work, copy and paste this link in your browser:</p>
                        <a href="{interview_url}">{interview_url}</a>
                    </div>
                </div>

                <div class="footer">
                    <p>© 2024 AI Mock Interview Platform</p>
                    <p>Questions? Contact us for support</p>
                </div>
            </div>
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