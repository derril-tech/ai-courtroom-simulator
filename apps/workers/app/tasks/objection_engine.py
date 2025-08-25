from celery_app import celery_app
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import re


@celery_app.task(bind=True)
def suggest_objection_grounds(self, turn_text: str, context: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyze turn text and suggest potential objection grounds.
    
    Args:
        turn_text: The text of the current turn
        context: Trial context (phase, speaker, witness, etc.)
        
    Returns:
        List of suggested objection grounds with confidence scores
    """
    try:
        suggestions = []
        
        # Define objection patterns and their grounds
        objection_patterns = {
            "hearsay": {
                "patterns": [
                    r"he said", r"she said", r"they said", r"told me", r"heard that",
                    r"according to", r"someone told me", r"word on the street"
                ],
                "ground": "Hearsay",
                "description": "Out-of-court statement offered for truth"
            },
            "leading": {
                "patterns": [
                    r"isn't it true that", r"wouldn't you agree", r"don't you think",
                    r"you would say", r"you must admit", r"you have to agree"
                ],
                "ground": "Leading Question",
                "description": "Question suggests the answer"
            },
            "compound": {
                "patterns": [
                    r"\?.*\?.*\?", r"and.*\?", r"but.*\?", r"or.*\?"
                ],
                "ground": "Compound Question",
                "description": "Multiple questions in one"
            },
            "argumentative": {
                "patterns": [
                    r"how dare you", r"how could you", r"why would anyone",
                    r"what kind of person", r"don't you feel guilty"
                ],
                "ground": "Argumentative",
                "description": "Question is argumentative or inflammatory"
            },
            "asked_and_answered": {
                "patterns": [
                    r"we already covered", r"you already answered", r"we discussed this"
                ],
                "ground": "Asked and Answered",
                "description": "Question already asked and answered"
            },
            "relevance": {
                "patterns": [
                    r"what does this have to do", r"how is this relevant",
                    r"what's the point", r"why are we talking about"
                ],
                "ground": "Relevance",
                "description": "Evidence not relevant to case"
            },
            "speculation": {
                "patterns": [
                    r"what do you think", r"what might have", r"what could have",
                    r"in your opinion", r"what if"
                ],
                "ground": "Speculation",
                "description": "Witness speculating without foundation"
            },
            "character": {
                "patterns": [
                    r"what kind of person", r"are you a", r"do you often",
                    r"have you ever", r"your reputation"
                ],
                "ground": "Character Evidence",
                "description": "Character evidence not admissible"
            },
            "privilege": {
                "patterns": [
                    r"attorney client", r"doctor patient", r"spousal privilege",
                    r"confidential", r"privileged"
                ],
                "ground": "Privilege",
                "description": "Protected by privilege"
            },
            "best_evidence": {
                "patterns": [
                    r"copy of", r"photograph of", r"description of",
                    r"summary of", r"instead of the original"
                ],
                "ground": "Best Evidence",
                "description": "Original document required"
            }
        }
        
        # Analyze turn text for objection patterns
        turn_lower = turn_text.lower()
        
        for objection_type, config in objection_patterns.items():
            for pattern in config["patterns"]:
                if re.search(pattern, turn_lower, re.IGNORECASE):
                    # Calculate confidence based on pattern match strength
                    matches = re.findall(pattern, turn_lower, re.IGNORECASE)
                    confidence = min(len(matches) * 0.3, 1.0)
                    
                    # Adjust confidence based on context
                    if context.get("phase") == "witness_examination":
                        if context.get("examination_mode") == "cross" and objection_type == "leading":
                            confidence *= 0.5  # Leading questions more acceptable in cross
                        elif context.get("examination_mode") == "direct" and objection_type == "leading":
                            confidence *= 1.2  # Leading questions less acceptable in direct
                    
                    if confidence > 0.3:  # Only suggest if confidence is reasonable
                        suggestions.append({
                            "id": str(uuid.uuid4()),
                            "ground": config["ground"],
                            "description": config["description"],
                            "confidence": round(confidence, 2),
                            "pattern_matched": pattern,
                            "objection_type": objection_type,
                            "suggested_at": datetime.utcnow().isoformat()
                        })
        
        # Sort by confidence (highest first)
        suggestions.sort(key=lambda x: x["confidence"], reverse=True)
        
        # Limit to top 3 suggestions
        suggestions = suggestions[:3]
        
        return {
            "suggestions": suggestions,
            "total_suggestions": len(suggestions),
            "turn_text_length": len(turn_text),
            "context": context
        }
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def process_objection(self, objection_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process an objection and generate Judge ruling.
    
    Args:
        objection_data: Objection information (ground, context, etc.)
        
    Returns:
        Judge ruling on the objection
    """
    try:
        ground = objection_data.get("ground", "")
        context = objection_data.get("context", {})
        turn_text = objection_data.get("turn_text", "")
        
        # Judge ruling logic based on objection ground
        ruling_rules = {
            "Hearsay": {
                "sustained_probability": 0.8,
                "exceptions": ["present_sense_impression", "excited_utterance", "state_of_mind"],
                "ruling_template": "Objection sustained. {ground} is inadmissible unless an exception applies."
            },
            "Leading Question": {
                "sustained_probability": 0.6,
                "exceptions": ["cross_examination", "hostile_witness", "preliminary_matters"],
                "ruling_template": "Objection {result}. {explanation}"
            },
            "Compound Question": {
                "sustained_probability": 0.9,
                "exceptions": [],
                "ruling_template": "Objection sustained. Please ask one question at a time."
            },
            "Argumentative": {
                "sustained_probability": 0.85,
                "exceptions": [],
                "ruling_template": "Objection sustained. The question is argumentative."
            },
            "Asked and Answered": {
                "sustained_probability": 0.7,
                "exceptions": ["clarification_needed"],
                "ruling_template": "Objection sustained. The question has been asked and answered."
            },
            "Relevance": {
                "sustained_probability": 0.75,
                "exceptions": ["foundation_being_laid"],
                "ruling_template": "Objection sustained. The evidence is not relevant to this case."
            },
            "Speculation": {
                "sustained_probability": 0.8,
                "exceptions": ["expert_witness", "lay_opinion"],
                "ruling_template": "Objection sustained. The witness may not speculate."
            },
            "Character Evidence": {
                "sustained_probability": 0.9,
                "exceptions": ["character_in_issue", "impeachment"],
                "ruling_template": "Objection sustained. Character evidence is not admissible."
            },
            "Privilege": {
                "sustained_probability": 0.95,
                "exceptions": ["waiver"],
                "ruling_template": "Objection sustained. The communication is privileged."
            },
            "Best Evidence": {
                "sustained_probability": 0.7,
                "exceptions": ["original_unavailable", "duplicate_authenticated"],
                "ruling_template": "Objection sustained. The original document must be produced."
            }
        }
        
        # Get ruling rule for this ground
        rule = ruling_rules.get(ground, {
            "sustained_probability": 0.5,
            "exceptions": [],
            "ruling_template": "Objection {result}. The court will consider the arguments."
        })
        
        # Determine if objection is sustained or overruled
        import random
        sustained = random.random() < rule["sustained_probability"]
        
        # Check for exceptions based on context
        if context.get("examination_mode") == "cross" and ground == "Leading Question":
            sustained = False  # Leading questions generally allowed in cross
        
        if context.get("witness_type") == "expert" and ground == "Speculation":
            sustained = False  # Experts can give opinions
        
        # Generate ruling text
        result = "sustained" if sustained else "overruled"
        explanation = get_ruling_explanation(ground, sustained, context)
        
        ruling_text = rule["ruling_template"].format(
            ground=ground,
            result=result,
            explanation=explanation
        )
        
        # Create objection record
        objection = {
            "id": str(uuid.uuid4()),
            "case_id": context.get("case_id"),
            "turn_id": context.get("turn_id"),
            "ground": ground,
            "objecting_party": objection_data.get("objecting_party", "defense"),
            "ruling": result,
            "ruling_text": ruling_text,
            "explanation": explanation,
            "created_at": datetime.utcnow().isoformat(),
            "meta": {
                "context": context,
                "confidence": objection_data.get("confidence", 0.0)
            }
        }
        
        return {
            "objection": objection,
            "ruling_summary": {
                "result": result,
                "ground": ground,
                "ruling_text": ruling_text
            }
        }
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


def get_ruling_explanation(ground: str, sustained: bool, context: Dict[str, Any]) -> str:
    """Generate explanation for the ruling"""
    
    if sustained:
        explanations = {
            "Hearsay": "The statement is hearsay and no exception applies.",
            "Leading Question": "Leading questions are not permitted in direct examination.",
            "Compound Question": "The question contains multiple parts and may confuse the witness.",
            "Argumentative": "The question is argumentative and inflammatory.",
            "Asked and Answered": "This question has already been asked and answered.",
            "Relevance": "The evidence is not relevant to the issues in this case.",
            "Speculation": "The witness lacks personal knowledge to answer this question.",
            "Character Evidence": "Character evidence is generally inadmissible.",
            "Privilege": "The communication is protected by privilege.",
            "Best Evidence": "The original document must be produced."
        }
    else:
        explanations = {
            "Hearsay": "An exception to the hearsay rule applies.",
            "Leading Question": "Leading questions are permitted in cross-examination.",
            "Compound Question": "The question is clear and not confusing.",
            "Argumentative": "The question is not argumentative in this context.",
            "Asked and Answered": "The question seeks clarification of previous testimony.",
            "Relevance": "The evidence is relevant to the issues in this case.",
            "Speculation": "The witness has sufficient knowledge to answer.",
            "Character Evidence": "Character evidence is admissible in this context.",
            "Privilege": "The privilege has been waived or does not apply.",
            "Best Evidence": "The duplicate is admissible under the circumstances."
        }
    
    return explanations.get(ground, "The court finds the objection appropriate.")


@celery_app.task(bind=True)
def get_objection_statistics(self, case_id: str) -> Dict[str, Any]:
    """
    Get statistics about objections in a case.
    
    Args:
        case_id: The case ID
        
    Returns:
        Objection statistics
    """
    try:
        # This would query actual objection data
        stats = {
            "case_id": case_id,
            "total_objections": 0,
            "sustained_count": 0,
            "overruled_count": 0,
            "grounds_breakdown": {},
            "objection_rate_per_hour": 0.0,
            "most_common_ground": None,
            "sustained_rate": 0.0
        }
        
        return stats
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def batch_process_objections(self, objections_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Process multiple objections in batch.
    
    Args:
        objections_data: List of objection data
        
    Returns:
        Batch processing results
    """
    try:
        results = []
        
        for objection_data in objections_data:
            result = process_objection.apply_async(args=[objection_data])
            results.append({
                "objection_id": objection_data.get("id"),
                "task_id": result.id,
                "status": "queued"
            })
        
        return {
            "batch_id": str(uuid.uuid4()),
            "total_objections": len(objections_data),
            "results": results,
            "processed_at": datetime.utcnow().isoformat()
        }
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc
