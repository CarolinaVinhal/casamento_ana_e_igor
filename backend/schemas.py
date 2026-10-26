from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class GuestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    full_name: str
    phone: Optional[str] = None
    created_at: datetime


class RSVPRequest(BaseModel):
    """ Confirmação por convite: quem vai (confirm) e quem não vai (decline) """
    confirm: List[str] = Field(default_factory=list, max_length=20)
    decline: List[str] = Field(default_factory=list, max_length=20)
    name: Optional[str] = Field(default=None, max_length=150)  # compatibilidade com a versão antiga


class RSVPCancelRequest(BaseModel):
    name: str = Field(min_length=3, max_length=150)


class GiftResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    description: Optional[str] = None
    price: float
    category: str
    type: Optional[str] = None
    multi: bool = False
    image_url: Optional[str] = None
    is_claimed: bool


class GiftStatusResponse(BaseModel):
    id: int
    status: str  # AVAILABLE, PENDING, CLAIMED


class ClaimGiftRequest(BaseModel):
    gift_id: int
    giver_name: str = Field(min_length=2, max_length=80)
    message: Optional[str] = Field(default="", max_length=500)
    amount: float = Field(gt=0, le=50000)
    payment_method: str = Field(default="PIX", pattern="^(PIX|CARTAO)$")


class MessageCreate(BaseModel):
    author: str = Field(min_length=2, max_length=80)
    content: str = Field(min_length=1, max_length=600)


class MessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    author_name: str
    content: str
    dog_name: Optional[str] = None
    couple_reply: Optional[str] = None
    created_at: datetime


class ContributionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    gift_id: int
    giver_name: str
    amount: float
    message: Optional[str] = None
    payment_method: Optional[str] = "PIX"
    status: str
    created_at: datetime


class GuestSuggestion(BaseModel):
    name: str
    group_size: int = 1
    with_names: List[str] = []  # primeiro nome de quem está no mesmo convite (para diferenciar xarás)


class GroupMember(BaseModel):
    name: str
    status: Optional[str] = None


class GroupResponse(BaseModel):
    group: Optional[str] = None
    members: List[GroupMember]
