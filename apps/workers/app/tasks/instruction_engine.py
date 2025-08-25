from celery_app import celery_app
from typing import Dict, Any, List, Optional
from datetime import datetime
import uuid
import re


@celery_app.task(bind=True)
def generate_instructions(self, case_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Generate jury instructions based on case elements and counts.
    
    Args:
        case_data: Case information including counts, elements, defenses
        
    Returns:
        Generated jury instructions with templates and customizations
    """
    try:
        counts = case_data.get("counts", [])
        elements = case_data.get("elements", [])
        defenses = case_data.get("defenses", [])
        case_type = case_data.get("case_type", "criminal")
        
        instructions = {
            "id": str(uuid.uuid4()),
            "case_id": case_data.get("case_id"),
            "generated_at": datetime.utcnow().isoformat(),
            "sections": [],
            "custom_instructions": [],
            "verdict_form": generate_verdict_form(counts, case_type)
        }
        
        # Generate standard instruction sections
        instructions["sections"].extend(generate_standard_sections(case_type))
        
        # Generate element-specific instructions
        for count in counts:
            count_instructions = generate_count_instructions(count, elements, case_type)
            instructions["sections"].extend(count_instructions)
        
        # Generate defense instructions
        if defenses:
            defense_instructions = generate_defense_instructions(defenses, case_type)
            instructions["sections"].extend(defense_instructions)
        
        # Generate credibility and expert instructions
        if case_data.get("has_experts"):
            instructions["sections"].extend(generate_expert_instructions())
        
        instructions["sections"].extend(generate_credibility_instructions())
        
        return instructions
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def generate_verdict_form(self, counts: List[Dict[str, Any]], case_type: str) -> Dict[str, Any]:
    """
    Generate verdict form with counts and special findings.
    
    Args:
        counts: List of counts/charges
        case_type: Type of case (criminal/civil)
        
    Returns:
        Verdict form structure
    """
    try:
        verdict_form = {
            "id": str(uuid.uuid4()),
            "counts": [],
            "special_findings": [],
            "total_verdicts": len(counts)
        }
        
        for i, count in enumerate(counts):
            count_form = {
                "count_number": i + 1,
                "count_name": count.get("name", f"Count {i + 1}"),
                "elements": count.get("elements", []),
                "verdict_options": get_verdict_options(case_type, count),
                "special_findings": get_special_findings(count, case_type)
            }
            verdict_form["counts"].append(count_form)
        
        return verdict_form
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


def generate_standard_sections(case_type: str) -> List[Dict[str, Any]]:
    """Generate standard jury instruction sections"""
    
    sections = [
        {
            "id": str(uuid.uuid4()),
            "title": "General Instructions",
            "content": get_general_instructions(case_type),
            "order": 1
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Burden of Proof",
            "content": get_burden_instructions(case_type),
            "order": 2
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Evidence",
            "content": get_evidence_instructions(),
            "order": 3
        },
        {
            "id": str(uuid.uuid4()),
            "title": "Deliberation",
            "content": get_deliberation_instructions(),
            "order": 999
        }
    ]
    
    return sections


def generate_count_instructions(count: Dict[str, Any], elements: List[Dict[str, Any]], case_type: str) -> List[Dict[str, Any]]:
    """Generate instructions for specific counts"""
    
    instructions = []
    count_name = count.get("name", "Unknown Count")
    
    # Count-specific instruction
    count_instruction = {
        "id": str(uuid.uuid4()),
        "title": f"Count: {count_name}",
        "content": f"You must consider Count {count.get('count_number', 1)}: {count_name}",
        "order": 10 + count.get("count_number", 1)
    }
    instructions.append(count_instruction)
    
    # Element instructions
    for element in count.get("elements", []):
        element_instruction = {
            "id": str(uuid.uuid4()),
            "title": f"Element: {element.get('name', 'Unknown Element')}",
            "content": generate_element_instruction(element, case_type),
            "order": 20 + count.get("count_number", 1)
        }
        instructions.append(element_instruction)
    
    return instructions


def generate_defense_instructions(defenses: List[Dict[str, Any]], case_type: str) -> List[Dict[str, Any]]:
    """Generate instructions for defenses"""
    
    instructions = []
    
    for defense in defenses:
        defense_instruction = {
            "id": str(uuid.uuid4()),
            "title": f"Defense: {defense.get('name', 'Unknown Defense')}",
            "content": generate_defense_instruction(defense, case_type),
            "order": 50 + len(instructions)
        }
        instructions.append(defense_instruction)
    
    return instructions


def generate_expert_instructions() -> List[Dict[str, Any]]:
    """Generate instructions for expert testimony"""
    
    return [
        {
            "id": str(uuid.uuid4()),
            "title": "Expert Testimony",
            "content": """You have heard testimony from expert witnesses. Expert testimony is admissible to help you understand technical or specialized subjects. You may accept or reject expert testimony in whole or in part. Consider the expert's qualifications, the basis for their opinions, and whether their testimony is supported by the evidence.""",
            "order": 40
        }
    ]


def generate_credibility_instructions() -> List[Dict[str, Any]]:
    """Generate instructions for witness credibility"""
    
    return [
        {
            "id": str(uuid.uuid4()),
            "title": "Witness Credibility",
            "content": """You are the sole judges of the credibility of witnesses and the weight to be given their testimony. In evaluating credibility, consider: the witness's demeanor and manner of testifying; the witness's interest in the outcome of the case; the witness's ability to observe, remember, and communicate; the reasonableness of the testimony in light of all the evidence; and any bias, prejudice, or motive to lie.""",
            "order": 45
        }
    ]


