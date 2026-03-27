"""Backend API tests for Optimus - Paper Trading Platform"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestUserAPI:
    """User endpoint tests"""

    def test_get_user(self):
        r = requests.get(f"{BASE_URL}/api/user")
        assert r.status_code == 200
        data = r.json()
        assert "user_id" in data
        assert data["user_id"] == "guest-001"
        assert "name" in data
        assert "xp" in data
        assert "level" in data
        assert "virtual_balance" in data
        print(f"User: {data['name']}, XP: {data['xp']}, Level: {data['level']}")

    def test_update_xp(self):
        r = requests.patch(f"{BASE_URL}/api/user/xp", json={"xp_amount": 10, "reason": "test"})
        assert r.status_code == 200
        data = r.json()
        assert "xp" in data
        print(f"XP after update: {data['xp']}")


class TestMarketAPI:
    """Market data endpoint tests"""

    def test_get_stocks(self):
        r = requests.get(f"{BASE_URL}/api/market/stocks")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "symbol" in data[0]
        assert "price" in data[0]
        print(f"Stocks count: {len(data)}")

    def test_get_stock_detail(self):
        r = requests.get(f"{BASE_URL}/api/market/stocks/TCS")
        assert r.status_code == 200
        data = r.json()
        assert data["symbol"] == "TCS"
        assert "price" in data

    def test_get_stock_chart(self):
        r = requests.get(f"{BASE_URL}/api/market/stocks/RELIANCE/chart?period=1M")
        assert r.status_code == 200
        data = r.json()
        assert "data" in data
        assert len(data["data"]) > 0

    def test_get_crypto(self):
        r = requests.get(f"{BASE_URL}/api/market/crypto")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0

    def test_crash_events(self):
        r = requests.get(f"{BASE_URL}/api/market/crash-events")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert "2020_covid_crash" in data


class TestPortfolioAPI:
    """Portfolio endpoint tests"""

    def test_get_portfolio(self):
        r = requests.get(f"{BASE_URL}/api/portfolio")
        assert r.status_code == 200
        data = r.json()
        assert "cash_balance" in data
        assert "holdings" in data
        assert "total_portfolio_value" in data
        print(f"Cash balance: {data['cash_balance']}")

    def test_get_trades(self):
        r = requests.get(f"{BASE_URL}/api/portfolio/trades")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_execute_buy_trade(self):
        r = requests.post(f"{BASE_URL}/api/portfolio/trade", json={
            "symbol": "WIPRO", "asset_type": "STOCK", "side": "BUY",
            "order_type": "MARKET", "quantity": 1
        })
        assert r.status_code == 200
        data = r.json()
        assert data["success"] == True
        assert "price" in data
        print(f"Bought WIPRO at {data['price']}")

    def test_execute_sell_trade(self):
        # First buy some
        requests.post(f"{BASE_URL}/api/portfolio/trade", json={
            "symbol": "ITC", "asset_type": "STOCK", "side": "BUY",
            "order_type": "MARKET", "quantity": 2
        })
        # Then sell 1
        r = requests.post(f"{BASE_URL}/api/portfolio/trade", json={
            "symbol": "ITC", "asset_type": "STOCK", "side": "SELL",
            "order_type": "MARKET", "quantity": 1
        })
        assert r.status_code == 200
        data = r.json()
        assert data["success"] == True

    def test_reset_portfolio(self):
        r = requests.delete(f"{BASE_URL}/api/portfolio/reset")
        assert r.status_code == 200
        data = r.json()
        assert data["success"] == True
        # Verify portfolio reset
        p = requests.get(f"{BASE_URL}/api/portfolio").json()
        assert p["cash_balance"] == 100000.0
        assert len(p["holdings"]) == 0


class TestRoadmapAPI:
    """Roadmap endpoint tests"""

    def test_get_roadmap_progress(self):
        r = requests.get(f"{BASE_URL}/api/roadmap/progress")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 12
        # Town 1 should be unlocked
        town1 = next(t for t in data if t["town_id"] == 1)
        assert town1["status"] == "unlocked"
        print(f"Town 1 status: {town1['status']}")

    def test_complete_lesson(self):
        r = requests.post(f"{BASE_URL}/api/roadmap/1/lesson/lesson-1")
        assert r.status_code == 200
        data = r.json()
        assert "completed_lessons" in data
        assert "lesson-1" in data["completed_lessons"]

    def test_submit_quiz(self):
        r = requests.post(f"{BASE_URL}/api/roadmap/1/quiz", json={"answers": [1, 0, 2, 1, 3]})
        assert r.status_code == 200
        data = r.json()
        assert "score" in data
        assert "passed" in data
        print(f"Quiz score: {data['score']}, passed: {data['passed']}")


class TestCommunityAPI:
    """Community endpoint tests"""

    def test_get_posts(self):
        r = requests.get(f"{BASE_URL}/api/community/posts")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) > 0
        assert "content" in data[0]
        assert "like_count" in data[0]

    def test_create_post(self):
        r = requests.post(f"{BASE_URL}/api/community/posts", json={
            "content": "TEST_post: Testing API integration", "topic": "general"
        })
        assert r.status_code == 200
        data = r.json()
        assert "post_id" in data
        assert data["content"] == "TEST_post: Testing API integration"
        return data["post_id"]

    def test_like_post(self):
        # Get first post
        posts = requests.get(f"{BASE_URL}/api/community/posts").json()
        post_id = posts[0]["post_id"]
        r = requests.post(f"{BASE_URL}/api/community/posts/{post_id}/like")
        assert r.status_code == 200
        data = r.json()
        assert "action" in data
        assert data["action"] in ["liked", "unliked"]

    def test_get_leaderboard(self):
        r = requests.get(f"{BASE_URL}/api/community/leaderboard")
        assert r.status_code == 200
        data = r.json()
        assert "leaderboard" in data
        assert len(data["leaderboard"]) == 10
        assert "user_rank" in data


class TestCompetitionsAPI:
    """Competition endpoint tests"""

    def test_get_competitions(self):
        r = requests.get(f"{BASE_URL}/api/competitions")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        print(f"Competitions: {len(data)}")

    def test_join_competition(self):
        comps = requests.get(f"{BASE_URL}/api/competitions").json()
        comp_id = comps[0]["comp_id"]
        r = requests.post(f"{BASE_URL}/api/competitions/{comp_id}/join")
        assert r.status_code == 200
        data = r.json()
        assert "success" in data

    def test_create_competition(self):
        r = requests.post(f"{BASE_URL}/api/competitions", json={
            "name": "TEST_Competition", "description": "Test only",
            "start_date": "2026-03-01T00:00:00Z", "end_date": "2026-03-31T00:00:00Z",
            "asset_classes": ["stocks"], "max_participants": 10
        })
        assert r.status_code == 200
        data = r.json()
        assert "comp_id" in data
        assert data["name"] == "TEST_Competition"


class TestAlgoLabAPI:
    """AlgoLab endpoint tests"""

    def test_get_strategies(self):
        r = requests.get(f"{BASE_URL}/api/algo/strategies")
        assert r.status_code == 200
        data = r.json()
        assert "pre_built" in data
        assert len(data["pre_built"]) == 6
        print(f"Pre-built strategies: {len(data['pre_built'])}")

    def test_run_backtest(self):
        r = requests.post(f"{BASE_URL}/api/algo/backtest", json={
            "strategy_type": "MA_CROSSOVER", "symbol": "TCS", "period_days": 90
        })
        assert r.status_code == 200
        data = r.json()
        assert "total_return" in data
        assert "sharpe_ratio" in data
        assert "equity_curve" in data
        print(f"Backtest return: {data['total_return']}%")


class TestLearnAPI:
    """Learning Hub endpoint tests"""

    def test_get_daily_quiz(self):
        r = requests.get(f"{BASE_URL}/api/learn/daily-quiz")
        assert r.status_code == 200
        data = r.json()
        assert "questions" in data
        assert len(data["questions"]) == 5
        assert "xp_reward" in data

    def test_submit_daily_quiz(self):
        r = requests.post(f"{BASE_URL}/api/learn/daily-quiz/submit", json={"answers": [0, 1, 1, 1, 1]})
        assert r.status_code == 200
        data = r.json()
        assert "score" in data or "message" in data


class TestAnalysisAPI:
    """Stock analysis endpoint tests"""

    def test_stock_analysis(self):
        r = requests.get(f"{BASE_URL}/api/analysis/stock/HDFCBANK")
        assert r.status_code == 200
        data = r.json()
        assert "pe_ratio" in data
        assert "income_statement" in data
        assert "analyst_consensus" in data


class TestChatbotAPI:
    """Chatbot endpoint tests"""

    def test_chatbot_message(self):
        r = requests.post(f"{BASE_URL}/api/chatbot/message", json={
            "message": "What is a P/E ratio?",
            "page_context": "dashboard"
        })
        assert r.status_code == 200
        data = r.json()
        assert "response" in data
        assert len(data["response"]) > 10
        print(f"Chatbot response length: {len(data['response'])}")


class TestNotificationsAPI:
    def test_get_notifications(self):
        r = requests.get(f"{BASE_URL}/api/notifications")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
