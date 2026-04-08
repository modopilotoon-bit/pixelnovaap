import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, getOtherUser, getUserProfile } from '../lib/supabase'
import questionsData from '../data/questions.json'
import Celebration from '../components/Celebration'
import confetti from 'canvas-confetti'

const MILESTONES = [
  { key: 'first_spark', emoji: '🌅', title: '¡Primera Chispa del día!', message: 'Han comenzado juntos. La conexión empieza aquí.' },
  { key: 'streak_7', emoji: '🔥🔥🔥', title: '¡Una semana de conexión!', message: 'Siete días encendiendo la chispa. Algo especial está pasando.' },
]

function getDailyQuestion() {
  const all = [
    ...questionsData.levels['1'].questions,
    ...questionsData.levels['2'].questions,
    ...questionsData.levels['3'].questions,
  ]
  const today = new Date()
  const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / 86400000)
  return all[dayOfYear % all.length]
}

function getStreakDays(bothDates) {
  if (!bothDates || bothDates.length === 0) return 0
  const dates = [...new Set(bothDates.map(a => a.spark_date))].sort().reverse()
  let streak = 0
  let current = new Date().toISOString().split('T')[0]
  for (const date of dates) {
    if (date === current) {
      streak++
      const d = new Date(current)
      d.setDate(d.getDate() - 1)
      current = d.toISOString().split('T')[0]
    } else break
  }
  return streak
}

