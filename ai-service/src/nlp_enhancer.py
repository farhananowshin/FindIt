"""
FindIt NLP & Multimodal Vision Enhancement Module
Provides:
1. Cross-lingual semantic enrichment for Bengali, Banglish, and English text inputs.
2. Multilingual attribute normalization (colors, categories, brands).
3. Sylhet Metropolitan geographic location resolution.
4. Smartphone camera image pre-processing (EXIF auto-orientation & adaptive contrast).
"""

import re
import logging
from typing import Tuple, Optional
from PIL import Image, ImageOps

logger = logging.getLogger("findit.nlp_enhancer")

# Comprehensive Bengali / Banglish to English Semantic Concept Mapping
BENGALI_CONCEPT_MAP = {
    # Items / Objects
    r'(মানিব্যাগ|ওয়ালেট|মানি\s*ব্যাগ|manibag|mani\s*bag|pers|pars)': 'wallet moneybag leather-wallet bi-fold',
    r'(মোবাইল|ফোন|স্মার্টফোন|মুঠোফোন|phn|mobile|fon|shmartfon)': 'mobile smartphone cellphone telephone device',
    r'(ঘড়ি|হাত\s*ঘড়ি|ঘড়ি|ghori|hat\s*ghori|wrist\s*watch)': 'wristwatch analog digital watch timepiece',
    r'(ছাতা|chata|sata|umbrella)': 'umbrella folding rain umbrella collapsible',
    r'(ব্যাগ|ব্যাকপ্যাক|ব্যাগপ্যাক|স্কুল\s*ব্যাগ|byag|bag|backpack)': 'backpack rucksack knapsack bag',
    r'(বোতল|পানির\s*বোতল|botol|panir\s*botol|water\s*bottle)': 'water bottle stainless steel flask thermos drinkware',
    r'(চাবি|চাবির\s*রিং|chabi|chabir\s*ring|key|keyring)': 'keys keychain keyring door keys latchkey',
    r'(ক্যালকুলেটর|হিসাবের\s*যন্ত্র|calculator|kelkuletor)': 'scientific calculator engineering calculator casio',
    r'(আইডি\s*কার্ড|পরিচয়পত্র|স্টুডেন্ট\s*কার্ড|id\s*card|student\s*card)': 'student identification card badge lanyard credentials',
    r'(হেডফোন|ইয়ারবাড|ইয়ারফোন|হেডসেট|headphone|earbuds|airpods)': 'wireless bluetooth earbuds headphones earphones audio',
    r'(বই|খাতা|নোটবই|নোট|textbook|boi|khata|not)': 'textbook reference book notebook paper study notes',
    r'(চশমা|রোদ\s*চশমা|choshma|chasma|sunglass)': 'eyeglasses spectacle frames sunglasses vision glasses',
    
    # Colors
    r'(কালো|কুচকুচে|kalo|black)': 'black dark matte',
    r'(নীল|আকাশি|nil|akashi|blue)': 'blue navy royal-blue azure',
    r'(লাল|রক্তিম|lal|red)': 'red crimson maroon scarlet',
    r'(সাদা|শুভ্র|shada|sada|white)': 'white silver cream pearl',
    r'(সবুজ|shobuj|soboj|green)': 'green emerald olive',
    r'(ধূসর|ছাই|dhusor|chai|gray|grey)': 'gray grey charcoal silver metallic',
    r'(বাদামী|খয়েরি|badami|khoiri|brown)': 'brown tan leather beige cocoa',
    r'(সোনালী|গোল্ড|shonali|gold|golden)': 'gold golden metallic yellow brass',
    r'(রূপালী|সিলভার|rupali|silver)': 'silver metallic chrome steel aluminium',

    # Actions / Context
    r'(হারিয়েছি|হারিয়ে\s*গেছে|হারাইছি|haray\s*gese|haraisi|harano|lost)': 'lost missing misplaced misplaced-item',
    r'(পেয়েছি|পাওয়া\s*গেছে|পাইছি|paici|pawa\s*gese|kudaye\s*paici|found)': 'found recovered turned-in discovered',
}

