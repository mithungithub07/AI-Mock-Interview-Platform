import os
import requests
from dotenv import load_dotenv

load_dotenv()

BREVO_API_KEY = os.getenv("BREVO_API_KEY")

FRONTEND_URL = "https://ai-mock-interview-platform-mu.vercel.app"


def send_interview_link(to_email: str, role: str, level: str, token: str):

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
            "email": "mithun.kumar.careers@gmail.com"
        },
        "to": [{"email": to_email}],
        "subject": "Your Mock Interview is Ready! 🎯",
        "htmlContent": f"""
<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
    body {{
        margin:0;
        padding:0;
        font-family: Arial, sans-serif;
        background:#f5f7fb;
    }}

    .container {{
        width:100%;
        max-width:600px;
        margin:auto;
        background:#ffffff;
    }}

    .header {{
        background:linear-gradient(135deg,#667eea,#764ba2);
        padding:30px 20px;
        text-align:center;
        color:#fff;
    }}

    .header h1 {{
        font-size:22px;
        margin:0;
    }}

    .content {{
        padding:20px;
    }}

    .box {{
        background:#f3f6ff;
        border-left:4px solid #667eea;
        padding:15px;
        margin:15px 0;
        border-radius:6px;
    }}

    .row {{
        padding:10px 0;
        font-size:14px;
    }}

    .label {{
        color:#667eea;
        font-weight:bold;
        display:inline-block;
        width:80px;
    }}

    /* ✅ MOBILE FIX */
    @media only screen and (max-width: 600px) {{
        .label {{
            display:block;
            width:100%;
            margin-bottom:4px;
        }}
    }}

    .cta {{
        text-align:center;
        padding:30px 10px;
    }}

    .btn {{
        background:#ff2d55;
        color:#fff;
        padding:16px 28px;
        text-decoration:none;
        font-size:16px;
        font-weight:bold;
        border-radius:8px;
        display:inline-block;
        box-shadow:0 6px 15px rgba(255,45,85,0.3);
    }}

    .btn:hover {{
        background:#e6003d;
    }}

    .footer {{
        text-align:center;
        font-size:12px;
        color:#888;
        padding:20px;
        background:#f5f7fb;
    }}
</style>
</head>

<body>

<div class="container">

    <!-- HEADER -->
    <div class="header">
        <h1>🎯 Interview Ready</h1>
        <p style="margin:5px 0;font-size:13px;">AI Mock Interview Platform</p>
    </div>

    <!-- CONTENT -->
    <div class="content">

        <p>Hi 👋</p>
        <p>Your interview is ready. Start when you're ready.</p>

        <div class="box">
            <div class="row">
                <span class="label">📍 Role:</span>
                <span>{role.title()}</span>
            </div>

            <div class="row">
                <span class="label">📊 Level:</span>
                <span>{level.title()}</span>
            </div>
        </div>

        <div class="cta">
            <a href="{interview_url}" class="btn">🚀 START INTERVIEW</a>
        </div>

        <p style="text-align:center;font-size:12px;color:#666;">
            Works best on desktop & mobile
        </p>

    </div>

    <!-- FOOTER -->
    <div class="footer">
        © 2026 AI Mock Interview Platform
    </div>

</div>

</body>
</html>
"""
    }

    try:
        response = requests.post(url, json=payload, headers=headers)

        if response.status_code not in [200, 201]:
            raise Exception(response.text)

        return True

    except Exception as e:
        raise Exception(f"Failed to send email: {str(e)}")