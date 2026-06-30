-- Admin
INSERT INTO users (id, email, email_verified, username, display_name, role, status, is_adult, referral_code, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', 'admin@cyberlisans.com', true, 'admin', 'Site Admin', 'SUPER_ADMIN', 'ACTIVE', true, 'admin-ref-code', now(), now())
ON CONFLICT (email) DO NOTHING;

-- 5 Customers
INSERT INTO users (id, email, email_verified, username, display_name, role, status, is_adult, referral_code, created_at, updated_at) VALUES
('22222222-2222-2222-2222-222222222221', 'alice@cyberlisans.com', true, 'alice', 'Alice', 'CUSTOMER', 'ACTIVE', true, 'ref-alice', now(), now()),
('22222222-2222-2222-2222-222222222222', 'bob@cyberlisans.com', true, 'bob', 'Bob', 'CUSTOMER', 'ACTIVE', true, 'ref-bob', now(), now()),
('22222222-2222-2222-2222-222222222223', 'charlie@cyberlisans.com', true, 'charlie', 'Charlie', 'CUSTOMER', 'ACTIVE', true, 'ref-charlie', now(), now()),
('22222222-2222-2222-2222-222222222224', 'diana@cyberlisans.com', true, 'diana', 'Diana', 'CUSTOMER', 'ACTIVE', true, 'ref-diana', now(), now()),
('22222222-2222-2222-2222-222222222225', 'erhan@cyberlisans.com', true, 'erhan', 'Erhan', 'CUSTOMER', 'ACTIVE', true, 'ref-erhan', now(), now())
ON CONFLICT (email) DO NOTHING;

-- Wallets for each user
INSERT INTO wallets (user_id, balance_try, balance_usd, balance_eur, balance_usdt, loyalty_coins, created_at, updated_at)
SELECT id, 500, 0, 0, 0, 100, now(), now() FROM users ON CONFLICT (user_id) DO NOTHING;

-- Categories
INSERT INTO categories (id, slug, name, name_en, name_de, name_ar, name_ru, icon, sort_order, is_active, created_at, updated_at) VALUES
('33333333-3333-3333-3333-333333333331', 'games', 'Oyun', 'Games', 'Spiele', 'الألعاب', 'Игры', 'gamepad', 1, true, now(), now()),
('33333333-3333-3333-3333-333333333332', 'software', 'Yazılım', 'Software', 'Software', 'برمجيات', 'Программы', 'package', 2, true, now(), now()),
('33333333-3333-3333-3333-333333333333', 'ai-api', 'AI API', 'AI API', 'KI-API', 'واجهة الذكاء الاصطناعي', 'ИИ API', 'sparkles', 3, true, now(), now())
ON CONFLICT (slug) DO NOTHING;

-- Brands
INSERT INTO brands (id, slug, name, logo_url, website_url, is_active, created_at, updated_at) VALUES
('44444444-4444-4444-4444-444444444441', 'steam', 'Steam', 'https://cdn.cyberlisans.com/brands/steam.png', 'https://store.steampowered.com', true, now(), now()),
('44444444-4444-4444-4444-444444444442', 'playstation', 'PlayStation', 'https://cdn.cyberlisans.com/brands/ps.png', 'https://www.playstation.com', true, now(), now()),
('44444444-4444-4444-4444-444444444443', 'xbox', 'Xbox', 'https://cdn.cyberlisans.com/brands/xbox.png', 'https://www.xbox.com', true, now(), now()),
('44444444-4444-4444-4444-444444444444', 'riot-games', 'Riot Games', 'https://cdn.cyberlisans.com/brands/riot.png', 'https://www.riotgames.com', true, now(), now()),
('44444444-4444-4444-4444-444444444445', 'netflix', 'Netflix', 'https://cdn.cyberlisans.com/brands/netflix.png', 'https://www.netflix.com', true, now(), now()),
('44444444-4444-4444-4444-444444444446', 'spotify', 'Spotify', 'https://cdn.cyberlisans.com/brands/spotify.png', 'https://www.spotify.com', true, now(), now()),
('44444444-4444-4444-4444-444444444447', 'discord', 'Discord', 'https://cdn.cyberlisans.com/brands/discord.png', 'https://discord.com', true, now(), now()),
('44444444-4444-4444-4444-444444444448', 'microsoft', 'Microsoft', 'https://cdn.cyberlisans.com/brands/microsoft.png', 'https://www.microsoft.com', true, now(), now())
ON CONFLICT (slug) DO NOTHING;

-- Products
INSERT INTO products (id, category_id, brand_id, slug, title, description, price_try, price_usd, price_eur, price_usdt, stock, delivery_type, is_active, is_featured, sort_order, created_at, updated_at) VALUES
('55555555-5555-5555-5555-555555555551', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444441', 'steam-wallet-50-try', 'Steam 50 TL Bakiye', 'Steam cüzdanına 50 TL bakiye yükleyin.', 50, 1.65, 1.55, 1.65, 100, 'KEY', true, true, 1, now(), now()),
('55555555-5555-5555-5555-555555555552', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444442', 'psn-100-usd', 'PSN 100 USD Bakiye', 'PlayStation Network 100 USD bakiye.', 3000, 100, 92, 100, 80, 'KEY', true, true, 2, now(), now()),
('55555555-5555-5555-5555-555555555553', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444443', 'xbox-game-pass-1m', 'Xbox Game Pass 1 Ay', '1 aylık Xbox Game Pass Ultimate.', 350, 11, 10.30, 11, 60, 'KEY', true, true, 3, now(), now()),
('55555555-5555-5555-5555-555555555554', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444444', 'riot-vp-2800', 'Riot Valorant Points 2800', 'Valorant için 2800 VP.', 600, 20, 18.50, 20, 70, 'KEY', true, false, 4, now(), now()),
('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444445', 'netflix-premium-1m', 'Netflix Premium 1 Ay', '1 aylık Netflix Premium üyeliği.', 250, 8, 7.40, 8, 90, 'KEY', true, true, 5, now(), now()),
('55555555-5555-5555-5555-555555555556', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444446', 'spotify-premium-3m', 'Spotify Premium 3 Ay', '3 aylık Spotify Premium.', 450, 14.50, 13.50, 14.50, 75, 'KEY', true, false, 6, now(), now()),
('55555555-5555-5555-5555-555555555557', '33333333-3333-3333-3333-333333333331', '44444444-4444-4444-4444-444444444447', 'discord-nitro-1m', 'Discord Nitro 1 Ay', '1 aylık Discord Nitro.', 200, 6.50, 6, 6.50, 85, 'KEY', true, false, 7, now(), now()),
('55555555-5555-5555-5555-555555555558', '33333333-3333-3333-3333-333333333332', '44444444-4444-4444-4444-444444444448', 'windows-11-pro', 'Windows 11 Pro Key', 'Windows 11 Pro lisans anahtarı.', 1200, 39, 36, 39, 50, 'KEY', true, true, 8, now(), now()),
('55555555-5555-5555-5555-555555555559', '33333333-3333-3333-3333-333333333332', '44444444-4444-4444-4444-444444444448', 'microsoft-365-personal-1y', 'Microsoft 365 Personal 1 Yıl', '1 yıllık Microsoft 365 Personal.', 1500, 49, 45, 49, 40, 'KEY', true, false, 9, now(), now()),
('55555555-5555-5555-5555-55555555555a', '33333333-3333-3333-3333-333333333332', NULL, 'canva-pro-1y', 'Canva Pro 1 Yıl', '1 yıllık Canva Pro üyeliği.', 800, 26, 24, 26, 45, 'KEY', true, false, 10, now(), now()),
('55555555-5555-5555-5555-55555555555b', '33333333-3333-3333-3333-333333333333', NULL, 'openai-api-10-usd', 'OpenAI API $10 Kredi', 'OpenAI API için 10 USD kredi.', 320, 10, 9.20, 10, 100, 'API_CREDITS', true, true, 11, now(), now()),
('55555555-5555-5555-5555-55555555555c', '33333333-3333-3333-3333-333333333333', NULL, 'claude-api-10-usd', 'Claude API $10 Kredi', 'Anthropic Claude API için 10 USD kredi.', 320, 10, 9.20, 10, 100, 'API_CREDITS', true, true, 12, now(), now())
ON CONFLICT (slug) DO NOTHING;

-- Product Keys (5-10 per product, XXXX-XXXX-XXXX format)
INSERT INTO product_keys (product_id, code, created_at) VALUES
('55555555-5555-5555-5555-555555555551', 'STEA-AAAA-1111', now()),('55555555-5555-5555-5555-555555555551', 'STEA-BBBB-2222', now()),('55555555-5555-5555-5555-555555555551', 'STEA-CCCC-3333', now()),('55555555-5555-5555-5555-555555555551', 'STEA-DDDD-4444', now()),('55555555-5555-5555-5555-555555555551', 'STEA-EEEE-5555', now()),('55555555-5555-5555-5555-555555555551', 'STEA-FFFF-6666', now()),('55555555-5555-5555-5555-555555555551', 'STEA-GGGG-7777', now()),('55555555-5555-5555-5555-555555555551', 'STEA-HHHH-8888', now()),
('55555555-5555-5555-5555-555555555552', 'PSNA-AAAA-1001', now()),('55555555-5555-5555-5555-555555555552', 'PSNA-BBBB-1002', now()),('55555555-5555-5555-5555-555555555552', 'PSNA-CCCC-1003', now()),('55555555-5555-5555-5555-555555555552', 'PSNA-DDDD-1004', now()),('55555555-5555-5555-5555-555555555552', 'PSNA-EEEE-1005', now()),('55555555-5555-5555-5555-555555555552', 'PSNA-FFFF-1006', now()),('55555555-5555-5555-5555-555555555552', 'PSNA-GGGG-1007', now()),('55555555-5555-5555-5555-555555555552', 'PSNA-HHHH-1008', now()),
('55555555-5555-5555-5555-555555555553', 'XBGA-XXXX-3001', now()),('55555555-5555-5555-5555-555555555553', 'XBGA-YYYY-3002', now()),('55555555-5555-5555-5555-555555555553', 'XBGA-ZZZZ-3003', now()),('55555555-5555-5555-5555-555555555553', 'XBGA-WWWW-3004', now()),('55555555-5555-5555-5555-555555555553', 'XBGA-VVVV-3005', now()),('55555555-5555-5555-5555-555555555553', 'XBGA-UUUU-3006', now()),('55555555-5555-5555-5555-555555555553', 'XBGA-TTTT-3007', now()),
('55555555-5555-5555-5555-555555555554', 'RIOT-VP28-4001', now()),('55555555-5555-5555-5555-555555555554', 'RIOT-VP28-4002', now()),('55555555-5555-5555-5555-555555555554', 'RIOT-VP28-4003', now()),('55555555-5555-5555-5555-555555555554', 'RIOT-VP28-4004', now()),('55555555-5555-5555-5555-555555555554', 'RIOT-VP28-4005', now()),('55555555-5555-5555-5555-555555555554', 'RIOT-VP28-4006', now()),('55555555-5555-5555-5555-555555555554', 'RIOT-VP28-4007', now()),('55555555-5555-5555-5555-555555555554', 'RIOT-VP28-4008', now()),
('55555555-5555-5555-5555-555555555555', 'NTFX-PREM-5001', now()),('55555555-5555-5555-5555-555555555555', 'NTFX-PREM-5002', now()),('55555555-5555-5555-5555-555555555555', 'NTFX-PREM-5003', now()),('55555555-5555-5555-5555-555555555555', 'NTFX-PREM-5004', now()),('55555555-5555-5555-5555-555555555555', 'NTFX-PREM-5005', now()),('55555555-5555-5555-5555-555555555555', 'NTFX-PREM-5006', now()),
('55555555-5555-5555-5555-555555555556', 'SPTY-PREM-6001', now()),('55555555-5555-5555-5555-555555555556', 'SPTY-PREM-6002', now()),('55555555-5555-5555-5555-555555555556', 'SPTY-PREM-6003', now()),('55555555-5555-5555-5555-555555555556', 'SPTY-PREM-6004', now()),('55555555-5555-5555-5555-555555555556', 'SPTY-PREM-6005', now()),('55555555-5555-5555-5555-555555555556', 'SPTY-PREM-6006', now()),('55555555-5555-5555-5555-555555555556', 'SPTY-PREM-6007', now()),
('55555555-5555-5555-5555-555555555557', 'DSCR-NITR-7001', now()),('55555555-5555-5555-5555-555555555557', 'DSCR-NITR-7002', now()),('55555555-5555-5555-5555-555555555557', 'DSCR-NITR-7003', now()),('55555555-5555-5555-5555-555555555557', 'DSCR-NITR-7004', now()),('55555555-5555-5555-5555-555555555557', 'DSCR-NITR-7005', now()),('55555555-5555-5555-5555-555555555557', 'DSCR-NITR-7006', now()),('55555555-5555-5555-5555-555555555557', 'DSCR-NITR-7007', now()),('55555555-5555-5555-5555-555555555557', 'DSCR-NITR-7008', now()),
('55555555-5555-5555-5555-555555555558', 'WIN11-PROD-8001', now()),('55555555-5555-5555-5555-555555555558', 'WIN11-PROD-8002', now()),('55555555-5555-5555-5555-555555555558', 'WIN11-PROD-8003', now()),('55555555-5555-5555-5555-555555555558', 'WIN11-PROD-8004', now()),('55555555-5555-5555-5555-555555555558', 'WIN11-PROD-8005', now()),('55555555-5555-5555-5555-555555555558', 'WIN11-PROD-8006', now()),
('55555555-5555-5555-5555-555555555559', 'MSFT-365P-9001', now()),('55555555-5555-5555-5555-555555555559', 'MSFT-365P-9002', now()),('55555555-5555-5555-5555-555555555559', 'MSFT-365P-9003', now()),('55555555-5555-5555-5555-555555555559', 'MSFT-365P-9004', now()),('55555555-5555-5555-5555-555555555559', 'MSFT-365P-9005', now()),
('55555555-5555-5555-5555-55555555555a', 'CNVA-PROD-A001', now()),('55555555-5555-5555-5555-55555555555a', 'CNVA-PROD-A002', now()),('55555555-5555-5555-5555-55555555555a', 'CNVA-PROD-A003', now()),('55555555-5555-5555-5555-55555555555a', 'CNVA-PROD-A004', now()),('55555555-5555-5555-5555-55555555555a', 'CNVA-PROD-A005', now()),('55555555-5555-5555-5555-55555555555a', 'CNVA-PROD-A006', now()),
('55555555-5555-5555-5555-55555555555b', 'OPEN-AI10-B001', now()),('55555555-5555-5555-5555-55555555555b', 'OPEN-AI10-B002', now()),('55555555-5555-5555-5555-55555555555b', 'OPEN-AI10-B003', now()),('55555555-5555-5555-5555-55555555555b', 'OPEN-AI10-B004', now()),('55555555-5555-5555-5555-55555555555b', 'OPEN-AI10-B005', now()),('55555555-5555-5555-5555-55555555555b', 'OPEN-AI10-B006', now()),('55555555-5555-5555-5555-55555555555b', 'OPEN-AI10-B007', now()),
('55555555-5555-5555-5555-55555555555c', 'CLAU-DE10-C001', now()),('55555555-5555-5555-5555-55555555555c', 'CLAU-DE10-C002', now()),('55555555-5555-5555-5555-55555555555c', 'CLAU-DE10-C003', now()),('55555555-5555-5555-5555-55555555555c', 'CLAU-DE10-C004', now()),('55555555-5555-5555-5555-55555555555c', 'CLAU-DE10-C005', now()),('55555555-5555-5555-5555-55555555555c', 'CLAU-DE10-C006', now()),('55555555-5555-5555-5555-55555555555c', 'CLAU-DE10-C007', now()),('55555555-5555-5555-5555-55555555555c', 'CLAU-DE10-C008', now()),('55555555-5555-5555-5555-55555555555c', 'CLAU-DE10-C009', now()),('55555555-5555-5555-5555-55555555555c', 'CLAU-DE10-C010', now());

-- Sync stock counts
UPDATE products p SET stock = (SELECT COUNT(*)::int FROM product_keys k WHERE k.product_id = p.id AND k.is_used = false);