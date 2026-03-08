from fastapi import APIRouter
from pydantic import BaseModel
from utils.ai_engine import generate_interview_question, evaluate_answer

router = APIRouter()


class AnswerRequest(BaseModel):
    question: str
    answer: str


@router.post("/question")
def get_question(role: str, difficulty: str):

    question = generate_interview_question(role, difficulty)

    return {"question": question}


@router.post("/evaluate")
def evaluate_candidate_answer(data: AnswerRequest):

    evaluation = evaluate_answer(data.question, data.answer)

    return {"evaluation": evaluation}