from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import uuid

router = APIRouter()

# Pydantic models
class CaseBase(BaseModel):
    title: str
    jurisdiction: Optional[str] = None
    case_type: str  # 'criminal' or 'civil'

class CaseCreate(CaseBase):
    pass

class CaseUpdate(BaseModel):
    title: Optional[str] = None
    jurisdiction: Optional[str] = None
    status: Optional[str] = None

class Case(CaseBase):
    id: str
    org_id: str
    status: str
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True

# Mock data store (replace with database)
cases_db = []

@router.post("/", response_model=Case)
async def create_case(case: CaseCreate):
    """Create a new case"""
    new_case = Case(
        id=str(uuid.uuid4()),
        org_id="demo-org-id",  # TODO: Get from auth context
        title=case.title,
        jurisdiction=case.jurisdiction,
        case_type=case.case_type,
        status="created",
        created_by="demo-user-id",  # TODO: Get from auth context
        created_at=datetime.utcnow(),
    )
    cases_db.append(new_case)
    return new_case

@router.get("/", response_model=List[Case])
async def list_cases(skip: int = 0, limit: int = 100):
    """List all cases"""
    return cases_db[skip : skip + limit]

@router.get("/{case_id}", response_model=Case)
async def get_case(case_id: str):
    """Get a specific case by ID"""
    for case in cases_db:
        if case.id == case_id:
            return case
    raise HTTPException(status_code=404, detail="Case not found")

@router.put("/{case_id}", response_model=Case)
async def update_case(case_id: str, case_update: CaseUpdate):
    """Update a case"""
    for i, case in enumerate(cases_db):
        if case.id == case_id:
            update_data = case_update.dict(exclude_unset=True)
            for field, value in update_data.items():
                setattr(cases_db[i], field, value)
            return cases_db[i]
    raise HTTPException(status_code=404, detail="Case not found")

@router.delete("/{case_id}")
async def delete_case(case_id: str):
    """Delete a case"""
    for i, case in enumerate(cases_db):
        if case.id == case_id:
            del cases_db[i]
            return {"message": "Case deleted successfully"}
    raise HTTPException(status_code=404, detail="Case not found")

@router.post("/{case_id}/start-trial", response_model=Case)
async def start_trial(case_id: str):
    """Start a trial for a case"""
    for i, case in enumerate(cases_db):
        if case.id == case_id:
            if case.status != "pretrial":
                raise HTTPException(status_code=400, detail="Case must be in pretrial status to start trial")
            cases_db[i].status = "trial"
            return cases_db[i]
    raise HTTPException(status_code=404, detail="Case not found")

@router.post("/{case_id}/complete-intake", response_model=Case)
async def complete_intake(case_id: str):
    """Complete case intake and move to pretrial"""
    for i, case in enumerate(cases_db):
        if case.id == case_id:
            if case.status != "created":
                raise HTTPException(status_code=400, detail="Case must be in created status to complete intake")
            cases_db[i].status = "pretrial"
            return cases_db[i]
    raise HTTPException(status_code=404, detail="Case not found")
