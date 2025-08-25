from celery_app import celery_app
from typing import Dict, Any, List
import re
from datetime import datetime


@celery_app.task(bind=True)
def process_motion(self, case_id: str, motion_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process a pre-trial motion and generate Judge ruling.
    
    Args:
        case_id: The case ID
        motion_data: Motion details including kind, arguments, etc.
        
    Returns:
        Motion with Judge ruling and reasoning
    """
    try:
        motion_kind = motion_data.get("kind")
        arguments = motion_data.get("arguments", "")
        filed_by = motion_data.get("filed_by", "")
        
        # Analyze motion and generate ruling
        ruling_result = analyze_motion(motion_kind, arguments, filed_by)
        
        result = {
            "case_id": case_id,
            "motion_id": motion_data.get("id"),
            "kind": motion_kind,
            "filed_by": filed_by,
            "arguments": arguments,
            "status": ruling_result["status"],
            "ruling": ruling_result["ruling"],
            "reasoning": ruling_result["reasoning"],
            "processed_at": datetime.utcnow().isoformat()
        }
        
        return result
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


def analyze_motion(kind: str, arguments: str, filed_by: str) -> Dict[str, Any]:
    """Analyze motion arguments and generate Judge ruling"""
    
    # Motion type patterns and common rulings
    motion_patterns = {
        "limine": {
            "patterns": [
                (r"prejudicial|prejudice|unfair", "denied", "Motion denied. Evidence is relevant and probative value outweighs prejudicial effect."),
                (r"character|prior|bad act", "granted", "Motion granted. Character evidence inadmissible without proper foundation."),
                (r"hearsay|out of court", "granted_in_part", "Motion granted in part. Some statements may be admissible under hearsay exceptions."),
                (r"expert|qualification|credentials", "denied", "Motion denied. Expert appears qualified based on credentials and experience."),
            ],
            "default": ("denied", "Motion denied. Moving party has not met burden of showing inadmissibility.")
        },
        "suppress": {
            "patterns": [
                (r"illegal search|warrantless|unreasonable", "granted", "Motion granted. Search conducted without probable cause or valid warrant."),
                (r"consent|voluntary|knowing", "denied", "Motion denied. Defendant voluntarily consented to search."),
                (r"miranda|rights|custodial", "granted", "Motion granted. Defendant was in custody and not properly advised of rights."),
                (r"fruit of poisonous tree|derivative", "granted_in_part", "Motion granted in part. Some evidence excluded as fruit of unlawful search."),
            ],
            "default": ("denied", "Motion denied. Search was conducted lawfully with proper authorization.")
        },
        "summary_judgment": {
            "patterns": [
                (r"no genuine issue|material fact|disputed", "granted", "Motion granted. No genuine issue of material fact exists."),
                (r"reasonable jury|could find|evidence", "denied", "Motion denied. Reasonable jury could find for non-moving party."),
                (r"burden of proof|elements|established", "granted", "Motion granted. Moving party has established all elements as matter of law."),
                (r"credibility|witness|testimony", "denied", "Motion denied. Credibility determinations are for jury to decide."),
            ],
            "default": ("denied", "Motion denied. Genuine issues of material fact exist requiring trial.")
        },
        "sever": {
            "patterns": [
                (r"prejudicial|joinder|unfair", "granted", "Motion granted. Severance necessary to avoid prejudice."),
                (r"separate trials|different evidence", "granted", "Motion granted. Separate trials will promote judicial economy and fairness."),
                (r"same transaction|common scheme", "denied", "Motion denied. Charges arise from same transaction or common scheme."),
                (r"witness|testimony|overlap", "denied", "Motion denied. Evidence and witnesses overlap significantly."),
            ],
            "default": ("denied", "Motion denied. Charges properly joined under rules of criminal procedure.")
        }
    }
    
    motion_config = motion_patterns.get(kind, motion_patterns["limine"])
    
    # Check for pattern matches
    for pattern, status, reasoning in motion_config["patterns"]:
        if re.search(pattern, arguments, re.IGNORECASE):
            return {
                "status": status,
                "ruling": get_ruling_text(status, kind),
                "reasoning": reasoning
            }
    
    # Default ruling
    default_status, default_reasoning = motion_config["default"]
    return {
        "status": default_status,
        "ruling": get_ruling_text(default_status, kind),
        "reasoning": default_reasoning
    }


def get_ruling_text(status: str, kind: str) -> str:
    """Generate ruling text based on status and motion kind"""
    rulings = {
        "granted": {
            "limine": "Motion in limine GRANTED",
            "suppress": "Motion to suppress GRANTED",
            "summary_judgment": "Motion for summary judgment GRANTED",
            "sever": "Motion to sever GRANTED"
        },
        "denied": {
            "limine": "Motion in limine DENIED",
            "suppress": "Motion to suppress DENIED",
            "summary_judgment": "Motion for summary judgment DENIED",
            "sever": "Motion to sever DENIED"
        },
        "granted_in_part": {
            "limine": "Motion in limine GRANTED IN PART",
            "suppress": "Motion to suppress GRANTED IN PART",
            "summary_judgment": "Motion for summary judgment GRANTED IN PART",
            "sever": "Motion to sever GRANTED IN PART"
        }
    }
    
    return rulings.get(status, {}).get(kind, f"Motion {status.upper()}")


@celery_app.task(bind=True)
def batch_process_motions(self, case_id: str, motions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Process multiple motions for a case.
    
    Args:
        case_id: The case ID
        motions: List of motion data
        
    Returns:
        List of processed motions with rulings
    """
    try:
        results = []
        
        for motion in motions:
            result = process_motion.apply_async(args=[case_id, motion])
            results.append(result.get())
        
        return results
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc
