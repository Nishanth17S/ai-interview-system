"use client";

import { useEffect, useState } from "react";

export default function AvatarInterviewer({
  interviewer = "male",
  speaking = false,
}) {
  const [blink, setBlink] = useState(false);

  // ✅ Avatar paths
  const basePath =
    interviewer === "male"
      ? "/avatars/male"
      : "/avatars/female";

  const face = `${basePath}/face.png`;
  const eyes = `${basePath}/eyes.png`;
  const mouth = `${basePath}/mouth.png`;

  // ✅ Blinking logic (random natural blink)
  useEffect(() => {
    let blinkTimeout;

    const blinkLoop = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);

        setTimeout(() => {
          setBlink(false);
          blinkLoop(); // repeat
        }, 150); // blink duration
      }, 2000 + Math.random() * 2000); // random interval
    };

    blinkLoop();

    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center">
      {/* Avatar Container */}
      <div className="relative w-44 h-44">

        {/* FACE */}
        {face && (
          <img
            src={face}
            alt="avatar-face"
            className="absolute w-44 h-44 object-cover rounded-xl"
          />
        )}

        {/* EYES (Blink Animation) */}
        {eyes && (
          <img
            src={eyes}
            alt="avatar-eyes"
            className={`absolute w-44 h-44 object-cover rounded-xl transition-opacity duration-100 ${
              blink ? "opacity-0" : "opacity-100"
            }`}
          />
        )}

        {/* MOUTH (Speaking Animation) */}
        {mouth && (
          <img
            src={mouth}
            alt="avatar-mouth"
            className={`absolute w-44 h-44 object-cover rounded-xl transition-transform duration-150 ${
              speaking ? "scale-110" : "scale-100"
            }`}
          />
        )}
      </div>

      {/* Label */}
      <p className="text-sm mt-2 text-gray-400">
        {interviewer === "male" ? "Male Interviewer" : "Female Interviewer"}
      </p>

      {/* Speaking indicator */}
      {speaking && (
        <p className="text-green-400 text-sm mt-1">
          Speaking...
        </p>
      )}
    </div>
  );
}