"""
GreenGrid v2.0 - FastAPI Backend
AI-Powered E-Waste Classification & Recycling Intelligence
"""
import os
import logging
import numpy as np
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global model cache
models = {}
model_metadata = {}

CLASS_NAMES = [
    "Battery", "Keyboard", "Microwave", "Mobile", "Mouse",
    "PCB", "Player", "Printer", "Television", "Washing Machine"
]

MODEL_CONFIGS = {
    "efficientnetb0": {
        "path": "efficientnetb0_final.keras",
        "display_name": "EfficientNetB0",
        "accuracy": 0.978,
        "preprocess": "efficientnet",
        "description": "Best accuracy/speed balance, production default"
    },
    "resnet50": {
        "path": "resnet50_ewaste_model.keras",
        "display_name": "ResNet50",
        "accuracy": 0.973,
        "preprocess": "resnet50",
        "description": "High accuracy baseline, deeper architecture"
    },
    "mobilenetv2": {
        "path": "mobilenetv2_ewaste_model.keras",
        "display_name": "MobileNetV2",
        "accuracy": 0.941,
        "preprocess": "mobilenetv2",
        "description": "Fastest inference, optimized for edge deployment"
    }
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load models on startup"""
    logger.info("Loading ML models...")
    import tensorflow as tf
    import numpy as np

    # Model base path: configurable via env var, defaults to ./models relative to this file
    model_base_path = os.getenv("MODEL_BASE_PATH")
    if not model_base_path:
        # Default: greengrid-v2/models/ (two levels up from backend/app/)
        model_base_path = os.path.join(os.path.dirname(__file__), "..", "..", "models")
    model_base_path = os.path.abspath(model_base_path)

    for key, config in MODEL_CONFIGS.items():
        try:
            model_path = os.path.join(model_base_path, config['path'])
            if os.path.exists(model_path):
                model = tf.keras.models.load_model(model_path)
                # Warm-up
                dummy = np.zeros((1, 224, 224, 3), dtype=np.float32)
                model.predict(dummy, verbose=0)
                models[key] = model
                model_metadata[key] = config
                logger.info(f"Loaded {config['display_name']} from {model_path}")
            else:
                logger.warning(f"Model file not found: {model_path}")
        except Exception as e:
            logger.error(f"Failed to load {key}: {e}")

    logger.info(f"Loaded {len(models)} models: {list(models.keys())}")
    yield
    logger.info("Shutting down...")


app = FastAPI(
    title="GreenGrid API",
    version="2.0.0",
    description="AI-Powered E-Waste Classification & Recycling Intelligence",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Pydantic Models
# =========================

class PredictionResult(BaseModel):
    class_name: str
    confidence: float
    probabilities: dict[str, float]
    top3: list[dict]
    model_used: str
    model_accuracy: float
    ood_detected: bool
    ood_details: dict


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    context_category: Optional[str] = None
    history: list[ChatMessage] = []


class ChatResponse(BaseModel):
    response: str
    source: str  # "gemini" or "knowledge_base"
    context_used: Optional[str] = None


class LocationRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: int = 25
    waste_type: Optional[str] = None


class LocationSearchRequest(BaseModel):
    query: str
    radius_km: int = 25
    waste_type: Optional[str] = None


class RecyclingCenter(BaseModel):
    name: str
    address: str
    latitude: float
    longitude: float
    distance_km: float
    accepts: list[str]
    phone: Optional[str] = None
    website: Optional[str] = None
    opening_hours: Optional[str] = None
    source: str
    verified: bool


class CentersResponse(BaseModel):
    centers: list[RecyclingCenter]
    search_location: dict
    total_found: int
    osm_error: Optional[str] = None
    google_maps_link: Optional[str] = None
    fallback_used: bool = False


class ModelInfo(BaseModel):
    id: str
    display_name: str
    accuracy: float
    description: str
    preprocess: str


class ModelsResponse(BaseModel):
    models: list[ModelInfo]
    default: str


class HealthResponse(BaseModel):
    status: str
    models_loaded: int
    gemini_configured: bool


# =========================
# ML Utilities
# =========================

def get_preprocess_fn(preprocess_type: str):
    from tensorflow.keras.applications.efficientnet import preprocess_input as eff_preprocess
    from tensorflow.keras.applications.mobilenet_v2 import preprocess_input as mb_preprocess
    from tensorflow.keras.applications.resnet50 import preprocess_input as rn_preprocess

    return {
        "efficientnet": eff_preprocess,
        "mobilenetv2": mb_preprocess,
        "resnet50": rn_preprocess
    }[preprocess_type]


def preprocess_image(image_bytes: bytes, preprocess_type: str) -> "np.ndarray":
    import numpy as np
    from PIL import Image
    import io

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize((224, 224))
    img_array = np.array(img, dtype=np.float32)
    preprocess_fn = get_preprocess_fn(preprocess_type)
    img_array = preprocess_fn(img_array)
    return np.expand_dims(img_array, axis=0)


def generate_gradcam(model, img_array, layer_name=None):
    import tensorflow as tf
    try:
        if layer_name is None:
            last_conv_layer = None
            for layer in reversed(model.layers):
                if 'conv' in layer.name.lower() and len(layer.output_shape) == 4:
                    last_conv_layer = layer
                    break
        else:
            last_conv_layer = model.get_layer(layer_name)

        if last_conv_layer is None:
            return None

        grad_model = tf.keras.Model(
            inputs=model.input,
            outputs=[last_conv_layer.output, model.output]
        )

        with tf.GradientTape() as tape:
            conv_outputs, predictions = grad_model(img_array)
            predicted_class = tf.argmax(predictions[0])
            class_channel = predictions[:, predicted_class]

        grads = tape.gradient(class_channel, conv_outputs)
        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

        conv_outputs = conv_outputs[0]
        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]
        heatmap = tf.squeeze(heatmap)
        heatmap = tf.maximum(heatmap, 0) / (tf.math.reduce_max(heatmap) + 1e-10)
        return heatmap.numpy()
    except Exception as e:
        logger.warning(f"Grad-CAM failed: {e}")
        return None


def check_ood(predictions, confidence_threshold=0.5, entropy_threshold=1.8, margin_threshold=0.15):
    import numpy as np
    max_conf = float(np.max(predictions))
    entropy = float(-np.sum(predictions * np.log(predictions + 1e-10)))
    sorted_preds = np.sort(predictions)[::-1]
    margin = float(sorted_preds[0] - sorted_preds[1]) if len(sorted_preds) > 1 else max_conf
    norm_entropy = entropy / np.log(len(predictions)) if len(predictions) > 1 else 0

    is_ood = (max_conf < confidence_threshold or
              entropy > entropy_threshold or
              margin < margin_threshold or
              norm_entropy > 0.85)

    return {
        "is_ood": bool(is_ood),
        "max_confidence": max_conf,
        "entropy": entropy,
        "normalized_entropy": norm_entropy,
        "margin": margin,
        "thresholds": {
            "confidence": confidence_threshold,
            "entropy": entropy_threshold,
            "margin": margin_threshold,
            "normalized_entropy": 0.85
        }
    }


# =========================
# Knowledge Base
# =========================

EWASTE_KNOWLEDGE = {
    "Battery": {
        "hazards": ["Lead", "Cadmium", "Mercury", "Lithium", "Acid electrolytes", "Cobalt"],
        "materials": ["Lithium", "Cobalt", "Nickel", "Lead", "Copper", "Aluminum", "Steel", "Plastic", "Graphite"],
        "process": "Sorted by chemistry. Li-ion: discharged, crushed in inert atmosphere, hydrometallurgical recovery of Li/Co/Ni. Lead-acid: hammer mill separation, lead smelting, plastic recycling, acid neutralization.",
        "disposal": "NEVER in trash. Tape terminals. Drop at Call2Recycle, Best Buy, Home Depot, Lowe's, municipal HHW. Swollen Li-ion: sand/kitty litter, hazardous waste facility immediately.",
        "reuse": "Functional packs rarely reusable by consumers. Device donation preferred.",
        "donation": "Donate working devices instead. Battery recycling only.",
        "repair": "Battery replacement via authorized service only. DIY risky.",
        "safety": "Li-ion fire/explosion if punctured. Lead-acid: corrosive acid. Button cells: swallow hazard. Wear gloves/eye protection.",
        "steps": ["Identify type", "Tape terminals", "Non-metal container", "Certified drop-off", "Don't mix chemistries"]
    },
    "Mobile": {
        "hazards": ["Lead", "Mercury", "Arsenic", "Cadmium", "Brominated flame retardants", "Beryllium"],
        "materials": ["Gold", "Silver", "Palladium", "Copper", "Rare earths", "Cobalt", "Tantalum", "Tin", "Aluminum", "Plastic", "Glass", "Lithium"],
        "process": "Manual disassembly (battery, display, hazards). Shredding. Magnetic/eddy current/optical separation. Precious metals via smelting or chemical leaching. Plastics sorted by NIR.",
        "disposal": "Backup & factory reset. Remove SIM/SD. If functional: donate/sell/trade-in (Apple, Samsung, Google, carriers). Non-functional: Best Buy, Staples, certified recyclers (R2/e-Stewards).",
        "reuse": "High value. Refurbished resale, donation to shelters/veterans, parts harvesting.",
        "donation": "Cell Phones for Soldiers, NCADV, local shelters, Goodwill, ecoATM.",
        "repair": "Screen, battery, port repairs common. iFixit scores 6-7/10. Independent shops widely available.",
        "safety": "Battery puncture risk. Data security: encrypt + factory reset. Broken glass hazard.",
        "steps": ["Backup data", "Sign out accounts", "Factory reset", "Remove SIM/SD", "Remove case", "Drop-off or trade-in"]
    },
    "Keyboard": {
        "hazards": ["Brominated flame retardants", "Lead (solder)", "Phthalates (cable)"],
        "materials": ["Plastic (ABS/PBT)", "Steel", "Aluminum", "Copper", "Gold (contacts)", "FR-4"],
        "process": "Keycaps removed. Switches desoldered/harvested. PCB separated. Shredding. Density/optical plastic sorting. Magnetic/eddy current metals. PCB precious metal recovery.",
        "disposal": "Clean thoroughly. Mechanical: consider switch harvesting. Detachable cable = copper recycling. Best Buy, Staples, Goodwill, municipal e-waste, Logitech/Razer/Corsair take-back.",
        "reuse": "High. Switches, keycaps, PCBs, cases, cables valued by enthusiasts (r/mechmarket, Geekhack).",
        "donation": "Functional units to schools, non-profits, community centers.",
        "repair": "Very repairable. Hot-swap = no solder. Switch/keycap/cable/PCB replacement.",
        "safety": "Lead solder dust (wash hands). Flame retardants (don't burn). Spring pinch hazard.",
        "steps": ["Unplug & clean", "Remove keycaps", "Detach cable", "Harvest switches (mechanical)", "E-waste drop-off"]
    },
    "Mouse": {
        "hazards": ["Lead (solder)", "Brominated flame retardants", "Phthalates (cable)", "Button cell (wireless)"],
        "materials": ["Plastic (ABS)", "Copper", "Gold", "Steel", "Aluminum", "FR-4", "Optical components"],
        "process": "Battery removed (wireless). Shredded. Density separation. Plastics recycled. Metals recovered. PCB precious metals. Optical sensors minimal recovery.",
        "disposal": "Remove batteries. Clean sensor/feet. Detachable cable = copper. Same drop-offs as keyboards. Gaming mice: keep weights.",
        "reuse": "Sensor, switches, encoder, PCB, feet, shell reusable. Gaming mod community.",
        "donation": "Functional units accepted like keyboards.",
        "repair": "Switch replacement (main buttons), cable, feet, sensor cleaning, battery (wireless).",
        "safety": "Button cell swallow hazard. Lead solder. Small spring eye hazard.",
        "steps": ["Remove batteries", "Clean exterior", "Remove cable", "Keep weights", "E-waste drop-off"]
    },
    "PCB": {
        "hazards": ["Lead (solder)", "Brominated flame retardants", "Halogenated compounds", "Beryllium", "Antimony trioxide", "PCBs (vintage capacitors)"],
        "materials": ["Gold", "Silver", "Palladium", "Copper", "Tin", "Nickel", "Fiberglass", "Epoxy", "Ceramic", "Rare earths"],
        "process": "Depopulation (heat/mechanical). Shredding <20mm. Magnetic/eddy current/density separation. Smelting (pyrometallurgy) or chemical leaching (hydrometallurgy) for precious metals. Non-metal fraction: construction filler or further copper recovery.",
        "disposal": "HIGH VALUE - never trash. Certified recycler only (R2/e-Stewards). Remove batteries/large caps/mercury switches. Destroy data chips. Anti-static bags. Bulk: gaylord boxes.",
        "reuse": "Functional boards (motherboards, GPUs, controllers) high reuse. Component harvesting by specialists.",
        "donation": "Working boards to makers, repair shops, education.",
        "repair": "Board-level repair (trace, BGA reballing) for high-value boards (MacBook, GPU, server).",
        "safety": "NEVER burn (dioxins). NEVER crude acid stripping. Capacitor lethal charge. BeO dust toxic. Lead solder dust.",
        "steps": ["Identify grade", "Remove hazards", "Destroy data chips", "Anti-static bags", "R2/e-Stewards recycler"]
    },
    "Printer": {
        "hazards": ["Toner dust (carcinogen)", "Lead", "Brominated flame retardants", "Ozone (laser)", "Selenium (drums)", "Mercury (CCFL)", "PCBs (vintage)"],
        "materials": ["Steel", "Plastic (ABS/PC/POM)", "Aluminum", "Copper", "PCBs", "Motors", "Optical components", "Rubber"],
        "process": "Cartridges removed (manufacturer programs). Fluids drained. Manual disassembly (Hg lamps, Se drums, batteries). Shredding. Steel magnetic. Non-ferrous eddy current. Plastics sorted. PCBs precious metals. Large MFPs: appliance stream.",
        "disposal": "REMOVE ALL CARTRIDGES (HP/Canon/Epson/Brother/Lexmark free return). Factory reset. Remove trays. Best Buy/Staples/Office Depot (size limits). Manufacturer take-back. Municipal bulky waste. Donate functional.",
        "reuse": "Functional laser/MFPs good reuse. Parts: fusers, belts, rollers, formatters, scanners.",
        "donation": "Goodwill, Salvation Army, schools, Freecycle, Facebook Marketplace.",
        "repair": "Fuser, pickup rollers, formatter, printhead, PSU. Service manuals available. Parts widely available.",
        "safety": "Toner: N95 mask, no regular vacuum (static explosion). Fuser: 30+ min cool. Capacitors: lethal charge. Mercury lamps: hazardous waste. Selenium drums: toxic.",
        "steps": ["Remove cartridges", "Factory reset", "Remove trays", "Cool fuser", "Cartridges to manufacturer", "Printer to recycler"]
    },
    "Television": {
        "hazards": ["Lead (CRT glass)", "Mercury (CCFL)", "Phosphors", "Brominated flame retardants", "Beryllium", "PCBs (vintage)"],
        "materials": ["Glass (leaded CRT)", "Steel", "Copper", "Aluminum", "Plastic", "PCBs", "Rare earth phosphors", "Mercury (recoverable)"],
        "process": "CRT: tube intact, panel/funnel separated, leaded glass to smelter/glass-to-glass, phosphor washed, steel mask recovered. LCD/LED: Hg lamps removed, panel crushed enclosed, layers separated (glass, polarizers, LC fluid, backlight). OLED: similar, no backlight.",
        "disposal": "CRT: specialized ONLY (implosion risk, lead dust). Flat-panel: most e-waste recyclers. Remove stand. Retail haul-away (Best Buy, Costco). Manufacturer programs (Sony, LG, Samsung, Vizio, TCL). Donate functional flat-panels. NEVER curbside.",
        "reuse": "Flat-panels high reuse/donation. CRT: retro gaming niche only.",
        "donation": "Flat-panels: Goodwill, Salvation Army, Habitat ReStore, shelters, schools. CRT: rarely accepted.",
        "repair": "PSU, main board, T-con, backlight strips, HDMI. Panel replacement uneconomical. CRT: specialized/hazardous.",
        "safety": "CRT: 25-30kV persists, discharge anode. Implosion risk (face shield). Lead dust (wet wipe, HEPA). CCFL: Hg vapor if broken. Weight: 2 people. Capacitors: charge.",
        "steps": ["Identify CRT vs flat", "Unplug 30+ min", "Remove stand", "Factory reset (smart)", "CRT: certified only", "Flat: haul-away/drop-off"]
    },
    "Microwave": {
        "hazards": ["Beryllium oxide (magnetron - TOXIC)", "PCBs (pre-1979 capacitors)", "Lead", "HV capacitor (LETHAL)", "Microwave radiation"],
        "materials": ["Steel (~70%)", "Copper", "Aluminum", "Glass", "Plastic", "PCBs", "Motors"],
        "process": "Capacitor discharged (CRITICAL). Magnetron removed INTACT (BeO hazard). PCB precious metals. Remaining: appliance shredder stream (steel magnetic, non-ferrous eddy current, plastics).",
        "disposal": "NEVER DIY. Professional ONLY. Retail haul-away (Best Buy, Home Depot, Lowe's). Municipal bulky/appliance pickup. Scrap yards (they remove magnetron). Donate functional to shelters/kitchens/Habitat ReStore.",
        "reuse": "Functional donation value. Parts: turntable motor, fan, light, door switches, glass tray. Magnetron/control board: specialized.",
        "donation": "Habitat ReStore, Goodwill (some), Salvation Army, shelters, community kitchens.",
        "repair": "Door switches, turntable motor, fan, light, fuse, control panel. HV components: qualified tech only. Often uneconomical.",
        "safety": "CAPACITOR = LETHAL CHARGE (days after unplug). BEO = chronic beryllium disease if dust inhaled. NEVER BREAK MAGNETRON. PCBs pre-1979 = hazardous. Door interlocks must work.",
        "steps": ["DO NOT DISASSEMBLE", "Unplug, tape door", "Clean interior", "Remove glass turntable", "Professional appliance recycling", "Retail haul-away or municipal"]
    },
    "Washing Machine": {
        "hazards": ["PCBs (vintage)", "Mercury (lid switches)", "Refrigerants (combo)", "Lead", "Residual chemicals"],
        "materials": ["Steel (60-70%)", "Copper", "Aluminum", "Stainless drum (high value)", "Plastic", "PCBs", "Motors", "Concrete (aggregate)", "Glass"],
        "process": "Fluids drained. Refrigerant recovered (combo). Hg switches/PCB caps removed. Concrete counterweight separated. Shredding: steel magnetic, non-ferrous eddy current, plastics sorted, PCBs precious metals, motors copper/steel. Stainless drum often manual pre-shred.",
        "disposal": "Retail haul-away (often free with purchase). Municipal bulky waste. Scrap yards (pay for steel/copper, handle refrigerant). Utility rebates. Donate functional to Habitat ReStore/charities. Disconnect: water valves off, hoses drained, capped.",
        "reuse": "High reuse if functional. Refurbished market strong. Parts: motor, pump, board, valves, door lock, suspension, drum.",
        "donation": "Habitat ReStore, Salvation Army, Goodwill (some), charities, Freecycle, Facebook Marketplace.",
        "repair": "Very repairable. Pump, door lock, board, motor, bearings, suspension, valve, belt. Parts widely available. 10-15yr lifespan.",
        "safety": "150-250+ lbs (dolly, 2 people). Water: shut valves, drain hoses. Concrete shifts (secure). Refrigerant: EPA 608 tech. Hg switches: gentle, hazardous waste. Capacitors: charge.",
        "steps": ["Final cycle (clean)", "Water valves off", "Disconnect/drain hoses", "Secure drum (bolts/foam)", "Tape door/lid", "Retail haul-away or municipal pickup"]
    },
    "Player": {
        "hazards": ["Lead", "Brominated flame retardants", "Beryllium", "Mercury (CCFL displays)"],
        "materials": ["Plastic (ABS/PC)", "Aluminum", "Steel", "Copper", "Gold", "Silver", "Optical components", "PCBs", "Motors"],
        "process": "Optical drive removed (laser diode Class 1 safe intact, but As/Ga specialized). PCBs precious metals. Mechanism disassembled (motors, gears, rails). Chassis shredded (steel, Al, plastic). Streaming boxes: like phones (small PCB, SoC).",
        "disposal": "Remove discs. Factory reset streaming boxes (unlink Roku/Apple/Amazon/Google). Best Buy, Staples drop-off. Manufacturer programs (Sony, LG, Samsung, Panasonic, Apple, Amazon, Google). Donate functional streaming boxes to seniors/centers/libraries. Game consoles: separate category.",
        "reuse": "Streaming boxes: high reuse (long support). Optical players: declining but usable. Laser diodes, motors, lenses harvestable.",
        "donation": "Streaming boxes excellent for seniors/non-tech-savvy. Optical: libraries, schools, centers.",
        "repair": "Streaming boxes: rarely repaired (sealed). Optical: belt, laser pickup, tray motor (parts for popular models).",
        "safety": "Laser diode: Class 1 normal, NEVER disassemble pickup (IR eye hazard). Capacitors: PSU charge. Be in RF/laser packages: dust hazard if machined.",
        "steps": ["Remove discs", "Factory reset (streaming)", "Unlink accounts", "Remote batteries", "Retail drop-off or manufacturer take-back"]
    }
}

DEFAULT_KNOWLEDGE = {
    "hazards": ["Lead", "Mercury", "Cadmium", "Brominated flame retardants"],
    "materials": ["Metals", "Plastics", "Glass", "Circuit boards"],
    "process": "Sorted, shredded, separated into material streams for recovery.",
    "disposal": "Certified e-waste recycler (R2/e-Stewards). Check local municipality. Remove batteries first.",
    "reuse": "Functional items may be donated, sold, or refurbished.",
    "donation": "Working electronics accepted by charities, schools, community organizations.",
    "repair": "Repairability varies. Check iFixit or manufacturer for parts/service manuals.",
    "safety": "Handle carefully. Remove batteries. Avoid breaking screens or crushing batteries. Wash hands after handling bare PCBs.",
    "steps": ["Remove batteries/accessories", "Factory reset if smart", "Clean exterior", "Certified e-waste recycler"]
}


def build_chat_prompt(category: str, user_question: str, history: list) -> str:
    knowledge = EWASTE_KNOWLEDGE.get(category, DEFAULT_KNOWLEDGE)

    history_str = "\n".join([f"{'User' if m.role == 'user' else 'Assistant'}: {m.content}" for m in history[-6:]]) or "No previous conversation."

    return f"""You are GreenGrid's AI Recycling Advisor — an expert on e-waste management, recycling processes, environmental safety, and disposal regulations.

**Current Context:**
- Detected E-Waste Type: **{category}**
- Key Hazards: {', '.join(knowledge['hazards'])}
- Recyclable Materials: {', '.join(knowledge['materials'])}
- Recycling Process: {knowledge['process']}
- Disposal Tips: {knowledge['disposal']}
- Safety Precautions: {knowledge['safety']}
- Reuse Options: {knowledge['reuse']}
- Donation Info: {knowledge['donation']}
- Repair/Refurbish: {knowledge['repair']}
- Preparation Steps: {'; '.join(knowledge['steps'])}

**Conversation History:**
{history_str}

**User Question:** {user_question}

**Instructions:**
- Provide helpful, concise answers (under 250 words) focused on recycling, safety, and environmental impact
- Use bullet points for readability
- Be encouraging about proper disposal
- If asked about topics outside e-waste, politely redirect
- Never fabricate specific facility names, addresses, or regulations — suggest checking local resources
- Acknowledge uncertainty when appropriate
- Tone: Professional, knowledgeable, environmentally conscious"""


def get_fallback_response(category: str, question: str) -> str:
    knowledge = EWASTE_KNOWLEDGE.get(category, DEFAULT_KNOWLEDGE)
    q_lower = question.lower()

    # ===== Battery-specific: Swollen/damaged Li-ion safety (HIGHEST PRIORITY) =====
    if category == "Battery" and any(w in q_lower for w in ["swollen", "puffed", "bulging", "expanded", "damaged", "punctured", "leaking", "fire", "smoke", "hot", "overheating"]):
        return f"""🚨 **URGENT: Swollen/Damaged Lithium-Ion Battery Safety**

**Immediate Actions:**
1. **STOP using the device immediately** — do not charge, do not press on it
2. **Move to a fire-safe area** — away from flammables, on concrete/metal surface
3. **Place in sand, kitty litter, or vermiculite** — do NOT use water
4. **Contact hazardous waste facility immediately** — do not put in regular trash/recycling

**Drop-off Locations for Damaged Batteries:**
• Municipal Household Hazardous Waste (HHW) facility
• Call2Recycle (accepts damaged with special handling)
• Best Buy Geek Squad (some locations)
• Local fire department (may accept)

**⚠️ NEVER:**
• Puncture, crush, or attempt to "fix" a swollen battery
• Put in trash, recycling bin, or mail
• Leave in hot car or direct sunlight
• Use water on a battery fire (use Class D extinguisher or sand)

**For functional batteries:** See disposal guidance below."""

    # ===== Intent detection with priority order =====
    # More specific intents checked FIRST

    # 1. Disposal / Drop-off / Where (most common for "how do I recycle")
    if any(w in q_lower for w in ["how do i recycle", "how to recycle", "where.*recycl", "where.*drop", "where.*take", "drop.?off", "collection", "near me", "find.*recycl"]):
        return f"**How to Recycle {category}:**\n{knowledge['disposal']}\n\n**Key Steps:**\n" + "\n".join(f"{i+1}. {s}" for i, s in enumerate(knowledge['steps']))

    # 2. Disposal / Throw away / Get rid of
    if any(w in q_lower for w in ["dispos", "throw", "trash", "get rid", "discard"]):
        return f"**Disposal Guidance for {category}:**\n{knowledge['disposal']}"

    # 3. Safety / Hazards / Dangerous
    if any(w in q_lower for w in ["hazard", "toxic", "danger", "harmful", "poison", "safe", "safety", "precaution", "handle", "protect", "risk"]):
        return f"**Safety & Hazards for {category}:**\n" + "\n".join(f"• {h}" for h in knowledge['hazards']) + f"\n\n{knowledge['safety']}"

    # 4. Recycling process / How it works / What happens
    if any(w in q_lower for w in ["process", "how.*recycl", "what happen", "recycled", "recycling process", "how it works", "after.*recycl"]):
        return f"**Recycling Process for {category}:**\n{knowledge['process']}"

    # 5. Materials / What's inside / Valuable / Precious
    if any(w in q_lower for w in ["material", "what.*inside", "component", "valuable", "precious", "recover", "extract", "contain"]):
        return f"**Recyclable Materials from {category}:**\n" + "\n".join(f"• {m}" for m in knowledge['materials']) + "\n\n♻️ Certified recyclers recover these materials for reuse in manufacturing."

    # 6. Preparation / Steps / Before / Ready
    if any(w in q_lower for w in ["prepar", "ready", "step", "before", "how.*prepar"]):
        return f"**Preparation Steps for {category}:**\n" + "\n".join(f"{i+1}. {s}" for i, s in enumerate(knowledge['steps']))

    # 7. Donation / Give away / Charity
    if any(w in q_lower for w in ["donat", "give away", "charity", "goodwill", "salvation army", "freecycle"]):
        return f"**Donation Options for {category}:**\n{knowledge['donation']}"

    # 8. Repair / Fix / Refurbish
    if any(w in q_lower for w in ["repair", "fix", "refurbish", "refurb", "replace"]):
        return f"**Repair/Refurbishment for {category}:**\n{knowledge['repair']}"

    # 9. Reuse / Repurpose / Upcycle
    if any(w in q_lower for w in ["reuse", "repurpose", "upcycle", "second life"]):
        return f"**Reuse Options for {category}:**\n{knowledge['reuse']}"

    # ===== General fallback with full reference =====
    return f"""I'm running in **offline mode** (Gemini API unavailable). Here's what I know about **{category}**:

**Quick Reference:**
• **Hazards:** {', '.join(knowledge['hazards'][:4])}{'...' if len(knowledge['hazards']) > 4 else ''}
• **Recyclable Materials:** {', '.join(knowledge['materials'][:4])}{'...' if len(knowledge['materials']) > 4 else ''}
• **Disposal:** {knowledge['disposal'][:200]}...
• **Safety:** {knowledge['safety'][:200]}...

**Try asking about:**
• **How to recycle / Where to drop off** — disposal locations & steps
• **Safety / Hazards** — what makes it dangerous
• **Recycling process** — what happens after drop-off
• **Materials** — what valuable materials are inside
• **Preparation** — steps before recycling
• **Donation / Repair / Reuse** — alternatives to recycling

**For full AI responses:** Configure GEMINI_API_KEY in backend environment."""


# =========================
# Recycling Center Finder
# =========================

# Multiple Overpass API instances for redundancy
OVERPASS_INSTANCES = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter",
    "https://overpass-api.fr/api/interpreter",
]

# Indian e-waste chain/recycler directories (not fabricated - these are real directories)
INDIAN_EWASTE_CHAINS = {
    "Attero Recycling": {"accepts": ["Mobile", "Keyboard", "Mouse", "PCB", "Printer", "Television", "Monitor", "Battery"], "website": "attero.in", "type": "certified_ewaste"},
    "Ecoreco": {"accepts": ["Mobile", "Keyboard", "Mouse", "PCB", "Printer", "Television", "Monitor", "Battery", "Washing Machine", "Microwave"], "website": "ecoreco.com", "type": "certified_ewaste"},
    "GreenScape": {"accepts": ["Mobile", "PCB", "Battery"], "website": "greenscape-ewaste.com", "type": "certified_ewaste"},
    "TES-AMM": {"accepts": ["Mobile", "Keyboard", "Mouse", "PCB", "Television", "Monitor", "Battery"], "website": "tes-amm.com", "type": "certified_ewaste"},
    "Karo Sambhav": {"accepts": ["Mobile", "Keyboard", "Mouse", "PCB", "Battery"], "website": "karosambhav.com", "type": "certified_ewaste"},
    "RLG Systems": {"accepts": ["Mobile", "Keyboard", "Mouse", "PCB", "Printer", "Television", "Monitor", "Battery"], "website": "rlg-systems.com", "type": "certified_ewaste"},
    "Cerebra Integrated Technologies": {"accepts": ["Mobile", "PCB", "Battery", "Television", "Monitor"], "website": "cerebra.in", "type": "certified_ewaste"},
    "Namo eWaste": {"accepts": ["Mobile", "Keyboard", "Mouse", "PCB", "Printer", "Television", "Monitor", "Battery"], "website": "namoewaste.com", "type": "certified_ewaste"},
    "Deshwal Waste Management": {"accepts": ["Mobile", "Keyboard", "Mouse", "PCB", "Printer", "Television", "Monitor", "Battery"], "website": "deshwalwaste.com", "type": "certified_ewaste"},
    "Recycle Karo": {"accepts": ["Mobile", "PCB", "Battery"], "website": "recyclekaro.com", "type": "certified_ewaste"},
}

# International chains
GLOBAL_CHAINS = {
    "Best Buy": {"accepts": ["Mobile", "Keyboard", "Mouse", "Printer", "PCB", "Player", "Television", "Monitor"], "website": "bestbuy.com/recycle", "type": "retail_takeback"},
    "Staples": {"accepts": ["Mobile", "Keyboard", "Mouse", "Printer", "PCB", "Player", "Monitor"], "website": "staples.com/recycling", "type": "retail_takeback"},
    "Home Depot": {"accepts": ["Battery", "Microwave", "Washing Machine"], "website": "homedepot.com/recycling", "type": "retail_takeback"},
    "Lowe's": {"accepts": ["Battery", "Microwave", "Washing Machine"], "website": "lowes.com/recycling", "type": "retail_takeback"},
    "Goodwill": {"accepts": ["Mobile", "Keyboard", "Mouse", "Printer", "Player", "Television", "Monitor"], "website": "goodwill.org/donate", "type": "donation"},
    "The Salvation Army": {"accepts": ["Television", "Microwave", "Washing Machine", "Player"], "website": "satruck.org", "type": "donation"},
    "Call2Recycle": {"accepts": ["Battery", "Mobile"], "website": "call2recycle.org", "type": "battery_program"},
    "Apple Store": {"accepts": ["Mobile", "Keyboard", "Mouse", "Monitor"], "website": "apple.com/recycling", "type": "manufacturer_takeback"},
    "Microsoft Store": {"accepts": ["Mobile", "Keyboard", "Mouse", "PCB"], "website": "microsoft.com/recycling", "type": "manufacturer_takeback"},
    "Samsung": {"accepts": ["Mobile", "Television", "Monitor", "Washing Machine", "Microwave"], "website": "samsung.com/recycling", "type": "manufacturer_takeback"},
    "Dell": {"accepts": ["Keyboard", "Mouse", "Monitor", "PCB"], "website": "dell.com/recycling", "type": "manufacturer_takeback"},
    "HP": {"accepts": ["Printer", "Monitor", "PCB"], "website": "hp.com/recycle", "type": "manufacturer_takeback"},
    "LG": {"accepts": ["Television", "Monitor", "Washing Machine", "Microwave"], "website": "lg.com/recycling", "type": "manufacturer_takeback"},
    "Sony": {"accepts": ["Television", "Player", "Mobile"], "website": "sony.com/recycle", "type": "manufacturer_takeback"},
}


async def geocode_address(query: str) -> tuple[float, float, str] | None:
    import httpx
    url = "https://nominatim.openstreetmap.org/search"
    params = {"q": query, "format": "json", "limit": 1, "addressdetails": 1}
    headers = {"User-Agent": "GreenGrid/2.0 (https://github.com/nishantmishra/wastedup)"}

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            r = await client.get(url, params=params, headers=headers)
            r.raise_for_status()
            data = r.json()
            if data:
                return float(data[0]["lat"]), float(data[0]["lon"]), data[0].get("display_name", query)
    except Exception as e:
        logger.warning(f"Geocoding failed for '{query}': {e}")
    return None


async def search_osm_centers(lat: float, lon: float, radius_km: int, waste_type: str | None) -> tuple[list[dict], str | None]:
    """
    Search OSM for recycling centers with multiple Overpass instance fallbacks.
    Returns (centers, error_message)
    """
    import httpx
    import asyncio

    # Build Overpass query - search for recycling facilities and e-waste specific tags
    query = f"""
    [out:json][timeout:8];
    (
      node["amenity"="recycling"](around:{radius_km * 1000},{lat},{lon});
      way["amenity"="recycling"](around:{radius_km * 1000},{lat},{lon});
      relation["amenity"="recycling"](around:{radius_km * 1000},{lat},{lon});
      node["shop"="electronics"]["recycling:electronics"="yes"](around:{radius_km * 1000},{lat},{lon});
      node["shop"="mobile_phone"]["recycling:mobile_phone"="yes"](around:{radius_km * 1000},{lat},{lon});
      node["amenity"="waste_disposal"]["waste:electronics"="yes"](around:{radius_km * 1000},{lat},{lon});
    );
    out center tags;
    """

    headers = {"Content-Type": "application/x-www-form-urlencoded", "User-Agent": "GreenGrid/2.0"}

    # Try each Overpass instance with shorter timeout and fewer retries
    last_error = None
    for base_url in OVERPASS_INSTANCES:
        try:
            timeout = httpx.Timeout(connect=3.0, read=8.0, write=5.0, pool=3.0)
            async with httpx.AsyncClient(timeout=timeout) as client:
                r = await client.post(base_url, data={"data": query}, headers=headers)

                if r.status_code == 200:
                    data = r.json()
                    centers = []
                    for element in data.get("elements", []):
                        if element.get("type") == "node":
                            c_lat, c_lon = element["lat"], element["lon"]
                        elif "center" in element:
                            c_lat, c_lon = element["center"]["lat"], element["center"]["lon"]
                        else:
                            continue

                        tags = element.get("tags", {})
                        name = tags.get("name", "Recycling Center")
                        addr_parts = [tags.get(k) for k in ["addr:housenumber", "addr:street", "addr:city", "addr:postcode", "addr:state", "addr:country"] if tags.get(k)]
                        address = ", ".join(addr_parts) if addr_parts else "Address not available"

                        # Extract accepted materials from recycling:* tags
                        accepts = []
                        for k, v in tags.items():
                            if k.startswith("recycling:") and v in ["yes", "true"]:
                                material = k.replace("recycling:", "").replace("_", " ").title()
                                accepts.append(material)

                        # Also check for e-waste specific tags
                        if tags.get("waste:electronics") == "yes":
                            accepts.append("Electronics")
                        if tags.get("recycling:electronics") == "yes":
                            accepts.append("Electronics")
                        if tags.get("recycling:batteries") == "yes":
                            accepts.append("Batteries")
                        if tags.get("recycling:mobile_phone") == "yes":
                            accepts.append("Mobile Phones")

                        distance = calculate_distance(lat, lon, c_lat, c_lon)
                        if distance > radius_km:
                            continue

                        # Determine if verified (has specific e-waste acceptance tags)
                        is_verified = len(accepts) > 0 and any(a.lower() in ["electronics", "batteries", "mobile phones", "computers", "laptops"] for a in accepts)

                        centers.append({
                            "name": name,
                            "address": address,
                            "latitude": c_lat,
                            "longitude": c_lon,
                            "distance_km": round(distance, 1),
                            "accepts": accepts if accepts else ["Acceptance not verified — contact center"],
                            "phone": tags.get("phone", tags.get("contact:phone")),
                            "website": tags.get("website", tags.get("contact:website")),
                            "opening_hours": tags.get("opening_hours", "Hours not listed"),
                            "source": f"OpenStreetMap ({base_url.split('/')[2]})",
                            "verified": is_verified
                        })

                    centers.sort(key=lambda x: x["distance_km"])
                    return centers[:50], None

                elif r.status_code in (429, 502, 503, 504):
                    last_error = f"{base_url}: HTTP {r.status_code}"
                    continue
                else:
                    last_error = f"{base_url}: HTTP {r.status_code}"
                    break  # Don't retry on other errors

        except httpx.TimeoutException:
            last_error = f"{base_url}: Timeout"
            continue
        except Exception as e:
            last_error = f"{base_url}: {type(e).__name__}"
            break  # Don't retry on other exceptions

    return [], f"All Overpass API instances unavailable: {last_error}"


async def get_verified_chain_locations(lat: float, lon: float, waste_type: str, radius_km: int, country_code: str = "IN") -> list[dict]:
    """
    Get known chain/recycler locations near the user.
    For India, uses certified e-waste recyclers directory.
    For other countries, uses global retail chains.
    These are REPRESENTATIVE locations - user must verify locally.
    """
    import random
    results = []

    # Select appropriate chains based on country
    if country_code.upper() == "IN":
        chains = INDIAN_EWASTE_CHAINS
    else:
        chains = GLOBAL_CHAINS

    # Filter chains that accept the waste type
    relevant_chains = {}
    for chain_name, info in chains.items():
        if waste_type:
            if waste_type in info["accepts"]:
                relevant_chains[chain_name] = info
        else:
            relevant_chains[chain_name] = info

    if not relevant_chains:
        return []

    # Generate representative locations near user (clearly labeled as such)
    # In production, this would use Google Places API or similar
    for chain_name, info in list(relevant_chains.items())[:8]:
        # Create a pseudo-location near user
        offset_lat = lat + (random.uniform(-0.02, 0.02))
        offset_lon = lon + (random.uniform(-0.02, 0.02))
        distance = calculate_distance(lat, lon, offset_lat, offset_lon)

        if distance <= radius_km:
            results.append({
                "name": chain_name,
                "address": f"{chain_name} (verify local branch)",
                "latitude": offset_lat,
                "longitude": offset_lon,
                "distance_km": round(distance, 1),
                "accepts": info["accepts"],
                "phone": "Check website",
                "website": info["website"],
                "opening_hours": "Varies by location — verify locally",
                "source": f"{info['type'].replace('_', ' ').title()} (representative — verify locally)",
                "verified": False  # These are representative, not verified locations
            })

    results.sort(key=lambda x: x["distance_km"])
    return results[:10]


async def get_google_maps_search_link(lat: float, lon: float, query: str = "e-waste recycling") -> str:
    """Generate a Google Maps search URL for the user's location"""
    return f"https://www.google.com/maps/search/{query.replace(' ', '+')}/@{lat},{lon},12z"


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    from math import radians, sin, cos, sqrt, atan2
    R = 6371
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c


def get_country_code_from_display_name(display_name: str) -> str:
    """Extract country code from Nominatim display name"""
    if "india" in display_name.lower():
        return "IN"
    elif "united states" in display_name.lower() or "usa" in display_name.lower():
        return "US"
    elif "united kingdom" in display_name.lower() or "uk" in display_name.lower():
        return "GB"
    return "IN"  # Default to India for this project


# =========================
# API Endpoints
# =========================

@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    gemini_key = os.getenv("GEMINI_API_KEY")
    return HealthResponse(
        status="healthy",
        models_loaded=len(models),
        gemini_configured=bool(gemini_key)
    )


@app.get("/api/models", response_model=ModelsResponse)
async def get_models():
    model_list = [
        ModelInfo(
            id=key,
            display_name=config["display_name"],
            accuracy=config["accuracy"],
            description=config["description"],
            preprocess=config["preprocess"]
        )
        for key, config in MODEL_CONFIGS.items()
        if key in models
    ]
    return ModelsResponse(models=model_list, default="efficientnetb0")


@app.post("/api/predict", response_model=PredictionResult)
async def predict(
    file: UploadFile = File(...),
    model_id: str = Form("efficientnetb0"),
    confidence_threshold: float = Form(0.5)
):
    if model_id not in models:
        raise HTTPException(400, f"Model {model_id} not available. Available: {list(models.keys())}")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 10MB)")

    try:
        config = MODEL_CONFIGS[model_id]
        model = models[model_id]

        img_array = preprocess_image(image_bytes, config["preprocess"])
        predictions = model.predict(img_array, verbose=0)[0]

        predicted_idx = int(np.argmax(predictions))
        predicted_class = CLASS_NAMES[predicted_idx]
        confidence = float(predictions[predicted_idx])

        # OOD detection
        ood_result = check_ood(predictions, confidence_threshold)

        # Top 3
        top3_indices = np.argsort(predictions)[-3:][::-1]
        top3 = [
            {"class": CLASS_NAMES[i], "confidence": float(predictions[i]), "rank": rank}
            for rank, i in enumerate(top3_indices, 1)
        ]

        # All probabilities
        prob_dict = {CLASS_NAMES[i]: float(predictions[i]) for i in range(len(CLASS_NAMES))}

        return PredictionResult(
            class_name=predicted_class,
            confidence=confidence,
            probabilities=prob_dict,
            top3=top3,
            model_used=config["display_name"],
            model_accuracy=config["accuracy"],
            ood_detected=ood_result["is_ood"],
            ood_details=ood_result
        )
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(500, f"Prediction failed: {str(e)}")


@app.post("/api/predict/compare")
async def predict_compare(
    file: UploadFile = File(...),
    confidence_threshold: float = Form(0.5)
):
    """Run inference on all available models for comparison"""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "File must be an image")

    image_bytes = await file.read()
    if len(image_bytes) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 10MB)")

    results = {}
    for model_id, model in models.items():
        try:
            config = MODEL_CONFIGS[model_id]
            img_array = preprocess_image(image_bytes, config["preprocess"])
            predictions = model.predict(img_array, verbose=0)[0]

            predicted_idx = int(np.argmax(predictions))
            predicted_class = CLASS_NAMES[predicted_idx]
            confidence = float(predictions[predicted_idx])
            ood_result = check_ood(predictions, confidence_threshold)

            top3_indices = np.argsort(predictions)[-3:][::-1]
            top3 = [
                {"class": CLASS_NAMES[i], "confidence": float(predictions[i]), "rank": rank}
                for rank, i in enumerate(top3_indices, 1)
            ]

            results[model_id] = {
                "model": config["display_name"],
                "accuracy": config["accuracy"],
                "class": predicted_class,
                "confidence": confidence,
                "top3": top3,
                "ood_detected": ood_result["is_ood"],
                "ood_details": ood_result
            }
        except Exception as e:
            logger.error(f"Comparison failed for {model_id}: {e}")
            results[model_id] = {"error": str(e)}

    return {"results": results}


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    context_category = request.context_category or "e-waste"
    gemini_key = os.getenv("GEMINI_API_KEY")

    if gemini_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_key)
            prompt = build_chat_prompt(context_category, request.message, request.history)

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )

            return ChatResponse(
                response=response.text,
                source="gemini",
                context_used=context_category
            )
        except Exception as e:
            logger.warning(f"Gemini failed, using fallback: {e}")

    # Fallback
    fallback = get_fallback_response(context_category, request.message)
    return ChatResponse(
        response=fallback,
        source="knowledge_base",
        context_used=context_category
    )


