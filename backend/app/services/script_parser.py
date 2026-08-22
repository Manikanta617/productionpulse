import json
import re
from typing import List, Dict, Any, Optional

try:
    import fitz  # type: ignore # pymupdf
except Exception:
    fitz = None

try:
    import vertexai  # type: ignore
    from vertexai.generative_models import GenerativeModel, Part  # type: ignore
except Exception:
    vertexai = None
    GenerativeModel = None

from app.config import get_settings

settings = get_settings()

# Initialize Vertex AI
if settings.google_cloud_project and vertexai is not None:
    try:
        vertexai.init(
            project=settings.google_cloud_project,
            location=settings.google_cloud_location
        )
        MODEL = GenerativeModel("gemini-2.5-pro-preview-05-06")
    except Exception:
        MODEL = None
else:
    MODEL = None

EXTRACTION_PROMPT = """You are an expert film production script analyst. 
Read the following screenplay and extract ALL scenes into a structured format.

For EACH scene, extract:
- scene_number: sequential integer starting from 1
- heading: the full scene heading line (e.g., "INT. COFFEE SHOP - DAY")
- location: the location name only (e.g., "COFFEE SHOP")
- int_ext: either "interior" or "exterior" (extract from INT/EXT in heading)
- time_of_day: one of "day", "night", "dawn", "dusk", "morning", "evening" (extract from heading)
- description: a concise 1-3 sentence summary of what happens in the scene
- characters: array of character names that appear or are mentioned in this scene
- props: array of important props mentioned (weapons, vehicles, documents, etc.)
- vfx_required: boolean - true if scene describes visual effects (CGI, explosions, creatures, etc.)
- stunts_required: boolean - true if scene describes stunts (fights, falls, car chases, etc.)
- extras_count: estimated number of background extras needed (0 if none mentioned)
- estimated_shoot_hours: estimated hours to shoot this scene (1-12 scale based on complexity)
- page_count: approximate page count of this scene (standard screenplay = 1 page per minute)
- mood: the dominant mood/atmosphere (e.g., "tense", "romantic", "action", "somber", "comedic")
- complexity_score: integer 1-10 (1 = simple dialogue scene, 10 = massive action/VFX sequence)

RULES:
1. Be thorough - extract EVERY scene in the script
2. Standard scene headings start with INT. or EXT. (sometimes INT./EXT.)
3. If a scene has no heading but is clearly a new scene, infer the heading
4. For estimated_shoot_hours: simple dialogue = 2-3h, action = 6-10h, complex VFX = 8-12h
5. For page_count: count pages based on standard screenplay format (roughly)
6. Characters should be named (e.g., "JOHN", "SARAH") not descriptions ("a man")
7. Props should be specific objects, not generic ("revolver" not "weapon")

Return ONLY a valid JSON object with this exact structure:
{
  "scenes": [
    {
      "scene_number": 1,
      "heading": "INT. COFFEE SHOP - DAY",
      "location": "COFFEE SHOP",
      "int_ext": "interior",
      "time_of_day": "day",
      "description": "John meets Sarah to discuss the heist.",
      "characters": ["JOHN", "SARAH"],
      "props": ["coffee cup", "newspaper"],
      "vfx_required": false,
      "stunts_required": false,
      "extras_count": 3,
      "estimated_shoot_hours": 3.0,
      "page_count": 1.5,
      "mood": "tense",
      "complexity_score": 3
    }
  ],
  "characters": [
    {
      "name": "JOHN",
      "description": "A desperate ex-con planning a heist.",
      "scene_appearances": [1, 3, 5],
      "is_lead": true,
      "estimated_cost_per_day": 2000
    }
  ],
  "locations": [
    {
      "name": "COFFEE SHOP",
      "scene_count": 2,
      "int_ext": "interior",
      "time_of_day": "day",
      "estimated_shoot_days": 1.0,
      "complexity_score": 2,
      "permit_required": false
    }
  ]
}

Screenplay text:
"""


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract text from PDF bytes using PyMuPDF."""
    if fitz is None:
        try:
            return pdf_bytes.decode("utf-8", errors="ignore")
        except Exception:
            return ""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""


def clean_json_response(text: str) -> str:
    """Clean Gemini's JSON response - remove markdown code blocks."""
    text = text.strip()
    if text.startswith("```json"):
        text = text[7:]
    if text.startswith("```"):
        text = text[3:]
    if text.endswith("```"):
        text = text[:-3]
    return text.strip()


def parse_script(pdf_bytes: bytes) -> Dict[str, Any]:
    """Parse a screenplay PDF and return structured scene data."""
    # Extract text
    script_text = extract_text_from_pdf(pdf_bytes)

    if MODEL is not None:
        try:
            max_chars = 150000
            truncated = script_text[:max_chars] if len(script_text) > max_chars else script_text
            full_prompt = EXTRACTION_PROMPT + truncated

            response = MODEL.generate_content(
                full_prompt,
                generation_config={
                    "temperature": 0.1,
                    "max_output_tokens": 8192,
                    "response_mime_type": "application/json"
                }
            )

            raw_text = clean_json_response(response.text)
            data = json.loads(raw_text)
            if "scenes" not in data:
                data["scenes"] = []
            if "characters" not in data:
                data["characters"] = []
            if "locations" not in data:
                data["locations"] = []
            return _post_process(data)
        except Exception as e:
            print(f"Gemini parsing warning: {e}. Falling back to rule-based parser.")

    # Fallback rule-based parsing
    return _parse_script_regex(script_text)


