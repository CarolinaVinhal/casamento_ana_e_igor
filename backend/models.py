from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Boolean, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship

from database import Base


def utcnow():
    return datetime.now(timezone.utc)


class Guest(Base):
    """ Lista oficial de convidados """
    __tablename__ = "guests"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    email = Column(String(150), nullable=True)
    group_name = Column(String(150), nullable=True, index=True)  # convite: casal / família
    created_at = Column(DateTime, default=utcnow)

    rsvp = relationship("RSVP", back_populates="guest", uselist=False)


class RSVP(Base):
    """ Confirmações de presença """
    __tablename__ = "rsvps"

    id = Column(Integer, primary_key=True, index=True)
    guest_id = Column(Integer, ForeignKey("guests.id"), nullable=False, unique=True)
    guest_name = Column(String(150), nullable=False)
    status = Column(String(20), default="CONFIRMED")  # CONFIRMED ou CANCELLED (não vai)
    confirmed_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    guest = relationship("Guest", back_populates="rsvp")


class Gift(Base):
    """ Catálogo de presentes (mesmos IDs do app.js) """
    __tablename__ = "gifts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    category = Column(String(20), default="mid")   # low, mid, high (faixa de preço)
    type = Column(String(20), default="casa")      # casa, cozinha, viagem, zoeira, matilha
    multi = Column(Boolean, default=False)          # aceita várias contribuições (cotas)
    image_url = Column(String(300), nullable=True)
    is_claimed = Column(Boolean, default=False)     # só vira True quando os noivos confirmam o Pix
    claimed_at = Column(DateTime, nullable=True)

    contributions = relationship("Contribution", back_populates="gift")


class Contribution(Base):
    """ Presentes informados pelos convidados (aguardam conferência dos noivos) """
    __tablename__ = "contributions"

    id = Column(Integer, primary_key=True, index=True)
    gift_id = Column(Integer, ForeignKey("gifts.id"), nullable=False)
    giver_name = Column(String(150), nullable=False)
    amount = Column(Float, nullable=False)
    message = Column(Text, nullable=True)
    payment_method = Column(String(30), default="PIX")  # PIX ou CARTAO
    status = Column(String(20), default="PENDING")  # PENDING, PAID, REJECTED
    created_at = Column(DateTime, default=utcnow)
    confirmed_at = Column(DateTime, nullable=True)

    gift = relationship("Gift", back_populates="contributions")


class GuestbookMessage(Base):
    """ Mural de recados """
    __tablename__ = "guestbook_messages"

    id = Column(Integer, primary_key=True, index=True)
    author_name = Column(String(150), nullable=False)
    content = Column(Text, nullable=False)
    dog_name = Column(String(40), nullable=True)
    couple_reply = Column(Text, nullable=True)
    is_hidden = Column(Boolean, default=False)  # permite aos noivos esconder recados indevidos
    created_at = Column(DateTime, default=utcnow)
