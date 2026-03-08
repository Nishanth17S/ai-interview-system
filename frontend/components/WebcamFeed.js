"use client";

import { useEffect, useRef, useState } from "react";

export default function WebcamFeed({ interviewFinished }) {

  const videoRef = useRef(null);
  const cameraRef = useRef(null);

  const totalFrames = useRef(0);
  const eyeFrames = useRef(0);
  const smileFrames = useRef(0);

  const lastEmotionCheck = useRef(0);

  const [confidence, setConfidence] = useState(0);
  const [eyeContact, setEyeContact] = useState("Analyzing...");
  const [smileLevel, setSmileLevel] = useState("Analyzing...");
  const [emotion, setEmotion] = useState("Analyzing...");
  const [nervousness, setNervousness] = useState("Low");

  useEffect(() => {

    let faceapi;

    const init = async () => {

      const faceMeshModule = await import("@mediapipe/face_mesh");
      const cameraModule = await import("@mediapipe/camera_utils");

      faceapi = await import("face-api.js");

      await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
      await faceapi.nets.faceExpressionNet.loadFromUri("/models");

      const FaceMesh = faceMeshModule.FaceMesh;
      const Camera = cameraModule.Camera;

      const faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });

      faceMesh.onResults(async (results) => {

        if (!results.multiFaceLandmarks?.length) return;

        const landmarks = results.multiFaceLandmarks[0];

        totalFrames.current++;

        // ------------------------
        // Eye Contact Detection
        // ------------------------

        const leftEye = landmarks[33];
        const rightEye = landmarks[263];

        const eyeDistance = Math.abs(leftEye.x - rightEye.x);

        if (eyeDistance > 0.08) {

          eyeFrames.current++;
          setEyeContact("Good");

        } else {

          setEyeContact("Looking Away");

        }

        // ------------------------
        // Smile Detection
        // ------------------------

        const mouthTop = landmarks[13];
        const mouthBottom = landmarks[14];

        const smile = Math.abs(mouthTop.y - mouthBottom.y);

        if (smile > 0.03) {

          smileFrames.current++;
          setSmileLevel("Smiling");

        } else {

          setSmileLevel("Neutral");

        }

        // ------------------------
        // Confidence Score
        // ------------------------

        const eyeRatio =
          eyeFrames.current / totalFrames.current;

        const smileRatio =
          smileFrames.current / totalFrames.current;

        const confidenceScore = Math.floor(
          eyeRatio * 60 +
          smileRatio * 20 +
          20
        );

        setConfidence(Math.min(confidenceScore, 100));

        // ------------------------
        // Nervousness Estimation
        // ------------------------

        const headMovement =
          Math.abs(landmarks[1].x - landmarks[152].x);

        const nervousScore =
          (1 - eyeRatio) * 40 +
          headMovement * 30 +
          (1 - smileRatio) * 30;

        if (nervousScore < 30)
          setNervousness("Low");
        else if (nervousScore < 60)
          setNervousness("Moderate");
        else
          setNervousness("High");

        // ------------------------
        // Emotion Detection (1 sec)
        // ------------------------

        const now = Date.now();

        if (now - lastEmotionCheck.current > 1000) {

          lastEmotionCheck.current = now;

          if (!videoRef.current ||
              videoRef.current.readyState !== 4)
            return;

          const detection = await faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceExpressions();

          if (detection) {

            const expressions = detection.expressions;

            const dominant =
              Object.keys(expressions).reduce((a,b)=>
                expressions[a] > expressions[b] ? a : b
              );

            setEmotion(dominant);

          }

        }

      });

      cameraRef.current = new Camera(videoRef.current, {

        onFrame: async () => {
          await faceMesh.send({ image: videoRef.current });
        },

        width: 640,
        height: 480

      });

      cameraRef.current.start();

    };

    init();

    return () => {

      if (cameraRef.current)
        cameraRef.current.stop();

      if (videoRef.current?.srcObject) {

        videoRef.current.srcObject
          .getTracks()
          .forEach(track => track.stop());

      }

    };

  }, []);

  // Stop webcam after interview

  useEffect(() => {

    if (interviewFinished && cameraRef.current) {

      cameraRef.current.stop();

      if (videoRef.current?.srcObject) {

        videoRef.current.srcObject
          .getTracks()
          .forEach(track => track.stop());

      }

    }

  }, [interviewFinished]);

  return (

    <div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="rounded-lg"
      />

      <div className="mt-4 text-sm space-y-1">

        <p>Confidence Score: {confidence}%</p>
        <p>Eye Contact: {eyeContact}</p>
        <p>Smile: {smileLevel}</p>
        <p>Emotion: {emotion}</p>
        <p>Nervousness Level: {nervousness}</p>

      </div>

    </div>

  );

}