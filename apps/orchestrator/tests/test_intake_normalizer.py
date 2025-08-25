import pytest
from unittest.mock import patch
from app.tasks.intake_normalizer import (
    normalize_intake,
    parse_counts,
    parse_parties,
    parse_witnesses,
    get_criminal_elements,
    get_civil_elements
)


class TestIntakeNormalizer:
    
    def test_parse_counts_criminal(self):
        """Test parsing criminal counts from summary"""
        summary = "The defendant stole a laptop and assaulted the victim"
        case_type = "criminal"
        
        counts = parse_counts(summary, case_type)
        
        assert len(counts) >= 1
        assert any(count["label"] == "Theft" for count in counts)
        assert any(count["label"] == "Assault" for count in counts)
        
        for count in counts:
            assert "label" in count
            assert "description" in count
            assert "burden" in count
            assert count["burden"] == "BRD"
    
    def test_parse_counts_civil(self):
        """Test parsing civil counts from summary"""
        summary = "The defendant breached the contract and was negligent"
        case_type = "civil"
        
        counts = parse_counts(summary, case_type)
        
        assert len(counts) >= 1
        assert any(count["label"] == "Breach of Contract" for count in counts)
        assert any(count["label"] == "Negligence" for count in counts)
        
        for count in counts:
            assert "label" in count
            assert "description" in count
            assert "burden" in count
            assert count["burden"] == "preponderance"
    
    def test_parse_parties_criminal(self):
        """Test parsing parties for criminal case"""
        summary = "John Smith was charged with theft. The prosecutor is Jane Doe."
        case_type = "criminal"
        
        parties = parse_parties(summary, case_type)
        
        assert len(parties) >= 1
        assert any(party["side"] == "prosecution" for party in parties)
        assert any(party["side"] == "defense" for party in parties)
    
    def test_parse_parties_civil(self):
        """Test parsing parties for civil case"""
        summary = "Mary Johnson sued Bob Wilson for breach of contract."
        case_type = "civil"
        
        parties = parse_parties(summary, case_type)
        
        assert len(parties) >= 1
        assert any(party["side"] == "plaintiff" for party in parties)
        assert any(party["side"] == "defendant" for party in parties)
    
    def test_parse_witnesses(self):
        """Test parsing witnesses from summary"""
        summary = "Sarah Wilson testified that she saw the defendant. Michael Chen also witnessed the incident."
        
        witnesses = parse_witnesses(summary)
        
        assert len(witnesses) >= 1
        for witness in witnesses:
            assert "name" in witness
            assert "role" in witness
            assert "credibility_notes" in witness
    
    def test_get_criminal_elements(self):
        """Test getting criminal elements"""
        elements = get_criminal_elements("Theft")
        
        assert "elements" in elements
        assert isinstance(elements["elements"], list)
        assert len(elements["elements"]) > 0
    
    def test_get_civil_elements(self):
        """Test getting civil elements"""
        elements = get_civil_elements("Breach of Contract")
        
        assert "elements" in elements
        assert isinstance(elements["elements"], list)
        assert len(elements["elements"]) > 0
    
    @patch('app.tasks.intake_normalizer.parse_counts')
    @patch('app.tasks.intake_normalizer.parse_parties')
    @patch('app.tasks.intake_normalizer.parse_witnesses')
    def test_normalize_intake_integration(self, mock_witnesses, mock_parties, mock_counts):
        """Test full intake normalization integration"""
        mock_counts.return_value = [{"label": "Test", "description": "Test", "burden": "BRD"}]
        mock_parties.return_value = [{"name": "Test", "side": "prosecution", "role": "prosecutor"}]
        mock_witnesses.return_value = [{"name": "Test", "role": "witness", "credibility_notes": "Test"}]
        
        case_data = {
            "id": "test-case",
            "summary": "Test case summary",
            "case_type": "criminal",
            "exhibits": []
        }
        
        result = normalize_intake(case_data)
        
        assert result["case_id"] == "test-case"
        assert result["status"] == "normalized"
        assert "normalized_at" in result
        assert "counts" in result
        assert "parties" in result
        assert "witnesses" in result
        assert "exhibits" in result