@app.post("/api/centers/search", response_model=CentersResponse)
async def search_centers(request: LocationSearchRequest):
    """Search by address/query string"""
    geo_result = await geocode_address(request.query)
    if not geo_result:
        raise HTTPException(404, f"Could not geocode: {request.query}")

    lat, lon, display_name = geo_result
    country_code = get_country_code_from_display_name(display_name)

    # Search OSM with multiple Overpass fallbacks
    osm_centers, osm_error = await search_osm_centers(lat, lon, request.radius_km, request.waste_type)

    # Get verified chain/recycler locations (representative only)
    chain_centers = await get_verified_chain_locations(lat, lon, request.waste_type, request.radius_km, country_code)

    # Combine
    all_centers = osm_centers + chain_centers

    # Filter by waste type if specified
    if request.waste_type and all_centers:
        filtered = []
        for c in all_centers:
            accepts = c.get("accepts", [])
            if any(request.waste_type.lower() in a.lower() for a in accepts) or not c.get("verified", True):
                filtered.append(c)
        all_centers = filtered if filtered else all_centers

    all_centers.sort(key=lambda x: x.get("distance_km", float('inf')))

    # Generate Google Maps link for fallback
    google_maps_link = await get_google_maps_search_link(lat, lon, "e-waste recycling")

    return CentersResponse(
        centers=[RecyclingCenter(**c) for c in all_centers],
        search_location={"latitude": lat, "longitude": lon, "display_name": display_name},
        total_found=len(all_centers),
        osm_error=osm_error,
        google_maps_link=google_maps_link,
        fallback_used=bool(chain_centers and not osm_centers)
    )


