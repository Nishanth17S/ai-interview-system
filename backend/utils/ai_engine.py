import os
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Groq client
client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

# ---------------------------------
# Generate Interview Question
# ---------------------------------
def generate_question(role: str, difficulty: str):

    prompt = f"""
You are an expert technical interviewer.

Generate ONE interview question.

Role: {role}
Difficulty: {difficulty}

Return only the question.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        question = response.choices[0].message.content.strip()

        return question

    except Exception as e:
        print("❌ Groq Question Generation Error:", e)
        return "Unable to generate question right now."


# ---------------------------------
# Evaluate Candidate Answer
# ---------------------------------
def evaluate_answer(question: str, answer: str):

    prompt = f"""
You are a strict technical interviewer.

Evaluate the candidate answer.

Question:
{question}

Candidate Answer:
{answer}

Return the result exactly in this format:

Score: <number between 0 and 10>
Feedback: <short explanation>
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        evaluation = response.choices[0].message.content.strip()

        # -------------------------------
        # Convert AI output to structured data
        # -------------------------------
        score = None
        feedback = ""

        lines = evaluation.split("\n")

        for line in lines:
            if "Score" in line:
                try:
                    score = int(line.split(":")[1].strip())
                except:
                    score = None

            if "Feedback" in line:
                feedback = line.split(":", 1)[1].strip()

        return {
            "score": score,
            "feedback": feedback
        }

    except Exception as e:
        print("❌ Groq Answer Evaluation Error:", e)

        return {
            "score": None,
            "feedback": "Evaluation failed."
        }