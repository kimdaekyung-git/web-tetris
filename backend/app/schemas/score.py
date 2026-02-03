import re
from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class PlayerCreate(BaseModel):
    """Player creation request"""

    id: str = Field(..., description="Client-generated UUID", min_length=36, max_length=36)
    nickname: str = Field(default="PLAYER", min_length=1, max_length=10, description="Player nickname")

    @field_validator('id')
    @classmethod
    def validate_uuid(cls, v: str) -> str:
        """Validate UUID format"""
        uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
        if not uuid_pattern.match(v):
            raise ValueError('Invalid UUID format')
        return v.lower()

    @field_validator('nickname')
    @classmethod
    def validate_nickname(cls, v: str) -> str:
        """Sanitize nickname - only alphanumeric and basic chars"""
        # Remove any non-alphanumeric characters except spaces and basic punctuation
        sanitized = re.sub(r'[^A-Z0-9 _-]', '', v.upper())
        if not sanitized:
            return "PLAYER"
        return sanitized[:10]


class PlayerResponse(BaseModel):
    """Player response"""

    id: str
    nickname: str
    created_at: datetime
    last_played_at: datetime

    model_config = {"from_attributes": True}


class ScoreCreate(BaseModel):
    """Score creation request"""

    player_id: str = Field(..., description="Player UUID", min_length=36, max_length=36)
    score: int = Field(..., ge=0, le=9999999, description="Final score")
    level: int = Field(..., ge=1, le=10, description="Reached level")
    lines: int = Field(..., ge=0, le=9999, description="Lines cleared")
    play_time_seconds: int = Field(..., ge=0, le=86400, description="Play time in seconds (max 24h)")

    @field_validator('player_id')
    @classmethod
    def validate_player_id(cls, v: str) -> str:
        """Validate player UUID format"""
        uuid_pattern = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$', re.IGNORECASE)
        if not uuid_pattern.match(v):
            raise ValueError('Invalid player UUID format')
        return v.lower()


class ScoreResponse(BaseModel):
    """Score response"""

    id: str
    player_id: str
    score: int
    level: int
    lines: int
    play_time_seconds: int
    created_at: datetime

    model_config = {"from_attributes": True}


class RankingEntry(BaseModel):
    """Single ranking entry"""

    rank: int
    player_nickname: str
    score: int
    level: int
    lines: int
    created_at: datetime


class RankingResponse(BaseModel):
    """Ranking list response"""

    data: list[RankingEntry]
    total: int
