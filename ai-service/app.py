"""
Eventora AI Microservice
Vendor ranking, recommendations, and chatbot intelligence
"""

import os
import json
import hashlib
import numpy as np
import redis
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics.pairwise import cosine_similarity
from dotenv import load_dotenv
import logging

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Redis connection
try:
    redis_client = redis.Redis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        password=os.getenv('REDIS_PASSWORD', None),
        decode_responses=True
    )
    redis_client.ping()
    logger.info("Redis connected successfully")
except Exception as e:
    logger.warning(f"Redis connection failed: {e}")
    redis_client = None


class VendorRankingEngine:
    """AI-powered vendor ranking algorithm"""

    WEIGHTS = {
        'rating': 0.25,
        'booking_success_rate': 0.20,
        'wishlist_score': 0.10,
        'response_time': 0.15,
        'price_competitiveness': 0.10,
        'profile_completion': 0.10,
        'ai_popularity': 0.10
    }

    def calculate_ranking_score(self, vendor: dict, category_stats: dict) -> float:
        """Calculate comprehensive AI ranking score for a vendor"""
        scores = {}

        # 1. Rating score (0-5 normalized to 0-1)
        rating = float(vendor.get('avg_rating', 0))
        scores['rating'] = rating / 5.0

        # 2. Booking success rate
        total = max(vendor.get('total_bookings', 0), 1)
        successful = vendor.get('successful_bookings', 0)
        scores['booking_success_rate'] = successful / total

        # 3. Wishlist score (normalized by category max)
        max_wishlist = max(category_stats.get('max_wishlist', 1), 1)
        scores['wishlist_score'] = min(vendor.get('wishlist_count', 0) / max_wishlist, 1.0)

        # 4. Response time score (inverse - faster is better)
        response_hours = float(vendor.get('avg_response_time_hours', 24))
        if response_hours <= 1:
            scores['response_time'] = 1.0
        elif response_hours <= 6:
            scores['response_time'] = 0.8
        elif response_hours <= 24:
            scores['response_time'] = 0.5
        else:
            scores['response_time'] = max(0, 1 - (response_hours - 24) / 72)

        # 5. Price competitiveness (close to category median is competitive)
        median_price = category_stats.get('median_price', 0)
        vendor_price = float(vendor.get('starting_price', median_price or 1))
        if median_price and median_price > 0:
            price_diff = abs(vendor_price - median_price) / median_price
            scores['price_competitiveness'] = max(0, 1 - price_diff)
        else:
            scores['price_competitiveness'] = 0.5

        # 6. Profile completion
        scores['profile_completion'] = min(vendor.get('profile_completion_score', 0) / 100.0, 1.0)

        # 7. AI popularity (composite of views, clicks, conversion)
        scores['ai_popularity'] = min(float(vendor.get('ai_popularity_score', 0)) / 10.0, 1.0)

        # Calculate weighted score
        total_score = sum(scores[k] * self.WEIGHTS[k] for k in self.WEIGHTS)

        # Boost for verified vendors
        if vendor.get('is_verified'):
            total_score *= 1.05

        return round(min(total_score * 10, 10), 4)  # Scale to 0-10

    def rank_vendors(self, vendors: list, user_preferences: dict = None) -> list:
        """Rank a list of vendors with optional personalization"""
        if not vendors:
            return []

        # Calculate category stats
        prices = [float(v.get('starting_price', 0)) for v in vendors if v.get('starting_price')]
        wishlist_counts = [v.get('wishlist_count', 0) for v in vendors]

        category_stats = {
            'median_price': float(np.median(prices)) if prices else 0,
            'max_wishlist': max(wishlist_counts) if wishlist_counts else 1
        }

        # Calculate scores
        for vendor in vendors:
            vendor['computed_ranking_score'] = self.calculate_ranking_score(vendor, category_stats)

        # Personalization boost
        if user_preferences:
            for vendor in vendors:
                boost = self._personalization_boost(vendor, user_preferences)
                vendor['computed_ranking_score'] *= (1 + boost)

        # Sort by score descending
        vendors.sort(key=lambda x: x.get('computed_ranking_score', 0), reverse=True)
        return vendors

    def _personalization_boost(self, vendor: dict, preferences: dict) -> float:
        """Calculate personalization boost based on user preferences"""
        boost = 0.0

        # City preference
        if preferences.get('city') and vendor.get('city'):
            if preferences['city'].lower() == vendor['city'].lower():
                boost += 0.1

        # Price preference
        if preferences.get('max_budget') and vendor.get('starting_price'):
            if float(vendor['starting_price']) <= float(preferences['max_budget']):
                boost += 0.05

        # Rating preference
        if preferences.get('min_rating') and vendor.get('avg_rating'):
            if float(vendor['avg_rating']) >= float(preferences['min_rating']):
                boost += 0.05

        return boost

    def get_ai_recommendations(self, vendors: list, target_vendor_id: str, top_n: int = 5) -> list:
        """Content-based filtering for similar vendor recommendations"""
        if not vendors or len(vendors) < 2:
            return vendors[:top_n]

        features = []
        vendor_ids = []

        for v in vendors:
            feature = [
                float(v.get('avg_rating', 0)),
                float(v.get('starting_price', 0)) / 100000,  # normalize
                float(v.get('total_bookings', 0)) / 1000,
                float(v.get('wishlist_count', 0)) / 100,
                float(v.get('profile_completion_score', 0)) / 100,
            ]
            features.append(feature)
            vendor_ids.append(str(v.get('id', '')))

        try:
            scaler = MinMaxScaler()
            features_scaled = scaler.fit_transform(features)

            if target_vendor_id in vendor_ids:
                target_idx = vendor_ids.index(target_vendor_id)
                similarities = cosine_similarity([features_scaled[target_idx]], features_scaled)[0]
                similar_indices = np.argsort(similarities)[::-1][1:top_n+1]
                return [vendors[i] for i in similar_indices]
        except Exception as e:
            logger.warning(f"Recommendation engine error: {e}")

        return vendors[:top_n]


