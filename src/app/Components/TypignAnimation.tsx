import Markdown from "marked-react";
import React, { useEffect, useState, useRef } from "react";

interface TypingAnimationProps {
  text: string;
  speed?: number;
}

const TypingAnimation: React.FC<TypingAnimationProps> = ({ text, speed = 5 }) => {
  const [displayedText, setDisplayedText] = useState<string>("");
  const indexRef = useRef(0);
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!text) return;

    setDisplayedText(""); // Reset displayed text when new text is provided
    indexRef.current = 0; // Reset index when new text is provided

    if (intervalIdRef.current) {
      clearInterval(intervalIdRef.current);
    }

    intervalIdRef.current = setInterval(() => {
      setDisplayedText((prev) => prev + text[indexRef.current]);
      indexRef.current++;
      if (indexRef.current === text.length) {
        if (intervalIdRef.current) {
          clearInterval(intervalIdRef.current);
        }
      }
    }, speed);

    return () => {
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [text, speed]);

  return (
    <Markdown>
     {displayedText}
    </Markdown>
  );
};

export default TypingAnimation;