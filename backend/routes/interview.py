from fastapi import APIRouter
from pydantic import BaseModel
from utils.ai_engine import (
    generate_question,
    evaluate_answer,
    generate_feedback,
    generate_ai_feedback
)

router = APIRouter()


class AnswerInput(BaseModel):
    question: str
    answer: str


class MetricsInput(BaseModel):
    confidence: list = []
    eye_contact: list = []
    smile: list = []
    speech_rate: list = []
    emotion: list = []


@router.post("/question")
def get_question(role: str, difficulty: str):
    return {"question": generate_question(role, difficulty)}


@router.post("/evaluate")
def evaluate(data: AnswerInput):
    return {"evaluation": evaluate_answer(data.question, data.answer)}


@router.post("/feedback")
def get_feedback(data: MetricsInput):

    base_report = generate_feedback(data.dict())
    ai_text = generate_ai_feedback(base_report)

    return {
        "report": base_report,
        "ai_feedback": ai_text
    }