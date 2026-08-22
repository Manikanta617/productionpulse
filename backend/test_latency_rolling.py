import time
from app.services.mcp_service import record_and_compute_percentiles, execute_mcp_clickhouse_query

print("="*70)
print("TESTING REAL ROLLING WINDOW PERCENTILES (20 SAMPLES)")
print("="*70)

test_queries = [
    "SELECT count() FROM scenes",
    "SELECT scene_number, heading, location FROM scenes LIMIT 3",
    "SELECT category, sum(total_cost_usd) FROM budget_items GROUP BY category",
    "SELECT name, total_scenes, is_lead FROM characters LIMIT 5",
    "SELECT count() FROM locations",
    "SELECT * FROM scenes WHERE time_of_day = 'night'",
    "SELECT avg(complexity_score) FROM scenes",
    "SELECT sum(page_count) FROM scenes",
    "SELECT scene_number, vfx_required, stunts_required FROM scenes WHERE complexity_score > 7",
    "SELECT count() FROM budget_items"
]

for i in range(1, 21):
    sql = test_queries[(i - 1) % len(test_queries)]
    start = time.perf_counter()
    res = execute_mcp_clickhouse_query(sql)
    measured_ms = (time.perf_counter() - start) * 1000
    
    print(f"Query #{i:02d} | Query: {sql[:38]:<38} | Latency: {res['latency_ms']:6.2f}ms | p50: {res['p50_ms']:6.2f}ms | p95: {res['p95_ms']:6.2f}ms | Samples: {res.get('data', []) and len(res.get('data', []))} rows")
    time.sleep(0.05)

print("="*70)
print("ROLLING PERCENTILES TEST COMPLETED SUCCESSFULLY")
print("="*70)
