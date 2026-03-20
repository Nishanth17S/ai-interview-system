"use client";

import { useEffect, useState } from "react";

export default function AvatarInterviewer({ interviewer, speaking, mouthOpen }) {

  const [avatar, setAvatar] = useState(null);
  const [blink, setBlink] = useState(false);

  useEffect(() => {

    if (interviewer === "male") {
      setAvatar("/avatars/male.png");
    } 
    else if (interviewer === "female") {
      setAvatar("/avatars/female.png");
    }

  }, [interviewer]);

  // blinking animation
  useEffect(() => {

    const interval = setInterval(() => {

      setBlink(true);

      setTimeout(() => {
        setBlink(false);
      }, 120);

    }, 3500);

    return () => clearInterval(interval);

  }, []);

  return (

    <div className="flex flex-col items-center">

      {avatar && (

        <div className="relative">

          <img
            src={avatar}
            alt="AI Interviewer"
            className={`w-44 rounded-full transition-transform duration-200 ${
              speaking ? "scale-105" : "scale-100"
            } ${blink ? "scale-y-[0.9]" : ""}`}
          />

          {/* mouth animation */}
          {speaking && (
            <div
              className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black rounded-full"
              style={{
                width: "20px",
                height: `${6 + mouthOpen * 20}px`,
                transition: "height 0.1s"
              }}
            />
          )}

        </div>

      )}

      {speaking && (
        <p className="text-green-400 mt-2 text-sm animate-pulse">
          Speaking...
        </p>
      )}

    </div>

  );

}