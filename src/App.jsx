import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function App() {
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  return (
    <div>
      {!session ? <Auth /> : <Dashboard session={session} />}
    </div>
  )
}

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else setMessage('Tjek din email for bekræftelse!')
    setLoading(false)
  }

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setMessage(error.message)
    setLoading(false)
  }

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24 }}>
      <h1>Footlio</h1>
      <input type="email" placeholder="Email" value={email}
        onChange={e => setEmail(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }} />
      <input type="password" placeholder="Adgangskode" value={password}
        onChange={e => setPassword(e.target.value)}
        style={{ display: 'block', width: '100%', marginBottom: 12, padding: 8 }} />
      <button onClick={handleLogin} disabled={loading}
        style={{ marginRight: 8, padding: '8px 16px' }}>Log ind</button>
      <button onClick={handleSignUp} disabled={loading}
        style={{ padding: '8px 16px' }}>Opret konto</button>
      {message && <p>{message}</p>}
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

  const getWidthCategory = (lengthCm, widthCm) => {
    const index = (parseFloat(widthCm) / parseFloat(lengthCm)) * 100
    if (index < 36) return 'Smal'
    if (index <= 40) return 'Normal'
    if (index <= 44) return 'Bred'
    return 'Meget bred'
  }

  useEffect(() => {
    getOrCreateParent()
  }, [])

  const getOrCreateParent = async () => {
    let { data } = await supabase
      .from('parents')
      .select('id')
      .eq('auth_id', session.user.id)
      .single()
    if (!data) {
      const { data: newParent } = await supabase
        .from('parents')
        .insert({ auth_id: session.user.id, email: session.user.email })
        .select('id')
        .single()
      setParentId(newParent.id)
      fetchChildren(newParent.id)
    } else {
      setParentId(data.id)
      fetchChildren(data.id)
    }
  }

  const fetchChildren = async (pid) => {
    const { data, error } = await supabase
      .from('children')
      .select('*')
      .eq('parent_id', pid)
      .order('created_at', { ascending: true })
    if (!error) setChildren(data)
  }

  const fetchMeasurements = async (childId) => {
    const { data, error } = await supabase
      .from('measurements')
      .select('*')
      .eq('child_id', childId)
      .order('measured_date', { ascending: false })
    if (!error) setMeasurements(data)
  }

  const selectChild = (child) => {
    if (selectedChild?.id === child.id) {
      setSelectedChild(null)
      setMeasurements([])
    } else {
      setSelectedChild(child)
      fetchMeasurements(child.id)
    }
  }

  const addChild = async () => {
    if (!name || !parentId) return
    setLoading(true)
    const { error } = await supabase
      .from('children')
      .insert({
        name,
        age_months: (parseInt(ageYears || 0) * 12) + parseInt(ageMonths || 0),
        parent_id: parentId,
        palette_idx: 0
      })
    if (!error) {
      setName('')
      setAgeYears('')
      setAgeMonths('')
      fetchChildren(parentId)
    }
    setLoading(false)
  }

  const deleteChild = async (id) => {
    await supabase.from('children').delete().eq('id', id)
    if (selectedChild?.id === id) setSelectedChild(null)
    fetchChildren(parentId)
  }

  const addMeasurement = async () => {
    if (!leftCm || !leftWidthCm || !rightCm || !rightWidthCm) return
    const { error } = await supabase
      .from('measurements')
      .insert({
        child_id: selectedChild.id,
        parent_id: parentId,
        left_cm: parseFloat(leftCm),
        left_width_cm: parseFloat(leftWidthCm),
        right_cm: parseFloat(rightCm),
        right_width_cm: parseFloat(rightWidthCm),
        measured_date: new Date().toISOString().split('T')[0]
      })
    if (!error) {
      setLeftCm('')
      setLeftWidthCm('')
      setRightCm('')
      setRightWidthCm('')
      fetchMeasurements(selectedChild.id)
    } else {
      console.log(error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Footlio</h1>
        <button onClick={handleLogout}>Log ud</button>
      </div>

      <h2>Mine børn</h2>

      <div style={{ marginBottom: 24 }}>
        <input placeholder="Barnets navn" value={name}
          onChange={e => setName(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
        <input type="number" placeholder="År" value={ageYears}
          onChange={e => setAgeYears(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
        <input type="number" placeholder="Måneder (0-11)" value={ageMonths}
          onChange={e => setAgeMonths(e.target.value)}
          style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
        <button onClick={addChild} disabled={loading}
          style={{ padding: '8px 16px' }}>Tilføj barn</button>
      </div>

      {children.length === 0 && <p>Ingen børn tilføjet endnu.</p>}

      {children.map(child => (
        <div key={child.id} style={{
          padding: 16, marginBottom: 12,
          border: `2px solid ${selectedChild?.id === child.id ? '#C4623A' : '#ddd'}`,
          borderRadius: 8
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div onClick={() => selectChild(child)} style={{ cursor: 'pointer' }}>
              <strong>{child.name}</strong>
              <p style={{ margin: 0, color: '#666' }}>
                {Math.floor(child.age_months / 12)} år og {child.age_months % 12} måneder
              </p>
            </div>
            <button onClick={() => deleteChild(child.id)}
              style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }}>
              Slet
            </button>
          </div>

          {selectedChild?.id === child.id && (
            <div style={{ marginTop: 16, borderTop: '1px solid #eee', paddingTop: 16 }}>
              <h3 style={{ margin: '0 0 12px 0' }}>Registrer fodmål</h3>

              <p style={{ fontWeight: 'bold', marginBottom: 4 }}>Venstre fod</p>
              <input type="number" placeholder="Længde (cm)" value={leftCm}
                onChange={e => setLeftCm(e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
              <input type="number" placeholder="Bredde (cm)" value={leftWidthCm}
                onChange={e => setLeftWidthCm(e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
              {leftCm && leftWidthCm && (
                <p style={{ color: '#6B7C3D', marginBottom: 12 }}>
                  Bredde: <strong>{getWidthCategory(leftCm, leftWidthCm)}</strong>
                </p>
              )}

              <p style={{ fontWeight: 'bold', marginBottom: 4 }}>Højre fod</p>
              <input type="number" placeholder="Længde (cm)" value={rightCm}
                onChange={e => setRightCm(e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
              <input type="number" placeholder="Bredde (cm)" value={rightWidthCm}
                onChange={e => setRightWidthCm(e.target.value)}
                style={{ display: 'block', width: '100%', marginBottom: 8, padding: 8 }} />
              {rightCm && rightWidthCm && (
                <p style={{ color: '#6B7C3D', marginBottom: 12 }}>
                  Bredde: <strong>{getWidthCategory(rightCm, rightWidthCm)}</strong>
                </p>
              )}

              <button onClick={addMeasurement}
                style={{ padding: '8px 16px', marginBottom: 16 }}>
                Gem fodmål
              </button>

              {measurements.length === 0 && (
                <p style={{ color: '#999' }}>Ingen fodmål endnu.</p>
              )}
              {measurements.map(m => (
                <div key={m.id} style={{
                  padding: 8, marginBottom: 8,
                  background: '#f9f9f9', borderRadius: 6, fontSize: 14
                }}>
                  <strong>{m.measured_date}</strong><br />
                  Venstre: {m.left_cm} cm
                  {m.left_width_cm && ` · ${getWidthCategory(m.left_cm, m.left_width_cm)}`}<br />
                  Højre: {m.right_cm} cm
                  {m.right_width_cm && ` · ${getWidthCategory(m.right_cm, m.right_width_cm)}`}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}