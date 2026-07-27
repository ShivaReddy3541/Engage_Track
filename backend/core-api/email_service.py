import smtplib
import os
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Load .env file robustly from the directory of this file
try:
    from dotenv import load_dotenv
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dotenv_path = os.path.join(current_dir, ".env")
    load_dotenv(dotenv_path)
except ImportError:
    pass  # dotenv not installed, rely on OS environment variables

# SMTP configuration — using Gmail SMTP
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = os.getenv("EMAIL_USER", "")   # set in .env: EMAIL_USER=your@gmail.com
SMTP_PASS = os.getenv("EMAIL_PASS", "")   # set in .env: EMAIL_PASS=your-gmail-app-password


def send_email(to_address: str, subject: str, html_body: str) -> bool:
    """Sends an HTML email via Gmail SMTP."""
    if not SMTP_USER or not SMTP_PASS:
        print("Email credentials not configured. Skipping email send.")
        return False
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = SMTP_USER
        msg["To"] = to_address

        part = MIMEText(html_body, "html")
        msg.attach(part)

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.login(SMTP_USER, SMTP_PASS)
            server.sendmail(SMTP_USER, [to_address], msg.as_string())

        print(f"Email sent successfully to {to_address}")
        return True
    except Exception as e:
        print(f"Failed to send email to {to_address}: {e}")
        return False


def faculty_welcome_email(name: str, department: str, designation: str,
                           college_email: str, personal_email: str) -> bool:
    """Sends a welcome email to newly added faculty member."""
    subject = f"Welcome to SSV University - {name}"
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; padding: 20px;">
      <p>Hello {name},</p>
      <p>Welcome to the <strong>SSV University</strong> academic community! We are glad to have you join our faculty team.</p>
      <p>You have been successfully registered in the <strong>{department}</strong> department as a <strong>{designation}</strong>.</p>
      
      <p><strong>Your University Account Details:</strong><br/>
      - College Email: {college_email}<br/>
      - Default Password: <strong>123456</strong><br/>
      - Department: {department}<br/>
      - Designation: {designation}</p>
      
      <p style="color: #ef4444; font-weight: bold;">Please change the password for privacy and security upon logging in for the first time.</p>
      <p>You can now use your college email to access the university portal and configure your account.</p>
      <p>Best regards,<br/>SSV University Administration</p>
    </body>
    </html>
    """
    return send_email(personal_email, subject, html_body)


def student_welcome_email(full_name: str, department: str, section: str,
                           roll_number: str, college_email: str,
                           personal_email: str) -> bool:
    """Sends a welcome email to newly pre-registered student."""
    subject = f"Welcome to SSV University - {full_name}"
    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333333; padding: 20px;">
      <p>Hello {full_name},</p>
      <p>We are excited to welcome you to <strong>SSV University</strong>! Your pre-registration has been completed successfully.</p>
      <p>You have been assigned to the <strong>{department}</strong> department, <strong>Section {section}</strong>.</p>
      
      <p><strong>Your Student Registration Details:</strong><br/>
      - Roll Number: {roll_number}<br/>
      - College Email: {college_email}<br/>
      - Assigned Section: Section {section}</p>
      
      <p>Please visit the SSV University Portal, click on "Register" to set up your password using your new college email ID and roll number.</p>
      <p>Best regards,<br/>SSV University Admissions Office</p>
    </body>
    </html>
    """
    return send_email(personal_email, subject, html_body)
