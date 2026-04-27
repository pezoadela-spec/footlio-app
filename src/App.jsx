import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

// === Brand palette ===
const COLORS = {
  cream: '#FAF7F2',
  white: '#FFFFFF',
  olive: '#6B7C3D',
  oliveDark: '#3A4520',
  oliveSoft: '#F4F6EC',
  oliveBorder: '#DDE3C8',
  terracotta: '#C4623A',
  terracottaSoft: '#FBE8DC',
  terracottaDeep: '#8B3F1F',
  ink: '#1A1A1A',
  inkSoft: '#5C5C5C',
  inkMute: '#9A9A9A',
}

// === Avatar palette (one per child, derived from palette_idx or name) ===
const AVATAR_COLORS = [
  '#C4623A', // terracotta
  '#6B7C3D', // olive
  '#C99B3A', // mustard
  '#8FA873', // sage
  '#B8786E', // dusty rose
]

const getAvatarColor = (paletteIdx, name = '') => {
  if (paletteIdx && paletteIdx > 0) return AVATAR_COLORS[paletteIdx % AVATAR_COLORS.length]
  // fallback: derive from first letter so existing children with palette_idx=0 vary
  const seed = name ? name.charCodeAt(0) : 0
  return AVATAR_COLORS[seed % AVATAR_COLORS.length]
}

// === Width category — moved to top level so badge can be a reusable component ===
const getWidthCategory = (lengthCm, widthCm) => {
  const index = (parseFloat(widthCm) / parseFloat(lengthCm)) * 100
  if (index < 36) return 'Smal'
  if (index <= 40) return 'Normal'
  if (index <= 44) return 'Bred'
  return 'Meget bred'
}

const getWidthBadgeStyle = (label) => {
  if (label === 'Smal') return { background: '#EAEFF2', color: '#4A6B7C', border: '1px solid #D4DCE2' }
  if (label === 'Normal') return { background: COLORS.oliveSoft, color: COLORS.olive, border: `1px solid ${COLORS.oliveBorder}` }
  if (label === 'Bred') return { background: COLORS.terracottaSoft, color: COLORS.terracotta, border: '1px solid #F2D1BC' }
  return { background: '#F5D5C2', color: COLORS.terracottaDeep, border: '1px solid #E8B89C' } // Meget bred
}

// === Styles ===
const s = {
  hdr: { background: `linear-gradient(135deg, ${COLORS.olive} 0%, ${COLORS.oliveDark} 100%)`, padding: '40px 20px', color: '#fff', textAlign: 'center' },
  hdrLogo: { fontSize: '2rem', fontWeight: 900, marginBottom: '8px', fontFamily: 'Fraunces, serif' },
  hdrTitle: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '4px' },
  hdrSub: { fontSize: '1rem', opacity: 0.8 },
  body: { padding: '20px', maxWidth: '600px', margin: '0 auto' },
  card: { background: '#fff', border: `1.5px solid ${COLORS.oliveBorder}`, borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  cardLabel: { fontSize: '1.1rem', fontWeight: 700, color: COLORS.ink, marginBottom: '16px' },
  lbl: { display: 'block', fontSize: '0.9rem', fontWeight: 600, color: COLORS.inkSoft, marginBottom: '6px' },
  inp: { width: '100%', padding: '12px', border: `1.5px solid ${COLORS.oliveBorder}`, borderRadius: '8px', fontSize: '1rem', marginBottom: '12px' },
  btnP: { background: COLORS.olive, color: '#fff', border: 'none', borderRadius: '8px', padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', width: '100%' },
  btnO: { background: 'transparent', color: COLORS.olive, border: `1.5px solid ${COLORS.oliveBorder}`, borderRadius: '8px', padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', width: '100%', marginTop: '8px' },
  btnDanger: { background: '#DC3545', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' },
  childRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  childName: { fontSize: '1.1rem', fontWeight: 700, color: COLORS.ink },
  childAge: { fontSize: '0.85rem', color: COLORS.inkSoft },
  measureRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${COLORS.oliveBorder}` },
  measureDate: { fontSize: '0.8rem', color: COLORS.inkSoft },
  measureVal: { fontSize: '0.9rem', color: COLORS.ink },
  widthBadge: { display: 'inline-block', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 600, marginLeft: '8px' },
}

function Auth() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [showAuth, setShowAuth] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Check your email for the confirmation link!')
    setLoading(false)
  }

  useEffect(() => {
    const sticky = document.getElementById('stickyCta')
    const intro = document.querySelector('.intro-wrap')
    const onScroll = () => {
      if (!sticky || !intro) return
      const introBottom = intro.offsetTop + intro.offsetHeight
      if (window.scrollY > introBottom - 100) sticky.classList.add('show')
      else sticky.classList.remove('show')
    }
    window.addEventListener('scroll', onScroll)
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const startMeasure = (e) => {
    e.preventDefault()
    setShowAuth(true)
    requestAnimationFrame(() => {
      document.getElementById('start')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="page">

      <header className="hdr-bar">
        <div className="hdr-brand">
          <span className="hdr-tagline">Know before<br />they grow</span>
        </div>
      </header>

      <section className="intro-wrap">
        <div className="intro-card">
          <h1 className="intro-subhead">Kære Forælder.</h1>
          <p className="intro-facts">Tre ud af fire skolebørn går i forkert fodtøj — sikre at dit barn ikke er en af dem.</p>
          <a className="intro-cta" href="#start" onClick={startMeasure}>Find barnets størrelse →</a>
          <p className="intro-sub">Mål hjemmefra. Vær klar til næste skokøb.</p>
          <div className="intro-meta">
            <span>Gratis</span>
            <span className="intro-meta-dot"></span>
            <span>Tager 2 minutter</span>
          </div>
        </div>
      </section>

      {showAuth && (
        <section id="start" className="auth-section">
          <div className="auth-card">
            <div className="auth-h">{isLogin ? 'Log ind' : 'Opret konto'}</div>
            <div className="auth-sub">Gem dine måleresultater og følg fodvæksten over tid.</div>
            <input className="auth-input" placeholder="Email" value={email}
              onChange={e => setEmail(e.target.value)} />
            <input className="auth-input" type="password" placeholder="Adgangskode" value={password}
              onChange={e => setPassword(e.target.value)} />
            {message && <p className="auth-msg">{message}</p>}
            <button className="auth-primary" onClick={isLogin ? handleLogin : handleSignUp} disabled={loading}>
              {loading ? '...' : isLogin ? 'Log ind' : 'Opret konto'}
            </button>
            <button className="auth-secondary" onClick={() => { setIsLogin(!isLogin); setMessage('') }}>
              {isLogin ? 'Opret ny konto' : 'Jeg har allerede en konto'}
            </button>
          </div>
        </section>
      )}

      <footer className="foot">
        <div className="foot-links">
          <a href="#metode">Om Footlioo</a>
          <a href="#privatliv">Privatliv</a>
          <a href="#loefter">Vores løfter</a>
          <a href="#kontakt">Kontakt</a>
        </div>
        <p className="foot-legal">Footlioo ApS · CVR 46392043 · Danmark</p>
      </footer>

      <div className="sticky-cta" id="stickyCta">
        <a href="#start" onClick={startMeasure}>Find barnets størrelse →</a>
      </div>

    </div>
  )
}

function Dashboard({ session }) {
  const [parentId, setParentId] = useState(null)
  const [children, setChildren] = useState([])
  const [name, setName] = useState('')
  const [ageYears, setAgeYears] = useState('')
  const [ageMonths, setAgeMonths] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedChild, setSelectedChild] = useState(null)
  const [measurements, setMeasurements] = useState([])
  const [leftCm, setLeftCm] = useState('')
  const [leftWidthCm, setLeftWidthCm] = useState('')
  const [rightCm, setRightCm] = useState('')
  const [rightWidthCm, setRightWidthCm] = useState('')
  const [showAddChild, setShowAddChild] = useState(false)

  useEffect(() => { getOrCreateParent() }, [])

  const getOrCreateParent = async () => {
    let { data } = await supabase.from('parents').select('id').eq('auth_id', session.user.id).single()
    if (!data) {
      const { data: newParent } = await supabase.from('parents')
        .insert({ auth_id: session.user.id, email: session.user.email })
        .select('id').single()
      setParentId(newParent.id)
      fetchChildren(newParent.id)
    } else {
      setParentId(data.id)
      fetchChildren(data.id)
    }
  }

  const fetchChildren = async (pid) => {
    const { data, error } = await supabase.from('children').select('*')
      .eq('parent_id', pid).order('created_at', { ascending: true })
    if (!error) setChildren(data)
  }

  const fetchMeasurements = async (childId) => {
    const { data, error } = await supabase.from('measurements').select('*')
      .eq('child_id', childId).order('measured_date', { ascending: false })
    if (!error) setMeasurements(data)
  }

  const selectChild = (child) => {
    if (selectedChild?.id === child.id) { setSelectedChild(null); setMeasurements([]) }
    else { setSelectedChild(child); fetchMeasurements(child.id) }
  }

  const addChild = async () => {
    if (!name || !parentId) return
    setLoading(true)
    const { error } = await supabase.from('children').insert({
      name, age_months: (parseInt(ageYears || 0) * 12) + parseInt(ageMonths || 0),
      parent_id: parentId, palette_idx: 0
    })
    if (!error) { setName(''); setAgeYears(''); setAgeMonths(''); setShowAddChild(false); fetchChildren(parentId) }
    setLoading(false)
  }

  const deleteChild = async (id) => {
    await supabase.from('children').delete().eq('id', id)
    if (selectedChild?.id === id) setSelectedChild(null)
    fetchChildren(parentId)
  }

  const addMeasurement = async () => {
    if (!leftCm || !leftWidthCm || !rightCm || !rightWidthCm) return
    const { error } = await supabase.from('measurements').insert({
      child_id: selectedChild.id, parent_id: parentId,
      left_cm: parseFloat(leftCm), left_width_cm: parseFloat(leftWidthCm),
      right_cm: parseFloat(rightCm), right_width_cm: parseFloat(rightWidthCm),
      measured_date: new Date().toISOString().split('T')[0]
    })
    if (!error) { setLeftCm(''); setLeftWidthCm(''); setRightCm(''); setRightWidthCm(''); fetchMeasurements(selectedChild.id) }
    else console.log(error)
  }

  return (
    <div>
      <div style={s.hdr}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={s.hdrLogo}>Footlio</div>
            <div style={s.hdrTitle}>Mine born</div>
            <div style={s.hdrSub}>Know before they grow 👣</div>
          </div>
          <button onClick={() => supabase.auth.signOut()}
            style={{ background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.3)', borderRadius: 50, padding: '6px 14px', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>
            Log ud
          </button>
        </div>
      </div>

      <div style={s.body}>

        {/* Add child button */}
        <button style={s.btnP} onClick={() => setShowAddChild(!showAddChild)}>
          {showAddChild ? '✕ Annuller' : '+ Tilfoj barn'}
        </button>

        {/* Add child form */}
        {showAddChild && (
          <div style={s.card}>
            <div style={s.cardLabel}>Nyt barn</div>
            <label style={s.lbl}>Navn</label>
            <input style={s.inp} placeholder="Barnets navn" value={name} onChange={e => setName(e.target.value)} />
            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{ flex: 1 }}>
                <label style={s.lbl}>Ar</label>
                <input style={s.inp} type="number" placeholder="0" value={ageYears} onChange={e => setAgeYears(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={s.lbl}>Maneder</label>
                <input style={s.inp} type="number" placeholder="0" value={ageMonths} onChange={e => setAgeMonths(e.target.value)} />
              </div>
            </div>
            <button style={s.btnP} onClick={addChild} disabled={loading}>
              {loading ? '...' : 'Gem barn'}
            </button>
          </div>
        )}

        {/* Children list */}
        {children.length === 0 && !showAddChild && (
          <div style={{ ...s.card, textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>👣</div>
            Tilfoj dit forste barn for at komme i gang
          </div>
        )}

        {children.map(child => (
          <div key={child.id} style={{
            ...s.card,
            borderColor: selectedChild?.id === child.id ? '#C4623A' : '#DDE3C8',
            borderWidth: selectedChild?.id === child.id ? 2 : 1.5
          }}>
            <div style={s.childRow}>
              <div onClick={() => selectChild(child)} style={{ cursor: 'pointer', flex: 1 }}>
                <div style={s.childName}>{child.name}</div>
                <div style={s.childAge}>
                  {Math.floor(child.age_months / 12)} ar og {child.age_months % 12} maneder
                </div>
              </div>
              <button onClick={() => deleteChild(child.id)} style={s.btnDanger}>Slet</button>
            </div>

            {selectedChild?.id === child.id && (
              <div style={{ marginTop: 16, borderTop: '1px solid #DDE3C8', paddingTop: 16 }}>
                <div style={s.cardLabel}>Registrer fodmal</div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ flex: 1 }}>
                    <label style={s.lbl}>Venstre — langde</label>
                    <input style={s.inp} type="number" placeholder="cm" value={leftCm} onChange={e => setLeftCm(e.target.value)} />
                    <label style={s.lbl}>Venstre — bredde</label>
                    <input style={s.inp} type="number" placeholder="cm" value={leftWidthCm} onChange={e => setLeftWidthCm(e.target.value)} />
                    {leftCm && leftWidthCm && (
                      <div style={{ ...s.widthBadge, ...getWidthBadgeStyle(getWidthCategory(leftCm, leftWidthCm)), marginLeft: 0, marginBottom: 8 }}>
                        {getWidthCategory(leftCm, leftWidthCm)}
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={s.lbl}>Hojre — langde</label>
                    <input style={s.inp} type="number" placeholder="cm" value={rightCm} onChange={e => setRightCm(e.target.value)} />
                    <label style={s.lbl}>Hojre — bredde</label>
                    <input style={s.inp} type="number" placeholder="cm" value={rightWidthCm} onChange={e => setRightWidthCm(e.target.value)} />
                    {rightCm && rightWidthCm && (
                      <div style={{ ...s.widthBadge, ...getWidthBadgeStyle(getWidthCategory(rightCm, rightWidthCm)), marginLeft: 0, marginBottom: 8 }}>
                        {getWidthCategory(rightCm, rightWidthCm)}
                      </div>
                    )}
                  </div>
                </div>

                <button style={s.btnP} onClick={addMeasurement}>Gem fodmal</button>

                {measurements.length === 0 && (
                  <p style={{ color: COLORS.inkMute, fontSize: '0.85rem', textAlign: 'center', padding: '12px 0', fontStyle: 'italic' }}>
                    Ingen fodmal endnu
                  </p>
                )}

                {measurements.map(m => (
                  <div key={m.id} style={s.measureRow}>
                    <div style={s.measureDate}>{m.measured_date}</div>
                    <div style={s.measureVal}>
                      Venstre: {m.left_cm} cm
                      {m.left_width_cm && <span style={{ ...s.widthBadge, ...getWidthBadgeStyle(getWidthCategory(m.left_cm, m.left_width_cm)) }}>{getWidthCategory(m.left_cm, m.left_width_cm)}</span>}
                    </div>
                    <div style={s.measureVal}>
                      Hoje: {m.right_cm} cm
                      {m.right_width_cm && <span style={{ ...s.widthBadge, ...getWidthBadgeStyle(getWidthCategory(m.right_cm, m.right_width_cm)) }}>{getWidthCategory(m.right_cm, m.right_width_cm)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (!session) {
    return <Auth />
  } else {
    return <Dashboard session={session} />
  }
}

export default App
