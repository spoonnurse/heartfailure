"use client";

import { useEffect, useMemo, useState } from "react";

type Question = {
  category: string;
  prompt: string;
  options: string[];
  answer: number;
  note: string;
};

const QUESTIONS: Question[] = [
  {
    category: "핵심 정의",
    prompt: "심부전을 가장 정확하게 설명한 것은?",
    options: ["심장이 너무 빨리 뛰는 상태", "심장이 몸 전체로 혈액을 충분히 짜내지 못하는 상태", "폐에만 물이 차는 상태"],
    answer: 1,
    note: "심부전은 원인이 아니라, 심장의 펌프 기능이 제 역할을 못하는 상태예요.",
  },
  {
    category: "좌 vs 우",
    prompt: "좌심부전에서 가장 먼저 연결해야 할 증상은?",
    options: ["호흡곤란과 폐울혈", "하지 부종과 복수", "간비대와 경정맥 팽창"],
    answer: 0,
    note: "좌심실 뒤쪽은 폐예요. 혈액이 뒤로 밀리면 폐울혈과 호흡곤란이 나타나요.",
  },
  {
    category: "좌 vs 우",
    prompt: "우심부전의 대표적인 관찰 소견은?",
    options: ["분홍색 거품 가래", "경정맥 팽창과 하지 부종", "발작성 야간 호흡곤란"],
    answer: 1,
    note: "우심부전은 전신 정맥 울혈! 경정맥 팽창, 하지 부종, 복수, 간종창을 기억하세요.",
  },
  {
    category: "병태생리",
    prompt: "고혈압처럼 심장이 혈액을 내보낼 때 받는 저항은?",
    options: ["전부하", "후부하", "심박수"],
    answer: 1,
    note: "후부하는 ‘나가는 길의 저항’이에요. 고혈압과 판막 협착이 대표적입니다.",
  },
  {
    category: "병태생리",
    prompt: "RAAS가 활성화되어 알도스테론이 증가하면?",
    options: ["나트륨과 물을 더 배출한다", "나트륨과 물을 붙잡아 전부하가 증가한다", "심박수가 즉시 감소한다"],
    answer: 1,
    note: "알도스테론은 나트륨과 수분을 붙잡아요. 혈액량이 늘어 전부하와 부종이 악화될 수 있어요.",
  },
  {
    category: "진단",
    prompt: "심장이 받는 스트레스를 반영해 심부전 진단에 중요한 혈액검사는?",
    options: ["BNP / NT-proBNP", "HbA1c", "Amylase"],
    answer: 0,
    note: "BNP와 NT-proBNP는 심장이 늘어나고 부담을 받을 때 증가하는 중요한 지표예요.",
  },
  {
    category: "약물",
    prompt: "Furosemide(라식스)를 투여할 때 특히 관찰할 것은?",
    options: ["고칼륨혈증만 확인", "I/O, 매일 체중, 저칼륨혈증", "취침 직전 투여"],
    answer: 1,
    note: "강력한 고리이뇨제예요. 아침 투여, I/O와 매일 체중, 칼륨 감소를 확인합니다.",
  },
  {
    category: "약물",
    prompt: "Digoxin 투여 전 맥박이 58회/분이라면?",
    options: ["바로 투여한다", "두 배로 투여한다", "투여를 보류하고 보고한다"],
    answer: 2,
    note: "Digoxin은 심박수를 낮출 수 있어요. 성인 맥박이 60회/분 미만이면 보류하고 보고합니다.",
  },
];

const LETTERS = ["A", "B", "C"];

export default function Home() {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(300);
  const [finished, setFinished] = useState(false);
  const question = QUESTIONS[index];

  useEffect(() => {
    if (!started || finished || seconds <= 0) return;
    const id = window.setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [started, finished, seconds]);

  useEffect(() => {
    if (started && seconds === 0) setFinished(true);
  }, [seconds, started]);

  const time = useMemo(
    () => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`,
    [seconds],
  );

  function choose(option: number) {
    if (selected !== null) return;
    setSelected(option);
    if (option === question.answer) setScore((s) => s + 1);
  }

  function next() {
    if (index === QUESTIONS.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setSelected(null);
  }

  function restart() {
    setStarted(true);
    setIndex(0);
    setScore(0);
    setSelected(null);
    setSeconds(300);
    setFinished(false);
  }

  if (!started) {
    return (
      <main className="shell intro">
        <div className="brand">HEART LAB <span>5</span></div>
        <section className="hero">
          <div className="pulse" aria-hidden="true">♥</div>
          <p className="eyebrow">5분 심부전 복습 게임</p>
          <h1>심장을<br /><em>구해라!</em></h1>
          <p className="lead">8개의 핵심 문제를 풀고<br />심부전 구조대원이 되어보세요.</p>
          <button className="start" onClick={() => setStarted(true)}>게임 시작 <b>→</b></button>
          <div className="rules"><span>⏱ 5분</span><span>◆ 8문제</span><span>⚡ 즉시 해설</span></div>
        </section>
        <p className="source">오늘 수업 자료 · 심부전 핵심편</p>
      </main>
    );
  }

  if (finished) {
    const message = score >= 7 ? "심부전 구조대장!" : score >= 5 ? "훌륭한 구조대원!" : "한 번 더 하면 완벽!";
    return (
      <main className="shell result">
        <div className="brand">HEART LAB <span>5</span></div>
        <section className="result-card">
          <div className="result-heart">♥</div>
          <p className="eyebrow">MISSION COMPLETE</p>
          <h1>{message}</h1>
          <div className="score-ring"><strong>{score}</strong><span>/ {QUESTIONS.length}</span></div>
          <p>{score >= 7 ? "좌·우심부전부터 약물 간호까지 정확히 기억했어요." : "틀린 문제의 한 줄 해설을 떠올리며 다시 도전해 보세요."}</p>
          <button className="start" onClick={restart}>다시 도전 <b>↻</b></button>
        </section>
      </main>
    );
  }

  return (
    <main className="shell game">
      <header>
        <div className="brand">HEART LAB <span>5</span></div>
        <div className={`timer ${seconds < 60 ? "danger" : ""}`}><small>남은 시간</small>{time}</div>
      </header>
      <div className="progress" aria-label={`${index + 1}번째 문제`}>
        <i style={{ width: `${((index + 1) / QUESTIONS.length) * 100}%` }} />
      </div>
      <div className="question-meta">
        <span>ROUND {String(index + 1).padStart(2, "0")} / {String(QUESTIONS.length).padStart(2, "0")}</span>
        <b>{question.category}</b>
      </div>
      <section className="question-card">
        <h1>{question.prompt}</h1>
        <div className="answers">
          {question.options.map((option, i) => {
            const state = selected === null ? "" : i === question.answer ? "correct" : i === selected ? "wrong" : "muted";
            return (
              <button key={option} className={state} onClick={() => choose(i)}>
                <span>{LETTERS[i]}</span>{option}
                {state === "correct" && <b>✓</b>}
                {state === "wrong" && <b>×</b>}
              </button>
            );
          })}
        </div>
        {selected !== null && (
          <div className={`feedback ${selected === question.answer ? "good" : "bad"}`}>
            <strong>{selected === question.answer ? "정답! 심장이 힘을 되찾았어요." : "아쉬워요! 정답을 확인해요."}</strong>
            <p>{question.note}</p>
            <button onClick={next}>{index === QUESTIONS.length - 1 ? "결과 보기" : "다음 문제"} →</button>
          </div>
        )}
      </section>
      <footer><span>현재 점수 <b>{score}</b></span><span>빠르게보다 정확하게!</span></footer>
    </main>
  );
}
