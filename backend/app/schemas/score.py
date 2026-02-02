from datetime import datetime

from pydantic import BaseModel, Field


class PlayerCreate(BaseModel):
    """Player creation request"""

    id: str = Field(..., description="Client-generated UUID")
    nickname: str = Field(default="PLAYER", max_length=10, description="Player nickname")


class PlayerResponse(BaseModel):
    """Player response"""

    id: str
    nickname: str
    created_at: datetime
    last_played_at: datetime

    model_config = {"from_attributes": True}


class ScoreCreate(BaseModel):
    """Score creation request"""

    player_id: str = Field(..., description="Player UUID")
    score: int = Field(..., ge=0, description="Final score")
    level: int = Field(..., ge=1, le=10, description="Reached level")
    lines: int = Field(..., ge=0, description="Lines cleared")
    play_time_seconds: int = Field(..., ge=0, description="Play time in seconds")


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
