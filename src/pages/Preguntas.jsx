import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, getOtherUser, getUserProfile } from '../lib/supabase'
import questionsData from '../data/questions.json'
import Celebration from '../components/Celebration'
import confetti from 'canvas-confetti'

const MILESTONES_QUESTIONS = [
  { threshold: 10, key: 'answers_10', emoji: '🔥', title: '¡10 preguntas juntos!', message: 'La chispa está encendida. Siguen conociéndose.' },
  { threshold: 25, key: 'answers_25', emoji: '💜', title: '¡25 preguntas juntos!', message: 'Van conociendo sus almas. Esto es hermoso.' },
  { threshold: 50, key: 'answers_50', emoji: '✨', title: '¡50 preguntas juntos!', message: 'Esto ya es algo especial. Cincuenta momentos de verdad.' },
  { threshold: 100, key: 'answers_100', emoji: '🌹', title: '¡100 preguntas juntos!', message: 'Esto es amor real. Cien puertas abiertas entre ustedes.' },
]

function LevelBadge({ level, locked, progress, required }) {
  const levelData = questionsData.levels[String(level)]
  return (
    <div
      className="flex-1 rounded-xl p-3 text-center relative overflow-hidden"
      style={{
        background: locked ? 'rgba(61,26,36,0.3)' : 'rgba(201,168,76,0.1)',
        border: `1px solid ${locked ? '#3D1A24' : 'rgba(201,168,76,0.3)'}`,
        opacity: locked ? 0.6 : 1,
      }}
    >
      {locked && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: 'rgba(13,6,8,0.5)', backdropFilter: 'blur(2px)', zIndex: 1 }}
        >
          <div className="text-center">
            <div className="text-lg">🔒</div>
            <p className="text-xs" style={{ color: '#B89FA8' }}>
              {progress}/{required} para desbloquear
            </p>
          </div>
        </div>
      )}
      <div className="text-xl">{levelData?.emoji}</div>
      <p className="text-xs font-semibold mt-1" style={{ color: '#FFF8F0' }}>
        Nivel {level}
      </p>
      <p className="text-xs" style={{ color: '#B89FA8' }}>
        {levelData?.name}
      </p>
    </div>
  )
}

