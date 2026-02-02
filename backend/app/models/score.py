from datetime import datetime

from sqlalchemy import CheckConstraint, Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class Player(Base):
    """Anonymous player model"""

    __tablename__ = "player"

    id = Column(String, primary_key=True)
    nickname = Column(String(10), nullable=False, default="PLAYER")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    last_played_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationship
    scores = relationship("Score", back_populates="player", cascade="all, delete-orphan")


class Score(Base):
    """Game score model"""

    __tablename__ = "score"

    id = Column(String, primary_key=True)
    player_id = Column(String, ForeignKey("player.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, nullable=False)
    level = Column(Integer, nullable=False)
    lines = Column(Integer, nullable=False)
    play_time_seconds = Column(Integer, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Constraints
    __table_args__ = (
        CheckConstraint("score >= 0", name="check_score_positive"),
        CheckConstraint("level >= 1 AND level <= 10", name="check_level_range"),
        CheckConstraint("lines >= 0", name="check_lines_positive"),
        CheckConstraint("play_time_seconds >= 0", name="check_time_positive"),
    )

    # Relationship
    player = relationship("Player", back_populates="scores")
