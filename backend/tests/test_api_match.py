import unittest

from fastapi.testclient import TestClient

from app.main import app


class MatchApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_normal_win_4_2(self):
        # A wins at 4-2 (no deuce)
        payload = {"points": ["A", "A", "A", "B", "B", "A"]}

        response = self.client.post("/api/match", json=payload)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["winner"], "A")
        self.assertEqual(data["final_score"], {"A": 4, "B": 2})
        self.assertFalse(data["deuce_reached"])

    def test_deuce_win_5_3(self):
        # Reaches 3-3, then A wins two consecutive points => 5-3
        payload = {"points": ["A", "A", "A", "B", "B", "B", "A", "A"]}

        response = self.client.post("/api/match", json=payload)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["winner"], "A")
        self.assertEqual(data["final_score"], {"A": 5, "B": 3})
        self.assertTrue(data["deuce_reached"])

    def test_repeated_deuce_loops_then_win(self):
        # 3-3, then alternate points to force multiple deuce resets,
        # and finally A wins two in a row from deuce.
        payload = {"points": ["A", "A", "A", "B", "B", "B", "A", "B", "A", "B", "A", "A"]}

        response = self.client.post("/api/match", json=payload)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["winner"], "A")
        self.assertEqual(data["final_score"], {"A": 5, "B": 3})
        self.assertTrue(data["deuce_reached"])
        self.assertEqual(data["points_processed"], 12)


if __name__ == "__main__":
    unittest.main()
