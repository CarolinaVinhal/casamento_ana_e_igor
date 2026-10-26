import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from html import escape
from urllib.parse import quote

import requests

# ==============================================================================
# Avisos para os noivos a cada confirmação de presença, presente ou recado.
# Tudo também fica salvo no banco de dados (painel admin.html).
# Configure pelas variáveis de ambiente (veja .env.example).
# ==============================================================================
COUPLE_EMAIL = os.getenv("COUPLE_EMAIL", "")               # pode ter vários, separados por vírgula
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")

# WhatsApp — opção 1 (grátis): CallMeBot manda mensagem para o SEU próprio número.
# Cada noivo ativa no celular dele e recebe uma apikey. Formato: "5561999999999:APIKEY,5561988888888:APIKEY2"
CALLMEBOT_TARGETS = os.getenv("CALLMEBOT_TARGETS", "")

# WhatsApp — opção 2: API própria (Evolution API, Z-API, Twilio...)
WHATSAPP_API_URL = os.getenv("WHATSAPP_API_URL", "")
WHATSAPP_TOKEN = os.getenv("WHATSAPP_TOKEN", "")
COUPLE_PHONE = os.getenv("COUPLE_PHONE", "5561992894788")

TITLE = "Casamento Ana Beatriz & Igor"


def _email(subject: str, message: str):
    recipients = [e.strip() for e in COUPLE_EMAIL.split(",") if e.strip()]
    if not (SMTP_USER and SMTP_PASS and recipients):
        return
    html = f"""
    <div style="font-family:Georgia,serif;background:#FDFAF7;padding:24px">
      <div style="max-width:520px;margin:auto;background:#fff;border:1px solid #EADBD6;border-radius:14px;padding:24px">
        <p style="font-family:'Great Vibes',cursive;color:#C9A27E;font-size:22px;margin:0">{TITLE}</p>
        <h2 style="color:#661C1D;margin:6px 0 14px">{escape(subject)}</h2>
        <p style="color:#2E1B1B;font-size:15px;line-height:1.6;white-space:pre-line">{escape(message)}</p>
      </div>
    </div>"""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = f"💍 {subject}"
    msg["From"] = SMTP_USER
    msg["To"] = ", ".join(recipients)
    msg.attach(MIMEText(message, "plain", "utf-8"))
    msg.attach(MIMEText(html, "html", "utf-8"))
    with smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=15) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(SMTP_USER, recipients, msg.as_string())


def _whatsapp(subject: str, message: str):
    text = f"💍 *{TITLE}*\n\n*{subject}*\n\n{message}"
    for target in [t.strip() for t in CALLMEBOT_TARGETS.split(",") if ":" in t]:
        phone, apikey = target.split(":", 1)
        requests.get(f"https://api.callmebot.com/whatsapp.php?phone={phone}&text={quote(text)}&apikey={apikey}", timeout=10)
    if WHATSAPP_API_URL:
        headers = {"Authorization": f"Bearer {WHATSAPP_TOKEN}"} if WHATSAPP_TOKEN else {}
        requests.post(WHATSAPP_API_URL, json={"number": COUPLE_PHONE, "message": text}, headers=headers, timeout=10)


def send_notification(subject: str, message: str):
    """ Dispara e-mail + WhatsApp. Falhas aqui nunca derrubam o site (o dado já está salvo no banco). """
    print(f"[AVISO] {subject}\n{message}\n")
    for channel in (_email, _whatsapp):
        try:
            channel(subject, message)
        except Exception as e:  # noqa: BLE001
            print(f"[AVISO] falha em {channel.__name__}: {e}")
