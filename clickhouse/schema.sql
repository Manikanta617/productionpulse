-- ProductionPulse ClickHouse Schema
-- Run this in your ClickHouse Cloud console after creating your service

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS budget_items;
DROP TABLE IF EXISTS schedule_items;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS characters;
DROP TABLE IF EXISTS scenes;
DROP TABLE IF EXISTS projects;

-- Projects table (top-level)
CREATE TABLE projects (
    id UUID DEFAULT generateUUIDv4(),
    name String,
    script_title String,
    created_at DateTime DEFAULT now(),
    updated_at DateTime DEFAULT now(),
    total_scenes UInt32 DEFAULT 0,
    total_pages Float32 DEFAULT 0,
    estimated_budget_usd Float32 DEFAULT 0,
    estimated_shoot_days Float32 DEFAULT 0,
    complexity_score UInt8 DEFAULT 0,
    status String DEFAULT 'draft'
) ENGINE = MergeTree()
ORDER BY id;

-- Scenes table (core analytics data)
CREATE TABLE scenes (
    project_id UUID,
    scene_number UInt32,
    heading String,
    location String,
    int_ext String,
    time_of_day String,
    description String,
    characters Array(String),
    props Array(String),
    vfx_required Bool,
    stunts_required Bool,
    extras_count UInt32 DEFAULT 0,
    estimated_shoot_hours Float32 DEFAULT 0,
    page_count Float32 DEFAULT 0,
    mood String,
    complexity_score UInt8 DEFAULT 1,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (project_id, scene_number);

-- Characters table
CREATE TABLE characters (
    project_id UUID,
    name String,
    description String,
    scene_appearances Array(UInt32),
    total_scenes UInt32 DEFAULT 0,
    is_lead Bool DEFAULT false,
    estimated_cost_per_day UInt32 DEFAULT 500,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (project_id, name);

-- Locations table
CREATE TABLE locations (
    project_id UUID,
    name String,
    scene_count UInt32 DEFAULT 0,
    int_ext String,
    time_of_day String,
    estimated_shoot_days Float32 DEFAULT 0,
    complexity_score UInt8 DEFAULT 1,
    permit_required Bool DEFAULT false,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (project_id, name);

-- Budget items table (auto-generated from scene analysis)
CREATE TABLE budget_items (
    project_id UUID,
    category String,
    item_name String,
    quantity Float32 DEFAULT 1,
    unit_cost_usd Float32 DEFAULT 0,
    total_cost_usd Float32 DEFAULT 0,
    scene_numbers Array(UInt32),
    notes String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (project_id, category, item_name);

-- Schedule items table (shooting schedule)
CREATE TABLE schedule_items (
    project_id UUID,
    day_number UInt32,
    scene_numbers Array(UInt32),
    location String,
    int_ext String,
    time_of_day String,
    estimated_hours Float32 DEFAULT 0,
    crew_size UInt32 DEFAULT 0,
    notes String,
    created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (project_id, day_number);

-- Create useful views for analytics
CREATE OR REPLACE VIEW scene_summary AS
SELECT
    project_id,
    count() as total_scenes,
    sum(page_count) as total_pages,
    sum(estimated_shoot_hours) as total_shoot_hours,
    round(sum(estimated_shoot_hours) / 10, 1) as estimated_shoot_days,
    countIf(vfx_required) as vfx_scenes,
    countIf(stunts_required) as stunt_scenes,
    sum(extras_count) as total_extras,
    countIf(int_ext = 'interior') as interior_scenes,
    countIf(int_ext = 'exterior') as exterior_scenes,
    countIf(time_of_day = 'day') as day_scenes,
    countIf(time_of_day = 'night') as night_scenes,
    countIf(time_of_day IN ('dawn', 'dusk')) as golden_hour_scenes,
    avg(complexity_score) as avg_complexity
FROM scenes
GROUP BY project_id;

CREATE OR REPLACE VIEW location_summary AS
SELECT
    project_id,
    name,
    scene_count,
    int_ext,
    time_of_day,
    estimated_shoot_days,
    complexity_score,
    permit_required
FROM locations
ORDER BY project_id, scene_count DESC;

CREATE OR REPLACE VIEW character_summary AS
SELECT
    project_id,
    name,
    total_scenes,
    is_lead,
    estimated_cost_per_day,
    total_scenes * estimated_cost_per_day as estimated_total_cost
FROM characters
ORDER BY project_id, total_scenes DESC;
