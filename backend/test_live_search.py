import os
import json
import httpx
from dotenv import load_dotenv

# Load .env file
load_dotenv(".env")
load_dotenv("../.env")

from app.services.parallel_search import get_parallel_api_key, search_industry_rates

print("="*70)
print("EXECUTING LIVE PARALLEL SEARCH API CALL")
print("="*70)

api_key = get_parallel_api_key()
query = "SAG-AFTRA theatrical day scale minimum and holding rules 2026"

print(f"Detected API Key: {'YES (Length ' + str(len(api_key)) + ')' if api_key else 'NO KEY FOUND (check .env for paralle_ai_api)'}")

url = "https://api.parallel.ai/v1/search"
headers = {
    "Authorization": f"Bearer {api_key or 'test-productionpulse-key'}",
    "Content-Type": "application/json",
    "User-Agent": "ProductionPulse/1.0"
}
payload = {
    "query": query,
    "max_results": 2
}

print(f"Request URL: {url}")
print(f"Request Headers: {json.dumps({k: (v if k != 'Authorization' else ('Bearer ' + ('*' * 8) + api_key[-4:] if len(api_key) > 4 else 'Bearer ***')) for k, v in headers.items()}, indent=2)}")
print(f"Request Body:\n{json.dumps(payload, indent=2)}\n")

try:
    with httpx.Client(timeout=10.0) as client:
        response = client.post(url, headers=headers, json=payload)
        print(f"Response HTTP Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        print(f"Response Body:\n{response.text}")
except Exception as e:
    print(f"Network / HTTP Exception: {e}")

print("\n" + "="*70)
print("TESTING FULL SERVICE search_industry_rates() INTEGRATION")
print("="*70)
service_result = search_industry_rates(query)
print(json.dumps(service_result, indent=2))
print("="*70)
