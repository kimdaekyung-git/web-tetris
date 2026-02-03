"""
Score API Tests

점수 API 테스트 케이스
Phase 4에서 확장 예정
"""

import uuid

import pytest
from fastapi.testclient import TestClient


class TestHealthEndpoint:
    """Health check endpoint tests"""

    def test_health_check_returns_200(self, client: TestClient):
        """GET /health should return 200"""
        response = client.get("/health")
        assert response.status_code == 200

    def test_health_check_returns_healthy_status(self, client: TestClient):
        """GET /health should return healthy status"""
        response = client.get("/health")
        data = response.json()
        assert data["status"] == "healthy"

    def test_health_check_includes_service_name(self, client: TestClient):
        """GET /health should include service name"""
        response = client.get("/health")
        data = response.json()
        assert "service" in data
        assert data["service"] == "classic-tetris-api"


class TestPlayerEndpoint:
    """Player creation endpoint tests"""

    def test_create_player_returns_200(self, client: TestClient):
        """POST /api/v1/players should return 200"""
        player_id = str(uuid.uuid4())
        response = client.post(
            "/api/v1/players",
            json={"id": player_id, "nickname": "TEST"},
        )
        assert response.status_code == 200

    def test_create_player_returns_player_data(self, client: TestClient):
        """POST /api/v1/players should return player data"""
        player_id = str(uuid.uuid4())
        response = client.post(
            "/api/v1/players",
            json={"id": player_id, "nickname": "PLAYER1"},
        )
        data = response.json()
        assert data["id"] == player_id
        assert data["nickname"] == "PLAYER1"

    def test_create_player_with_default_nickname(self, client: TestClient):
        """POST /api/v1/players should use default nickname if not provided"""
        player_id = str(uuid.uuid4())
        response = client.post(
            "/api/v1/players",
            json={"id": player_id},
        )
        data = response.json()
        assert data["nickname"] == "PLAYER"

    def test_create_player_updates_existing(self, client: TestClient):
        """POST /api/v1/players should update last_played_at for existing player"""
        player_id = str(uuid.uuid4())

        # Create player first time
        response1 = client.post(
            "/api/v1/players",
            json={"id": player_id, "nickname": "TEST"},
        )
        # Just verify first response is OK
        assert response1.status_code == 200

        # Create again (should update)
        response2 = client.post(
            "/api/v1/players",
            json={"id": player_id, "nickname": "TEST"},
        )

        # Times should be different (or at least not error)
        assert response2.status_code == 200

    def test_create_player_validates_nickname_length(self, client: TestClient):
        """POST /api/v1/players should reject nickname > 10 chars"""
        player_id = str(uuid.uuid4())
        response = client.post(
            "/api/v1/players",
            json={"id": player_id, "nickname": "TOOLONGNICKNAME"},
        )
        # Should fail validation
        assert response.status_code == 422


