from fastapi import APIRouter
from utils.ai_engine import generate_question as ai_generate_question
from utils.ai_engine import evaluate_answer

router = APIRouter(
    prefix="/interview",
    tags=["Interview"]
)

# ---------------------------------
# Generate Interview Question
# ---------------------------------
@router.post("/question")
def generate_question(role: str, difficulty: str):

    question = ai_generate_question(role, difficulty)

    return {
        "role": role,
        "difficulty": difficulty,
        "question": question
    }


# ---------------------------------
# Evaluate Candidate Answer
# ---------------------------------
@router.post("/evaluate")
def evaluate(question: str, answer: str):

    result = evaluate_answer(question, answer)

    return {
        "score": result["score"],
        "feedback": result["feedback"]
    }