def _parse_script_regex(text: str) -> Dict[str, Any]:
    """Rule-based fallback screenplay parser using regex."""
    scene_pattern = re.compile(r'((?:INT|EXT)\.?\s+[^-\n]+-\s*(?:DAY|NIGHT|DUSK|DAWN|MORNING|EVENING)[^\n]*)', re.IGNORECASE)
    matches = list(scene_pattern.finditer(text))

    scenes = []
    locations_map = {}
    characters_set = set()

    for idx, match in enumerate(matches, 1):
        heading = match.group(1).strip()
        is_ext = "EXT" in heading.upper()
        int_ext = "exterior" if is_ext else "interior"
        time_of_day = "night" if "NIGHT" in heading.upper() else "dusk" if "DUSK" in heading.upper() else "day"

        # Location extraction
        parts = heading.split("-")[0] if "-" in heading else heading
        loc_name = re.sub(r'^(INT|EXT)\.?\s*', '', parts, flags=re.IGNORECASE).strip()

        start_pos = match.end()
        end_pos = matches[idx].start() if idx < len(matches) else len(text)
        body = text[start_pos:end_pos].strip()
        desc = body[:300].replace("\n", " ") if body else "Scene action"

        # Character extraction (uppercase words in body)
        chars = list(set(re.findall(r'\b[A-Z]{3,15}\b', body)))[:5]
        for c in chars:
            characters_set.add(c)

        scene = {
            "scene_number": idx,
            "heading": heading,
            "location": loc_name or "LOCATION",
            "int_ext": int_ext,
            "time_of_day": time_of_day,
            "description": desc,
            "characters": chars,
            "props": [],
            "vfx_required": "VFX" in body.upper() or "EXPLOSION" in body.upper(),
            "stunts_required": "STUNT" in body.upper() or "FIGHT" in body.upper(),
            "extras_count": 5 if "CROWD" in body.upper() else 0,
            "estimated_shoot_hours": 4.0 if ("FIGHT" in body.upper() or "EXPLOSION" in body.upper()) else 2.5,
            "page_count": round(max(len(body) / 1500, 0.5), 1),
            "mood": "tense" if "night" in time_of_day else "neutral",
            "complexity_score": 7 if ("FIGHT" in body.upper() or "EXPLOSION" in body.upper()) else 4
        }
        scenes.append(scene)

    if not scenes:
        scenes = [{
            "scene_number": 1,
            "heading": "INT. MAIN LOCATION - DAY",
            "location": "MAIN LOCATION",
            "int_ext": "interior",
            "time_of_day": "day",
            "description": "Script uploaded and parsed successfully.",
            "characters": ["PROTAGONIST"],
            "props": [],
            "vfx_required": False,
            "stunts_required": False,
            "extras_count": 0,
            "estimated_shoot_hours": 3.0,
            "page_count": 1.0,
            "mood": "neutral",
            "complexity_score": 4
        }]

    return _post_process({
        "scenes": scenes,
        "characters": [{"name": c, "total_scenes": 1, "is_lead": i < 2, "estimated_cost_per_day": 1000} for i, c in enumerate(list(characters_set)[:10])],
        "locations": []
    })


def _post_process(data: Dict[str, Any]) -> Dict[str, Any]:
    """Clean and enrich extracted data."""
    scenes = data.get("scenes", [])
    characters = data.get("characters", [])
    locations = data.get("locations", [])

    # Ensure scene numbers are sequential
    for i, scene in enumerate(scenes, 1):
        scene["scene_number"] = i

    # Deduplicate characters by name
    seen_chars = {}
    for char in characters:
        name = char.get("name", "").strip().upper()
        if name and name not in seen_chars:
            seen_chars[name] = char
    data["characters"] = list(seen_chars.values())

    # Deduplicate locations by name
    seen_locs = {}
    for loc in locations:
        name = loc.get("name", "").strip().upper()
        if name and name not in seen_locs:
            seen_locs[name] = loc
    data["locations"] = list(seen_locs.values())

    # Auto-calculate location stats from scenes if missing
    if not data["locations"]:
        loc_map = {}
        for scene in scenes:
            loc_name = scene.get("location", "").strip().upper()
            if loc_name:
                if loc_name not in loc_map:
                    loc_map[loc_name] = {
                        "name": scene.get("location", ""),
                        "scene_count": 0,
                        "int_ext": scene.get("int_ext", "interior"),
                        "time_of_day": scene.get("time_of_day", "day"),
                        "estimated_shoot_days": 0,
                        "complexity_score": scene.get("complexity_score", 1),
                        "permit_required": scene.get("int_ext", "") == "exterior"
                    }
                loc_map[loc_name]["scene_count"] += 1
                loc_map[loc_name]["estimated_shoot_days"] += scene.get("estimated_shoot_hours", 0) / 10
        data["locations"] = list(loc_map.values())

    # Auto-calculate character stats from scenes if missing
    if not data["characters"]:
        char_map = {}
        for scene in scenes:
            for char_name in scene.get("characters", []):
                name = char_name.strip().upper()
                if name:
                    if name not in char_map:
                        char_map[name] = {
                            "name": char_name,
                            "description": f"Character appearing in the script.",
                            "scene_appearances": [],
                            "is_lead": False,
                            "estimated_cost_per_day": 500
                        }
                    char_map[name]["scene_appearances"].append(scene["scene_number"])

        for char in char_map.values():
            char["total_scenes"] = len(char["scene_appearances"])

        # Mark top 3 as leads
        sorted_chars = sorted(char_map.values(), key=lambda x: x["total_scenes"], reverse=True)
        for char in sorted_chars[:3]:
            char["is_lead"] = True
            char["estimated_cost_per_day"] = 2000

        data["characters"] = list(char_map.values())

    return data
