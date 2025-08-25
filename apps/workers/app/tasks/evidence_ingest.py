from celery_app import celery_app
from typing import Dict, Any, List
import boto3
import hashlib
import mimetypes
import os
from PIL import Image
import fitz  # PyMuPDF
import io


@celery_app.task(bind=True)
def ingest_exhibit(self, case_id: str, file_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process and ingest an exhibit file.
    
    Args:
        case_id: The case ID
        file_data: File metadata and content
        
    Returns:
        Processed exhibit data with S3 key, metadata, and foundation requirements
    """
    try:
        # Extract file information
        filename = file_data.get('filename')
        content = file_data.get('content')
        mime_type = file_data.get('mime_type')
        
        # Generate checksum
        checksum = hashlib.sha256(content).hexdigest()
        
        # Determine file type and process accordingly
        if mime_type.startswith('image/'):
            processed_data = process_image(content, filename, mime_type)
        elif mime_type == 'application/pdf':
            processed_data = process_pdf(content, filename)
        elif mime_type.startswith('text/'):
            processed_data = process_text(content, filename, mime_type)
        else:
            processed_data = process_generic(content, filename, mime_type)
        
        # Upload to S3/MinIO
        s3_key = upload_to_s3(case_id, filename, content, mime_type)
        
        # Determine foundation requirements based on file type
        foundation_requirements = get_foundation_requirements(mime_type, processed_data)
        
        result = {
            "exhibit_id": f"exhibit_{case_id}_{checksum[:8]}",
            "case_id": case_id,
            "filename": filename,
            "s3_key": s3_key,
            "mime_type": mime_type,
            "checksum": checksum,
            "size_bytes": len(content),
            "foundation_requirements": foundation_requirements,
            "metadata": processed_data,
            "status": "ingested"
        }
        
        return result
        
    except Exception as exc:
        self.retry(countdown=60, max_retries=3)
        raise exc


def process_image(content: bytes, filename: str, mime_type: str) -> Dict[str, Any]:
    """Process image files for metadata extraction"""
    try:
        image = Image.open(io.BytesIO(content))
        
        return {
            "width": image.width,
            "height": image.height,
            "format": image.format,
            "mode": image.mode,
            "exif_data": extract_exif_data(image) if hasattr(image, '_getexif') else None,
        }
    except Exception as e:
        return {"error": f"Failed to process image: {str(e)}"}


def process_pdf(content: bytes, filename: str) -> Dict[str, Any]:
    """Process PDF files for metadata extraction"""
    try:
        pdf_document = fitz.open(stream=content, filetype="pdf")
        
        metadata = {
            "page_count": len(pdf_document),
            "title": pdf_document.metadata.get('title', ''),
            "author": pdf_document.metadata.get('author', ''),
            "subject": pdf_document.metadata.get('subject', ''),
            "creator": pdf_document.metadata.get('creator', ''),
            "producer": pdf_document.metadata.get('producer', ''),
            "creation_date": pdf_document.metadata.get('creationDate', ''),
            "modification_date": pdf_document.metadata.get('modDate', ''),
        }
        
        pdf_document.close()
        return metadata
    except Exception as e:
        return {"error": f"Failed to process PDF: {str(e)}"}


def process_text(content: bytes, filename: str, mime_type: str) -> Dict[str, Any]:
    """Process text files for metadata extraction"""
    try:
        text_content = content.decode('utf-8', errors='ignore')
        
        return {
            "character_count": len(text_content),
            "word_count": len(text_content.split()),
            "line_count": len(text_content.splitlines()),
            "encoding": "utf-8",
        }
    except Exception as e:
        return {"error": f"Failed to process text: {str(e)}"}


def process_generic(content: bytes, filename: str, mime_type: str) -> Dict[str, Any]:
    """Process generic files"""
    return {
        "size_bytes": len(content),
        "mime_type": mime_type,
    }


def extract_exif_data(image: Image.Image) -> Dict[str, Any]:
    """Extract EXIF data from image (redacted for privacy)"""
    try:
        exif = image._getexif()
        if exif:
            # Only extract non-sensitive EXIF data
            safe_tags = {
                271: 'make',
                272: 'model',
                306: 'datetime',
                296: 'resolution_unit',
                282: 'x_resolution',
                283: 'y_resolution',
            }
            
            safe_data = {}
            for tag_id, tag_name in safe_tags.items():
                if tag_id in exif:
                    safe_data[tag_name] = str(exif[tag_id])
            
            return safe_data
    except:
        pass
    
    return {}


def upload_to_s3(case_id: str, filename: str, content: bytes, mime_type: str) -> str:
    """Upload file to S3/MinIO"""
    try:
        s3_client = boto3.client(
            's3',
            endpoint_url=os.getenv('S3_ENDPOINT_URL', 'http://localhost:9000'),
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID', 'minioadmin'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY', 'minioadmin'),
            region_name=os.getenv('AWS_REGION', 'us-east-1'),
        )
        
        bucket_name = os.getenv('S3_BUCKET', 'courtroom-simulator')
        s3_key = f"cases/{case_id}/exhibits/{filename}"
        
        s3_client.put_object(
            Bucket=bucket_name,
            Key=s3_key,
            Body=content,
            ContentType=mime_type,
            Metadata={
                'case_id': case_id,
                'original_filename': filename,
            }
        )
        
        return s3_key
        
    except Exception as e:
        raise Exception(f"Failed to upload to S3: {str(e)}")


def get_foundation_requirements(mime_type: str, metadata: Dict[str, Any]) -> List[str]:
    """Determine foundation requirements based on file type and metadata"""
    requirements = []
    
    if mime_type.startswith('image/'):
        requirements.extend([
            "authentication",
            "relevance",
            "fair_and_accurate_representation"
        ])
        
        # Add specific requirements for different image types
        if mime_type in ['image/jpeg', 'image/jpg']:
            requirements.append("chain_of_custody")
            
    elif mime_type == 'application/pdf':
        requirements.extend([
            "authentication",
            "relevance",
            "business_records_exception"
        ])
        
    elif mime_type.startswith('text/'):
        requirements.extend([
            "authentication",
            "relevance",
            "hearsay_exception"
        ])
        
    else:
        requirements.extend([
            "authentication",
            "relevance"
        ])
    
    return requirements