class EventBudgetEstimator:
    """AI-powered event budget estimation"""

    BASE_COSTS = {
        'WEDDING': {
            'HALL': (50000, 500000),
            'CATERING': (800, 2500),  # per plate
            'DECORATION': (30000, 300000),
            'PHOTOGRAPHY': (25000, 200000),
            'DJ_MUSIC': (15000, 80000),
            'BEAUTICIAN': (15000, 80000),
            'TRANSPORT': (10000, 50000),
            'TAILOR': (20000, 150000),
        },
        'BIRTHDAY': {
            'HALL': (20000, 150000),
            'CATERING': (500, 1500),
            'DECORATION': (10000, 80000),
            'PHOTOGRAPHY': (10000, 60000),
            'DJ_MUSIC': (10000, 40000),
        },
        'CORPORATE': {
            'HALL': (30000, 300000),
            'CATERING': (600, 2000),
            'DECORATION': (15000, 100000),
            'PHOTOGRAPHY': (15000, 80000),
        }
    }

    def estimate_budget(self, occasion: str, guest_count: int,
                        selected_services: list, budget_tier: str) -> dict:
        """Estimate event budget based on parameters"""
        occasion = occasion.upper()
        tier_multiplier = {'budget': 0.6, 'standard': 1.0, 'premium': 1.7, 'luxury': 2.5}.get(
            budget_tier.lower(), 1.0)

        costs = self.BASE_COSTS.get(occasion, self.BASE_COSTS['WEDDING'])
        breakdown = {}
        total_min = 0
        total_max = 0

        for service in selected_services:
            service = service.upper()
            if service in costs:
                min_cost, max_cost = costs[service]
                if service == 'CATERING':
                    # Catering is per plate
                    min_cost *= guest_count
                    max_cost *= guest_count

                adjusted_min = int(min_cost * tier_multiplier)
                adjusted_max = int(max_cost * tier_multiplier)
                breakdown[service] = {
                    'min': adjusted_min,
                    'max': adjusted_max,
                    'recommended': int((adjusted_min + adjusted_max) / 2)
                }
                total_min += adjusted_min
                total_max += adjusted_max

        return {
            'breakdown': breakdown,
            'total_min': total_min,
            'total_max': total_max,
            'recommended_total': int((total_min + total_max) / 2),
            'guest_count': guest_count,
            'occasion': occasion,
            'budget_tier': budget_tier,
            'tips': self._get_budget_tips(occasion, budget_tier)
        }

    def _get_budget_tips(self, occasion: str, tier: str) -> list:
        tips = [
            "Book vendors 3-6 months in advance for the best rates",
            "Compare at least 3 vendors before finalizing",
            "Always get a written contract with payment terms",
            "Keep 10-15% buffer for unexpected expenses"
        ]
        if tier in ['budget', 'standard']:
            tips.append("Consider weekday events for 20-30% savings")
            tips.append("Combo packages from full-event handlers can save 15-25%")
        return tips