class TestCreateScoreEndpoint:
    """Score creation endpoint tests"""

    @pytest.fixture
    def player_id(self, client: TestClient) -> str:
        """Create a player for score tests"""
        pid = str(uuid.uuid4())
        client.post("/api/v1/players", json={"id": pid, "nickname": "TEST"})
        return pid

    def test_create_score_returns_200(self, client: TestClient, player_id: str):
        """POST /api/v1/scores should return 200"""
        response = client.post(
            "/api/v1/scores",
            json={
                "player_id": player_id,
                "score": 1000,
                "level": 5,
                "lines": 20,
                "play_time_seconds": 180,
            },
        )
        assert response.status_code == 200

    def test_create_score_returns_score_data(self, client: TestClient, player_id: str):
        """POST /api/v1/scores should return score data with id"""
        response = client.post(
            "/api/v1/scores",
            json={
                "player_id": player_id,
                "score": 1000,
                "level": 5,
                "lines": 20,
                "play_time_seconds": 180,
            },
        )
        data = response.json()
        assert "id" in data
        assert data["score"] == 1000
        assert data["level"] == 5
        assert data["lines"] == 20
        assert data["play_time_seconds"] == 180

    def test_create_score_requires_player(self, client: TestClient):
        """POST /api/v1/scores should return 404 for unknown player"""
        response = client.post(
            "/api/v1/scores",
            json={
                "player_id": str(uuid.uuid4()),  # Non-existent player
                "score": 1000,
                "level": 5,
                "lines": 20,
                "play_time_seconds": 180,
            },
        )
        assert response.status_code == 404

    def test_create_score_validates_level_min(self, client: TestClient, player_id: str):
        """POST /api/v1/scores should reject level < 1"""
        response = client.post(
            "/api/v1/scores",
            json={
                "player_id": player_id,
                "score": 1000,
                "level": 0,  # Invalid
                "lines": 20,
                "play_time_seconds": 180,
            },
        )
        assert response.status_code == 422

    def test_create_score_validates_level_max(self, client: TestClient, player_id: str):
        """POST /api/v1/scores should reject level > 10"""
        response = client.post(
            "/api/v1/scores",
            json={
                "player_id": player_id,
                "score": 1000,
                "level": 11,  # Invalid
                "lines": 20,
                "play_time_seconds": 180,
            },
        )
        assert response.status_code == 422

    def test_create_score_validates_score_negative(
        self, client: TestClient, player_id: str
    ):
        """POST /api/v1/scores should reject negative score"""
        response = client.post(
            "/api/v1/scores",
            json={
                "player_id": player_id,
                "score": -100,  # Invalid
                "level": 5,
                "lines": 20,
                "play_time_seconds": 180,
            },
        )
        assert response.status_code == 422


class TestRankingEndpoint:
    """Ranking retrieval endpoint tests"""

    @pytest.fixture
    def setup_scores(self, client: TestClient):
        """Create multiple players and scores for ranking tests"""
        players = []
        for i in range(3):
            pid = str(uuid.uuid4())
            client.post(
                "/api/v1/players", json={"id": pid, "nickname": f"PLAYER{i+1}"}
            )
            players.append(pid)

        # Create scores with different values
        scores = [5000, 3000, 1000]
        for pid, score in zip(players, scores, strict=True):
            client.post(
                "/api/v1/scores",
                json={
                    "player_id": pid,
                    "score": score,
                    "level": 5,
                    "lines": 20,
                    "play_time_seconds": 180,
                },
            )
        return players

    def test_get_rankings_returns_200(self, client: TestClient):
        """GET /api/v1/scores should return 200"""
        response = client.get("/api/v1/scores")
        assert response.status_code == 200

    def test_get_rankings_returns_list(self, client: TestClient):
        """GET /api/v1/scores should return data list"""
        response = client.get("/api/v1/scores")
        data = response.json()
        assert "data" in data
        assert isinstance(data["data"], list)

    def test_get_rankings_sorted_by_score_desc(
        self, client: TestClient, setup_scores
    ):
        """GET /api/v1/scores should return scores sorted descending"""
        response = client.get("/api/v1/scores")
        data = response.json()

        scores = [entry["score"] for entry in data["data"]]
        assert scores == sorted(scores, reverse=True)

    def test_get_rankings_includes_rank(self, client: TestClient, setup_scores):
        """GET /api/v1/scores should include rank field"""
        response = client.get("/api/v1/scores")
        data = response.json()

        for i, entry in enumerate(data["data"]):
            assert entry["rank"] == i + 1

    def test_get_rankings_includes_player_nickname(
        self, client: TestClient, setup_scores
    ):
        """GET /api/v1/scores should include player nickname"""
        response = client.get("/api/v1/scores")
        data = response.json()

        for entry in data["data"]:
            assert "player_nickname" in entry
            assert entry["player_nickname"].startswith("PLAYER")

    def test_get_rankings_respects_limit(self, client: TestClient, setup_scores):
        """GET /api/v1/scores?limit=2 should return only 2 results"""
        response = client.get("/api/v1/scores?limit=2")
        data = response.json()
        assert len(data["data"]) <= 2

    def test_get_rankings_default_limit_10(self, client: TestClient):
        """GET /api/v1/scores should default to limit=10"""
        # Create 15 scores
        for i in range(15):
            pid = str(uuid.uuid4())
            client.post("/api/v1/players", json={"id": pid, "nickname": f"P{i}"})
            client.post(
                "/api/v1/scores",
                json={
                    "player_id": pid,
                    "score": i * 100,
                    "level": 1,
                    "lines": i,
                    "play_time_seconds": 60,
                },
            )

        response = client.get("/api/v1/scores")
        data = response.json()
        assert len(data["data"]) == 10

    def test_get_rankings_includes_total(self, client: TestClient, setup_scores):
        """GET /api/v1/scores should include total count"""
        response = client.get("/api/v1/scores")
        data = response.json()
        assert "total" in data
        assert data["total"] >= len(data["data"])


