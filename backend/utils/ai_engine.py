import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ---------------------------------------
# QUESTION GENERATION
# ---------------------------------------
def generate_question(role: str, difficulty: str):

    prompt = f"""
    Generate a {difficulty} level interview question for a {role}.
    Only return the question.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content.strip()


# ---------------------------------------
# ANSWER EVALUATION
# ---------------------------------------
def evaluate_answer(question: str, answer: str):

    prompt = f"""
    Evaluate the candidate's answer.

    Question: {question}
    Answer: {answer}

    Give short feedback (3–5 lines).
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content.strip()


# ---------------------------------------
# RULE-BASED REPORT
# ---------------------------------------
def generate_feedback(metrics: dict):

    def avg(lst):
        return round(sum(lst) / len(lst)) if lst else 0

    confidence = avg(metrics.get("confidence", []))
    eye_contact = avg(metrics.get("eye_contact", []))
    smile = avg(metrics.get("smile", []))
    speech = avg(metrics.get("speech_rate", []))

    emotions = metrics.get("emotion", [])
    dominant_emotion = max(set(emotions), key=emotions.count) if emotions else "Neutral"

    strengths, weaknesses, suggestions = [], [], []

    if confidence >= 70:
        strengths.append("Good confidence")
    else:
        weaknesses.append("Low confidence")
        suggestions.append("Practice speaking confidently")

    if eye_contact >= 70:
        strengths.append("Maintained eye contact")
    else:
        weaknesses.append("Poor eye contact")
        suggestions.append("Look at the camera")

    if smile >= 50:
        strengths.append("Friendly expression")
    else:
        weaknesses.append("Low smile frequency")
        suggestions.append("Maintain positive expression")

    if speech >= 70:
        strengths.append("Clear speech")
    else:
        weaknesses.append("Speech clarity needs improvement")
        suggestions.append("Reduce pauses")

    return {
        "confidence": confidence,
        "eye_contact": eye_contact,
        "smile": smile,
        "speech_clarity": speech,
        "emotion": dominant_emotion,
        "strengths": strengths or ["Good attempt overall"],
        "weaknesses": weaknesses or ["Minor improvements needed"],
        "suggestions": suggestions or ["Keep practicing"]
    }


# ---------------------------------------
# LLM-BASED REPORT
# ---------------------------------------
def generate_ai_feedback(report_data):

    prompt = f"""
    You are a professional interview evaluator.

    Metrics:
    Confidence: {report_data['confidence']}%
    Eye Contact: {report_data['eye_contact']}%
    Smile: {report_data['smile']}%
    Speech Clarity: {report_data['speech_clarity']}%
    Emotion: {report_data['emotion']}

    Strengths: {report_data['strengths']}
    Weaknesses: {report_data['weaknesses']}

    Generate a professional summary including:
    - Overall performance
    - Key strengths
    - Areas of improvement
    - Suggestions

    Keep it concise (6–10 lines).
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}]
    )

    return response.choices[0].message.content.strip()