from celery_app import celery_app
from typing import Dict, Any, List
from datetime import datetime
import uuid


@celery_app.task(bind=True)
def start_trial(self, case_id: str) -> Dict[str, Any]:
    """
    Start a trial and initialize the trial state machine.
    
    Args:
        case_id: The case ID
        
    Returns:
        Trial state with initial configuration
    """
    try:
        # Initialize trial state
        trial_state = {
            "case_id": case_id,
            "status": "trial_started",
            "phase": "openings",
            "current_witness": None,
            "current_phase_start": datetime.utcnow().isoformat(),
            "turns": [],
            "objections": [],
            "exhibits_admitted": [],
            "element_coverage": {},
            "trial_id": str(uuid.uuid4())
        }
        
        return trial_state
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def add_turn(self, case_id: str, turn_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Add a turn to the trial transcript.
    
    Args:
        case_id: The case ID
        turn_data: Turn information (speaker, text, phase, etc.)
        
    Returns:
        Updated trial state with new turn
    """
    try:
        turn = {
            "id": str(uuid.uuid4()),
            "case_id": case_id,
            "phase": turn_data.get("phase", "trial"),
            "speaker": turn_data.get("speaker"),
            "witness_id": turn_data.get("witness_id"),
            "count_id": turn_data.get("count_id"),
            "text": turn_data.get("text", ""),
            "timestamp_ms": int(datetime.utcnow().timestamp() * 1000),
            "meta": turn_data.get("meta", {}),
            "created_at": datetime.utcnow().isoformat()
        }
        
        # Update element coverage based on turn content
        element_updates = analyze_element_coverage(turn, turn_data.get("case_elements", []))
        
        result = {
            "turn": turn,
            "element_updates": element_updates,
            "trial_state": {
                "last_turn_id": turn["id"],
                "last_turn_time": turn["created_at"],
                "total_turns": 1  # This would be incremented from current state
            }
        }
        
        return result
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def advance_phase(self, case_id: str, new_phase: str) -> Dict[str, Any]:
    """
    Advance the trial to the next phase.
    
    Args:
        case_id: The case ID
        new_phase: The new trial phase
        
    Returns:
        Updated trial state
    """
    try:
        phase_transitions = {
            "openings": ["witness_examination"],
            "witness_examination": ["closings"],
            "closings": ["instructions"],
            "instructions": ["deliberation"],
            "deliberation": ["verdict"],
            "verdict": ["sentencing"],
            "sentencing": ["trial_complete"]
        }
        
        # Validate phase transition
        current_phase = "openings"  # This would come from current trial state
        valid_next_phases = phase_transitions.get(current_phase, [])
        
        if new_phase not in valid_next_phases:
            raise ValueError(f"Invalid phase transition from {current_phase} to {new_phase}")
        
        # Create phase transition turn
        transition_turn = {
            "id": str(uuid.uuid4()),
            "case_id": case_id,
            "phase": "transition",
            "speaker": "judge",
            "text": f"Court is now proceeding to the {new_phase.replace('_', ' ')} phase.",
            "timestamp_ms": int(datetime.utcnow().timestamp() * 1000),
            "meta": {
                "transition_from": current_phase,
                "transition_to": new_phase
            },
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = {
            "new_phase": new_phase,
            "transition_turn": transition_turn,
            "phase_start_time": datetime.utcnow().isoformat(),
            "trial_state": {
                "current_phase": new_phase,
                "phase_start": datetime.utcnow().isoformat()
            }
        }
        
        return result
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def start_witness_examination(self, case_id: str, witness_id: str, mode: str = "direct") -> Dict[str, Any]:
    """
    Start examination of a witness.
    
    Args:
        case_id: The case ID
        witness_id: The witness ID
        mode: Examination mode (direct, cross, redirect, recross)
        
    Returns:
        Witness examination state
    """
    try:
        examination_state = {
            "case_id": case_id,
            "witness_id": witness_id,
            "mode": mode,
            "start_time": datetime.utcnow().isoformat(),
            "turns": [],
            "objections": [],
            "exhibits_used": [],
            "foundation_established": [],
            "examination_id": str(uuid.uuid4())
        }
        
        # Create examination start turn
        start_turn = {
            "id": str(uuid.uuid4()),
            "case_id": case_id,
            "phase": "witness_examination",
            "speaker": "judge",
            "witness_id": witness_id,
            "text": f"Calling {witness_id} for {mode} examination.",
            "timestamp_ms": int(datetime.utcnow().timestamp() * 1000),
            "meta": {
                "examination_mode": mode,
                "examination_start": True
            },
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = {
            "examination_state": examination_state,
            "start_turn": start_turn,
            "trial_state": {
                "current_witness": witness_id,
                "current_examination_mode": mode,
                "examination_start_time": datetime.utcnow().isoformat()
            }
        }
        
        return result
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def end_witness_examination(self, case_id: str, witness_id: str) -> Dict[str, Any]:
    """
    End examination of a witness.
    
    Args:
        case_id: The case ID
        witness_id: The witness ID
        
    Returns:
        Examination summary
    """
    try:
        # Create examination end turn
        end_turn = {
            "id": str(uuid.uuid4()),
            "case_id": case_id,
            "phase": "witness_examination",
            "speaker": "judge",
            "witness_id": witness_id,
            "text": f"Witness {witness_id} is excused.",
            "timestamp_ms": int(datetime.utcnow().timestamp() * 1000),
            "meta": {
                "examination_end": True
            },
            "created_at": datetime.utcnow().isoformat()
        }
        
        result = {
            "end_turn": end_turn,
            "examination_summary": {
                "witness_id": witness_id,
                "duration": "calculated_duration",
                "turns_count": 0,  # This would be calculated from actual turns
                "objections_count": 0,
                "exhibits_used": []
            },
            "trial_state": {
                "current_witness": None,
                "current_examination_mode": None,
                "examination_end_time": datetime.utcnow().isoformat()
            }
        }
        
        return result
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


def analyze_element_coverage(turn: Dict[str, Any], case_elements: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Analyze turn content for element coverage updates"""
    # This is a simplified analysis - in practice, this would use NLP/AI
    # to determine which elements are being addressed
    
    element_updates = {}
    
    # Simple keyword matching for demonstration
    turn_text = turn.get("text", "").lower()
    
    for element in case_elements:
        element_name = element.get("name", "").lower()
        element_keywords = element_name.replace("_", " ").split()
        
        # Check if turn text contains element keywords
        coverage_score = 0
        for keyword in element_keywords:
            if keyword in turn_text:
                coverage_score += 1
        
        if coverage_score > 0:
            coverage_percentage = (coverage_score / len(element_keywords)) * 100
            if coverage_percentage > 50:
                element_updates[element.get("name")] = {
                    "status": "covered",
                    "score": coverage_percentage,
                    "turn_id": turn.get("id"),
                    "timestamp": turn.get("created_at")
                }
    
    return element_updates


@celery_app.task(bind=True)
def get_trial_summary(self, case_id: str) -> Dict[str, Any]:
    """
    Generate a summary of the trial progress.
    
    Args:
        case_id: The case ID
        
    Returns:
        Trial summary with statistics
    """
    try:
        # This would query the actual trial data
        summary = {
            "case_id": case_id,
            "trial_duration": "calculated_duration",
            "total_turns": 0,
            "total_objections": 0,
            "witnesses_examined": 0,
            "exhibits_admitted": 0,
            "current_phase": "openings",
            "element_coverage_percentage": 0,
            "last_activity": datetime.utcnow().isoformat()
        }
        
        return summary
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc
