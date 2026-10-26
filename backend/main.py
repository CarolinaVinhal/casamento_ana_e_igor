import ipaddress
import os
import random
import re
import secrets
import sys
import threading
import time
import unicodedata
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from typing import List

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import Base, engine, get_db
from notifier import send_notification
from seed import seed_database

# ==============================================================================
# CONFIGURAÇÕES (variáveis de ambiente — veja .env.example)
# ==============================================================================
PIX_KEY = os.getenv("PIX_KEY", "+5561991760206")          # celular SEMPRE com +55
PIX_MERCHANT_NAME = os.getenv("PIX_MERCHANT_NAME", "Ana Beatriz e Igor")
PIX_MERCHANT_CITY = os.getenv("PIX_MERCHANT_CITY", "BRASILIA")
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "")                  # senha das rotas /api/admin (mín. 20 caracteres)
TRUST_PROXY = os.getenv("TRUST_PROXY", "true").lower() == "true"  # atrás de Nginx/Render: usa o IP real do visitante
ENABLE_DOCS = os.getenv("ENABLE_DOCS", "false").lower() == "true"  # /docs só quando você quiser (ex.: no seu PC)
PENDING_HOURS = int(os.getenv("PENDING_HOURS", "48"))       # reserva "Aguardando Pix" expira sozinha
ALLOWED_ORIGINS = [o.strip() for o in os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:8080,http://127.0.0.1:8080,http://localhost:5500,http://127.0.0.1:5500"
).split(",") if o.strip()]

Base.metadata.create_all(bind=engine)
seed_database()

app = FastAPI(
    title="API Casamento Ana Beatriz & Igor",
    description="Convidados, RSVP, Lista de Presentes, Mural e Notificações.",
    version="2.1.0",
    # 🔒 Em produção a documentação automática fica desligada (ela mostra o "mapa" da API)
    docs_url="/docs" if ENABLE_DOCS else None,
    redoc_url=None,
    openapi_url="/openapi.json" if ENABLE_DOCS else None,
)

# Só o domínio do site pode chamar a API (antes era "*" + credentials, combinação inválida/insegura)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Admin-Token"],
)


def now():
    return datetime.now(timezone.utc)


