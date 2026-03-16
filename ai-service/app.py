"""
Eventora AI Microservice
Vendor ranking, recommendations, and chatbot intelligence
"""

import os
import hashlib
import numpy as np
import redis
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# ==============================
# REDIS CLOUD CONNECTION (STRICT)
# ==============================
try:
    redis_host = os.environ.get("REDIS_HOST")
    redis_port = int(os.environ.get("REDIS_PORT", 6379))
    redis_password = os.environ.get("REDIS_PASSWORD")

    redis_client = redis.Redis(
        host=redis_host,
        port=redis_port,
        password=redis_password,
        decode_responses=True,
        socket_connect_timeout=5,
        socket_timeout=5
    )

    redis_client.ping()
    logger.info("✅ Connected to Cloud Redis successfully")

except Exception as e:
    logger.error(f"❌ Redis Cloud connection failed: {e}")
    redis_client = None
    
# ==============================
# ROOT + HEALTH
# ==============================
@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "service": "Eventora AI Microservice",
        "status": "running",
        "version": "1.0"
    })


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "eventora-ai"
    })


# ==============================
# VENDOR RANKING ENGINE
# ==============================
class VendorRankingEngine:

    WEIGHTS = {
        'rating': 0.25,
        'booking_success_rate': 0.20,
        'wishlist_score': 0.10,
        'response_time': 0.15,
        'price_competitiveness': 0.10,
        'profile_completion': 0.10,
        'ai_popularity': 0.10
    }

    def calculate_score(self, vendor, stats):
        rating = float(vendor.get('avg_rating', 0)) / 5
        total = max(vendor.get('total_bookings', 1), 1)
        success = vendor.get('successful_bookings', 0) / total
        wishlist = vendor.get('wishlist_count', 0) / max(stats['max_wishlist'], 1)

        response = float(vendor.get('avg_response_time_hours', 24))
        response_score = 1 if response <= 1 else 0.8 if response <= 6 else 0.5

        price = float(vendor.get('starting_price', stats['median_price'] or 1))
        price_score = 1 - abs(price - stats['median_price']) / max(stats['median_price'], 1)

        profile = min(vendor.get('profile_completion_score', 0) / 100, 1)
        popularity = min(vendor.get('ai_popularity_score', 0) / 10, 1)

        score = (
            rating * 0.25 +
            success * 0.20 +
            wishlist * 0.10 +
            response_score * 0.15 +
            price_score * 0.10 +
            profile * 0.10 +
            popularity * 0.10
        )

        if vendor.get('is_verified'):
            score *= 1.05

        return round(score * 10, 3)

    def rank(self, vendors):
        if not vendors:
            return []

        prices = [float(v.get('starting_price', 0)) for v in vendors]
        stats = {
            "median_price": float(np.median(prices)) if prices else 1,
            "max_wishlist": max([v.get('wishlist_count', 0) for v in vendors] or [1])
        }

        for v in vendors:
            v['ranking_score'] = self.calculate_score(v, stats)

        vendors.sort(key=lambda x: x['ranking_score'], reverse=True)
        return vendors


ranking_engine = VendorRankingEngine()


@app.route('/rank-vendors', methods=['POST'])
def rank_vendors():
    try:
        data = request.json
        vendors = data.get('vendors', [])
        ranked = ranking_engine.rank(vendors)
        return jsonify({"vendors": ranked})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# SIMPLE CHATBOT
# ==============================
@app.route('/chat', methods=['POST'])
def chat():
    try:
        msg = request.json.get("message", "").lower()

        cache_key = f"ai:{hashlib.md5(msg.encode()).hexdigest()}"
        if redis_client:
            cached = redis_client.get(cache_key)
            if cached:
                return jsonify({"response": cached, "cached": True})

        if "wedding" in msg:
            response = "Wedding planning tip: Book hall and catering 6 months early."
        elif "budget" in msg:
            response = "For 100 guests wedding budget approx ₹3L–₹8L."
        else:
            response = "Hello 👋 I am Eventora AI assistant. Ask about vendors, budget, or planning."

        if redis_client:
            redis_client.setex(cache_key, 3600, response)

        return jsonify({"response": response, "cached": False})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ==============================
# ERROR HANDLER
# ==============================
@app.errorhandler(404)
def not_found(e):
    return jsonify({"error": "Endpoint not found"}), 404


# ==============================
# RUN SERVER
# ==============================
if __name__ == '__main__':
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)