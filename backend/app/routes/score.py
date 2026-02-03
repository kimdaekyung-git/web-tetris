from datetime import UTC, datetime
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.score import Player, Score
from app.schemas.score import (
    PlayerCreate,
    PlayerResponse,
    RankingEntry,
    RankingResponse,
    ScoreCreate,
    ScoreResponse,
)

router = APIRouter(tags=["scores"])


@router.post("/players", response_model=PlayerResponse)
async def create_player(player_data: PlayerCreate, db: Session = Depends(get_db)):
    """Create or update a player"""
    # Check if player exists
    existing_player = db.query(Player).filter(Player.id == player_data.id).first()

    if existing_player:
        # Update last played time
        existing_player.last_played_at = datetime.now(UTC)
        db.commit()
        db.refresh(existing_player)
        return existing_player

    # Create new player
    player = Player(
        id=player_data.id,
        nickname=player_data.nickname,
    )
    db.add(player)
    db.commit()
    db.refresh(player)
    return player


@router.post("/scores", response_model=ScoreResponse)
async def create_score(score_data: ScoreCreate, db: Session = Depends(get_db)):
    """Save a game score"""
    # Verify player exists
    player = db.query(Player).filter(Player.id == score_data.player_id).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")

    # Create score record
    score = Score(
        id=str(uuid4()),
        player_id=score_data.player_id,
        score=score_data.score,
        level=score_data.level,
        lines=score_data.lines,
        play_time_seconds=score_data.play_time_seconds,
    )
    db.add(score)

    # Update player's last played time
    player.last_played_at = datetime.now(UTC)

    db.commit()
    db.refresh(score)
    return score


@router.get("/scores", response_model=RankingResponse)
async def get_rankings(limit: int = 10, db: Session = Depends(get_db)):
    """Get top scores ranking"""
    scores = (
        db.query(Score, Player)
        .join(Player, Score.player_id == Player.id)
        .order_by(Score.score.desc())
        .limit(limit)
        .all()
    )

    ranking_entries = [
        RankingEntry(
            rank=idx + 1,
            player_nickname=player.nickname,
            score=score.score,
            level=score.level,
            lines=score.lines,
            created_at=score.created_at,
        )
        for idx, (score, player) in enumerate(scores)
    ]

    total = db.query(Score).count()

    return RankingResponse(data=ranking_entries, total=total)


@router.get("/scores/{player_id}", response_model=list[ScoreResponse])
async def get_player_scores(
    player_id: str, limit: int = 10, db: Session = Depends(get_db)
):
    """Get a player's score history"""
    scores = (
        db.query(Score)
        .filter(Score.player_id == player_id)
        .order_by(Score.created_at.desc())
        .limit(limit)
        .all()
    )
    return scores
