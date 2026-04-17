import { useEffect, useState } from 'react';

interface CountdownProps {
  seconds: number;
  onComplete: () => void;
}

export function useCountdown({ seconds, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsActive(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft, onComplete]);

  const start = () => {
    setTimeLeft(seconds);
    setIsActive(true);
  };

  const stop = () => {
    setIsActive(false);
  };

  const reset = () => {
    setTimeLeft(seconds);
    setIsActive(false);
  };

  return { timeLeft, isActive, start, stop, reset };
}