def get_general_instructions(case_type: str) -> str:
    """Get general jury instructions"""
    
    if case_type == "criminal":
        return """You have been sworn as jurors in this criminal case. Your duty is to determine the facts and apply the law as I give it to you. You must not be influenced by sympathy, prejudice, or public opinion. You must base your verdict solely on the evidence presented in court and the law as I instruct you."""
    else:
        return """You have been sworn as jurors in this civil case. Your duty is to determine the facts and apply the law as I give it to you. You must not be influenced by sympathy, prejudice, or public opinion. You must base your verdict solely on the evidence presented in court and the law as I instruct you."""


def get_burden_instructions(case_type: str) -> str:
    """Get burden of proof instructions"""
    
    if case_type == "criminal":
        return """The defendant is presumed innocent. The prosecution has the burden of proving the defendant guilty beyond a reasonable doubt. This means the prosecution must prove each element of each charge beyond a reasonable doubt. If you have a reasonable doubt about any element, you must find the defendant not guilty of that charge."""
    else:
        return """The plaintiff has the burden of proving their case by a preponderance of the evidence. This means the plaintiff must prove that it is more likely than not that their claims are true. If the plaintiff fails to meet this burden, you must find for the defendant."""


def get_evidence_instructions() -> str:
    """Get evidence instructions"""
    
    return """Evidence includes testimony of witnesses, exhibits admitted into evidence, and any stipulations. You must consider all the evidence presented. You may not consider evidence that was excluded or stricken from the record. You may not conduct your own investigation or research outside the courtroom."""


def get_deliberation_instructions() -> str:
    """Get deliberation instructions"""
    
    return """You must deliberate together as a jury. Each of you must decide the case for yourself, but you should do so only after discussing the evidence with your fellow jurors. You must not surrender your honest conviction about the weight or effect of evidence solely because of the opinion of your fellow jurors or for the mere purpose of returning a verdict."""


def generate_element_instruction(element: Dict[str, Any], case_type: str) -> str:
    """Generate instruction for a specific element"""
    
    element_name = element.get("name", "Unknown Element")
    element_description = element.get("description", "")
    
    if case_type == "criminal":
        return f"""The prosecution must prove beyond a reasonable doubt that: {element_name}. {element_description} If the prosecution fails to prove this element beyond a reasonable doubt, you must find the defendant not guilty."""
    else:
        return f"""The plaintiff must prove by a preponderance of the evidence that: {element_name}. {element_description} If the plaintiff fails to prove this element, you must find for the defendant on this issue."""


def generate_defense_instruction(defense: Dict[str, Any], case_type: str) -> str:
    """Generate instruction for a specific defense"""
    
    defense_name = defense.get("name", "Unknown Defense")
    defense_description = defense.get("description", "")
    
    if case_type == "criminal":
        return f"""The defendant has raised the defense of {defense_name}. {defense_description} If you find that this defense applies, you must find the defendant not guilty."""
    else:
        return f"""The defendant has raised the defense of {defense_name}. {defense_description} If you find that this defense applies, you must find for the defendant."""


def get_verdict_options(case_type: str, count: Dict[str, Any]) -> List[str]:
    """Get verdict options for a count"""
    
    if case_type == "criminal":
        return ["Guilty", "Not Guilty"]
    else:
        return ["For Plaintiff", "For Defendant"]


def get_special_findings(count: Dict[str, Any], case_type: str) -> List[Dict[str, Any]]:
    """Get special findings for a count"""
    
    special_findings = []
    
    if case_type == "criminal":
        # Add sentencing enhancements if applicable
        if count.get("has_enhancement"):
            special_findings.append({
                "name": "Sentencing Enhancement",
                "options": ["Yes", "No"],
                "required": False
            })
    else:
        # Add damages findings for civil cases
        special_findings.append({
            "name": "Compensatory Damages",
            "type": "amount",
            "required": False
        })
        
        if count.get("allows_punitive"):
            special_findings.append({
                "name": "Punitive Damages",
                "type": "amount",
                "required": False
            })
    
    return special_findings


@celery_app.task(bind=True)
def publish_instructions(self, instruction_id: str) -> Dict[str, Any]:
    """
    Publish instructions to the jury and gate deliberation.
    
    Args:
        instruction_id: The instruction ID to publish
        
    Returns:
        Publication status
    """
    try:
        # This would update the trial state to allow deliberation
        publication_status = {
            "instruction_id": instruction_id,
            "published_at": datetime.utcnow().isoformat(),
            "status": "published",
            "deliberation_gate": "open",
            "jury_notified": True
        }
        
        return publication_status
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


@celery_app.task(bind=True)
def get_instruction_summary(self, case_id: str) -> Dict[str, Any]:
    """
    Get a summary of instructions for a case.
    
    Args:
        case_id: The case ID
        
    Returns:
        Instruction summary
    """
    try:
        # This would query actual instruction data
        summary = {
            "case_id": case_id,
            "total_sections": 0,
            "published": False,
            "last_updated": datetime.utcnow().isoformat(),
            "verdict_form_ready": True
        }
        
        return summary
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc
