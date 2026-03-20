"use client";

import { useEffect, useState, useRef } from "react";
import WebcamFeed from "@/components/WebcamFeed";
import InterviewAnalytics from "@/components/InterviewAnalytics";
import AvatarInterviewer from "@/components/AvatarInterviewer";

export default function InterviewPage() {

  const [interviewer, setInterviewer] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);

  const [listening, setListening] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);

  const [results, setResults] = useState([]);

  const [report, setReport] = useState(null);

  const recognitionRef = useRef(null);

  const [speaking, setSpeaking] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(0);

  // 🔥 Metrics storage
  const [metrics, setMetrics] = useState({
    timestamps: [],
    confidence: [],
    eyeContact: [],
    smile: [],
    speechRate: [],
    emotion: []
  });

  // -----------------------------
  // AI SPEECH + LIP SYNC
  // -----------------------------
  const speakQuestion = (text) => {

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();

    let selectedVoice;

    if (interviewer === "male") {
      selectedVoice = voices.find(v =>
        v.name.includes("Male") || v.name.includes("David")
      );
    } else {
      selectedVoice = voices.find(v =>
        v.name.includes("Female") || v.name.includes("Zira")
      );
    }

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.rate = 0.9;

    setSpeaking(true);

    const interval = setInterval(() => {
      setMouthOpen(Math.random());
    }, 120);

    utterance.onend = () => {
      setSpeaking(false);
      setMouthOpen(0);
      clearInterval(interval);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  // -----------------------------
  // SPEECH RECOGNITION
  // -----------------------------
  useEffect(() => {

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;

    let finalTranscript = "";

    recognition.onresult = (event) => {

      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {

        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      setAnswer(finalTranscript + interimTranscript);
    };

    recognitionRef.current = recognition;

  }, []);

  const startListening = () => {
    recognitionRef.current.start();
    setListening(true);
  };

  const stopListening = () => {
    recognitionRef.current.stop();
    setListening(false);
  };

  // -----------------------------
  // FETCH QUESTION
  // -----------------------------
  const fetchQuestion = async () => {

    const res = await fetch(
      "http://127.0.0.1:8000/interview/question?role=Software Engineer&difficulty=medium",
      { method: "POST" }
    );

    const data = await res.json();

    if (data.question) {
      setQuestion(data.question);
      setTimeout(() => speakQuestion(data.question), 400);
    }
  };

  useEffect(() => {
    if (interviewer && questionCount) {
      fetchQuestion();
    }
  }, [interviewer, questionCount]);

  // -----------------------------
  // EVALUATE ANSWER
  // -----------------------------
  const evaluateAnswer = async () => {

    const res = await fetch(
      "http://127.0.0.1:8000/interview/evaluate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          question,
          answer
        })
      }
    );

    const data = await res.json();

    setResults(prev => [...prev, data.evaluation || "No feedback"]);
  };

  // -----------------------------
  // GENERATE FINAL REPORT
  // -----------------------------
  const generateReport = async () => {

    try {

      const payload = {
        confidence: metrics.confidence,
        eye_contact: metrics.eyeContact,
        smile: metrics.smile,
        speech_rate: metrics.speechRate,
        emotion: metrics.emotion
      };

      const res = await fetch("http://127.0.0.1:8000/interview/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      setReport(data.report);

    } catch (err) {
      console.error("Report error:", err);
    }
  };

  // -----------------------------
  // SUBMIT ANSWER
  // -----------------------------
  const handleSubmit = async () => {

    await evaluateAnswer();

    if (currentQuestionIndex < questionCount) {

      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswer("");
      fetchQuestion();

    } else {

      recognitionRef.current?.stop();
      window.speechSynthesis.cancel();

      await generateReport();

      setInterviewFinished(true);
    }
  };

  // -----------------------------
  // METRICS COLLECTION
  // -----------------------------
  useEffect(() => {

    if (interviewFinished) return;

    const interval = setInterval(() => {

      const time = new Date().toLocaleTimeString();

      const words = answer.split(" ").length;

      const speechRate = words * 6;

      setMetrics(prev => ({
        timestamps: [...prev.timestamps, time],
        confidence: [...prev.confidence, Math.random() * 100],
        eyeContact: [...prev.eyeContact, Math.random() * 100],
        smile: [...prev.smile, Math.random() * 100],
        speechRate: [...prev.speechRate, speechRate],
        emotion: [...prev.emotion, "neutral"]
      }));

    }, 4000);

    return () => clearInterval(interval);

  }, [answer, interviewFinished]);

  // -----------------------------
  // FINAL SCREEN
  // -----------------------------
  if (interviewFinished) {

    return (

      <div className="min-h-screen bg-black text-white p-10">

        <h1 className="text-4xl font-bold mb-6">
          Interview Completed
        </h1>

        {/* AI REPORT */}
        {report && (
          <div className="bg-zinc-900 p-6 rounded-lg mb-6">

            <h2 className="text-xl font-bold mb-4">
              AI Interview Report
            </h2>

            <p>Confidence: {report.confidence}%</p>
            <p>Eye Contact: {report.eye_contact}%</p>
            <p>Smile: {report.smile}%</p>
            <p>Speech Clarity: {report.speech_clarity}%</p>
            <p>Emotion: {report.emotion}</p>

            <div className="mt-4">
              <h3 className="font-semibold">Strengths</h3>
              <ul>
                {report.strengths.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Weaknesses</h3>
              <ul>
                {report.weaknesses.map((w, i) => (
                  <li key={i}>• {w}</li>
                ))}
              </ul>
            </div>

            <div className="mt-4">
              <h3 className="font-semibold">Suggestions</h3>
              <ul>
                {report.suggestions.map((s, i) => (
                  <li key={i}>• {s}</li>
                ))}
              </ul>
            </div>

          </div>
        )}

        {/* ANSWER FEEDBACK */}
        {results.map((r, i) => (
          <div key={i} className="bg-zinc-900 p-6 rounded-lg mb-4">
            <p className="text-gray-300 whitespace-pre-wrap">
              {r}
            </p>
          </div>
        ))}

        {/* GRAPH */}
        <InterviewAnalytics metrics={metrics} />

      </div>
    );
  }

  // -----------------------------
  // SELECT INTERVIEWER
  // -----------------------------
  if (!interviewer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-4xl mb-6">Choose Interviewer</h1>

        <button onClick={() => setInterviewer("male")}>
          👨 Male
        </button>

        <button onClick={() => setInterviewer("female")}>
          👩 Female
        </button>
      </div>
    );
  }

  // -----------------------------
  // SELECT QUESTION COUNT
  // -----------------------------
  if (!questionCount) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
        <h1 className="text-3xl mb-4">Number of Questions</h1>

        {[3,4,5,6,7,8,9,10].map(n => (
          <button key={n} onClick={() => setQuestionCount(n)}>
            {n}
          </button>
        ))}
      </div>
    );
  }

  // -----------------------------
  // MAIN INTERVIEW UI
  // -----------------------------
  return (

    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-3xl text-center mb-4">
        AI Mock Interview
      </h1>

      <div className="grid grid-cols-2 gap-8">

        <div>
          <AvatarInterviewer
            interviewer={interviewer}
            speaking={speaking}
          />

          <p className="mt-4">{question}</p>
        </div>

        <WebcamFeed interviewFinished={interviewFinished} />

      </div>

      <textarea
        className="w-full mt-6 bg-gray-800 p-4"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
      />

      <div className="flex gap-4 mt-4">
        <button onClick={startListening}>Start</button>
        <button onClick={stopListening}>Stop</button>
        <button onClick={handleSubmit}>Submit</button>
      </div>

      {listening && <p>🎤 Listening...</p>}

    </div>
  );
}