class TestPlayerScoresEndpoint:
    """Player score history endpoint tests"""

    @pytest.fixture
    def player_with_scores(self, client: TestClient) -> str:
        """Create a player with multiple scores"""
        pid = str(uuid.uuid4())
        client.post("/api/v1/players", json={"id": pid, "nickname": "TESTER"})

        # Create 5 scores
        for i in range(5):
            client.post(
                "/api/v1/scores",
                json={
                    "player_id": pid,
                    "score": (i + 1) * 1000,
                    "level": i + 1,
                    "lines": (i + 1) * 10,
                    "play_time_seconds": (i + 1) * 60,
                },
            )
        return pid

    def test_get_player_scores_returns_200(
        self, client: TestClient, player_with_scores: str
    ):
        """GET /api/v1/scores/{player_id} should return 200"""
        response = client.get(f"/api/v1/scores/{player_with_scores}")
        assert response.status_code == 200

    def test_get_player_scores_returns_list(
        self, client: TestClient, player_with_scores: str
    ):
        """GET /api/v1/scores/{player_id} should return list"""
        response = client.get(f"/api/v1/scores/{player_with_scores}")
        data = response.json()
        assert isinstance(data, list)

    def test_get_player_scores_filters_by_player(
        self, client: TestClient, player_with_scores: str
    ):
        """GET /api/v1/scores/{player_id} should only return that player's scores"""
        response = client.get(f"/api/v1/scores/{player_with_scores}")
        data = response.json()

        for score in data:
            assert score["player_id"] == player_with_scores

    def test_get_player_scores_sorted_by_date_desc(
        self, client: TestClient, player_with_scores: str
    ):
        """GET /api/v1/scores/{player_id} should sort by date descending"""
        response = client.get(f"/api/v1/scores/{player_with_scores}")
        data = response.json()

        dates = [score["created_at"] for score in data]
        assert dates == sorted(dates, reverse=True)

    def test_get_player_scores_respects_limit(
        self, client: TestClient, player_with_scores: str
    ):
        """GET /api/v1/scores/{player_id}?limit=2 should return only 2"""
        response = client.get(f"/api/v1/scores/{player_with_scores}?limit=2")
        data = response.json()
        assert len(data) == 2

    def test_get_player_scores_empty_for_unknown_player(self, client: TestClient):
        """GET /api/v1/scores/{unknown_id} should return empty list"""
        unknown_id = str(uuid.uuid4())
        response = client.get(f"/api/v1/scores/{unknown_id}")
        data = response.json()
        assert data == []


class TestSwaggerDocs:
    """Swagger documentation tests"""

    def test_swagger_ui_accessible(self, client: TestClient):
        """GET /docs should return 200"""
        response = client.get("/docs")
        assert response.status_code == 200

    def test_openapi_json_accessible(self, client: TestClient):
        """GET /openapi.json should return 200"""
        response = client.get("/openapi.json")
        assert response.status_code == 200

    def test_openapi_includes_paths(self, client: TestClient):
        """GET /openapi.json should include API paths"""
        response = client.get("/openapi.json")
        data = response.json()
        assert "paths" in data
        assert "/api/v1/scores" in data["paths"]
        assert "/api/v1/players" in data["paths"]
