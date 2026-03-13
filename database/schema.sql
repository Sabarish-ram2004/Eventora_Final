-- EVENTORA PostgreSQL Schema v1.0.0
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('USER', 'VENDOR', 'ADMIN');
CREATE TYPE booking_status AS ENUM ('PENDING', 'CONFIRMED', 'REJECTED', 'WAITLISTED', 'CANCELLED', 'COMPLETED');
CREATE TYPE vendor_status AS ENUM ('PENDING_APPROVAL', 'ACTIVE', 'SUSPENDED', 'REJECTED');
CREATE TYPE service_category AS ENUM ('HALL','CATERING','DECORATION','PHOTOGRAPHY','DJ_MUSIC','TRANSPORT','BEAUTICIAN','TAILOR','FULL_EVENT_HANDLER');
CREATE TYPE occasion_type AS ENUM ('WEDDING','BIRTHDAY','CORPORATE','ANNIVERSARY','BABY_SHOWER','GRADUATION','FESTIVAL','OTHER');

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'USER',
    first_name VARCHAR(100), last_name VARCHAR(100),
    phone VARCHAR(20), profile_image_url TEXT,
    city VARCHAR(100), pincode VARCHAR(10), address TEXT,
    google_maps_link TEXT,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP, created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name service_category NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL, description TEXT,
    icon_url TEXT, cover_image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE, vendor_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO service_categories (name, display_name, description) VALUES
('HALL','Event Halls','Premium banquet halls and venues'),
('CATERING','Catering Services','Exquisite food and beverage services'),
('DECORATION','Decoration','Creative event decoration and themes'),
('PHOTOGRAPHY','Photography & Video','Professional photography/videography'),
('DJ_MUSIC','DJ & Music','Live music, DJ and sound systems'),
('TRANSPORT','Transport','Wedding cars and guest transportation'),
('BEAUTICIAN','Beauty & Makeover','Bridal makeup and beauty services'),
('TAILOR','Tailor & Fashion','Custom clothing and wedding attire'),
('FULL_EVENT_HANDLER','Event Management','Complete end-to-end event planning');

CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL, tagline VARCHAR(500), description TEXT,
    category service_category NOT NULL,
    logo_url TEXT, cover_banner_url TEXT, website_url TEXT,
    phone VARCHAR(20), email VARCHAR(255),
    address TEXT NOT NULL, city VARCHAR(100) NOT NULL, pincode VARCHAR(10) NOT NULL,
    google_maps_link TEXT, starting_price DECIMAL(12,2), currency VARCHAR(3) DEFAULT 'INR',
    status vendor_status DEFAULT 'PENDING_APPROVAL', is_verified BOOLEAN DEFAULT FALSE,
    avg_rating DECIMAL(3,2) DEFAULT 0, total_reviews INTEGER DEFAULT 0,
    total_bookings INTEGER DEFAULT 0, successful_bookings INTEGER DEFAULT 0,
    wishlist_count INTEGER DEFAULT 0, avg_response_time_hours DECIMAL(5,2) DEFAULT 24,
    profile_completion_score INTEGER DEFAULT 0, ai_popularity_score DECIMAL(5,2) DEFAULT 0,
    overall_ranking_score DECIMAL(8,4) DEFAULT 0,
    amenities JSONB DEFAULT '[]', service_subtypes JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW(),
    approved_at TIMESTAMP, approved_by UUID REFERENCES users(id)
);

