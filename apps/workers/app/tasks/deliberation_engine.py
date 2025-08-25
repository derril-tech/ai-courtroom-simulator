from celery_app import celery_app
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import random
import math


@celery_app.task(bind=True)
def start_deliberation(self, case_id: str, jury_size: int = 12) -> Dict[str, Any]:
    """
    Start jury deliberation process.
    
    Args:
        case_id: The case ID
        jury_size: Number of jurors (default 12)
        
    Returns:
        Deliberation state with initial juror priors
    """
    try:
        # Initialize jurors with random priors
        jurors = []
        for i in range(jury_size):
            juror = {
                "id": str(uuid.uuid4()),
                "juror_number": i + 1,
                "initial_prior": random.uniform(0.1, 0.9),  # Random initial belief
                "current_belief": 0.0,  # Will be set after evidence review
                "confidence": random.uniform(0.3, 0.8),
                "deliberation_style": random.choice(["analytical", "intuitive", "balanced"]),
                "influence_factor": random.uniform(0.5, 1.5),
                "votes": [],
                "notes": []
            }
            jurors.append(juror)
        
        deliberation_state = {
            "id": str(uuid.uuid4()),
            "case_id": case_id,
            "jury_size": jury_size,
            "start_time": datetime.utcnow().isoformat(),
            "status": "deliberating",
            "jurors": jurors,
            "rounds": [],
            "current_round": 0,
            "consensus_threshold": 0.8,
            "unanimity_required": True,
            "max_rounds": 20,
            "hung_jury_threshold": 0.3
        }
        
        return deliberation_state
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def process_deliberation_round(self, deliberation_id: str, evidence_strength: float) -> Dict[str, Any]:
    """
    Process a single deliberation round.
    
    Args:
        deliberation_id: The deliberation ID
        evidence_strength: Strength of evidence (0.0 to 1.0)
        
    Returns:
        Updated deliberation state with round results
    """
    try:
        # This would retrieve the actual deliberation state
        # For now, we'll simulate the deliberation process
        
        # Simulate juror discussion and belief updates
        round_result = {
            "round_number": 1,  # This would be incremented
            "start_time": datetime.utcnow().isoformat(),
            "evidence_strength": evidence_strength,
            "juror_updates": [],
            "consensus_level": 0.0,
            "majority_vote": None,
            "unanimous": False,
            "hung_jury": False
        }
        
        # Simulate juror belief updates based on evidence and discussion
        juror_updates = []
        for i in range(12):  # Assuming 12 jurors
            juror_update = {
                "juror_id": str(uuid.uuid4()),
                "previous_belief": random.uniform(0.2, 0.8),
                "new_belief": 0.0,
                "confidence_change": random.uniform(-0.1, 0.1),
                "influence_received": random.uniform(0.0, 0.2),
                "influence_given": random.uniform(0.0, 0.2),
                "vote": random.choice(["guilty", "not_guilty", "undecided"])
            }
            
            # Update belief based on evidence strength and peer influence
            evidence_weight = 0.6
            peer_weight = 0.4
            
            evidence_effect = evidence_strength * evidence_weight
            peer_effect = juror_update["influence_received"] * peer_weight
            
            juror_update["new_belief"] = min(1.0, max(0.0, 
                juror_update["previous_belief"] + evidence_effect + peer_effect))
            
            juror_updates.append(juror_update)
        
        round_result["juror_updates"] = juror_updates
        
        # Calculate consensus metrics
        guilty_votes = sum(1 for update in juror_updates if update["vote"] == "guilty")
        not_guilty_votes = sum(1 for update in juror_updates if update["vote"] == "not_guilty")
        undecided_votes = sum(1 for update in juror_updates if update["vote"] == "undecided")
        
        total_votes = len(juror_updates)
        round_result["consensus_level"] = max(guilty_votes, not_guilty_votes) / total_votes
        
        if guilty_votes > not_guilty_votes:
            round_result["majority_vote"] = "guilty"
        elif not_guilty_votes > guilty_votes:
            round_result["majority_vote"] = "not_guilty"
        else:
            round_result["majority_vote"] = "tie"
        
        round_result["unanimous"] = (guilty_votes == total_votes or not_guilty_votes == total_votes)
        round_result["hung_jury"] = (undecided_votes / total_votes) > 0.3
        
        return round_result
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def reach_verdict(self, deliberation_id: str, final_votes: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Process final verdict based on jury votes.
    
    Args:
        deliberation_id: The deliberation ID
        final_votes: List of final juror votes
        
    Returns:
        Final verdict with rationale
    """
    try:
        # Count votes
        guilty_votes = sum(1 for vote in final_votes if vote["vote"] == "guilty")
        not_guilty_votes = sum(1 for vote in final_votes if vote["vote"] == "not_guilty")
        total_votes = len(final_votes)
        
        # Determine verdict
        if guilty_votes > not_guilty_votes:
            verdict = "guilty"
            majority_size = guilty_votes
        elif not_guilty_votes > guilty_votes:
            verdict = "not_guilty"
            majority_size = not_guilty_votes
        else:
            verdict = "hung_jury"
            majority_size = 0
        
        # Generate rationale
        rationale = generate_verdict_rationale(verdict, guilty_votes, not_guilty_votes, total_votes)
        
        # Calculate confidence metrics
        confidence = majority_size / total_votes if majority_size > 0 else 0.0
        
        final_verdict = {
            "id": str(uuid.uuid4()),
            "deliberation_id": deliberation_id,
            "verdict": verdict,
            "guilty_votes": guilty_votes,
            "not_guilty_votes": not_guilty_votes,
            "total_votes": total_votes,
            "majority_size": majority_size,
            "confidence": confidence,
            "unanimous": (guilty_votes == total_votes or not_guilty_votes == total_votes),
            "hung_jury": verdict == "hung_jury",
            "rationale": rationale,
            "reached_at": datetime.utcnow().isoformat(),
            "deliberation_duration": "calculated_duration"
        }
        
        return final_verdict
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def generate_verdict_rationale(self, verdict: str, guilty_votes: int, not_guilty_votes: int, total_votes: int) -> str:
    """
    Generate rationale for the verdict.
    
    Args:
        verdict: The verdict reached
        guilty_votes: Number of guilty votes
        not_guilty_votes: Number of not guilty votes
        total_votes: Total number of votes
        
    Returns:
        Verdict rationale
    """
    try:
        if verdict == "hung_jury":
            return f"The jury was unable to reach a unanimous verdict. The vote was {guilty_votes} guilty, {not_guilty_votes} not guilty, with {total_votes - guilty_votes - not_guilty_votes} undecided jurors. The jury is deadlocked and cannot reach a decision."
        
        majority_size = max(guilty_votes, not_guilty_votes)
        minority_size = min(guilty_votes, not_guilty_votes)
        
        if verdict == "guilty":
            if guilty_votes == total_votes:
                return f"The jury unanimously found the defendant guilty on all counts. All {total_votes} jurors agreed that the prosecution proved its case beyond a reasonable doubt."
            else:
                return f"The jury found the defendant guilty by a vote of {guilty_votes} to {not_guilty_votes}. The majority of jurors concluded that the prosecution proved its case beyond a reasonable doubt."
        else:  # not_guilty
            if not_guilty_votes == total_votes:
                return f"The jury unanimously found the defendant not guilty on all counts. All {total_votes} jurors agreed that the prosecution failed to prove its case beyond a reasonable doubt."
            else:
                return f"The jury found the defendant not guilty by a vote of {not_guilty_votes} to {guilty_votes}. The majority of jurors concluded that the prosecution failed to prove its case beyond a reasonable doubt."
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def get_deliberation_summary(self, deliberation_id: str) -> Dict[str, Any]:
    """
    Get summary of deliberation progress.
    
    Args:
        deliberation_id: The deliberation ID
        
    Returns:
        Deliberation summary
    """
    try:
        # This would query actual deliberation data
        summary = {
            "deliberation_id": deliberation_id,
            "total_rounds": 0,
            "current_consensus": 0.0,
            "majority_vote": None,
            "unanimous": False,
            "hung_jury": False,
            "deliberation_duration": "calculated_duration",
            "last_activity": datetime.utcnow().isoformat()
        }
        
        return summary
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def simulate_juror_interaction(self, juror_a: Dict[str, Any], juror_b: Dict[str, Any], evidence_strength: float) -> Dict[str, Any]:
    """
    Simulate interaction between two jurors during deliberation.
    
    Args:
        juror_a: First juror data
        juror_b: Second juror data
        evidence_strength: Strength of evidence
        
    Returns:
        Interaction result with belief updates
    """
    try:
        # Calculate influence based on juror characteristics
        a_influence = juror_a.get("influence_factor", 1.0) * juror_a.get("confidence", 0.5)
        b_influence = juror_b.get("influence_factor", 1.0) * juror_b.get("confidence", 0.5)
        
        # Determine who influences whom
        if a_influence > b_influence:
            influencer = juror_a
            influenced = juror_b
            influence_direction = "a_to_b"
        else:
            influencer = juror_b
            influenced = juror_a
            influence_direction = "b_to_a"
        
        # Calculate belief change
        belief_difference = abs(influencer.get("current_belief", 0.5) - influenced.get("current_belief", 0.5))
        influence_strength = min(0.2, belief_difference * 0.3)  # Max 20% change
        
        # Apply influence
        new_belief = influenced.get("current_belief", 0.5)
        if influencer.get("current_belief", 0.5) > influenced.get("current_belief", 0.5):
            new_belief += influence_strength
        else:
            new_belief -= influence_strength
        
        new_belief = max(0.0, min(1.0, new_belief))
        
        interaction_result = {
            "influence_direction": influence_direction,
            "influence_strength": influence_strength,
            "belief_change": new_belief - influenced.get("current_belief", 0.5),
            "new_belief": new_belief,
            "evidence_effect": evidence_strength * 0.1,
            "interaction_time": datetime.utcnow().isoformat()
        }
        
        return interaction_result
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def check_convergence(self, deliberation_rounds: List[Dict[str, Any]], convergence_threshold: float = 0.9) -> Dict[str, Any]:
    """
    Check if jury deliberation has converged to a verdict.
    
    Args:
        deliberation_rounds: List of deliberation rounds
        convergence_threshold: Threshold for convergence (default 0.9)
        
    Returns:
        Convergence analysis
    """
    try:
        if len(deliberation_rounds) < 2:
            return {
                "converged": False,
                "convergence_level": 0.0,
                "trend": "insufficient_data",
                "recommendation": "continue_deliberation"
            }
        
        # Calculate convergence metrics
        recent_rounds = deliberation_rounds[-3:]  # Last 3 rounds
        consensus_levels = [round_data.get("consensus_level", 0.0) for round_data in recent_rounds]
        
        avg_consensus = sum(consensus_levels) / len(consensus_levels)
        consensus_trend = consensus_levels[-1] - consensus_levels[0] if len(consensus_levels) > 1 else 0
        
        # Determine convergence
        converged = avg_consensus >= convergence_threshold
        
        # Determine trend
        if consensus_trend > 0.05:
            trend = "increasing"
        elif consensus_trend < -0.05:
            trend = "decreasing"
        else:
            trend = "stable"
        
        # Generate recommendation
        if converged:
            recommendation = "ready_for_verdict"
        elif trend == "increasing":
            recommendation = "continue_deliberation"
        elif trend == "decreasing":
            recommendation = "consider_hung_jury"
        else:
            recommendation = "continue_deliberation"
        
        convergence_analysis = {
            "converged": converged,
            "convergence_level": avg_consensus,
            "consensus_trend": consensus_trend,
            "trend": trend,
            "recommendation": recommendation,
            "rounds_analyzed": len(recent_rounds),
            "analysis_time": datetime.utcnow().isoformat()
        }
        
        return convergence_analysis
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc
