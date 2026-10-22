import { useEffect, useState } from "react";
import { getChoice, resolveTheme } from "./Theme";

export function useTheme() {
  const [choice, setChoiceState] = useState(getChoice);
  const [resolved, setResolved] = useState(() => resolveTheme(getChoice()));

  useEffect(() => {
    const sync = () => {
      const next = getChoice();
      setChoiceState(next);
      setResolved(resolveTheme(next));
    };
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  return { choice, resolved };
}