function QuestionCard({ question, myAnswer, otherAnswer, onSubmit, onSkip, onFavorite, submitting }) {
  const { username } = useAuth()
  const [answer, setAnswer] = useState('')
  const [flipped, setFlipped] = useState(false)
  const otherUsername = getOtherUser(username)
  const otherProfile = getUserProfile(otherUsername)
  const myProfile = getUserProfile(username)

  const bothAnswered = !!(myAnswer && otherAnswer)

  useEffect(() => {
    if (bothAnswered && !flipped) {
      setTimeout(() => setFlipped(true), 300)
    }
    if (!bothAnswered) {
      setFlipped(false)
    }
  }, [bothAnswered])

  const handleSubmit = async () => {
    if (!answer.trim()) return
    await onSubmit(answer.trim())
    setAnswer('')
  }

  if (flipped) {
    // Revealed state — show both answers directly (no flip needed once revealed)
    return (
      <div
        className="card p-5 reveal-animation"
        style={{
          background: 'linear-gradient(135deg, #1F0D14, #250F18)',
          border: '1px solid rgba(201,168,76,0.4)',
          boxShadow: '0 0 40px rgba(201,168,76,0.15)',
        }}
      >
        <div className="text-center mb-4">
          <span className="text-2xl">✨</span>
          <p className="text-sm font-medium mt-1" style={{ color: '#C9A84C' }}>
            ¡Ambos respondieron!
          </p>
          <p
            className="text-xs italic mt-1 leading-tight px-2"
            style={{ color: '#B89FA8', fontFamily: 'Playfair Display, serif' }}
          >
            "{question.text}"
          </p>
        </div>

        <div className="space-y-3 mb-4">
          {[
            { uname: username, answer: myAnswer, label: 'Tú' },
            { uname: otherUsername, answer: otherAnswer, label: otherProfile?.display_name },
          ].map(({ uname, answer: ans, label }) => {
            const p = getUserProfile(uname)
            return (
              <div
                key={uname}
                className="rounded-xl p-3"
                style={{
                  background: uname === 'mimmis' ? 'rgba(232,104,138,0.08)' : 'rgba(201,168,76,0.08)',
                  border: `1px solid ${uname === 'mimmis' ? 'rgba(232,104,138,0.25)' : 'rgba(201,168,76,0.25)'}`,
                }}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span className="text-base">{p.avatar_emoji}</span>
                  <span className="text-xs font-semibold" style={{ color: uname === 'mimmis' ? '#E8688A' : '#C9A84C' }}>
                    {label}
                  </span>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#FFF8F0' }}>
                  {ans?.answer || ans}
                </p>
              </div>
            )
          })}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onFavorite(myAnswer?.id)}
            className="btn-secondary flex-1"
            style={{
              borderColor: myAnswer?.is_favorite ? '#E8688A' : undefined,
              color: myAnswer?.is_favorite ? '#E8688A' : undefined,
            }}
          >
            {myAnswer?.is_favorite ? '❤️ Favorita' : '🤍 Favorita'}
          </button>
          <button
            onClick={onSkip}
            className="btn-primary flex-1"
            style={{ background: 'linear-gradient(135deg, #6B1A2A, #4A1019)' }}
          >
            Siguiente →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className="card card-glow p-5"
      style={{
        background: 'linear-gradient(135deg, #1F0D14, #2A0F1A)',
        border: '1px solid rgba(201,168,76,0.25)',
      }}
    >
      {/* Level indicator */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm">{questionsData.levels[String(question.level)]?.emoji}</span>
        <span className="text-xs" style={{ color: '#B89FA8' }}>
          Nivel {question.level} · {questionsData.levels[String(question.level)]?.name}
        </span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full"
          style={{
            background: 'rgba(201,168,76,0.1)',
            color: '#C9A84C',
            border: '1px solid rgba(201,168,76,0.2)',
          }}
        >
          {question.id}
        </span>
      </div>

      {/* Question text */}
      <p
        className="text-lg leading-relaxed mb-5"
        style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0', fontStyle: 'italic' }}
      >
        "{question.text}"
      </p>

      {/* Status badges */}
      <div className="flex gap-2 mb-4">
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            background: myAnswer ? 'rgba(201,168,76,0.15)' : 'rgba(61,26,36,0.4)',
            color: myAnswer ? '#C9A84C' : '#B89FA8',
            border: `1px solid ${myAnswer ? 'rgba(201,168,76,0.3)' : '#3D1A24'}`,
          }}
        >
          {myProfile?.avatar_emoji} {myAnswer ? 'Respondiste ✓' : 'Sin respuesta'}
        </span>
        <span
          className="text-xs px-2 py-1 rounded-full"
          style={{
            background: otherAnswer ? 'rgba(232,104,138,0.1)' : 'rgba(61,26,36,0.4)',
            color: otherAnswer ? '#E8688A' : '#B89FA8',
            border: `1px solid ${otherAnswer ? 'rgba(232,104,138,0.3)' : '#3D1A24'}`,
          }}
        >
          {otherProfile?.avatar_emoji} {otherAnswer ? 'Respondió ✓' : 'Sin respuesta'}
        </span>
      </div>

      {!myAnswer ? (
        <div className="space-y-3">
          <textarea
            className="input-field resize-none"
            rows={3}
            placeholder="Tu respuesta sincera..."
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            style={{ minHeight: '80px' }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || submitting}
              className="btn-primary flex-1"
              style={{ opacity: (!answer.trim() || submitting) ? 0.5 : 1 }}
            >
              {submitting
                ? <span className="gold-pulse"><span /><span /><span /></span>
                : 'Responder ✨'}
            </button>
            <button onClick={onSkip} className="btn-secondary px-4">
              👋 Pasar
            </button>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl p-3 text-center"
          style={{ background: 'rgba(61,26,36,0.4)', border: '1px solid #3D1A24' }}
        >
          <p className="text-sm" style={{ color: '#C9A84C' }}>
            ✍️ Esperando que {otherProfile?.display_name} responda...
          </p>
          <p className="text-xs mt-1" style={{ color: '#B89FA8' }}>
            La magia comienza cuando ambos responden
          </p>
        </div>
      )}
    </div>
  )
}

export default function Preguntas() {
  const { username, profile } = useAuth()
  const [activeLevel, setActiveLevel] = useState(1)
  const [answeredQuestions, setAnsweredQuestions] = useState({})
  const [currentIndex, setCurrentIndex] = useState({})
  const [skippedIds, setSkippedIds] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [celebration, setCelebration] = useState(null)
  const [levelProgress, setLevelProgress] = useState({ 1: 0, 2: 0, 3: 0 })
  const otherUsername = username ? getOtherUser(username) : null

  const loadAnswers = useCallback(async () => {
    if (!username) return
    setLoading(true)
    try {
      const { data } = await supabase
        .from('question_answers')
        .select('*')
        .order('created_at', { ascending: true })

      const byQId = {}
      const progressByLevel = { 1: new Set(), 2: new Set(), 3: new Set() }

      ;(data || []).forEach(a => {
        if (!byQId[a.question_id]) byQId[a.question_id] = {}
        byQId[a.question_id][a.username] = a
        // Count questions answered by BOTH users
        if (byQId[a.question_id]['mimmis'] && byQId[a.question_id]['russell']) {
          progressByLevel[a.question_level]?.add(a.question_id)
        }
      })

      setAnsweredQuestions(byQId)
      setLevelProgress({
        1: progressByLevel[1].size,
        2: progressByLevel[2].size,
        3: progressByLevel[3].size,
      })
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    loadAnswers()
  }, [loadAnswers])

  // Realtime
  useEffect(() => {
    if (!username) return
    const channel = supabase
      .channel('question-answers')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'question_answers',
      }, () => loadAnswers())
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'question_answers',
      }, () => loadAnswers())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [username, loadAnswers])

  const getLevelQuestions = (level) => {
    const all = questionsData.levels[String(level)]?.questions || []
    const answered = all.filter(q => {
      const ans = answeredQuestions[q.id]
      return ans?.mimmis && ans?.russell
    })
    const unanswered = all.filter(q => {
      const ans = answeredQuestions[q.id]
      return !(ans?.mimmis && ans?.russell)
    })
    // Put skipped ones at the end
    const nonSkipped = unanswered.filter(q => !skippedIds.includes(q.id))
    const skipped = unanswered.filter(q => skippedIds.includes(q.id))
    return [...nonSkipped, ...skipped]
  }

  const isLevelLocked = (level) => {
    if (level === 1) return false
    if (level === 2) return levelProgress[1] < 10
    if (level === 3) return levelProgress[2] < 10
    return true
  }

  const questions = getLevelQuestions(activeLevel)
  const idx = currentIndex[activeLevel] || 0
  const currentQuestion = questions[idx]
  const myAnswer = currentQuestion ? answeredQuestions[currentQuestion.id]?.[username] : null
  const otherAnswer = currentQuestion ? answeredQuestions[currentQuestion.id]?.[otherUsername] : null

  const handleSubmit = async (answer) => {
    if (!currentQuestion || !username || submitting) return
    setSubmitting(true)
    try {
      await supabase.from('question_answers').insert({
        question_id: currentQuestion.id,
        question_level: currentQuestion.level,
        question_text: currentQuestion.text,
        username,
        answer,
        is_favorite: false,
      })

      await loadAnswers()

      // Check milestones based on total pairs answered across all levels
      const totalPairs = Object.values(answeredQuestions).filter(
        q => q.mimmis && q.russell
      ).length + (otherAnswer ? 1 : 0)

      for (const m of MILESTONES_QUESTIONS) {
        if (totalPairs >= m.threshold) {
          const { data: existing } = await supabase
            .from('milestones')
            .select('id')
            .eq('type', m.key)
            .maybeSingle()

          if (!existing) {
            await supabase.from('milestones').insert({ type: m.key, data: {} })
            setCelebration(m)
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#C9A84C', '#E8688A', '#E8C87C', '#F4A0B5'],
            })
            break
          }
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSkip = () => {
    if (currentQuestion) {
      setSkippedIds(prev => [...new Set([...prev, currentQuestion.id])])
    }
    setCurrentIndex(prev => ({
      ...prev,
      [activeLevel]: (prev[activeLevel] || 0) + 1,
    }))
  }

  const handleFavorite = async (answerId) => {
    if (!answerId) return
    try {
      const current = answeredQuestions[currentQuestion?.id]?.[username]
      await supabase
        .from('question_answers')
        .update({ is_favorite: !current?.is_favorite })
        .eq('id', answerId)
      await loadAnswers()
    } catch (e) {
      console.error(e)
    }
  }

  const allAnswered = questions.length === 0 || (idx >= questions.length)

  return (
    <div className="page-enter px-4 pt-4 pb-6">
      {celebration && (
        <Celebration milestone={celebration} onClose={() => setCelebration(null)} />
      )}

      {/* Header */}
      <div className="mb-5">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
        >
          Preguntas 🃏
        </h1>
        <p className="text-sm" style={{ color: '#B89FA8' }}>
          Conócense de verdad, nivel por nivel
        </p>
      </div>

      {/* Level selector */}
      <div className="flex gap-2 mb-5">
        {[1, 2, 3].map(level => {
          const locked = isLevelLocked(level)
          const levelData = questionsData.levels[String(level)]
          const required = level === 1 ? 0 : 10
          const progressVal = level === 2 ? levelProgress[1] : levelProgress[2]

          return (
            <button
              key={level}
              onClick={() => !locked && setActiveLevel(level)}
              disabled={locked}
              className="flex-1 rounded-xl p-3 text-center relative overflow-hidden transition-all duration-200"
              style={{
                background: locked
                  ? 'rgba(61,26,36,0.3)'
                  : activeLevel === level
                  ? 'rgba(201,168,76,0.15)'
                  : 'rgba(31,13,20,0.8)',
                border: activeLevel === level
                  ? '1px solid rgba(201,168,76,0.5)'
                  : '1px solid rgba(61,26,36,0.6)',
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.6 : 1,
              }}
            >
              {locked && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center"
                  style={{ background: 'rgba(13,6,8,0.6)', backdropFilter: 'blur(2px)' }}
                >
                  <span className="text-sm">🔒</span>
                  <span className="text-xs" style={{ color: '#B89FA8' }}>
                    {progressVal}/{required}
                  </span>
                </div>
              )}
              <div className="text-xl">{levelData?.emoji}</div>
              <p className="text-xs font-medium mt-1" style={{ color: '#FFF8F0' }}>
                Nivel {level}
              </p>
              <p className="text-xs" style={{ color: '#B89FA8' }}>
                {levelData?.name}
              </p>
              <p className="text-xs mt-1" style={{ color: '#C9A84C' }}>
                {levelProgress[level]}/{levelData?.questions?.length}
              </p>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="gold-pulse"><span /><span /><span /></div>
        </div>
      ) : allAnswered ? (
        <div className="card p-8 text-center" style={{ border: '1px solid rgba(61,26,36,0.5)' }}>
          <div className="text-4xl mb-4">🌟</div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C' }}
          >
            {questions.length === 0
              ? '¡Han respondido todas las preguntas de este nivel!'
              : 'No hay más preguntas en este momento'}
          </h3>
          <p className="text-sm" style={{ color: '#B89FA8' }}>
            {activeLevel < 3
              ? 'Prueba el siguiente nivel o revisa tus memorias.'
              : 'Han explorado todo juntos. Qué hermoso viaje.'}
          </p>
        </div>
      ) : currentQuestion ? (
        <div>
          {/* Progress */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs" style={{ color: '#B89FA8' }}>
              {levelProgress[activeLevel]} de {questionsData.levels[String(activeLevel)]?.questions?.length} respondidas juntos
            </span>
            <span className="text-xs" style={{ color: '#B89FA8' }}>
              Pregunta {idx + 1}/{questions.length}
            </span>
          </div>

          {/* Progress bar */}
          <div
            className="h-1 rounded-full mb-5"
            style={{ background: 'rgba(61,26,36,0.5)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(levelProgress[activeLevel] / (questionsData.levels[String(activeLevel)]?.questions?.length || 1)) * 100}%`,
                background: 'linear-gradient(90deg, #C9A84C, #E8C87C)',
              }}
            />
          </div>

          <QuestionCard
            question={currentQuestion}
            myAnswer={myAnswer}
            otherAnswer={otherAnswer}
            onSubmit={handleSubmit}
            onSkip={handleSkip}
            onFavorite={handleFavorite}
            submitting={submitting}
          />
        </div>
      ) : null}
    </div>
  )
}
