from celery_app import celery_app
from typing import Dict, Any, List
import re
from datetime import datetime


@celery_app.task(bind=True)
def normalize_intake(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normalize case intake data into structured format.
    
    Args:
        case_data: Raw case data from frontend
        
    Returns:
        Normalized case structure with counts, elements, defenses, etc.
    """
    try:
        summary = case_data.get("summary", "")
        case_type = case_data.get("case_type", "criminal")
        
        # Parse counts/charges
        counts = parse_counts(summary, case_type)
        
        # Parse parties
        parties = parse_parties(summary, case_type)
        
        # Parse timeline
        timeline = parse_timeline(summary)
        
        # Parse witnesses
        witnesses = parse_witnesses(summary)
        
        # Parse exhibits
        exhibits = parse_exhibits(case_data.get("exhibits", []))
        
        # Generate elements and defenses
        elements = generate_elements(counts, case_type)
        defenses = generate_defenses(counts, case_type)
        
        result = {
            "case_id": case_data.get("id"),
            "counts": counts,
            "elements": elements,
            "defenses": defenses,
            "parties": parties,
            "timeline": timeline,
            "witnesses": witnesses,
            "exhibits": exhibits,
            "status": "normalized",
            "normalized_at": datetime.utcnow().isoformat()
        }
        
        return result
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


def parse_counts(summary: str, case_type: str) -> List[Dict[str, Any]]:
    """Parse counts/charges from case summary"""
    counts = []
    
    if case_type == "criminal":
        # Common criminal charges
        criminal_patterns = [
            (r"theft|stole|stolen", "Theft", "BRD"),
            (r"assault|battery|attack", "Assault", "BRD"),
            (r"murder|homicide|killed", "Murder", "BRD"),
            (r"burglary|breaking|entering", "Burglary", "BRD"),
            (r"fraud|deceit|false", "Fraud", "BRD"),
            (r"drug|narcotic|controlled substance", "Drug Possession", "BRD"),
            (r"drunk|DUI|DWI|intoxicated", "DUI", "BRD"),
        ]
        
        for pattern, charge_name, burden in criminal_patterns:
            if re.search(pattern, summary, re.IGNORECASE):
                counts.append({
                    "label": charge_name,
                    "description": f"Charge of {charge_name.lower()}",
                    "burden": burden,
                    "elements": get_criminal_elements(charge_name),
                    "defenses": get_criminal_defenses(charge_name)
                })
    
    elif case_type == "civil":
        # Common civil claims
        civil_patterns = [
            (r"breach|contract|agreement", "Breach of Contract", "preponderance"),
            (r"negligence|careless|fault", "Negligence", "preponderance"),
            (r"defamation|libel|slander", "Defamation", "preponderance"),
            (r"trespass|property|land", "Trespass", "preponderance"),
            (r"nuisance|annoyance|disturbance", "Nuisance", "preponderance"),
        ]
        
        for pattern, claim_name, burden in civil_patterns:
            if re.search(pattern, summary, re.IGNORECASE):
                counts.append({
                    "label": claim_name,
                    "description": f"Claim of {claim_name.lower()}",
                    "burden": burden,
                    "elements": get_civil_elements(claim_name),
                    "defenses": get_civil_defenses(claim_name)
                })
    
    return counts


def parse_parties(summary: str, case_type: str) -> List[Dict[str, Any]]:
    """Parse parties from case summary"""
    parties = []
    
    # Look for party names (simplified pattern matching)
    name_patterns = [
        r"([A-Z][a-z]+ [A-Z][a-z]+)",  # First Last
        r"([A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+)",  # First M. Last
    ]
    
    names = []
    for pattern in name_patterns:
        matches = re.findall(pattern, summary)
        names.extend(matches)
    
    # Remove duplicates and assign roles
    unique_names = list(set(names))
    
    if case_type == "criminal":
        if len(unique_names) >= 1:
            parties.append({
                "name": unique_names[0],
                "side": "prosecution",
                "role": "prosecutor"
            })
        if len(unique_names) >= 2:
            parties.append({
                "name": unique_names[1],
                "side": "defense",
                "role": "defendant"
            })
    else:  # civil
        if len(unique_names) >= 1:
            parties.append({
                "name": unique_names[0],
                "side": "plaintiff",
                "role": "plaintiff"
            })
        if len(unique_names) >= 2:
            parties.append({
                "name": unique_names[1],
                "side": "defendant",
                "role": "defendant"
            })
    
    return parties


def parse_timeline(summary: str) -> List[Dict[str, Any]]:
    """Parse timeline of events from case summary"""
    timeline = []
    
    # Look for date patterns
    date_patterns = [
        r"(\d{1,2}/\d{1,2}/\d{4})",  # MM/DD/YYYY
        r"(\d{4}-\d{2}-\d{2})",  # YYYY-MM-DD
        r"(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2},? \d{4}",  # Month DD, YYYY
    ]
    
    for pattern in date_patterns:
        dates = re.findall(pattern, summary)
        for date in dates:
            timeline.append({
                "date": date,
                "description": "Event occurred",
                "source": "case_summary"
            })
    
    return timeline


def parse_witnesses(summary: str) -> List[Dict[str, Any]]:
    """Parse witnesses from case summary"""
    witnesses = []
    
    # Look for witness indicators
    witness_indicators = [
        r"witness(?:es)?",
        r"testified",
        r"saw",
        r"observed",
        r"heard",
        r"reported"
    ]
    
    # Extract names near witness indicators
    for indicator in witness_indicators:
        matches = re.finditer(indicator, summary, re.IGNORECASE)
        for match in matches:
            # Look for names around the witness indicator
            context = summary[max(0, match.start()-50):match.end()+50]
            name_matches = re.findall(r"([A-Z][a-z]+ [A-Z][a-z]+)", context)
            
            for name in name_matches:
                if name not in [w["name"] for w in witnesses]:
                    witnesses.append({
                        "name": name,
                        "role": "witness",
                        "credibility_notes": "Identified from case summary"
                    })
    
    return witnesses


def parse_exhibits(exhibits_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Parse exhibits from uploaded data"""
    exhibits = []
    
    for i, exhibit in enumerate(exhibits_data):
        exhibits.append({
            "code": f"Exhibit {chr(65 + i)}",  # A, B, C, etc.
            "title": exhibit.get("title", f"Exhibit {chr(65 + i)}"),
            "description": exhibit.get("description", ""),
            "type": exhibit.get("type", "document"),
            "status": "pending"
        })
    
    return exhibits


def get_criminal_elements(charge_name: str) -> Dict[str, Any]:
    """Get elements for criminal charges"""
    elements_map = {
        "Theft": {
            "elements": [
                "taking",
                "property_of_another",
                "without_consent",
                "intent_to_deprive"
            ]
        },
        "Assault": {
            "elements": [
                "intentional_act",
                "reasonable_apprehension",
                "imminent_harm"
            ]
        },
        "Murder": {
            "elements": [
                "unlawful_killing",
                "human_being",
                "malice_aforethought"
            ]
        },
        "Burglary": {
            "elements": [
                "breaking",
                "entering",
                "dwelling",
                "intent_to_commit_felony"
            ]
        },
        "Fraud": {
            "elements": [
                "false_representation",
                "material_fact",
                "intent_to_deceive",
                "reliance",
                "damage"
            ]
        }
    }
    
    return elements_map.get(charge_name, {"elements": ["general_intent", "actus_reus"]})


def get_criminal_defenses(charge_name: str) -> Dict[str, Any]:
    """Get defenses for criminal charges"""
    return {
        "defenses": [
            "alibi",
            "self_defense",
            "insanity",
            "duress",
            "entrapment"
        ]
    }


def get_civil_elements(claim_name: str) -> Dict[str, Any]:
    """Get elements for civil claims"""
    elements_map = {
        "Breach of Contract": {
            "elements": [
                "valid_contract",
                "breach",
                "damages"
            ]
        },
        "Negligence": {
            "elements": [
                "duty",
                "breach",
                "causation",
                "damages"
            ]
        },
        "Defamation": {
            "elements": [
                "false_statement",
                "publication",
                "fault",
                "damages"
            ]
        }
    }
    
    return elements_map.get(claim_name, {"elements": ["general_elements"]})


def get_civil_defenses(claim_name: str) -> Dict[str, Any]:
    """Get defenses for civil claims"""
    return {
        "defenses": [
            "statute_of_limitations",
            "contributory_negligence",
            "assumption_of_risk",
            "immunity"
        ]
    }


def generate_elements(counts: List[Dict[str, Any]], case_type: str) -> List[Dict[str, Any]]:
    """Generate comprehensive elements list"""
    elements = []
    
    for count in counts:
        count_elements = count.get("elements", {}).get("elements", [])
        for element in count_elements:
            elements.append({
                "name": element,
                "count_id": count.get("label"),
                "status": "unmet",
                "description": f"Element: {element.replace('_', ' ').title()}"
            })
    
    return elements


def generate_defenses(counts: List[Dict[str, Any]], case_type: str) -> List[Dict[str, Any]]:
    """Generate comprehensive defenses list"""
    defenses = []
    
    for count in counts:
        count_defenses = count.get("defenses", {}).get("defenses", [])
        for defense in count_defenses:
            defenses.append({
                "name": defense,
                "count_id": count.get("label"),
                "status": "available",
                "description": f"Defense: {defense.replace('_', ' ').title()}"
            })
    
    return defenses