CREATE TABLE vendor_services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    service_name VARCHAR(255) NOT NULL, description TEXT,
    price DECIMAL(12,2), price_unit VARCHAR(50) DEFAULT 'per event',
    duration_hours INTEGER, max_capacity INTEGER, min_order INTEGER DEFAULT 1,
    is_available BOOLEAN DEFAULT TRUE,
    features JSONB DEFAULT '[]', images JSONB DEFAULT '[]', occasion_types JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vendor_gallery (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL, thumbnail_url TEXT, caption VARCHAR(500),
    is_cover BOOLEAN DEFAULT FALSE, sort_order INTEGER DEFAULT 0,
    uploaded_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(20) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    service_id UUID REFERENCES vendor_services(id),
    category service_category NOT NULL, event_date DATE NOT NULL, event_time TIME,
    occasion occasion_type, guest_count INTEGER,
    venue_address TEXT, special_requirements TEXT,
    status booking_status DEFAULT 'PENDING',
    quoted_price DECIMAL(12,2), final_price DECIMAL(12,2), advance_paid DECIMAL(12,2) DEFAULT 0,
    payment_status VARCHAR(50) DEFAULT 'UNPAID',
    vendor_notes TEXT, user_notes TEXT,
    is_flagged BOOLEAN DEFAULT FALSE, flag_reason TEXT,
    created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW(),
    confirmed_at TIMESTAMP, cancelled_at TIMESTAMP, completed_at TIMESTAMP
);

CREATE TABLE vendor_availability (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    date DATE NOT NULL, is_available BOOLEAN DEFAULT TRUE,
    max_bookings INTEGER DEFAULT 1, current_bookings INTEGER DEFAULT 0,
    notes VARCHAR(500), UNIQUE(vendor_id, date)
);

CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID UNIQUE NOT NULL REFERENCES bookings(id),
    user_id UUID NOT NULL REFERENCES users(id),
    vendor_id UUID NOT NULL REFERENCES vendors(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(255), content TEXT, images JSONB DEFAULT '[]',
    quality_rating INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
    value_rating INTEGER CHECK (value_rating BETWEEN 1 AND 5),
    punctuality_rating INTEGER CHECK (punctuality_rating BETWEEN 1 AND 5),
    communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
    vendor_reply TEXT, vendor_replied_at TIMESTAMP,
    is_verified BOOLEAN DEFAULT TRUE, helpful_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(), updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE wishlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(), UNIQUE(user_id, vendor_id)
);

CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(), UNIQUE(user_id, vendor_id)
);

CREATE TABLE chatbot_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cache_key VARCHAR(512) UNIQUE NOT NULL, query_hash VARCHAR(64) NOT NULL,
    response TEXT NOT NULL, hit_count INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(), last_accessed_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NOT NULL
);

CREATE TABLE otp_cache_reference (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL, otp_type VARCHAR(50) NOT NULL,
    redis_key VARCHAR(512) NOT NULL, attempt_count INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3, is_used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(), expires_at TIMESTAMP NOT NULL
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL, message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, reference_id UUID, reference_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE, created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_city ON vendors(city);
CREATE INDEX idx_vendors_ranking ON vendors(overall_ranking_score DESC);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_vendor_id ON bookings(vendor_id);
CREATE INDEX idx_bookings_event_date ON bookings(event_date);
CREATE INDEX idx_reviews_vendor_id ON reviews(vendor_id);
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);

-- Functions
CREATE OR REPLACE FUNCTION update_vendor_rating() RETURNS TRIGGER AS $$
BEGIN
    UPDATE vendors SET avg_rating=(SELECT COALESCE(AVG(rating),0) FROM reviews WHERE vendor_id=NEW.vendor_id),
    total_reviews=(SELECT COUNT(*) FROM reviews WHERE vendor_id=NEW.vendor_id), updated_at=NOW() WHERE id=NEW.vendor_id;
    RETURN NEW;
END;$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vendor_rating AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_vendor_rating();

CREATE OR REPLACE FUNCTION generate_booking_reference() RETURNS TRIGGER AS $$
BEGIN NEW.booking_reference='EVT'||UPPER(SUBSTRING(NEW.id::text,1,8)); RETURN NEW; END;$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_booking_reference BEFORE INSERT ON bookings FOR EACH ROW EXECUTE FUNCTION generate_booking_reference();

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at=NOW(); RETURN NEW; END;$$ LANGUAGE plpgsql;

CREATE TRIGGER t1 BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t2 BEFORE UPDATE ON vendors FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER t3 BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
