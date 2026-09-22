// SalesApp · ejecución de ventas. La estrategia vive en Kintai Segment.html
const { useState, useEffect, useMemo } = React;

window.AppSales = function AppSales() {
  const [companies, setCompanies] = useState([]);
  const [selectedNif, setSelectedNif] = useState(null);
  const [view, setView] = useState(() => localStorage.getItem('kintai-sales-view') || 'workspace');
  const [showExport, setShowExport] = useState(false);
  const [statuses, setStatuses] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kintai-statuses') || '{}'); } catch { return {}; }
  });
  const [validations, setValidations] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kintai-validations') || '{}'); } catch { return {}; }
  });
  const [feedback, setFeedback] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kintai-feedback') || '{}'); } catch { return {}; }
  });
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kintai-notes') || '{}'); } catch { return {}; }
  });
  const [sdrName, setSdrName] = useState(() => localStorage.getItem('kintai-sdr') || 'Ignasi');
  const LS = (k, d) => { try { return JSON.parse(localStorage.getItem(k) || d); } catch { return JSON.parse(d); } };
  const [sprintList, setSprintList] = useState(() => LS('kintai-sprintlist', '[]'));
  const [callLog, setCallLog] = useState(() => LS('kintai-calllog', '{}'));
  const [engagement, setEngagement] = useState(() => LS('kintai-eng', '{}'));
  const [callbacks, setCallbacks] = useState(() => LS('kintai-callbacks', '{}'));
  const [touches, setTouches] = useState(() => LS('kintai-touches', '{}'));
  const [demo, setDemo] = useState(() => localStorage.getItem('kintai-demo') === '1');
  const [session, setSession] = useState(() => LS('kintai-session', 'null'));
  const [sprintHist, setSprintHist] = useState(() => LS('kintai-sprints', '[]'));
  const [discovery, setDiscovery] = useState(() => LS('kintai-discovery', '{}'));
  const [collateral, setCollateral] = useState(() => LS('kintai-collateral', '{}'));
  const [aeName, setAeName] = useState(() => localStorage.getItem('kintai-ae') || 'Ignasi');
  const [callState, setCallState] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kintai-callstate') || '{}'); } catch { return {}; }
  });
  const [pains, setPains] = useState(() => {
    try { return JSON.parse(localStorage.getItem('kintai-pains') || '{}'); } catch { return {}; }
  });
  const [camps, setCamps] = useState(() => window.campLoad());
  useEffect(() => {
    // Semilla con marcador de versión: añade las de ejemplo sin tocar las del usuario
    if (!window.campSeed || localStorage.getItem('kintai-campseed') === '2') return;
    localStorage.setItem('kintai-campseed', '2');
    const seed = window.campSeed(window.COMPANIES || []);
    setCamps(prev => {
      const have = new Set(prev.map(c => c.id));
      return [...prev, ...seed.filter(c => !have.has(c.id))];
    });
  }, []);
  const [openScripts, setOpenScripts] = useState({});
  const [inCall, setInCall] = useState(false);
  const [callStep, setCallStep] = useState(0);

  useEffect(() => {
    const d = window.COMPANIES || [];
    setCompanies(d);
    setSelectedNif(d[0]?.nif);
    // Datos de ejemplo la primera vez, para poder juzgar la interfaz con la tabla llena
    const s = window.DEMO_SEED;
    if (s && localStorage.getItem('kintai-seedv') !== String(s.v)) {
      localStorage.setItem('kintai-seedv', String(s.v));
      localStorage.setItem('kintai-demo', '1');
      setTouches(s.touches); setEngagement(s.eng);
      setCallbacks(s.callbacks); setCallLog(s.callLog);
      setSprintList(s.list); if (s.sprints) setSprintHist(s.sprints); setDemo(true);
    }
  }, []);

  const clearDemo = () => {
    setTouches({}); setEngagement({}); setCallbacks({}); setCallLog({}); setSprintList([]); setSprintHist([]);
    localStorage.setItem('kintai-demo', '0');
    setDemo(false);
  };

  useEffect(() => { localStorage.setItem('kintai-statuses', JSON.stringify(statuses)); }, [statuses]);
  useEffect(() => { localStorage.setItem('kintai-validations', JSON.stringify(validations)); }, [validations]);
  useEffect(() => { localStorage.setItem('kintai-feedback', JSON.stringify(feedback)); }, [feedback]);
  useEffect(() => { localStorage.setItem('kintai-notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('kintai-pains', JSON.stringify(pains)); }, [pains]);
  useEffect(() => { localStorage.setItem('kintai-sdr', sdrName); }, [sdrName]);
  useEffect(() => { localStorage.setItem('kintai-sprintlist', JSON.stringify(sprintList)); }, [sprintList]);
  useEffect(() => { localStorage.setItem('kintai-calllog', JSON.stringify(callLog)); }, [callLog]);
  useEffect(() => { localStorage.setItem('kintai-eng', JSON.stringify(engagement)); }, [engagement]);
  useEffect(() => { localStorage.setItem('kintai-callbacks', JSON.stringify(callbacks)); }, [callbacks]);
  useEffect(() => { localStorage.setItem('kintai-touches', JSON.stringify(touches)); }, [touches]);
  useEffect(() => { localStorage.setItem('kintai-session', JSON.stringify(session)); }, [session]);
  useEffect(() => { localStorage.setItem('kintai-sprints', JSON.stringify(sprintHist)); }, [sprintHist]);
  useEffect(() => { localStorage.setItem('kintai-discovery', JSON.stringify(discovery)); }, [discovery]);
  useEffect(() => { localStorage.setItem('kintai-collateral', JSON.stringify(collateral)); }, [collateral]);
  useEffect(() => { localStorage.setItem('kintai-ae', aeName); }, [aeName]);
  useEffect(() => { localStorage.setItem('kintai-callstate', JSON.stringify(callState)); }, [callState]);

  useEffect(() => { localStorage.setItem('kintai-sales-view', view); }, [view]);
  useEffect(() => { window.campSave(camps); }, [camps]);

  // Si la pestaña persistida cae fuera, acercar la nav a ella (scrollIntoView rompe el layout)
  const navRef = React.useRef(null);
  useEffect(() => {
    const nav = navRef.current;
    const tab = nav && nav.querySelector('.topnav-tab.active');
    if (!nav || !tab) return;
    const visible = tab.offsetLeft >= nav.scrollLeft && tab.offsetLeft + tab.offsetWidth <= nav.scrollLeft + nav.clientWidth;
    if (!visible) nav.scrollLeft = Math.max(0, tab.offsetLeft - 16);
  }, [view, companies.length]);

  const [calQ, setCalQ] = useState('');

  const c = companies.find(x => x.nif === selectedNif);

  const myValidations = validations[selectedNif] || {};
  const myFeedback = feedback[selectedNif] || {};
  const myNotes = notes[selectedNif] || '';
  const myOpenScripts = openScripts[selectedNif] || {};

  const adjustment = useMemo(() => {
    if (!c) return null;
    return window.computeAdjustment(c, myValidations, myFeedback);
  }, [c, myValidations, myFeedback]);

  const myPains = pains[selectedNif] || {};
  const myCall = callState[selectedNif] || {};
  const setCall = (k, v) => setCallState(prev => ({...prev, [selectedNif]: {...(prev[selectedNif] || {}), [k]: v}}));
  const setPain = (k, v) => setPains(prev => ({...prev, [selectedNif]: {...(prev[selectedNif] || {}), [k]: v}}));

  const setStatus = (s) => setStatuses(prev => ({...prev, [selectedNif]: s}));
  const setValidation = (key, v) => setValidations(prev => ({...prev, [selectedNif]: {...(prev[selectedNif] || {}), [key]: v}}));
  const setFeedbackKV = (pillarId, qIdx, value) => setFeedback(prev => ({
    ...prev, [selectedNif]: {...(prev[selectedNif] || {}), [`${pillarId}-${qIdx}`]: value}
  }));

  const focusBlock = (i) => {
    const id = ((window.CALL_FLOW || [])[i] || {}).id;
    if (!id) return;
    setTimeout(() => {
      const el = document.querySelector('[data-block="' + id + '"]');
      if (el) window.scrollTo({ top: 0 });
      const ws = document.querySelector('.workspace');
      if (el && ws) ws.scrollTo({ top: ws.scrollTop + el.getBoundingClientRect().top - 80, behavior: 'smooth' });
    }, 60);
  };
  const startCall = () => {
    setInCall(true); setCallStep(0);
    if (statuses[selectedNif] !== 'qualified') setStatus('contacted');
    focusBlock(0);
  };
  const advanceCall = (delta) => {
    const next = callStep + delta;
    if (next < 0 || next >= (window.CALL_FLOW || []).length) return;
    setCallStep(next);
    focusBlock(next);
  };
  const endCall = () => { setInCall(false); setStatus('qualified'); };
  const toggleScript = (i) => setOpenScripts(prev => ({
    ...prev, [selectedNif]: {...(prev[selectedNif] || {}), [i]: !(prev[selectedNif] || {})[i]}
  }));

  const goToLead = (nif) => { setSelectedNif(nif); setView('workspace'); setInCall(false); };
  const addLog = (nif, entry) => setCallLog(prev => ({ ...prev, [nif]: [...(prev[nif] || []), entry] }));
  const setEng = (nif, v) => setEngagement(prev => ({ ...prev, [nif]: v }));
  const setCb = (nif, v) => setCallbacks(prev => ({ ...prev, [nif]: v }));
  const setTouch = (nif, v) => setTouches(prev => ({ ...prev, [nif]: v }));
  const setDisc = (v) => setDiscovery(prev => ({ ...prev, [selectedNif]: v }));
  const setColl = (v) => setCollateral(prev => ({ ...prev, [selectedNif]: v }));
  const setNoteFor = (nif, v) => setNotes(prev => ({ ...prev, [nif]: v }));
  const startSprint = () => {
    setSession({ id: 'sp-' + Date.now(), startedAt: Date.now(), pausedMs: 0, active: true });
    setView('sprint');
  };
  // Reanudar conserva el id: sin él la cola vuelve a servir lo ya llamado
  const resumeSprint = () => {
    setSession({ ...session, active: true, startedAt: Date.now() - (session.frozenAt || 0), pausedMs: 0 });
    setView('sprint');
  };
  const exitSprint = (elapsed) => {
    setSession({ ...session, active: false, frozenAt: elapsed || 0 });
    setView('prep');
  };
  const closeSprint = () => {
    if (session) {
      const st = window.sprintStats(session.id, callLog, callbacks);
      if (st.calls > 0 && !sprintHist.some(h => h.id === session.id)) {
        setSprintHist(prev => [...prev, {
          id: session.id, closedAt: Date.now(),
          minutes: Math.round((session.frozenAt || 0) / 60000),
        }]);
      }
    }
    setSession(null);
  };
  const discardSprint = closeSprint;

  if (!c) {
    return <div className="app"><div className="empty"><div className="empty-icon">K</div>Cargando…</div></div>;
  }

  // El listado de leads solo sirve en Lead actual, que es donde se cambia de
  // empresa. En el resto estorba y roba ancho: discovery ya llega con la
  // empresa elegida desde el sprint.

  return (
    <div className="app app-wide">
      <main className="workspace">
        <nav className="topnav">
          <div className="topnav-strip" ref={navRef}>
          <button
            className={`topnav-tab ${view === 'research' ? 'active' : ''}`}
            onClick={() => setView('research')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/><path d="m20 20-3-3M11 8v6M8 11h6"/>
            </svg>
            Market research
          </button>
          <button
            className={`topnav-tab ${view === 'midmarket' ? 'active' : ''}`}
            onClick={() => setView('midmarket')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 20V7l8-3 8 3v13"/><path d="M9 20v-6h6v6"/>
            </svg>
            Mid Market
          </button>
          <button
            className={`topnav-tab ${view === 'campaigns' ? 'active' : ''}`}
            onClick={() => setView('campaigns')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3h18l-2 7H5z"/><path d="M5 10v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8"/>
            </svg>
            Campañas
          </button>
          <button
            className={`topnav-tab ${view === 'prep' || view === 'sprint' ? 'active' : ''}`}
            onClick={() => setView(session && session.active ? 'sprint' : 'prep')}
            title={session && !session.active ? 'Tienes un sprint sin cerrar' : undefined}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 16 14"/>
            </svg>
            Sprint
            {session && session.active && <span className="topnav-live"/>}
          </button>
          <button
            className={`topnav-tab ${view === 'workspace' ? 'active' : ''}`}
            onClick={() => setView('workspace')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            Calificación
          </button>
          <button
            className={`topnav-tab ${view === 'outbound' ? 'active' : ''}`}
            onClick={() => setView('outbound')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 11l18-7-7 18-2.5-8.5z"/>
            </svg>
            Outbound
          </button>
          <button
            className={`topnav-tab ${view === 'dash' ? 'active' : ''}`}
            onClick={() => setView('dash')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 21V9M12 21V4M18 21v-7"/>
            </svg>
            Performance SDR
          </button>
          <button
            className={`topnav-tab ${view === 'brokers' ? 'active' : ''}`}
            onClick={() => setView('brokers')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 20V9m5 11V5m5 15v-8m5 8V7"/>
            </svg>
            Brokers
          </button>
          <button
            className={`topnav-tab ${view === 'discovery' ? 'active' : ''}`}
            onClick={() => setView('discovery')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18h6M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/>
            </svg>
            Discovery
          </button>
          <button
            className={`topnav-tab ${view === 'funnelopt' ? 'active' : ''}`}
            onClick={() => setView('funnelopt')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 5h18l-7 8v6l-4-2v-4z"/>
            </svg>
            Funnel
          </button>
          <button
            className={`topnav-tab ${view === 'aeperf' ? 'active' : ''}`}
            onClick={() => setView('aeperf')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 20V10m6 10V4m6 16v-6"/><path d="M3 20h18"/>
            </svg>
            Performance AE
          </button>
          <button
            className={`topnav-tab ${view === 'skills' ? 'active' : ''}`}
            onClick={() => setView('skills')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.5 9.2l5.9-.9z"/>
            </svg>
            Skills
          </button>
          <button
            className={`topnav-tab ${view === 'followups' ? 'active' : ''}`}
            onClick={() => setView('followups')}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 1 0 3-6.7"/><path d="M3 4v5h5"/><circle cx="12" cy="12" r="2.5"/>
            </svg>
            Follow ups
          </button>
          </div>
          <div className="topnav-actions">
          <a className="topnav-export" href="Kintai Segment.html">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.4 2.5 15.6 0 18M12 3c-2.5 2.4-2.5 15.6 0 18"/></svg>
            Segmentación
          </a>
          <button className="topnav-export" onClick={() => setShowExport(true)}>
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Exportar feedback
          </button>
          </div>
        </nav>

        {view === 'workspace' && (
          <div className="ws-inner" data-screen-label="01 Calificación">
            <div className="cal-search-top">
              <label className="cal-search">
                <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true"><circle cx="6.8" cy="6.8" r="4.4" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M10.2 10.2 14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                <input type="search" value={calQ} onChange={e => setCalQ(e.target.value)} placeholder="Buscar campo, pregunta o respuesta de calificación"/>
                {calQ && <button type="button" className="cal-search-x" onClick={() => setCalQ('')} aria-label="Limpiar búsqueda">×</button>}
              </label>
              {calQ.trim() && <span className="cal-search-n">Filtrando los campos de encaje avanzado</span>}
            </div>
            <window.CompanyHead c={c} status={statuses[selectedNif]} onStatus={setStatus} onCall={startCall} adjustment={adjustment}/>
            <window.FinancialStrip c={c}/>

            <section className="section">
              <div className="section-head">
                <h2 className="section-title">Recomendación</h2>
                <span className="section-hint">Lo que el SDR debe hacer ahora</span>
              </div>
              <window.Recommendation c={c} validations={myValidations} feedback={myFeedback} adjustment={adjustment}/>
            </section>

            <section className="section" data-screen-label="02 Industria">
              <div className="section-head">
                <h2 className="section-title">Industria</h2>
                <span className="section-hint">Cómo se compara con sus pares y con los clientes que ya tenemos en su sector</span>
              </div>
              <window.IndustryBlock c={c} painState={myPains} onPain={setPain}/>
            </section>

            <section className="section" id="script-section" data-screen-label="03 Llamada">
              <div className="section-head">
                <h2 className="section-title">Llamada</h2>
                <span className="section-hint">Tres bloques. La evidencia vive dentro del bloque que la usa.</span>
              </div>
              <window.CallFlow
                activeBlock={inCall ? ((window.CALL_FLOW || [])[callStep] || {}).id : null}
                c={c} sdrName={sdrName} onSdrName={setSdrName}
                state={myCall} onState={setCall}
                validations={myValidations} onValidate={setValidation}
                painState={myPains} onPain={setPain}
                feedback={myFeedback} onFeedback={setFeedbackKV}/>
            </section>

            <div data-screen-label="04 Encaje avanzado">
              <window.Calificacion c={c} q={calQ} onQ={setCalQ}
                validations={myValidations} onValidate={setValidation}
                callState={myCall} onCall={setCall}
                feedback={myFeedback} onFeedback={setFeedbackKV}/>
            </div>

            <section className="section">
              <div className="notes-box">
                <div className="notes-box-label">Notas generales del SDR</div>
                <textarea
                  placeholder="Contexto extra: contacto clave, próxima acción, objeciones, oportunidad…"
                  value={myNotes}
                  onChange={e => setNotes(prev => ({...prev, [selectedNif]: e.target.value}))}
                />
              </div>
            </section>

            <window.CallBar
              inCall={inCall}
              currentStep={callStep}
              totalSteps={(window.CALL_FLOW || []).length}
              onPrev={() => advanceCall(-1)}
              onNext={() => advanceCall(1)}
              onEnd={endCall}
            />
          </div>
        )}

        {view === 'dash' && (
          <window.Dashboard
            history={sprintHist} log={callLog} callbacks={callbacks} touches={touches}
            sdrName={sdrName} session={session}
            onGoPrep={() => setView('prep')} onResume={resumeSprint}/>
        )}

        {view === 'discovery' && (
          <window.Discovery
            c={c} aeName={aeName} onAeName={setAeName}
            state={discovery[selectedNif] || {}} onState={setDisc}
            collateral={collateral[selectedNif] || {}} onCollateral={setColl}/>
        )}

        {view === 'prep' && (
          <window.SprintPrep
            companies={companies} list={sprintList} onList={setSprintList}
            log={callLog} eng={engagement} onEng={setEng} callbacks={callbacks}
            touches={touches} onTouch={setTouch}
            demo={demo} onClearDemo={clearDemo}
            session={session} onResume={resumeSprint} onDiscard={discardSprint}
            onStart={startSprint} onSelectLead={goToLead}/>
        )}

        {view === 'sprint' && session && (
          <window.SprintRun
            companies={companies} list={sprintList} log={callLog} onLog={addLog}
            eng={engagement} callbacks={callbacks} onCallback={setCb} touches={touches} onTouch={setTouch}
            notes={notes} onNote={setNoteFor}
            session={session} onSession={setSession}
            validations={validations} callState={callState} feedback={feedback}
            pains={pains} sdrName={sdrName} onSdrName={setSdrName}
            onPain={(nif, k, v) => setPains(prev => ({ ...prev, [nif]: { ...(prev[nif] || {}), [k]: v } }))}
            onValidate={(nif, key, v) => setValidations(prev => ({ ...prev, [nif]: { ...(prev[nif] || {}), [key]: v } }))}
            onCall={(nif, k, v) => setCallState(prev => ({ ...prev, [nif]: { ...(prev[nif] || {}), [k]: v } }))}
            onFeedback={(nif, pillarId, qIdx, value) => setFeedback(prev => ({ ...prev, [nif]: { ...(prev[nif] || {}), [`${pillarId}-${qIdx}`]: value } }))}
            onExit={exitSprint}
            onClose={(el) => { setSession({ ...session, active: false, frozenAt: el || 0 }); setTimeout(closeSprint, 0); setView('dash'); }}
            onSelectLead={goToLead}/>
        )}

        {view === 'sprint' && !session && (
          <div className="ws-inner"><div className="empty"><div className="empty-icon">K</div>
            <p>No hay sprint activo.</p>
            <button className="btn gold" onClick={() => setView('prep')}>Preparar uno</button>
          </div></div>
        )}

        {view === 'followups' && <window.ContactFlow/>}

        {view === 'brokers' && <window.BrokerFlow/>}

        {view === 'outbound' && <window.OutboundFlow/>}

        {view === 'aeperf' && <window.AePerf/>}

        {view === 'skills' && <window.AeSkills/>}

        {view === 'funnelopt' && <window.FunnelOpt/>}

        {view === 'midmarket' && <window.MidMarket/>}

        {view === 'research' && (
          <window.Research
            companies={companies} camps={camps} onCamps={setCamps} onSelectLead={goToLead}/>
        )}

        {view === 'campaigns' && (
          <window.Campaigns
            companies={companies}
            statuses={statuses}
            onSelectLead={goToLead}
            camps={camps} onCamps={setCamps}
          />
        )}
      </main>

      {showExport && (
        <window.ExportModal
          companies={companies}
          statuses={statuses}
          validations={validations}
          feedback={feedback}
          notes={notes}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<window.AppSales/>);
