"use client";

import { useMemo, useState } from "react";

type Side = "left" | "right";
type Stage = "intro" | "flow" | "sort" | "lab" | "case" | "result";

const SYMPTOMS = [
  { id: "dyspnea", label: "호흡곤란", side: "left" as Side, icon: "◌" },
  { id: "pink", label: "분홍색 거품 가래", side: "left" as Side, icon: "≈" },
  { id: "pnd", label: "돌발야간호흡곤란", side: "left" as Side, icon: "☾" },
  { id: "jvd", label: "경정맥 팽창", side: "right" as Side, icon: "↟" },
  { id: "ascites", label: "복수·간종창", side: "right" as Side, icon: "◉" },
  { id: "edema", label: "하지부종", side: "right" as Side, icon: "↓" },
];

const CASE_STEPS = [
  {
    title: "22:10 · 응급실 도착",
    text: "68세 환자. 잠을 자다 숨이 차서 깼고, 앉아 있어야 숨쉬기 편하다고 말합니다. 분홍색 거품 가래와 수포음이 들립니다.",
    question: "가장 먼저 의심할 상황은?",
    options: ["우심부전으로 인한 복수", "좌심부전으로 인한 폐부종", "단순 탈수"],
    answer: 1,
    feedback: "좌심실 뒤쪽의 폐정맥에 혈액이 정체되어 폐포 안으로 수분이 누출된 급성 폐부종 양상입니다.",
  },
  {
    title: "22:11 · 상태 확인",
    text: "SpO₂ 86%, RR 30회/분, 청색증이 보입니다. 환자는 불안해하며 누우면 더 힘들어합니다.",
    question: "가장 적절한 즉시 간호는?",
    options: ["평평하게 눕히기", "고좌위·산소 공급", "물을 많이 마시게 하기"],
    answer: 1,
    feedback: "고좌위는 정맥환류와 폐울혈 부담을 줄이고, 산소 공급은 저산소증을 완화합니다.",
  },
  {
    title: "22:14 · 처방 확인",
    text: "폐울혈과 호흡곤란을 빠르게 줄이기 위한 약물이 처방되었습니다.",
    question: "약물과 핵심 관찰을 연결하세요.",
    options: ["Furosemide — I/O·체중·K⁺", "Digoxin — 수분섭취 증가", "ACEi — 마른기침과 무관"],
    answer: 0,
    feedback: "고리이뇨제는 강력하게 체액을 배출합니다. I/O, 매일 체중, 저칼륨혈증을 관찰합니다.",
  },
];

export default function Home() {
  const [stage, setStage] = useState<Stage>("intro");
  const [flowSide, setFlowSide] = useState<Side | null>(null);
  const [selectedSymptom, setSelectedSymptom] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Record<string, Side>>({});
  const [preload, setPreload] = useState(45);
  const [afterload, setAfterload] = useState(45);
  const [caseStep, setCaseStep] = useState(0);
  const [caseChoice, setCaseChoice] = useState<number | null>(null);
  const [caseScore, setCaseScore] = useState(0);

  const sortCorrect = Object.entries(placed).filter(([id, side]) => SYMPTOMS.find((s) => s.id === id)?.side === side).length;
  const lab = useMemo(() => {
    const strain = Math.round((preload + afterload) / 2);
    const output = Math.max(18, Math.round(100 - strain * 0.7));
    return { strain, output, congestion: Math.round(preload * 0.9), resistance: Math.round(afterload * 0.9) };
  }, [preload, afterload]);

  function place(side: Side) {
    if (!selectedSymptom) return;
    setPlaced((p) => ({ ...p, [selectedSymptom]: side }));
    setSelectedSymptom(null);
  }

  function treat(type: "diuretic" | "vasodilator") {
    if (type === "diuretic") setPreload((v) => Math.max(10, v - 25));
    else setAfterload((v) => Math.max(10, v - 25));
  }

  function answerCase(i: number) {
    if (caseChoice !== null) return;
    setCaseChoice(i);
    if (i === CASE_STEPS[caseStep].answer) setCaseScore((s) => s + 1);
  }

  function nextCase() {
    if (caseStep === CASE_STEPS.length - 1) return setStage("result");
    setCaseStep((s) => s + 1);
    setCaseChoice(null);
  }

  function restart() {
    setStage("intro"); setFlowSide(null); setSelectedSymptom(null); setPlaced({});
    setPreload(45); setAfterload(45); setCaseStep(0); setCaseChoice(null); setCaseScore(0);
  }

  return (
    <main className={`app stage-${stage}`}>
      <header className="topbar">
        <div className="logo">HEART LAB <b>V2</b></div>
        <div className="steps" aria-label="게임 진행 단계">
          {["flow", "sort", "lab", "case"].map((s, i) => <i key={s} className={stage === s || ["sort","lab","case","result"].indexOf(stage) > i - 1 ? "on" : ""}>{i + 1}</i>)}
        </div>
        <span className="five">약 5분</span>
      </header>

      {stage === "intro" && (
        <section className="intro">
          <div className="ekg" aria-hidden="true"><span /><span /><span /></div>
          <p className="kicker">심부전 병태생리 인터랙티브 랩</p>
          <h1>읽지 말고,<br /><em>심장을 움직여보세요.</em></h1>
          <p className="lede">혈액이 어디에 쌓이는지 직접 관찰하고<br />전·후부하를 조절해 환자를 구조하세요.</p>
          <button className="primary" onClick={() => setStage("flow")}>실험 시작하기 <b>→</b></button>
          <div className="mission-strip"><span>혈류 실험</span><span>증상 배치</span><span>부하 조절</span><span>응급 구조</span></div>
        </section>
      )}

      {stage === "flow" && (
        <section className="screen flow-screen">
          <div className="screen-head"><div><small>MISSION 01</small><h1>펌프 한쪽을 멈춰보세요</h1></div><p>심실을 눌러 혈액이 어디에 정체되는지 관찰하세요.</p></div>
          <div className={`circulation anatomy ${flowSide ? `fail-${flowSide}` : ""}`}>
            <div className="organ lungs"><b>폐</b><div className="lung-shape" aria-hidden="true"><i/><i/></div><p>{flowSide === "left" ? "폐정맥 울혈 → 폐포 수분 누출" : "혈액에 산소를 공급"}</p></div>
            <div className="flow-path pulmonary-path"><span>우심실에서 폐로 ↑</span><div className="vessel pulmonary"><i/><i/><i/><i/></div></div>
            <div className="heart" aria-label="심장">
              <button onClick={() => setFlowSide("right")} className={flowSide === "right" ? "failed" : ""}><small>우심실</small><b>RV</b><span>폐로 보냄</span></button>
              <button onClick={() => setFlowSide("left")} className={flowSide === "left" ? "failed" : ""}><small>좌심실</small><b>LV</b><span>전신으로 보냄</span></button>
            </div>
            <div className="flow-path systemic-path"><div className="vessel systemic"><i/><i/><i/><i/></div><span>좌심실에서 전신으로 ↓</span></div>
            <div className="organ body"><b>전신 조직</b><div className="person" aria-hidden="true">♙</div><p>{flowSide === "right" ? "전신정맥 울혈 → 부종·복수·JVD" : "산소를 조직에 전달"}</p></div>
            <div className="return-label">전신정맥 → 우심실로 돌아옴</div>
            <div className="loop-note">순환은 한 방향으로 이어집니다</div>
          </div>
          <div className="observation">
            {!flowSide ? <p>심실을 하나 선택해 고장 내보세요.</p> :
              flowSide === "left" ? <><strong>좌심실 고장: 좌심실로 들어오기 전 단계인 폐에 혈액이 쌓입니다.</strong><p>호흡곤란 · 수포음 · 분홍색 거품 가래 · 돌발야간호흡곤란</p></> :
              <><strong>우심실 고장: 우심실로 돌아오기 전 단계인 전신 정맥에 혈액이 쌓입니다.</strong><p>경정맥 팽창 · 간종창 · 복수 · 하지부종</p></>}
          </div>
          <button className="next" disabled={!flowSide} onClick={() => setStage("sort")}>관찰 완료 →</button>
        </section>
      )}

      {stage === "sort" && (
        <section className="screen">
          <div className="screen-head"><div><small>MISSION 02</small><h1>증상을 울혈 위치에 배치하세요</h1></div><p>카드를 선택한 뒤 좌·우 영역을 누르세요.</p></div>
          <div className="symptom-tray">
            {SYMPTOMS.map((s) => <button key={s.id} onClick={() => setSelectedSymptom(s.id)} className={`${selectedSymptom === s.id ? "selected" : ""} ${placed[s.id] ? "placed" : ""}`}><b>{s.icon}</b>{s.label}</button>)}
          </div>
          <div className="drop-grid">
            {(["left","right"] as Side[]).map((side) => (
              <button key={side} className={`drop-zone ${side}`} onClick={() => place(side)}>
                <span>{side === "left" ? "좌심부전 · 폐울혈" : "우심부전 · 전신울혈"}</span>
                <div>{SYMPTOMS.filter((s) => placed[s.id] === side).map((s) => <i key={s.id} className={s.side === side ? "right" : "wrong"}>{s.label}{s.side === side ? " ✓" : " ↺"}</i>)}</div>
                <small>{selectedSymptom ? "여기에 놓기" : "카드를 먼저 선택하세요"}</small>
              </button>
            ))}
          </div>
          <div className="scoreline"><b>{sortCorrect}</b> / 6 정확히 연결</div>
          <button className="next" disabled={Object.keys(placed).length < 6} onClick={() => setStage("lab")}>부하 실험실로 →</button>
        </section>
      )}

      {stage === "lab" && (
        <section className="screen lab-screen">
          <div className="screen-head"><div><small>MISSION 03</small><h1>심장의 짐을 직접 조절하세요</h1></div><p>슬라이더와 치료 버튼이 심박출량에 미치는 영향을 관찰하세요.</p></div>
          <div className="lab-grid">
            <div className="controls">
              <label><span><b>전부하</b> · 들어오는 혈액량</span><output>{preload}</output><input type="range" min="10" max="100" value={preload} onChange={(e) => setPreload(+e.target.value)} /></label>
              <label><span><b>후부하</b> · 내보낼 때 저항</span><output>{afterload}</output><input type="range" min="10" max="100" value={afterload} onChange={(e) => setAfterload(+e.target.value)} /></label>
              <div className="treatments"><button onClick={() => treat("diuretic")}>이뇨제 투여<small>체액↓ → 전부하↓</small></button><button onClick={() => treat("vasodilator")}>혈관확장제 투여<small>저항↓ → 후부하↓</small></button></div>
            </div>
            <div className="monitor">
              <div className={`beating-heart ${lab.strain > 65 ? "strained" : ""}`}>♥</div>
              <div className="meter"><span>심장 부담</span><i><b style={{width:`${lab.strain}%`}} /></i><output>{lab.strain}%</output></div>
              <div className="readouts"><div><small>심박출 효율</small><b>{lab.output}%</b></div><div><small>울혈 위험</small><b>{lab.congestion}%</b></div><div><small>혈관 저항</small><b>{lab.resistance}%</b></div></div>
              <p>{lab.strain > 65 ? "보상기전이 계속되면 심실·심근 비대 후 수축력이 떨어집니다." : "부하가 감소해 심장이 혈액을 더 효율적으로 내보냅니다."}</p>
            </div>
          </div>
          <button className="next" onClick={() => setStage("case")}>응급실 미션 →</button>
        </section>
      )}

      {stage === "case" && (
        <section className="screen case-screen">
          <div className="case-top"><span>ER SIMULATION</span><div className="vitals"><b>HR 112</b><b>RR 30</b><b className="low">SpO₂ 86%</b></div></div>
          <div className="patient"><div className="patient-face">◉</div><div><small>{CASE_STEPS[caseStep].title}</small><p>{CASE_STEPS[caseStep].text}</p></div></div>
          <div className="decision">
            <small>DECISION {caseStep + 1} / {CASE_STEPS.length}</small>
            <h1>{CASE_STEPS[caseStep].question}</h1>
            {CASE_STEPS[caseStep].options.map((o, i) => <button key={o} disabled={caseChoice !== null} onClick={() => answerCase(i)} className={caseChoice === null ? "" : i === CASE_STEPS[caseStep].answer ? "correct" : i === caseChoice ? "wrong" : "dim"}><span>{i + 1}</span>{o}</button>)}
            {caseChoice !== null && <div className="case-feedback"><b>{caseChoice === CASE_STEPS[caseStep].answer ? "정확한 판단입니다." : "다시 연결해 볼 포인트예요."}</b><p>{CASE_STEPS[caseStep].feedback}</p><button onClick={nextCase}>{caseStep === CASE_STEPS.length - 1 ? "구조 결과 보기" : "다음 처치"} →</button></div>}
          </div>
        </section>
      )}

      {stage === "result" && (
        <section className="result">
          <div className="result-pulse">♥</div><p className="kicker">PATIENT STABILIZED</p>
          <h1>환자를 안정시켰습니다</h1>
          <div className="final-stats"><div><b>{sortCorrect}/6</b><span>증상 연결</span></div><div><b>{caseScore}/3</b><span>임상 판단</span></div><div><b>{lab.output}%</b><span>최종 박출 효율</span></div></div>
          <p className="takeaway"><strong>오늘의 핵심</strong>좌심실 뒤는 폐, 우심실 뒤는 전신 정맥.<br />이뇨제는 전부하를, 혈관확장제는 후부하를 낮춥니다.</p>
          <button className="primary" onClick={restart}>처음부터 다시 실험 ↻</button>
        </section>
      )}
    </main>
  );
}