export default function Inicio() {
  const { username, profile } = useAuth()
  const [todayQuestion] = useState(getDailyQuestion())
  const [myAnswer, setMyAnswer] = useState('')
  const [myAnswerSaved, setMyAnswerSaved] = useState(null)
  const [otherAnswer, setOtherAnswer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [streak, setStreak] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [celebration, setCelebration] = useState(null)

  const today = new Date().toISOString().split('T')[0]
  const otherUsername = username ? getOtherUser(username) : null
  const otherProfile = otherUsername ? getUserProfile(otherUsername) : null
  const myProfile = profile

  const loadData = useCallback(async () => {
    if (!username) return
    setLoading(true)
    try {
      const { data: sparkAnswers } = await supabase
        .from('daily_spark_answers')
        .select('*')
        .eq('spark_date', today)
        .eq('question_text', todayQuestion.text)

      const mine = sparkAnswers?.find(a => a.username === username)
      const other = sparkAnswers?.find(a => a.username === otherUsername)
      setMyAnswerSaved(mine || null)
      setOtherAnswer(other || null)
      setRevealed(!!(mine && other))

      // Streak: days where both answered
      const { data: allSparks } = await supabase
        .from('daily_spark_answers')
        .select('spark_date, username')
        .order('spark_date', { ascending: false })

      if (allSparks) {
        const byDate = {}
        allSparks.forEach(a => {
          if (!byDate[a.spark_date]) byDate[a.spark_date] = new Set()
          byDate[a.spark_date].add(a.username)
        })
        const bothDates = Object.entries(byDate)
          .filter(([, users]) => users.size >= 2)
          .map(([date]) => ({ spark_date: date }))
        setStreak(getStreakDays(bothDates))
      }

      const { count } = await supabase
        .from('question_answers')
        .select('id', { count: 'exact', head: true })
      setTotalAnswered(count || 0)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [username, today, todayQuestion.text, otherUsername])

  useEffect(() => { loadData() }, [loadData])

  // Realtime
  useEffect(() => {
    if (!username) return
    const channel = supabase
      .channel('daily-spark-' + today)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'daily_spark_answers',
        filter: `spark_date=eq.${today}`,
      }, (payload) => {
        if (payload.new.username === otherUsername) {
          setOtherAnswer(payload.new)
          setRevealed(prev => prev || !!myAnswerSaved)
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [username, today, otherUsername, myAnswerSaved])

  const handleSubmit = async () => {
    if (!myAnswer.trim() || submitting) return
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('daily_spark_answers')
        .insert({
          spark_date: today,
          question_text: todayQuestion.text,
          username,
          answer: myAnswer.trim(),
        })
        .select()
        .single()

      if (error) throw error
      setMyAnswerSaved(data)

      if (otherAnswer) {
        setRevealed(true)
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 }, colors: ['#C9A84C', '#E8688A', '#E8C87C'] })
        await checkMilestones()
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const checkMilestones = async () => {
    try {
      const { data: existing } = await supabase.from('milestones').select('type')
      const achieved = new Set((existing || []).map(m => m.type))

      if (!achieved.has('first_spark')) {
        await supabase.from('milestones').insert({ type: 'first_spark', data: {} })
        setCelebration(MILESTONES.find(m => m.key === 'first_spark'))
        return
      }
      if (streak + 1 >= 7 && !achieved.has('streak_7')) {
        await supabase.from('milestones').insert({ type: 'streak_7', data: {} })
        setCelebration(MILESTONES.find(m => m.key === 'streak_7'))
      }
    } catch (e) { console.error(e) }
  }

  if (loading) {
    return (
      <div className="page-enter flex flex-col items-center justify-center min-h-64 gap-4">
        <div className="gold-pulse"><span /><span /><span /></div>
        <p style={{ color: '#B89FA8', fontStyle: 'italic', fontSize: '0.875rem' }}>Cargando tu chispa del día...</p>
      </div>
    )
  }

  return (
    <div className="page-enter px-4 pt-4 pb-6 space-y-5">
      {celebration && <Celebration milestone={celebration} onClose={() => setCelebration(null)} />}

      {/* Header */}
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#B89FA8' }}>
          {new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 className="text-2xl font-bold"
          style={{ fontFamily: 'Playfair Display, serif', background: 'linear-gradient(135deg, #C9A84C, #E8C87C)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Chispa del Día ✨
        </h1>
      </div>

      {/* Daily spark card */}
      <div className="card card-glow p-5"
        style={{ background: 'linear-gradient(135deg, #1F0D14 0%, #2A0F1A 100%)', border: '1px solid rgba(201,168,76,0.3)' }}>
        <div className="mb-5">
          <div className="text-xs uppercase tracking-wider mb-3" style={{ color: '#C9A84C' }}>Pregunta de hoy</div>
          <p className="text-base leading-relaxed" style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0', fontStyle: 'italic' }}>
            "{todayQuestion.text}"
          </p>
        </div>

        {/* Status */}
        <div className="flex gap-3 mb-5">
          {[
            { uname: username, profile: myProfile, saved: myAnswerSaved, label: 'Tú' },
            { uname: otherUsername, profile: otherProfile, saved: otherAnswer, label: otherProfile?.display_name },
          ].map(({ uname, profile: p, saved }) => (
            <div key={uname} className="flex-1 rounded-xl p-3 text-center"
              style={{
                background: saved ? (uname === 'mimmis' ? 'rgba(232,104,138,0.1)' : 'rgba(201,168,76,0.1)') : 'rgba(61,26,36,0.3)',
                border: `1px solid ${saved ? (uname === 'mimmis' ? 'rgba(232,104,138,0.3)' : 'rgba(201,168,76,0.3)') : '#3D1A24'}`,
              }}>
              <div className="text-lg mb-1">{p?.avatar_emoji}</div>
              <div className="text-xs" style={{ color: saved ? (uname === 'mimmis' ? '#E8688A' : '#C9A84C') : '#B89FA8' }}>
                {saved ? '✅ Respondió' : '⏳ Pendiente'}
              </div>
            </div>
          ))}
        </div>

        {!myAnswerSaved ? (
          <div className="space-y-3">
            <textarea className="input-field resize-none" rows={3}
              placeholder="Tu respuesta, desde el corazón..."
              value={myAnswer} onChange={e => setMyAnswer(e.target.value)} style={{ minHeight: '80px' }} />
            <button onClick={handleSubmit} disabled={!myAnswer.trim() || submitting} className="btn-primary"
              style={{ opacity: (!myAnswer.trim() || submitting) ? 0.5 : 1 }}>
              {submitting ? <span className="gold-pulse"><span /><span /><span /></span> : 'Enviar mi respuesta ✨'}
            </button>
          </div>
        ) : !revealed ? (
          <div className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(61,26,36,0.4)', border: '1px solid rgba(61,26,36,0.8)' }}>
            <div className="text-2xl mb-2">⏳</div>
            <p className="text-sm font-medium mb-1" style={{ color: '#C9A84C' }}>
              Esperando a {otherProfile?.display_name}...
            </p>
            <p className="text-xs" style={{ color: '#B89FA8' }}>
              Las respuestas se revelarán cuando ambos hayan respondido
            </p>
          </div>
        ) : (
          <div className="space-y-3 reveal-animation">
            <div className="text-center text-xs mb-2" style={{ color: '#C9A84C' }}>
              ✨ ¡Ambos respondieron!
            </div>
            {[
              { uname: username, profile: myProfile, answer: myAnswerSaved?.answer, label: 'Tú' },
              { uname: otherUsername, profile: otherProfile, answer: otherAnswer?.answer, label: otherProfile?.display_name },
            ].map(({ uname, profile: p, answer }) => (
              <div key={uname} className="rounded-xl p-4"
                style={{
                  background: uname === 'mimmis' ? 'rgba(232,104,138,0.1)' : 'rgba(201,168,76,0.1)',
                  border: `1px solid ${uname === 'mimmis' ? 'rgba(232,104,138,0.3)' : 'rgba(201,168,76,0.3)'}`,
                }}>
                <div className="flex items-center gap-2 mb-2">
                  <span>{p?.avatar_emoji}</span>
                  <span className="text-xs font-semibold" style={{ color: uname === 'mimmis' ? '#E8688A' : '#C9A84C' }}>
                    {p?.display_name}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#FFF8F0' }}>{answer}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Streak */}
      {streak > 0 && (
        <div className="card p-4 flex items-center gap-4" style={{ border: '1px solid rgba(201,168,76,0.2)' }}>
          <div className="text-3xl fire-glow">🔥</div>
          <div>
            <p className="font-bold text-lg leading-none" style={{ color: '#C9A84C' }}>
              {streak} {streak === 1 ? 'día' : 'días'} seguidos
            </p>
            <p className="text-xs mt-1" style={{ color: '#B89FA8' }}>Racha de conexión activa</p>
          </div>
        </div>
      )}

      {/* Connection status */}
      <div className="card p-4" style={{ border: '1px solid rgba(61,26,36,0.8)' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}>
          Estado de la conexión
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {['mimmis', 'russell'].map(uname => {
            const p = getUserProfile(uname)
            const isMe = username === uname
            return (
              <div key={uname} className="rounded-xl p-3 text-center"
                style={{
                  background: uname === 'mimmis' ? 'rgba(232,104,138,0.08)' : 'rgba(201,168,76,0.08)',
                  border: `1px solid ${uname === 'mimmis' ? 'rgba(232,104,138,0.2)' : 'rgba(201,168,76,0.2)'}`,
                }}>
                <div className="text-2xl mb-1">{p.avatar_emoji}</div>
                <p className="text-sm font-semibold" style={{ color: uname === 'mimmis' ? '#E8688A' : '#C9A84C' }}>
                  {p.display_name}
                </p>
                <p className="text-xs mt-1" style={{ color: '#B89FA8' }}>
                  {isMe ? 'Tú 🟢' : '💕'}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {totalAnswered > 0 && (
        <div className="text-center py-2">
          <p className="text-sm" style={{ color: '#B89FA8' }}>
            Han respondido juntos{' '}
            <span className="font-bold" style={{ color: '#C9A84C' }}>{Math.floor(totalAnswered / 2)}</span>{' '}
            preguntas 🌟
          </p>
        </div>
      )}

      {totalAnswered === 0 && !myAnswerSaved && (
        <div className="card p-6 text-center" style={{ border: '1px solid rgba(61,26,36,0.5)' }}>
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-base mb-1" style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}>
            Aquí empieza todo
          </p>
          <p className="text-sm" style={{ color: '#B89FA8' }}>
            Responde la chispa del día y ve a Preguntas para comenzar a conocerse de verdad.
          </p>
        </div>
      )}
    </div>
  )
}
