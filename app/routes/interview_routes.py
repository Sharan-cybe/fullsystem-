from fastapi import APIRouter, UploadFile, File, Form
from app.services.interview_service import verify_interview

router = APIRouter()


@router.post("/verify-interview")
async def interview_verification(
    unique_id: str = Form(...),
    webcam_image: UploadFile = File(...)
):

    image_bytes = await webcam_image.read()

    return verify_interview(unique_id, image_bytes)