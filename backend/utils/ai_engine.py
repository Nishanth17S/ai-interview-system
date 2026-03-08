import os
from groq import Groq

# Initialize Groq client
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def generate_interview_question(role: str, difficulty: str):
    """
    Generate a single interview question based on role and difficulty
    """

    prompt = f"""
You are an expert technical interviewer.

Generate ONE {difficulty} level interview question for a {role} candidate.

Rules:
- Return only the question
- Do not include explanations
- Do not include numbering
"""

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )

    question = completion.choices[0].message.content.strip()

    return question


def evaluate_answer(question: str, answer: str):
    """
    Evaluate candidate answer using AI
    """

    prompt = f"""
You are an AI technical interviewer.

Evaluate the candidate's answer.

Question:
{question}

Candidate Answer:
{answer}

Provide feedback in this format:

Score: (0-10)
Strengths:
Weaknesses:
Suggestions for improvement:
"""

    completion = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )

    evaluation = completion.choices[0].message.content.strip()

    return evaluation