ranking_engine = VendorRankingEngine()
budget_estimator = EventBudgetEstimator()


@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'service': 'eventora-ai', 'version': '1.0.0'})


@app.route('/rank-vendors', methods=['POST'])
def rank_vendors():
    """Rank vendors using AI scoring algorithm"""
    try:
        data = request.get_json()
        vendors = data.get('vendors', [])
        preferences = data.get('userPreferences', {})

        ranked = ranking_engine.rank_vendors(vendors, preferences)
        return jsonify({'vendors': ranked, 'count': len(ranked)})
    except Exception as e:
        logger.error(f"Ranking error: {e}")
        return jsonify({'error': str(e)}), 500


@app.route('/recommend', methods=['POST'])
def recommend():
    """Get similar vendor recommendations"""
    try:
        data = request.get_json()
        vendors = data.get('vendors', [])
        target_id = data.get('targetVendorId', '')
        top_n = data.get('topN', 5)

        recommendations = ranking_engine.get_ai_recommendations(vendors, target_id, top_n)
        return jsonify({'recommendations': recommendations})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/estimate-budget', methods=['POST'])
def estimate_budget():
    """Estimate event budget"""
    try:
        data = request.get_json()
        result = budget_estimator.estimate_budget(
            occasion=data.get('occasion', 'WEDDING'),
            guest_count=int(data.get('guestCount', 100)),
            selected_services=data.get('services', ['HALL', 'CATERING', 'DECORATION', 'PHOTOGRAPHY']),
            budget_tier=data.get('budgetTier', 'standard')
        )
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/chat', methods=['POST'])
def chat():
    """AI chatbot endpoint with Redis caching"""
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        history = data.get('history', [])
        user_id = data.get('userId', 'anonymous')

        if not message:
            return jsonify({'error': 'Message is required'}), 400

        # Check Redis cache
        cache_key = f"eventora:ai:chat:{hashlib.md5(message.lower().encode()).hexdigest()}"
        if redis_client:
            cached = redis_client.get(cache_key)
            if cached:
                return jsonify({'response': cached, 'cached': True})

        # Generate AI response
        response = generate_intelligent_response(message, history)

        # Cache the response
        if redis_client and response:
            redis_client.setex(cache_key, 3600, response)

        return jsonify({'response': response, 'cached': False})
    except Exception as e:
        logger.error(f"Chat error: {e}")
        return jsonify({'error': str(e)}), 500


