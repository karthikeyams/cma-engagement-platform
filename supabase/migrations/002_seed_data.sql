-- ============================================================
-- CMA Member Engagement Platform — Seed Data
-- Migration: 002_seed_data.sql
-- Run AFTER 001_initial_schema.sql
-- ============================================================

-- ─── MEMBERS (20 records) ────────────────────────────────────
-- Tiers: active (75-95), passive (40-60), at_risk (15-35), lapsed (5-10)

INSERT INTO members (id, name, email, phone, interests, preferred_channel, engagement_score, tier, joined_at, last_active_at) VALUES

-- ACTIVE MEMBERS (8) — engagement_score 75-95
('a1000000-0000-0000-0000-000000000001', 'Priya Nair',       'priya.nair@example.com',       '+14045550101', ARRAY['gita_study','satsang','vedanta_class'],           'email',    92, 'active',   '2022-01-15 00:00:00+00', '2025-04-20 00:00:00+00'),
('a1000000-0000-0000-0000-000000000002', 'Rajan Krishnan',   'rajan.krishnan@example.com',   '+14045550102', ARRAY['satsang','seva','bhajan'],                         'whatsapp', 88, 'active',   '2021-06-10 00:00:00+00', '2025-04-21 00:00:00+00'),
('a1000000-0000-0000-0000-000000000003', 'Meena Iyer',       'meena.iyer@example.com',       '+14045550103', ARRAY['gita_study','devi_bhava','cultural_events'],       'email',    85, 'active',   '2020-03-22 00:00:00+00', '2025-04-19 00:00:00+00'),
('a1000000-0000-0000-0000-000000000004', 'Suresh Pillai',    'suresh.pillai@example.com',    '+14045550104', ARRAY['vedanta_class','satsang','seva'],                   'email',    91, 'active',   '2019-09-01 00:00:00+00', '2025-04-22 00:00:00+00'),
('a1000000-0000-0000-0000-000000000005', 'Anita Menon',      'anita.menon@example.com',      '+14045550105', ARRAY['youth_programs','seva','bhajan','cultural_events'], 'whatsapp', 79, 'active',   '2022-08-14 00:00:00+00', '2025-04-18 00:00:00+00'),
('a1000000-0000-0000-0000-000000000006', 'Vijay Sharma',     'vijay.sharma@example.com',     '+14045550106', ARRAY['gita_study','vedanta_class'],                       'email',    84, 'active',   '2021-11-30 00:00:00+00', '2025-04-20 00:00:00+00'),
('a1000000-0000-0000-0000-000000000007', 'Kavitha Reddy',    'kavitha.reddy@example.com',    '+14045550107', ARRAY['devi_bhava','satsang','cultural_events','bhajan'],  'whatsapp', 76, 'active',   '2023-01-05 00:00:00+00', '2025-04-17 00:00:00+00'),
('a1000000-0000-0000-0000-000000000008', 'Mohan Venkatesh',  'mohan.venkatesh@example.com',  '+14045550108', ARRAY['seva','gita_study','satsang'],                      'email',    95, 'active',   '2018-05-20 00:00:00+00', '2025-04-22 00:00:00+00'),

-- PASSIVE MEMBERS (6) — engagement_score 40-60
('a2000000-0000-0000-0000-000000000009', 'Deepa Subramaniam','deepa.subramaniam@example.com','+14045550109', ARRAY['cultural_events','bhajan'],                         'email',    55, 'passive',  '2023-03-10 00:00:00+00', '2025-02-28 00:00:00+00'),
('a2000000-0000-0000-0000-000000000010', 'Arun Kumar',       'arun.kumar@example.com',       '+14045550110', ARRAY['satsang'],                                          'whatsapp', 48, 'passive',  '2023-06-01 00:00:00+00', '2025-01-15 00:00:00+00'),
('a2000000-0000-0000-0000-000000000011', 'Lakshmi Patel',    'lakshmi.patel@example.com',    '+14045550111', ARRAY['devi_bhava','cultural_events'],                     'email',    60, 'passive',  '2022-10-18 00:00:00+00', '2025-03-05 00:00:00+00'),
('a2000000-0000-0000-0000-000000000012', 'Srinivas Rao',     'srinivas.rao@example.com',     '+14045550112', ARRAY['gita_study','vedanta_class'],                       'email',    43, 'passive',  '2023-07-22 00:00:00+00', '2025-02-10 00:00:00+00'),
('a2000000-0000-0000-0000-000000000013', 'Radha Chandran',   'radha.chandran@example.com',   '+14045550113', ARRAY['youth_programs','seva'],                            'whatsapp', 57, 'passive',  '2022-12-01 00:00:00+00', '2025-03-20 00:00:00+00'),
('a2000000-0000-0000-0000-000000000014', 'Balaji Gopalan',   'balaji.gopalan@example.com',   '+14045550114', ARRAY['bhajan','satsang'],                                 'email',    40, 'passive',  '2024-01-10 00:00:00+00', '2025-01-30 00:00:00+00'),

-- AT-RISK MEMBERS (4) — engagement_score 15-35
('a3000000-0000-0000-0000-000000000015', 'Nisha Balachandran','nisha.balachandran@example.com','+14045550115',ARRAY['cultural_events'],                                 'email',    28, 'at_risk',  '2023-09-15 00:00:00+00', '2024-11-01 00:00:00+00'),
('a3000000-0000-0000-0000-000000000016', 'Karthik Sundaram', 'karthik.sundaram@example.com', '+14045550116', ARRAY['gita_study'],                                       'whatsapp', 15, 'at_risk',  '2024-02-20 00:00:00+00', '2024-10-15 00:00:00+00'),
('a3000000-0000-0000-0000-000000000017', 'Uma Krishnamurthy','uma.krishnamurthy@example.com', '+14045550117', ARRAY['satsang','bhajan'],                                 'email',    35, 'at_risk',  '2022-05-10 00:00:00+00', '2024-12-01 00:00:00+00'),
('a3000000-0000-0000-0000-000000000018', 'Gopal Natarajan',  'gopal.natarajan@example.com',  '+14045550118', ARRAY['seva'],                                             'email',    20, 'at_risk',  '2023-04-05 00:00:00+00', '2024-09-20 00:00:00+00'),

-- LAPSED MEMBERS (2) — engagement_score 5-10
('a4000000-0000-0000-0000-000000000019', 'Sarala Venkatesan','sarala.venkatesan@example.com','+14045550119', ARRAY['cultural_events'],                                  'email',     8, 'lapsed',   '2021-08-01 00:00:00+00', '2024-05-10 00:00:00+00'),
('a4000000-0000-0000-0000-000000000020', 'Dinesh Murugan',   'dinesh.murugan@example.com',   '+14045550120', ARRAY['satsang'],                                          'whatsapp',  5, 'lapsed',   '2020-11-15 00:00:00+00', '2024-03-01 00:00:00+00');


-- ─── EVENTS (4 records) ──────────────────────────────────────

INSERT INTO events (id, title, description, event_date, location, type, capacity, status) VALUES

('e1000000-0000-0000-0000-000000000001',
 'Gita Jnana Yajna — Chapter 12',
 'A five-day intensive exposition of Bhagavad Gita Chapter 12 (Bhakti Yoga) by Swami Swaroopananda. Open to all seekers.',
 '2025-05-01 18:30:00+00',
 'Chinmaya Mission Atlanta Ashram, 1475 Hembree Rd, Roswell GA 30076',
 'satsang', 60, 'upcoming'),

('e1000000-0000-0000-0000-000000000002',
 'Bala Vihar Spring Session',
 'Monthly Bala Vihar session for children ages 6–16. Includes chanting, stories from scriptures, and craft activities.',
 '2025-04-27 10:00:00+00',
 'CMA Ashram — Bala Vihar Hall',
 'youth', 40, 'upcoming'),

('e1000000-0000-0000-0000-000000000003',
 'Devi Bhava Celebration',
 'An evening of devotional music, Devi puja, and cultural performances celebrating the Divine Mother.',
 '2025-05-08 17:00:00+00',
 'CMA Ashram — Main Hall',
 'cultural', 100, 'upcoming'),

('e1000000-0000-0000-0000-000000000004',
 'Saturday Vedanta Study Group',
 'Weekly guided study of Vivekachudamani with discussion. Suitable for those with foundational Vedanta knowledge.',
 '2025-04-26 09:00:00+00',
 'CMA Ashram — Library Room',
 'study_group', 25, 'upcoming');


-- ─── RSVPs ───────────────────────────────────────────────────
-- Gita Yajna: 13 RSVPs (mix of registered/confirmed)
-- Bala Vihar: 9 RSVPs
-- Study Group: 7 RSVPs
-- Devi Bhava: 5 RSVPs
-- At-risk members have 0-1 RSVPs total

INSERT INTO rsvps (member_id, event_id, status, registered_at, confirmed_at) VALUES

-- Gita Jnana Yajna (e1)
('a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000001', 'confirmed',   '2025-04-10 00:00:00+00', '2025-04-12 00:00:00+00'),
('a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000001', 'confirmed',   '2025-04-10 00:00:00+00', '2025-04-13 00:00:00+00'),
('a1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 'confirmed',   '2025-04-11 00:00:00+00', '2025-04-14 00:00:00+00'),
('a1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000001', 'confirmed',   '2025-04-09 00:00:00+00', '2025-04-11 00:00:00+00'),
('a1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000001', 'registered',  '2025-04-15 00:00:00+00', NULL),
('a1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000001', 'confirmed',   '2025-04-12 00:00:00+00', '2025-04-15 00:00:00+00'),
('a1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000001', 'registered',  '2025-04-16 00:00:00+00', NULL),
('a1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000001', 'confirmed',   '2025-04-08 00:00:00+00', '2025-04-10 00:00:00+00'),
('a2000000-0000-0000-0000-000000000009', 'e1000000-0000-0000-0000-000000000001', 'registered',  '2025-04-17 00:00:00+00', NULL),
('a2000000-0000-0000-0000-000000000010', 'e1000000-0000-0000-0000-000000000001', 'registered',  '2025-04-18 00:00:00+00', NULL),
('a2000000-0000-0000-0000-000000000011', 'e1000000-0000-0000-0000-000000000001', 'confirmed',   '2025-04-14 00:00:00+00', '2025-04-17 00:00:00+00'),
('a2000000-0000-0000-0000-000000000012', 'e1000000-0000-0000-0000-000000000001', 'registered',  '2025-04-19 00:00:00+00', NULL),
('a3000000-0000-0000-0000-000000000017', 'e1000000-0000-0000-0000-000000000001', 'registered',  '2025-04-20 00:00:00+00', NULL),

-- Bala Vihar (e2)
('a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000002', 'confirmed',   '2025-04-05 00:00:00+00', '2025-04-07 00:00:00+00'),
('a1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000002', 'confirmed',   '2025-04-05 00:00:00+00', '2025-04-08 00:00:00+00'),
('a1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000002', 'confirmed',   '2025-04-06 00:00:00+00', '2025-04-09 00:00:00+00'),
('a1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000002', 'registered',  '2025-04-10 00:00:00+00', NULL),
('a2000000-0000-0000-0000-000000000013', 'e1000000-0000-0000-0000-000000000002', 'confirmed',   '2025-04-07 00:00:00+00', '2025-04-10 00:00:00+00'),
('a2000000-0000-0000-0000-000000000014', 'e1000000-0000-0000-0000-000000000002', 'registered',  '2025-04-12 00:00:00+00', NULL),
('a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000002', 'registered',  '2025-04-13 00:00:00+00', NULL),
('a1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000002', 'confirmed',   '2025-04-06 00:00:00+00', '2025-04-09 00:00:00+00'),
('a1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000002', 'registered',  '2025-04-14 00:00:00+00', NULL),

-- Study Group (e4)
('a1000000-0000-0000-0000-000000000004', 'e1000000-0000-0000-0000-000000000004', 'confirmed',   '2025-04-01 00:00:00+00', '2025-04-03 00:00:00+00'),
('a1000000-0000-0000-0000-000000000006', 'e1000000-0000-0000-0000-000000000004', 'confirmed',   '2025-04-01 00:00:00+00', '2025-04-04 00:00:00+00'),
('a1000000-0000-0000-0000-000000000008', 'e1000000-0000-0000-0000-000000000004', 'confirmed',   '2025-04-02 00:00:00+00', '2025-04-05 00:00:00+00'),
('a2000000-0000-0000-0000-000000000012', 'e1000000-0000-0000-0000-000000000004', 'registered',  '2025-04-08 00:00:00+00', NULL),
('a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000004', 'confirmed',   '2025-04-02 00:00:00+00', '2025-04-05 00:00:00+00'),
('a1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000004', 'registered',  '2025-04-09 00:00:00+00', NULL),
('a3000000-0000-0000-0000-000000000015', 'e1000000-0000-0000-0000-000000000004', 'registered',  '2025-04-15 00:00:00+00', NULL),

-- Devi Bhava (e3)
('a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000003', 'confirmed',   '2025-04-10 00:00:00+00', '2025-04-13 00:00:00+00'),
('a1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000003', 'confirmed',   '2025-04-11 00:00:00+00', '2025-04-14 00:00:00+00'),
('a1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000003', 'confirmed',   '2025-04-12 00:00:00+00', '2025-04-15 00:00:00+00'),
('a2000000-0000-0000-0000-000000000011', 'e1000000-0000-0000-0000-000000000003', 'registered',  '2025-04-16 00:00:00+00', NULL),
('a2000000-0000-0000-0000-000000000009', 'e1000000-0000-0000-0000-000000000003', 'registered',  '2025-04-17 00:00:00+00', NULL);


-- ─── AGENT MESSAGES (12 records) ─────────────────────────────

INSERT INTO agent_messages (agent_type, member_id, event_id, channel, direction, subject, content, status, sent_at, responded_at) VALUES

-- Event reminders sent (outbound)
('event_reminder', 'a1000000-0000-0000-0000-000000000005', 'e1000000-0000-0000-0000-000000000001',
 'email', 'outbound',
 'Reminder: Gita Jnana Yajna starts May 1',
 'Namaste Anita! This is a friendly reminder that the Gita Jnana Yajna — Chapter 12 begins this Thursday, May 1 at 6:30 PM at the CMA Ashram. We look forward to your presence. Please confirm your attendance by replying to this message.',
 'sent', '2025-04-22 14:00:00+00', NULL),

('event_reminder', 'a1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000001',
 'whatsapp', 'outbound',
 NULL,
 'Namaste Kavitha-ji! Just a reminder that the Gita Jnana Yajna starts May 1 at 6:30 PM. Will we see you there? Reply YES to confirm or NO if you cannot attend.',
 'sent', '2025-04-22 14:05:00+00', NULL),

('event_reminder', 'a2000000-0000-0000-0000-000000000010', 'e1000000-0000-0000-0000-000000000001',
 'whatsapp', 'outbound',
 NULL,
 'Namaste Arun-ji! The Gita Jnana Yajna — Chapter 12 is coming up on May 1. It would be wonderful to see you. Reply YES to confirm your RSVP.',
 'sent', '2025-04-22 14:10:00+00', NULL),

-- Confirmations received (inbound)
('event_reminder', 'a1000000-0000-0000-0000-000000000007', 'e1000000-0000-0000-0000-000000000001',
 'whatsapp', 'inbound',
 NULL,
 'YES, I will be there! Looking forward to it.',
 'received', '2025-04-22 15:30:00+00', '2025-04-22 15:30:00+00'),

('event_reminder', 'a2000000-0000-0000-0000-000000000010', 'e1000000-0000-0000-0000-000000000001',
 'whatsapp', 'inbound',
 NULL,
 'YES! Will be there.',
 'received', '2025-04-22 16:00:00+00', '2025-04-22 16:00:00+00'),

-- Feedback collection (outbound)
('feedback_collection', 'a1000000-0000-0000-0000-000000000001', 'e1000000-0000-0000-0000-000000000004',
 'email', 'outbound',
 'How was the Vedanta Study Group? Share your feedback',
 'Namaste Priya! We hope you enjoyed the Saturday Vedanta Study Group. Your feedback helps us improve our programs. Could you take 2 minutes to share your thoughts? Reply with a rating from 1-5 and any highlights or suggestions.',
 'sent', '2025-04-19 18:00:00+00', NULL),

-- At-risk member re-engagement
('engagement_insight', 'a3000000-0000-0000-0000-000000000016', NULL,
 'whatsapp', 'outbound',
 NULL,
 'Namaste Karthik-ji! We miss you at Chinmaya Mission Atlanta. The Gita Jnana Yajna is coming up May 1 — it would be wonderful to reconnect. Is there anything we can do to support your spiritual journey? Feel free to reply or call us.',
 'sent', '2025-04-21 10:00:00+00', NULL),

('engagement_insight', 'a3000000-0000-0000-0000-000000000018', NULL,
 'email', 'outbound',
 'We miss you at CMA — upcoming seva opportunity',
 'Namaste Gopal! We noticed it has been a while since we connected. We have a wonderful seva opportunity coming up for the Devi Bhava Celebration on May 8. Your skills and presence would be a gift to our community. We hope to see you soon.',
 'sent', '2025-04-21 10:30:00+00', NULL),

-- Volunteer coordination
('volunteer_coordination', 'a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000003',
 'whatsapp', 'outbound',
 NULL,
 'Namaste Rajan-ji! We are looking for seva volunteers for the Devi Bhava Celebration on May 8. Knowing your love for seva, would you be available to help with event coordination from 4–9 PM? Please reply YES or NO.',
 'sent', '2025-04-20 11:00:00+00', NULL),

('volunteer_coordination', 'a1000000-0000-0000-0000-000000000002', 'e1000000-0000-0000-0000-000000000003',
 'whatsapp', 'inbound',
 NULL,
 'YES absolutely! Happy to serve. What do you need me to do?',
 'received', '2025-04-20 11:45:00+00', '2025-04-20 11:45:00+00'),

-- Onboarding
('onboarding', 'a2000000-0000-0000-0000-000000000014', NULL,
 'email', 'outbound',
 'Welcome to Chinmaya Mission Atlanta — Getting Started',
 'Namaste Balaji! Welcome to the CMA family. We are thrilled to have you with us. Here is a quick guide to our programs: Satsang meets every Sunday at 10 AM, Bala Vihar is monthly, and our Vedanta Study Group meets Saturdays. Feel free to reach out with any questions. Hari Om!',
 'sent', '2025-04-10 09:00:00+00', NULL),

-- Announcement
('announcement', NULL, 'e1000000-0000-0000-0000-000000000001',
 'email', 'outbound',
 'Gita Jnana Yajna — Registration Now Open',
 'Dear CMA Family, we are delighted to announce the Gita Jnana Yajna on Bhagavad Gita Chapter 12 (Bhakti Yoga) beginning May 1, 2025. Registration is now open. Seats are limited to 60. Please RSVP at your earliest. Hari Om!',
 'sent', '2025-04-01 08:00:00+00', NULL);
