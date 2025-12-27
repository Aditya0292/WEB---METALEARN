import { useState, useEffect } from 'react';

export default function Typewriter({ phrases, typeSpeed = 100, deleteSpeed = 50, pauseTime = 2000 }) {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    // Blinking cursor effect
    useEffect(() => {
        const timeout2 = setInterval(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearInterval(timeout2);
    }, []);

    // Typing logic
    useEffect(() => {
        if (index >= phrases.length) {
            setIndex(0);
            return;
        }

        if (subIndex === phrases[index].length + 1 && !reverse) {
            const timeout = setTimeout(() => {
                setReverse(true);
            }, pauseTime);
            return () => clearTimeout(timeout);
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % phrases.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? deleteSpeed : typeSpeed);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, phrases, typeSpeed, deleteSpeed, pauseTime]);

    return (
        <span className="inline-block min-w-[2ch]">
            {phrases[index].substring(0, subIndex)}
            <span className={`inline-block w-[3px] h-[1em] ml-1 align-middle bg-[var(--accent)] ${blink ? 'opacity-100' : 'opacity-0'}`} />
        </span>
    );
}