def normalize(text: str) -> str:
    """ 'João  Pedro' -> 'joao pedro' (sem acentos, minúsculo, espaços únicos) """
    text = unicodedata.normalize("NFD", text or "")
    text = "".join(c for c in text if unicodedata.category(c) != "Mn").lower()
    text = re.sub(r"[^a-z\s]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def find_guest(db: Session, typed_name: str):
    """
    Aceita o nome completo ou 'primeiro nome + sobrenomes' do convite.
    Antes era ilike('%nome%'): digitar só 'a' encontrava o primeiro convidado com 'a' no nome.
    """
    typed = [w for w in normalize(typed_name).split(" ") if len(w) >= 2]
    if len(typed) < 2:
        return None
    for guest in db.query(models.Guest).all():
        words = normalize(guest.full_name).split(" ")
        if words and words[0] == typed[0] and all(w in words for w in typed):
            return guest
    return None


# ==============================================================================
# 🔒 LIMITE DE TENTATIVAS (anti-spam / anti-força-bruta)
# Simples, em memória: suficiente para 1 servidor. Reinicia se o servidor reiniciar.
# ==============================================================================
_hits = defaultdict(deque)
_hits_lock = threading.Lock()


def client_ip(request: Request) -> str:
    """
    IP real do visitante. Atrás de Nginx/Render o IP vem no X-Forwarded-For.
    Lemos da DIREITA para a esquerda e pegamos o primeiro IP público: os da esquerda
    podem ser inventados pelo visitante para fugir do limite de tentativas.
    """
    if TRUST_PROXY:
        forwarded = [p.strip() for p in request.headers.get("x-forwarded-for", "").split(",") if p.strip()]
        for candidate in reversed(forwarded):
            try:
                if not ipaddress.ip_address(candidate).is_private:
                    return candidate
            except ValueError:
                continue
    return request.client.host if request.client else "desconhecido"


def rate_limit(bucket: str, max_hits: int, per_seconds: int):
    def dependency(request: Request):
        key = (bucket, client_ip(request))
        now_ts = time.monotonic()
        with _hits_lock:
            q = _hits[key]
            while q and now_ts - q[0] > per_seconds:
                q.popleft()
            if len(q) >= max_hits:
                raise HTTPException(status_code=429, detail="Muitas tentativas. Aguarde alguns minutos.")
            q.append(now_ts)
    return Depends(dependency)


def require_admin(request: Request, x_admin_token: str = Header(default="")):
    # Senha fraca ou vazia = painel desligado
    if len(ADMIN_TOKEN) < 20:
        raise HTTPException(status_code=503, detail="Painel desativado: defina ADMIN_TOKEN com pelo menos 20 caracteres.")
    if not secrets.compare_digest(x_admin_token.encode(), ADMIN_TOKEN.encode()):
        # conta só as tentativas erradas: 10 erros em 15 min bloqueiam o IP
        key = ("admin_fail", client_ip(request))
        now_ts = time.monotonic()
        with _hits_lock:
            q = _hits[key]
            while q and now_ts - q[0] > 900:
                q.popleft()
            q.append(now_ts)
            blocked = len(q) > 10
        raise HTTPException(status_code=429 if blocked else 401,
                            detail="Muitas tentativas." if blocked else "Acesso restrito aos noivos.")
    with _hits_lock:
        key = ("admin_fail", client_ip(request))
        if len(_hits[key]) > 10:
            raise HTTPException(status_code=429, detail="Muitas tentativas.")


@app.get("/")
@app.get("/api/health")
def read_root():
    return {"message": "API do Casamento de Ana Beatriz & Igor ativa!", "status": "online"}


# ==============================================================================
# CONVIDADOS E RSVP
# ==============================================================================
def group_members(db: Session, guest: models.Guest):
    if not guest.group_name:
        return [guest]
    return (db.query(models.Guest).filter(models.Guest.group_name == guest.group_name)
            .order_by(models.Guest.id).all())


@app.get("/api/guests/suggest", response_model=List[schemas.GuestSuggestion], dependencies=[rate_limit("suggest", 120, 600)])
def suggest_guests(q: str = "", db: Session = Depends(get_db)):
    """
    Sugere nomes enquanto a pessoa digita (mín. 3 letras, máx. 6 resultados).
    Só devolve nomes que COMEÇAM com o que foi digitado (por palavra), para não listar todo mundo.
    """
    words = [w for w in normalize(q).split(" ") if w]
    if not words or len("".join(words)) < 3:
        return []
    out = []
    for guest in db.query(models.Guest).order_by(models.Guest.full_name).all():
        gwords = normalize(guest.full_name).split(" ")
        if all(any(gw.startswith(w) for gw in gwords) for w in words):
            mates = [m.full_name for m in db.query(models.Guest).filter(models.Guest.group_name == guest.group_name).all()] if guest.group_name else [guest.full_name]
            others = [m.split(" ")[0] for m in mates if m != guest.full_name]
            out.append({"name": guest.full_name, "group_size": len(mates), "with_names": others})
            if len(out) >= 6:
                break
    return out


@app.get("/api/guests/group", response_model=schemas.GroupResponse, dependencies=[rate_limit("suggest", 120, 600)])
def guest_group(name: str, db: Session = Depends(get_db)):
    """ Devolve quem está no mesmo convite (casal/família) para confirmar junto """
    guest = db.query(models.Guest).filter(models.Guest.full_name == name.strip()).first() or find_guest(db, name)
    if not guest:
        raise HTTPException(status_code=404, detail="Convidado não encontrado.")
    members = []
    for m in group_members(db, guest):
        rsvp = db.query(models.RSVP).filter(models.RSVP.guest_id == m.id).first()
        members.append({"name": m.full_name, "status": rsvp.status if rsvp else None})
    return {"group": guest.group_name, "members": members}


def resolve_guest(db: Session, name: str):
    return db.query(models.Guest).filter(models.Guest.full_name == name.strip()).first() or find_guest(db, name)


def set_rsvp(db: Session, guest: models.Guest, status_value: str):
    rsvp = db.query(models.RSVP).filter(models.RSVP.guest_id == guest.id).first()
    if not rsvp:
        db.add(models.RSVP(guest_id=guest.id, guest_name=guest.full_name, status=status_value))
    else:
        rsvp.status = status_value
        rsvp.updated_at = now()


@app.post("/api/rsvp", dependencies=[rate_limit("rsvp", 20, 600)])
def confirm_rsvp(req: schemas.RSVPRequest, background: BackgroundTasks, db: Session = Depends(get_db)):
    confirm = list(req.confirm) + ([req.name] if req.name else [])
    decline = list(req.decline)
    if not confirm and not decline:
        raise HTTPException(status_code=400, detail="Nenhum nome informado.")

    confirmed, declined = [], []
    for name in confirm:
        guest = resolve_guest(db, name)
        if not guest:
            raise HTTPException(status_code=400, detail=f"Nome não localizado na lista: {name}")
        set_rsvp(db, guest, "CONFIRMED")
        confirmed.append(guest.full_name)
    for name in decline:
        guest = resolve_guest(db, name)
        if guest:
            set_rsvp(db, guest, "CANCELLED")
            declined.append(guest.full_name)
    db.commit()

    total = db.query(models.RSVP).filter(models.RSVP.status == "CONFIRMED").count()
    lines = []
    if confirmed:
        lines.append("✅ Confirmaram: " + ", ".join(confirmed))
    if declined:
        lines.append("❌ Não vão: " + ", ".join(declined))
    background.add_task(
        send_notification,
        subject=("Presença confirmada: " if confirmed else "Presença recusada: ") + ", ".join(confirmed or declined),
        message="\n".join(lines) + f"\n\nTotal de confirmados até agora: {total}",
    )
    return {"status": "SUCCESS", "confirmed": confirmed, "declined": declined}


@app.post("/api/rsvp/cancel", dependencies=[rate_limit("rsvp", 20, 600)])
def cancel_rsvp(req: schemas.RSVPCancelRequest, background: BackgroundTasks, db: Session = Depends(get_db)):
    """ Compatibilidade com a versão antiga do site """
    guest = resolve_guest(db, req.name)
    if not guest:
        raise HTTPException(status_code=400, detail="Convidado não encontrado.")
    set_rsvp(db, guest, "CANCELLED")
    db.commit()
    background.add_task(send_notification, subject=f"Presença cancelada: {guest.full_name}",
                        message=f"{guest.full_name} cancelou a presença no casamento.")
    return {"status": "SUCCESS"}


# ==============================================================================
# LISTA DE PRESENTES
# ==============================================================================
def gift_status(gift: models.Gift) -> str:
    if gift.multi:
        return "AVAILABLE"
    if gift.is_claimed:
        return "CLAIMED"
    # Reserva expira: evita que alguém "trave" a lista clicando em "Já fiz o Pix" sem pagar
    limit = datetime.now(timezone.utc) - timedelta(hours=PENDING_HOURS)
    for c in gift.contributions:
        created = c.created_at if c.created_at.tzinfo else c.created_at.replace(tzinfo=timezone.utc)
        if c.status == "PENDING" and created > limit:
            return "PENDING"
    return "AVAILABLE"


@app.get("/api/gifts", response_model=List[schemas.GiftResponse])
def get_gifts(db: Session = Depends(get_db)):
    return db.query(models.Gift).order_by(models.Gift.id).all()


@app.get("/api/gifts/status", response_model=List[schemas.GiftStatusResponse])
def get_gifts_status(db: Session = Depends(get_db)):
    """ Rota leve usada pelo site para saber o que já foi dado / reservado """
    return [{"id": g.id, "status": gift_status(g)} for g in db.query(models.Gift).all()]


@app.post("/api/gifts/claim", dependencies=[rate_limit("claim", 5, 3600)])
def claim_gift(req: schemas.ClaimGiftRequest, background: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Registra que o convidado DISSE que fez o Pix. O presente fica 'PENDING' até os noivos
    conferirem no extrato e confirmarem em /api/admin/contributions/{id}/confirm.
    """
    gift = db.query(models.Gift).filter(models.Gift.id == req.gift_id).first()
    if not gift:
        raise HTTPException(status_code=404, detail="Presente não encontrado.")
    if gift_status(gift) != "AVAILABLE":
        raise HTTPException(status_code=409, detail="Este presente já foi escolhido por outra pessoa.")

    # Em presentes de valor fixo, o valor vem do banco de dados (não confia no navegador)
    amount = req.amount if gift.multi else gift.price

    contribution = models.Contribution(
        gift_id=gift.id, giver_name=req.giver_name.strip(), amount=amount,
        message=(req.message or "").strip(), payment_method=req.payment_method, status="PENDING",
    )
    db.add(contribution)
    db.commit()

    background.add_task(
        send_notification,
        subject=f"🎁 Presente: {gift.title} ({'Pix' if req.payment_method == 'PIX' else 'cartão'})",
        message=(f"Convidado: {req.giver_name}\nPresente: {gift.title}\nValor: R$ {amount:.2f}\n"
                 f"Pagamento: {'Pix' if req.payment_method == 'PIX' else 'Cartão de crédito'}\n"
                 f"Mensagem: \"{req.message}\"\n\nConfira no extrato e confirme no painel (contribuição #{contribution.id})."),
    )
    return {"status": "PENDING", "message": "Presente registrado! Aguardando conferência dos noivos.", "contribution_id": contribution.id}


# ==============================================================================
# PIX (BR Code EMV com CRC16)
# ==============================================================================
def crc16_ccitt(data: str) -> str:
    crc = 0xFFFF
    for char in data:
        crc ^= (ord(char) << 8)
        for _ in range(8):
            crc = ((crc << 1) ^ 0x1021) & 0xFFFF if (crc & 0x8000) else (crc << 1) & 0xFFFF
    return f"{crc:04X}"


def pix_text(value: str, max_len: int) -> str:
    value = unicodedata.normalize("NFD", value or "")
    value = "".join(c for c in value if unicodedata.category(c) != "Mn")
    return re.sub(r"[^A-Za-z0-9 ]", "", value).strip()[:max_len]


def generate_pix_payload(pix_key: str, merchant_name: str, merchant_city: str, amount: float = 0.0, txid: str = "***") -> str:
    def f(tag: str, value: str) -> str:
        return f"{tag}{len(value):02d}{value}"

    payload = f("00", "01")
    payload += f("26", f("00", "br.gov.bcb.pix") + f("01", pix_key))
    payload += f("52", "0000") + f("53", "986")
    if amount > 0:
        payload += f("54", f"{amount:.2f}")
    payload += f("58", "BR")
    payload += f("59", pix_text(merchant_name, 25) or "NOIVOS")
    payload += f("60", pix_text(merchant_city, 15) or "BRASILIA")
    payload += f("62", f("05", re.sub(r"[^A-Za-z0-9*]", "", txid)[:25] or "***"))
    payload += "6304"
    return payload + crc16_ccitt(payload)


@app.get("/api/pix/generate", dependencies=[rate_limit("pix", 60, 600)])
def get_pix_code(amount: float = 0.0, gift_id: int = 0):
    """ Gera o Pix Copia e Cola com a chave dos noivos (a chave não pode mais ser trocada pela URL) """
    if amount < 0 or amount > 50000:
        raise HTTPException(status_code=400, detail="Valor inválido.")
    code = generate_pix_payload(PIX_KEY, PIX_MERCHANT_NAME, PIX_MERCHANT_CITY, amount, f"PRESENTE{gift_id}" if gift_id else "***")
    return {"amount": amount, "payload": code}


# ==============================================================================
# MURAL DE RECADOS
# ==============================================================================
DOG_REPLIES = {
    "Bela 🐶": ["Au au au! 🦴 (Bela adorou seu recado e perguntou se você vai levar petisco pra ela no casamento!)",
               "Rrrruff! 🐾 (Bela carimbou este recado com uma patinha cheia de carinho!)",
               "Au au! ✨ (Bela mandou avisar que vai estar de lacinho no grande dia!)"],
    "Nina 🐕": ["Grrrrrr... 🐾",
               "Grrr. Grrrrrr! (a Nina só rosna, mas é de carinho)",
               "GRRRR... grrr. (tradução: aprovado!)"],
    "Costela 🍖": ["Au au! Woof! 🍖 (Costela já reservou um lugarzinho ao lado da mesa do buffet!)",
                  "Au au au! 🥩 (Costela ficou babando de alegria ao ler seu recado fofo!)",
                  "Woof! 🥓 (Costela garante que a festa vai ter os melhores petiscos!)"],
    "Paçoca 🐕‍🦺": ["Yap yap au au! ✨ (Paçoca achou a sua mensagem tão doce quanto uma paçoca!)",
                   "Arf arf! 🦴 (Paçoca quase lambeu a tela ao ler seu carinho para os noivos!)",
                   "Au auuu! 🥜 (Paçoca deu pulinhos de alegria com o seu recado!)"],
    "Lua 🐺": ["AuuuOOOOOO! 🌙 (Lua uivou de emoção sob o luar ao ouvir essa mensagem linda!)",
              "Auuu au au! 🐾 (Lua deu três voltinhas no tapete e suspirou de alegria!)",
              "Woof woof! ⭐ (Lua mandou um beijinho de focinho no seu coração!)"],
}


@app.get("/api/messages", response_model=List[schemas.MessageResponse])
def get_messages(db: Session = Depends(get_db)):
    return (db.query(models.GuestbookMessage)
            .filter(models.GuestbookMessage.is_hidden.is_(False))
            .order_by(models.GuestbookMessage.created_at.desc())
            .limit(200).all())


@app.post("/api/messages", response_model=schemas.MessageResponse, dependencies=[rate_limit("msg", 5, 600)])
def post_message(req: schemas.MessageCreate, background: BackgroundTasks, db: Session = Depends(get_db)):
    dog = random.choice(list(DOG_REPLIES))
    msg = models.GuestbookMessage(
        author_name=req.author.strip(), content=req.content.strip(),
        dog_name=dog, couple_reply=random.choice(DOG_REPLIES[dog]),
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)
    background.add_task(send_notification, subject=f"💌 Novo recado de {msg.author_name}", message=msg.content)
    return msg


# ==============================================================================
# PAINEL DOS NOIVOS (exige o header X-Admin-Token)
# ==============================================================================
@app.get("/api/admin/guests", response_model=List[schemas.GuestResponse], dependencies=[Depends(require_admin)])
def admin_guests(db: Session = Depends(get_db)):
    """ Antes era público em /api/guests e expunha nomes e telefones de todos os convidados """
    return db.query(models.Guest).order_by(models.Guest.full_name).all()


@app.get("/api/admin/rsvps", dependencies=[Depends(require_admin)])
def admin_rsvps(db: Session = Depends(get_db)):
    rows = db.query(models.RSVP).order_by(models.RSVP.updated_at.desc()).all()
    groups = {g.id: g.group_name for g in db.query(models.Guest).all()}
    total_guests = db.query(models.Guest).count()
    return {"confirmed": sum(r.status == "CONFIRMED" for r in rows),
            "declined": sum(r.status == "CANCELLED" for r in rows),
            "total_guests": total_guests,
            "items": [{"guest": r.guest_name, "group": groups.get(r.guest_id), "status": r.status, "updated_at": r.updated_at} for r in rows]}


@app.get("/api/admin/livro", dependencies=[Depends(require_admin)])
def admin_livro(db: Session = Depends(get_db)):
    """ Tudo o que os convidados escreveram, para o livro de recados em PDF """
    msgs = (db.query(models.GuestbookMessage).filter(models.GuestbookMessage.is_hidden.is_(False))
            .order_by(models.GuestbookMessage.created_at).all())
    contribs = (db.query(models.Contribution).filter(models.Contribution.status != "REJECTED")
                .order_by(models.Contribution.created_at).all())
    rsvps = db.query(models.RSVP).filter(models.RSVP.status == "CONFIRMED").order_by(models.RSVP.guest_name).all()
    return {
        "mural": [{"author": m.author_name, "content": m.content, "dog": m.dog_name, "reply": m.couple_reply, "date": m.created_at} for m in msgs],
        "presentes": [{"author": c.giver_name, "gift": c.gift.title if c.gift else "", "message": c.message, "date": c.created_at} for c in contribs],
        "confirmados": [r.guest_name for r in rsvps],
    }


@app.get("/api/admin/contributions", response_model=List[schemas.ContributionResponse], dependencies=[Depends(require_admin)])
def admin_contributions(db: Session = Depends(get_db)):
    return db.query(models.Contribution).order_by(models.Contribution.created_at.desc()).all()


@app.post("/api/admin/contributions/{contribution_id}/confirm", dependencies=[Depends(require_admin)])
def admin_confirm(contribution_id: int, db: Session = Depends(get_db)):
    """ Os noivos conferiram o extrato: o Pix caiu! """
    c = db.query(models.Contribution).filter(models.Contribution.id == contribution_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contribuição não encontrada.")
    c.status = "PAID"
    c.confirmed_at = now()
    if not c.gift.multi:
        c.gift.is_claimed = True
        c.gift.claimed_at = now()
    db.commit()
    return {"status": "PAID"}


@app.post("/api/admin/contributions/{contribution_id}/reject", dependencies=[Depends(require_admin)])
def admin_reject(contribution_id: int, db: Session = Depends(get_db)):
    """ O Pix não apareceu: libera o presente de novo """
    c = db.query(models.Contribution).filter(models.Contribution.id == contribution_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Contribuição não encontrada.")
    c.status = "REJECTED"
    db.commit()
    return {"status": "REJECTED"}


@app.post("/api/admin/messages/{message_id}/hide", dependencies=[Depends(require_admin)])
def admin_hide_message(message_id: int, db: Session = Depends(get_db)):
    m = db.query(models.GuestbookMessage).filter(models.GuestbookMessage.id == message_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Recado não encontrado.")
    m.is_hidden = True
    db.commit()
    return {"status": "HIDDEN"}
