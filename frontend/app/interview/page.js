"use client";

import { useEffect, useRef, useState } from "react";
import WebcamFeed from "@/components/WebcamFeed";
import InterviewAnalytics from "@/components/InterviewAnalytics";

export default function InterviewPage() {

  const [interviewer, setInterviewer] = useState(null);
  const [questionCount, setQuestionCount] = useState(null);

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);

  const [listening, setListening] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);

  const [results, setResults] = useState([]);

  const recognitionRef = useRef(null);

  const [metrics, setMetrics] = useState({
    timestamps: [],
    confidence: [],
    eyeContact: [],
    smile: [],
    speechRate: []
  });

  // -----------------------------
  // AI TEXT TO SPEECH
  // -----------------------------

  const speakQuestion = (text) => {

    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();

    let selectedVoice;

    if (interviewer === "male") {

      selectedVoice = voices.find(v =>
        v.name.includes("David") ||
        v.name.includes("Male") ||
        v.name.includes("Google US")
      );

    } else {

      selectedVoice = voices.find(v =>
        v.name.includes("Zira") ||
        v.name.includes("Female") ||
        v.name.includes("Google UK")
      );

    }

    if (selectedVoice) utterance.voice = selectedVoice;

    utterance.rate = 0.9;

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

      setTimeout(() => {
        speakQuestion(data.question);
      }, 500);

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

  const handleSubmit = async () => {

    await evaluateAnswer();

    if (currentQuestionIndex < questionCount) {

      setCurrentQuestionIndex(currentQuestionIndex + 1);

      setAnswer("");

      fetchQuestion();

    } else {

      recognitionRef.current?.stop();

      window.speechSynthesis.cancel();

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
        confidence: [...prev.confidence, Math.random()*100],
        eyeContact: [...prev.eyeContact, Math.random()*100],
        smile: [...prev.smile, Math.random()*100],
        speechRate: [...prev.speechRate, speechRate]

      }));

    }, 4000);

    return () => clearInterval(interval);

  }, [answer, interviewFinished]);

  // -----------------------------
  // FINAL REPORT SCREEN
  // -----------------------------

  if (interviewFinished) {

    return (

      <div className="min-h-screen bg-black text-white p-10">

        <h1 className="text-4xl font-bold mb-6">
          Interview Completed
        </h1>

        {results.map((r, i) => (

          <div
            key={i}
            className="bg-zinc-900 p-6 rounded-lg mb-4"
          >
            <p className="text-gray-300 whitespace-pre-wrap">
              {r}
            </p>
          </div>

        ))}

        <InterviewAnalytics metrics={metrics} />

      </div>

    );

  }

  // -----------------------------
  // SELECT INTERVIEWER
  // -----------------------------

  if (!interviewer) {

    return (

      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

        <h1 className="text-4xl mb-10 font-bold">
          Choose AI Interviewer
        </h1>

        <div className="flex gap-10">

          <button
            onClick={() => setInterviewer("male")}
            className="bg-zinc-800 p-10 rounded-xl"
          >
            👨 Male Interviewer
          </button>

          <button
            onClick={() => setInterviewer("female")}
            className="bg-zinc-800 p-10 rounded-xl"
          >
            👩 Female Interviewer
          </button>

        </div>

      </div>

    );

  }

  // -----------------------------
  // SELECT QUESTION COUNT
  // -----------------------------

  if (!questionCount) {

    return (

      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">

        <h1 className="text-3xl mb-8 font-bold">
          Select Number of Questions
        </h1>

        <div className="flex gap-4">

          {[3,4,5,6,7,8,9,10].map(n => (

            <button
              key={n}
              onClick={() => setQuestionCount(n)}
              className="bg-blue-600 px-6 py-3 rounded-lg"
            >
              {n}
            </button>

          ))}

        </div>

      </div>

    );

  }

  // -----------------------------
  // MAIN INTERVIEW UI
  // -----------------------------

  return (

    <div className="min-h-screen bg-black text-white p-8">

      <h1 className="text-3xl text-center mb-4 font-bold">
        AI Mock Interview
      </h1>

      <p className="text-center text-gray-400 mb-8">
        Question {currentQuestionIndex} / {questionCount}
      </p>

      <div className="grid grid-cols-2 gap-8">

        {/* AI Interviewer */}

        <div className="bg-zinc-900 p-6 rounded-xl text-center">

          <h2 className="text-xl mb-4">AI Interviewer</h2>

          <img
            src={
              interviewer === "male"
                ? "/avatars/male.png"
                : "/avatars/female.png"
            }
            className="w-40 mx-auto mb-6 rounded-full"
          />

          <div className="bg-zinc-800 p-6 rounded-lg">

            {question}

          </div>

        </div>

        {/* Candidate Webcam */}

        <div className="bg-zinc-900 p-6 rounded-xl">

          <h2 className="text-xl mb-4">Candidate</h2>

          <WebcamFeed interviewFinished={interviewFinished} />

        </div>

      </div>

      {/* Answer Section */}

      <div className="mt-8 bg-zinc-900 p-6 rounded-xl">

        <textarea
          className="w-full bg-zinc-800 p-4 rounded-lg"
          rows="5"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        <div className="flex gap-4 mt-4">

          <button
            onClick={startListening}
            className="bg-green-600 px-6 py-2 rounded-lg"
          >
            🎤 Start Speaking
          </button>

          <button
            onClick={stopListening}
            className="bg-red-600 px-6 py-2 rounded-lg"
          >
            Stop
          </button>

          <button
            onClick={handleSubmit}
            className="bg-blue-600 px-6 py-2 rounded-lg"
          >
            Submit
          </button>

        </div>

        {listening && (
          <p className="text-green-400 mt-2">
            🎤 Listening...
          </p>
        )}

      </div>

    </div>

  );

}