# Sylhet Metro Locations Mapping (Bangla/Banglish to Zone ID & English description)
SYLHET_LOCATION_MAP = [
    (r'(আম্বরখানা|amberkhana|airport\s*road)', 'syl_amber', 'Amberkhana Point & Airport Road Junction, Sylhet'),
    (r'(জিন্দাবাজার|zindabazar|al-hamra|al\s*hamra|blue\s*water)', 'syl_zinda', 'Zindabazar Commercial Center (Al-Hamra / Blue Water), Sylhet'),
    (r'(মেট্রোপলিটন|metropolitan|mu\b|bateshwar|বটেশ্বর)', 'syl_mu', 'Metropolitan University Permanent Campus, Bateshwar, Sylhet'),
    (r'(সাস্ট|sust|shahjalal|সুরমা\s*গেট|surma\s*gate)', 'syl_sust', 'Shahjalal University Campus & Surma Gate, Sylhet'),
    (r'(শাহী\s*ঈদগাহ|shahi\s*eidgah|kumarpara|কুমারপাড়া)', 'syl_eidgah', 'Shahi Eidgah & Kumarpara Area, Sylhet'),
    (r'(বন্দরবাজার|bandar|surma\s*river|কীন\s*ব্রিজ|keane\s*bridge)', 'syl_bandar', 'Bandar Bazar & Keane Bridge Surma Riverside, Sylhet'),
    (r'(টিলাগড়|tilagarh|mc\s*college|এমসি\s*কলেজ)', 'syl_tilagarh', 'Tilagarh Point & MC College Campus Area, Sylhet'),
    (r'(মদিনা\s*মার্কেট|medina\s*market|modina\s*market)', 'syl_medina', 'Medina Market & Jalalabad Residential Area, Sylhet'),
    (r'(ক্যাম্পাস|লাইব্রেরি|library|dining|cafeteria|ক্লাসরুম)', 'campus_core', 'Central Campus Academic Zone & Library'),
]

COLOR_TRANSLATIONS = {
    "কালো": "black", "kalo": "black",
    "নীল": "blue", "nil": "blue", "akashi": "blue", "আকাশি": "blue",
    "লাল": "red", "lal": "red",
    "সাদা": "white", "shada": "white", "sada": "white",
    "সবুজ": "green", "shobuj": "green", "soboj": "green",
    "ধূসর": "gray", "dhusor": "gray", "chai": "gray", "grey": "gray",
    "বাদামী": "brown", "badami": "brown", "khoiri": "brown",
    "সোনালী": "gold", "shonali": "gold", "golden": "gold",
    "রূপালী": "silver", "rupali": "silver",
}

CATEGORY_TRANSLATIONS = {
    "ইলেকট্রনিক্স": "electronics", "মোবাইল": "electronics", "ফোন": "electronics",
    "মানিব্যাগ": "bags_wallets", "ওয়ালেট": "bags_wallets", "ব্যাগ": "bags_wallets", "backpack": "bags_wallets",
    "আইডি": "id_cards", "কার্ড": "id_cards", "পরিচয়পত্র": "id_cards",
    "চাবি": "keys",
    "বই": "books_notes", "খাতা": "books_notes",
    "বোতল": "bottles_accessories", "ছাতা": "bottles_accessories",
    "ঘড়ি": "accessories", "ঘড়ি": "accessories",
}

def enrich_multilingual_text(text: str) -> str:
    """
    Enriches Bengali / Banglish input by augmenting with cross-lingual English concept tags.
    This enables monolingual and bilingual Sentence Transformers models to achieve high
    cosine similarity between Bengali loss reports and English found reports.
    """
    if not text or not isinstance(text, str):
        return text or ""

    lower_text = text.lower()
    discovered_concepts = set()

    for pattern, concepts in BENGALI_CONCEPT_MAP.items():
        if re.search(pattern, lower_text, re.IGNORECASE):
            for c in concepts.split():
                discovered_concepts.add(c)

    if discovered_concepts:
        augmented = f"{text.strip()}. [Cross-lingual concepts: {' '.join(sorted(discovered_concepts))}]"
        return augmented
    return text.strip()

def normalize_attribute_term(term: Optional[str]) -> str:
    """Normalizes color, brand, or category from Bangla/Banglish into standard English."""
    if not term:
        return ""
    t = term.strip().lower()
    if t in COLOR_TRANSLATIONS:
        return COLOR_TRANSLATIONS[t]
    if t in CATEGORY_TRANSLATIONS:
        return CATEGORY_TRANSLATIONS[t]
    return t

def resolve_sylhet_location(zone_or_landmark: Optional[str]) -> Tuple[str, str]:
    """
    Resolves a raw location string (in Bangla/English/Banglish) to a standard (zone_id, full_name).
    """
    if not zone_or_landmark:
        return ("", "")
    z = zone_or_landmark.strip().lower()
    for pattern, zone_id, name in SYLHET_LOCATION_MAP:
        if re.search(pattern, z, re.IGNORECASE):
            return (zone_id, name)
    return ("", zone_or_landmark)

def smart_image_enhancer(image: Image.Image) -> Image.Image:
    """
    Applies computer vision pre-processing to smartphone camera photos:
    1. EXIF orientation transposition (corrects sideways / upside-down phone photos).
    2. Adaptive auto-contrast (normalizes shadows and washed-out highlights).
    """
    try:
        # 1. Correct EXIF orientation
        img = ImageOps.exif_transpose(image)
        if img is None:
            img = image

        # Ensure RGB
        if img.mode != "RGB":
            img = img.convert("RGB")

        # 2. Gentle auto-contrast (cut-off 0.5% extreme pixels)
        try:
            img = ImageOps.autocontrast(img, cutoff=0.5)
        except Exception:
            pass

        return img
    except Exception as e:
        logger.warning(f"Image enhancement fallback to raw image: {e}")
        return image.convert("RGB") if image.mode != "RGB" else image