def generate_intelligent_response(message: str, history: list) -> str:
    """Generate intelligent chatbot response"""
    msg_lower = message.lower()

    # Build context from history
    context = ' '.join([h.get('content', '') for h in history[-3:] if h.get('role') == 'user'])

    # Intent detection
    intents = {
        'wedding': any(w in msg_lower for w in ['wedding', 'shaadi', 'vivah', 'marriage', 'bride', 'groom']),
        'birthday': any(w in msg_lower for w in ['birthday', 'bday', 'celebration', 'party']),
        'corporate': any(w in msg_lower for w in ['corporate', 'office', 'business', 'conference', 'meeting']),
        'budget': any(w in msg_lower for w in ['budget', 'cost', 'price', 'afford', 'cheap', 'expensive']),
        'vendor': any(w in msg_lower for w in ['vendor', 'service', 'provider', 'find', 'search', 'book']),
        'hall': any(w in msg_lower for w in ['hall', 'venue', 'banquet', 'auditorium', 'ground']),
        'catering': any(w in msg_lower for w in ['food', 'catering', 'menu', 'cuisine', 'biryani', 'buffet']),
        'decoration': any(w in msg_lower for w in ['decor', 'decoration', 'theme', 'flower', 'setup']),
        'photography': any(w in msg_lower for w in ['photo', 'video', 'camera', 'shoot', 'cinematic']),
    }

    if intents['wedding']:
        return """🎊 **Wedding Planning Assistant**

For a perfect wedding, here's your complete checklist:

**6-12 Months Before:**
• Book your venue/hall and catering
• Finalize decoration theme
• Book photographer/videographer

**3-6 Months Before:**
• Book DJ/Music entertainment
• Arrange transport for guests
• Book bridal beautician
• Finalize tailor for wedding attire

**1-3 Months Before:**
• Confirm all bookings
• Send invitations
• Final fittings

**Estimated Budget (100-200 guests):**
| Service | Budget Range |
|---------|-------------|
| Hall | ₹50K - ₹5L |
| Catering | ₹1L - ₹5L |
| Decoration | ₹30K - ₹3L |
| Photography | ₹25K - ₹2L |
| Beautician | ₹15K - ₹80K |
| DJ/Music | ₹15K - ₹80K |

**Total: ₹3L - ₹15L+**

Would you like me to find top-rated vendors for any specific category? 💍"""

    if intents['budget']:
        return """💰 **Smart Budget Planning with Eventora AI**

**Event Size & Estimated Costs:**

🥉 **Intimate (20-50 guests):** ₹50,000 - ₹2,00,000
🥈 **Standard (50-200 guests):** ₹2,00,000 - ₹8,00,000
🥇 **Grand (200-500 guests):** ₹8,00,000 - ₹25,00,000
👑 **Luxury (500+ guests):** ₹25,00,000+

**Money-Saving Tips:**
• 📅 Book weekday events (save 20-30%)
• 📦 Use full event handler packages (save 15-25%)
• ⏰ Book 6+ months early (10-20% discount)
• 🔄 Compare minimum 3 vendors

Use our **AI Budget Calculator** on the homepage for a detailed personalized estimate! 🎯"""

    if intents['hall']:
        return """🏛️ **Finding Your Perfect Venue**

**Types of Venues on Eventora:**
• Banquet Halls (AC & Non-AC)
• Open Air Grounds
• Hotel Ballrooms
• Convention Centers
• Rooftop Venues

**Key Checklist:**
✅ Capacity matches your guest count
✅ Parking availability
✅ Catering kitchen facility
✅ Sound & lighting equipment
✅ Bridal room & changing areas
✅ Generator backup

**Price Range:**
• Basic Hall: ₹20,000/day
• Premium Hall: ₹1,00,000/day
• Luxury Ballroom: ₹5,00,000/day

Shall I show you top-rated halls in your city? 🌟"""

    if intents['catering']:
        return """🍽️ **Catering Services Guide**

**Popular Cuisines Available:**
• North Indian / South Indian
• Continental & Chinese
• Live Counters (Pasta, Chaat, Grill)
• Fusion & Specialty Menus

**Pricing Guide:**
| Package | Price/Plate |
|---------|------------|
| Veg Basic | ₹600-900 |
| Veg Premium | ₹900-1,500 |
| Non-Veg | ₹1,000-2,000 |
| Continental | ₹1,500-3,000 |

**Pro Tips:**
• Always do a food tasting before finalizing
• Confirm minimum order quantity
• Check if they provide serving staff
• Ask about leftover food policy

Ready to browse top caterers? 😋"""

    # Default helpful response
    return """👋 **Hi! I'm Eventora's AI Assistant**

I'm here to make your event planning effortless! Here's what I can help with:

🔍 **Find Vendors** - Search by category, city, budget
💰 **Budget Planning** - Estimate costs for any event type
📅 **Event Timeline** - Step-by-step planning guide
⭐ **AI Recommendations** - Personalized vendor suggestions
📊 **Price Comparison** - Compare vendor packages

**Quick Actions:**
• Type "wedding vendors" to find wedding services
• Type "budget 50000" for budget suggestions
• Type "hall in Mumbai" to find venues
• Type "catering menu" for food options

What event are you planning? I'll create a personalized plan just for you! 🎉"""


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'False').lower() == 'true'
    app.run(host='0.0.0.0', port=port, debug=debug)