@app.post("/api/centers/nearby", response_model=CentersResponse)
async def nearby_centers(request: LocationRequest):
    """Search by GPS coordinates"""
    lat, lon = request.latitude, request.longitude

    # Reverse geocode for display
    import httpx
    display_name = f"{lat:.4f}, {lon:.4f}"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            r = await client.get(
                "https://nominatim.openstreetmap.org/reverse",
                params={"lat": lat, "lon": lon, "format": "json"},
                headers={"User-Agent": "GreenGrid/2.0"}
            )
            if r.status_code == 200:
                display_name = r.json().get("display_name", display_name)
    except:
        pass

    country_code = get_country_code_from_display_name(display_name)

    osm_centers, osm_error = await search_osm_centers(lat, lon, request.radius_km, request.waste_type)
    chain_centers = await get_verified_chain_locations(lat, lon, request.waste_type, request.radius_km, country_code)

    all_centers = osm_centers + chain_centers

    if request.waste_type and all_centers:
        filtered = []
        for c in all_centers:
            accepts = c.get("accepts", [])
            if any(request.waste_type.lower() in a.lower() for a in accepts) or not c.get("verified", True):
                filtered.append(c)
        all_centers = filtered if filtered else all_centers

    all_centers.sort(key=lambda x: x.get("distance_km", float('inf')))

    google_maps_link = await get_google_maps_search_link(lat, lon, "e-waste recycling")

    return CentersResponse(
        centers=[RecyclingCenter(**c) for c in all_centers],
        search_location={"latitude": lat, "longitude": lon, "display_name": display_name},
        total_found=len(all_centers),
        osm_error=osm_error,
        google_maps_link=google_maps_link,
        fallback_used=bool(chain_centers and not osm_centers)
    )

    return CentersResponse(
        centers=[RecyclingCenter(**c) for c in all_centers],
        search_location={"latitude": lat, "longitude": lon, "display_name": display_name},
        total_found=len(all_centers)
    )


@app.get("/api/guide/{category}")
async def get_guide(category: str):
    if category not in EWASTE_KNOWLEDGE:
        raise HTTPException(404, f"Category not found. Available: {list(EWASTE_KNOWLEDGE.keys())}")

    knowledge = EWASTE_KNOWLEDGE[category]
    return {
        "category": category,
        "icon": {"Battery": "🔋", "Keyboard": "⌨️", "Microwave": "🍳", "Mobile": "📱", "Mouse": "🖱️", "PCB": "🧱", "Player": "💿", "Printer": "🖨️", "Television": "📺", "Washing Machine": "🧺"}.get(category, "📦"),
        **knowledge
    }


@app.get("/api/guide")
async def list_guides():
    return {"categories": list(EWASTE_KNOWLEDGE.keys())}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)