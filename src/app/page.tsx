'use client';

import fetchMelody, { Note } from '@/services/melody';
import { CirclePlay } from 'lucide-react';
import React, { useState, useEffect, useMemo } from 'react';
import * as Tone from "tone";
import { ranum } from './lib/utils';

const styles = {
  container: "p-4 bg-amber-900 min-h-screen flex flex-col items-center justify-center",
  button: "bg-amber-800 px-4 py-2 rounded-full font-bold text-amber-200 hover:text-amber-400",
  spinner: "animate-spin border-4 border-amber-500 border-t-transparent rounded-full w-6 h-6 relative z-100",
  responseContainer: "mt-4 text-amber-200 font-bold w-full flex items-center flex-col transition-all duration-1000",
  hidden: "hidden",
  progressWrapper: "flex items-center justify-center flex-col sm:flex-row sm:justify-start",
  notesWrapper: "mt-2 flex flex-wrap justify-center items-center sm:max-w-[60vw]",
  activeNote: "text-amber-500 bg-amber-800 rounded-lg p-2 m-1",
  inactiveNote: "text-amber-600 mx-1",
  animationContainer: "absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden",
  animation: "animate-fade",
  footer: 'fixed bottom-0 left-0 right-0 justify-center items-center flex font-bold text-amber-700 p-8 flex flex-col gap-2',
  inputContainer: 'mb-4 relative flex sm:flex-row flex-col gap-2 items-center justify-center'
};

const Page = () => {
  const [response, setResponse] = useState<Note[] | undefined>();
  const [mood, setMood] = useState('')
  const [noteIndex, setNoteIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [songProgress, setSongProgress] = useState(0);
  const [animations, setAnimations] = useState<{ id: number; x: number; y: number; size: number }[]>([]);
  const buttonDisabled = useMemo(() => !mood, [mood]);

  const cleanState  = () => {
    setSongProgress(0);
    setAnimations([]);
  }

  const handleSend = async () => {
    setLoading(true);
    const response = await fetchMelody(mood);
    setResponse(response);
    setLoading(false);
  };

  const fullDuration = useMemo(() => response?.reduce((acc, { interval }) => acc + interval, 0) || 0, [response]);

  const triggerAnimation = () => {
    const id = Date.now();
    const x = ranum(window.innerWidth);
    const y = ranum(window.innerHeight);
    const size = ranum(100, 20);
    setAnimations((prev) => [...prev, { id, x, y, size }]);
    setTimeout(() => {
      setAnimations((prev) => prev.filter((anim) => anim.id !== id));
    }, 1000);
  };

  const playMelody = async () => {
    if(songProgress > 0) return;
    cleanState()

    await Tone.start();
    const wahwah = [ranum(100), ranum(6), ranum(100, -100)];
    const shift = new Tone.FrequencyShifter(42).toDestination();
    const autoWah = new Tone.AutoWah(...wahwah).toDestination();
    const freeverb = new Tone.Freeverb().toDestination()
    freeverb.dampening = ranum(1000);
    const synth = new Tone.MonoSynth()
    synth.connect(autoWah);
    synth.connect(shift);
    synth.connect(freeverb);
    synth.volume.value = -10;
    let currentTime = Tone.now();

    response?.forEach(({ note, interval }, index) => {
      synth.triggerAttackRelease(note, interval / 1000, currentTime, 0.5);
      setTimeout(() => {
        setNoteIndex(index);
        triggerAnimation();
      }, (currentTime - Tone.now()) * 1000);
      currentTime += interval / 1000;
    });

    const interval = setInterval(() => {
      setSongProgress((prev) => {
        const nextProgress = prev + 100 / fullDuration;
        return nextProgress;
      });
    }, 100);

    setTimeout(() => {
      cleanState();
      synth.dispose();
      clearInterval(interval);
    }, fullDuration);
  };

  useEffect(() => {
    if (response) {
      playMelody();
    }
  }, [response]);

  return (
    <div className={styles.container}>
      <div className={styles.inputContainer}>
        <input
          placeholder='Enter mood...'
          onChange={e => setMood(e.target.value)}
          value={mood}
          className={`outline-none font-bold ${!buttonDisabled && 'border-b-2 border-amber-200'}`}
        />
        <button
          onClick={handleSend}
          disabled={buttonDisabled}
          className={`relative ${styles.button} ${buttonDisabled ? 'opacity-[0.7]' : 'cursor-pointer'}`}
        >
          {loading ? (
            <div className={styles.spinner}></div>
          ) : <span className='relative z-100'>GIVE ME A MELODY</span>}
        </button>
      </div>
      <div className={`${styles.responseContainer} ${response ? 'display' : styles.hidden}`}>
        <div className={styles.progressWrapper}>
          <button onClick={playMelody} className="mr-2 sm:mb-0">
            <CirclePlay size={50} className='cursor-pointer hover:text-amber-400' />
          </button>
          <progress value={songProgress} />
        </div>
        <div className={styles.notesWrapper}>
          {response?.map((note, index) => (
            <span key={index} className={`${index === noteIndex
              ? styles.activeNote
              : styles.inactiveNote
              }`}>
              {`${note.note}`}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.animationContainer}>
        {animations.map(({ id, x, y, size }) => (
          <div
            key={id}
            className={styles.animation}
            style={{
              top: y,
              left: x,
              width: size,
              height: size,
            }}
          />
        ))}
      </div>
      <footer className={styles.footer}>
        <span>Powered By Claude AI</span>
        <a className='text-amber-500 px-5 py-1 bg-amber-800 rounded-lg text-sm' href="https://timmyjr.netlify.app">Portfolio</a>
      </footer>
    </div>
  );
};

export default Page;
