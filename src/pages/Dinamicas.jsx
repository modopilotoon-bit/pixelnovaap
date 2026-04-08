import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, getOtherUser, getUserProfile } from '../lib/supabase'
import dinamicasData from '../data/dinamicas.json'

// ─── YO NUNCA ───────────────────────────────────────────────────────────────

function YoNunca({ username }) {
  const profile = getUserProfile(username)
  const [statement, setStatement] = useState('')
  const [myReaction, setMyReaction] = useState(null)
  const [otherReaction, setOtherReaction] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [session, setSession] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showPrompts, setShowPrompts] = useState(false)
  const [activeSession, setActiveSession] = useState(null)

  const otherUsername = getOtherUser(username)
  const otherProfile = getUserProfile(otherUsername)
  const myProfile = getUserProfile(username)

  const loadActiveSession = useCallback(async () => {
    const { data } = await supabase
      .from('dynamics_sessions')
      .select('*')
      .eq('type', 'yo_nunca')
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      setActiveSession(data)
      const state = data.state
      setStatement(state.statement || '')
      const myR = state.reactions?.[username]
      const otherR = state.reactions?.[otherUsername]
      setMyReaction(myR || null)
      setOtherReaction(otherR || null)
      if (myR && otherR) setRevealed(true)
    }
  }, [username, otherUsername])

  useEffect(() => {
    loadActiveSession()
  }, [loadActiveSession])

  // Realtime
  useEffect(() => {
    const channel = supabase
      .channel('yo-nunca-session')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'dynamics_sessions',
        filter: `type=eq.yo_nunca`,
      }, () => loadActiveSession())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [loadActiveSession])

  const startSession = async () => {
    if (!statement.trim()) return
    setSubmitting(true)
    try {
      const { data } = await supabase
        .from('dynamics_sessions')
        .insert({
          type: 'yo_nunca',
          state: { statement: statement.trim(), reactions: {} },
          created_by: username,
        })
        .select()
        .single()
      setActiveSession(data)
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const submitReaction = async (reaction) => {
    if (!activeSession) return
    setMyReaction(reaction)
    setSubmitting(true)
    try {
      const newState = {
        ...activeSession.state,
        reactions: {
          ...(activeSession.state.reactions || {}),
          [username]: reaction,
        },
      }
      await supabase
        .from('dynamics_sessions')
        .update({ state: newState })
        .eq('id', activeSession.id)

      await loadActiveSession()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const finishSession = async () => {
    if (!activeSession) return
    await supabase
      .from('dynamics_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', activeSession.id)
    setActiveSession(null)
    setStatement('')
    setMyReaction(null)
    setOtherReaction(null)
    setRevealed(false)
  }

  if (!activeSession) {
    return (
      <div className="space-y-4">
        <div
          className="card p-5"
          style={{ border: '1px solid rgba(61,26,36,0.6)' }}
        >
          <div className="text-center mb-4">
            <div className="text-3xl mb-2">🙅</div>
            <h3
              className="text-lg font-bold"
              style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
            >
              Yo Nunca...
            </h3>
            <p className="text-sm mt-1" style={{ color: '#B89FA8' }}>
              Escribe algo que nunca hayas hecho. Ambos reaccionan en secreto.
            </p>
          </div>

          <textarea
            className="input-field resize-none mb-3"
            rows={2}
            placeholder="Yo nunca he..."
            value={statement}
            onChange={e => setStatement(e.target.value)}
          />

          <button
            onClick={startSession}
            disabled={!statement.trim() || submitting}
            className="btn-primary"
            style={{ opacity: !statement.trim() ? 0.5 : 1 }}
          >
            Empezar ✨
          </button>

          <button
            onClick={() => setShowPrompts(v => !v)}
            className="btn-secondary mt-2"
          >
            💡 Ver ideas de frases
          </button>
        </div>

        {showPrompts && (
          <div className="card p-4" style={{ border: '1px solid rgba(61,26,36,0.5)' }}>
            <p className="text-xs font-semibold mb-3" style={{ color: '#C9A84C' }}>
              Ideas para inspirarte:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {dinamicasData.yo_nunca.prompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => { setStatement(prompt); setShowPrompts(false) }}
                  className="w-full text-left text-sm py-2 px-3 rounded-lg transition-colors"
                  style={{
                    color: '#B89FA8',
                    background: 'rgba(61,26,36,0.3)',
                    border: '1px solid rgba(61,26,36,0.5)',
                    cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif',
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div
        className="card p-5"
        style={{
          background: 'linear-gradient(135deg, #1F0D14, #2A0F1A)',
          border: '1px solid rgba(201,168,76,0.25)',
        }}
      >
        <div className="text-center mb-5">
          <p className="text-xs mb-2" style={{ color: '#C9A84C' }}>
            {activeSession.created_by === username ? 'Tu turno 🎯' : `${getUserProfile(activeSession.created_by).display_name} propuso:`}
          </p>
          <p
            className="text-lg font-bold"
            style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
          >
            {statement}
          </p>
        </div>

        {!revealed ? (
          <>
            {!myReaction ? (
              <div className="space-y-3">
                <p className="text-center text-sm" style={{ color: '#B89FA8' }}>
                  ¿Tú lo has hecho?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => submitReaction('si')}
                    className="flex-1 py-4 rounded-xl text-2xl transition-all"
                    style={{
                      background: 'rgba(201,168,76,0.1)',
                      border: '1px solid rgba(201,168,76,0.3)',
                      cursor: 'pointer',
                    }}
                  >
                    🙋<br/>
                    <span className="text-xs" style={{ color: '#C9A84C' }}>Sí lo he hecho</span>
                  </button>
                  <button
                    onClick={() => submitReaction('no')}
                    className="flex-1 py-4 rounded-xl text-2xl transition-all"
                    style={{
                      background: 'rgba(107,26,42,0.15)',
                      border: '1px solid rgba(107,26,42,0.4)',
                      cursor: 'pointer',
                    }}
                  >
                    🙅<br/>
                    <span className="text-xs" style={{ color: '#E8688A' }}>Nunca</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">
                  {myReaction === 'si' ? '🙋' : '🙅'}
                </div>
                <p className="text-sm" style={{ color: '#C9A84C' }}>
                  Tu respuesta guardada. Esperando a {otherProfile.display_name}...
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="reveal-animation space-y-3">
            <p className="text-center text-sm font-semibold" style={{ color: '#C9A84C' }}>
              ¡Revelación! 🎉
            </p>
            {[
              { username: username, reaction: myReaction, label: 'Tú' },
              { username: otherUsername, reaction: otherReaction, label: otherProfile.display_name },
            ].map(({ username, reaction, label }) => {
              const p = getUserProfile(username)
              return (
                <div
                  key={username}
                  className="flex items-center gap-3 rounded-xl p-3"
                  style={{
                    background: username === 'mimmis' ? 'rgba(232,104,138,0.1)' : 'rgba(201,168,76,0.1)',
                    border: `1px solid ${username === 'mimmis' ? 'rgba(232,104,138,0.3)' : 'rgba(201,168,76,0.3)'}`,
                  }}
                >
                  <span className="text-2xl">{p.avatar_emoji}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: username === 'mimmis' ? '#E8688A' : '#C9A84C' }}>
                      {label}
                    </p>
                    <p className="text-sm" style={{ color: '#FFF8F0' }}>
                      {reaction === 'si' ? '🙋 Sí lo he hecho' : '🙅 Nunca lo he hecho'}
                    </p>
                  </div>
                </div>
              )
            })}

            {myReaction !== otherReaction && (
              <div
                className="text-center py-3 rounded-xl"
                style={{
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                }}
              >
                <p className="text-base" style={{ color: '#C9A84C' }}>
                  ¡Revelación sorpresa! 🎉
                </p>
                <p className="text-xs mt-1" style={{ color: '#B89FA8' }}>
                  ¡Sus respuestas son diferentes!
                </p>
              </div>
            )}

            <button onClick={finishSession} className="btn-primary mt-2">
              Nueva ronda →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── COMPLETA LA FRASE ──────────────────────────────────────────────────────

function CompletaLaFrase({ username }) {
  const profile = getUserProfile(username)
  const [currentStarter, setCurrentStarter] = useState(null)
  const [myCompletion, setMyCompletion] = useState('')
  const [myCompletionSaved, setMyCompletionSaved] = useState(null)
  const [otherCompletion, setOtherCompletion] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [session, setSession] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const otherUsername = getOtherUser(username)
  const otherProfile = getUserProfile(otherUsername)
  const myProfile = getUserProfile(username)

  const starters = dinamicasData.completa_la_frase.starters

  const loadActiveSession = useCallback(async () => {
    const { data } = await supabase
      .from('dynamics_sessions')
      .select('*')
      .eq('type', 'completa_la_frase')
      .is('completed_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (data) {
      setSession(data)
      setCurrentStarter(data.state.starter)
      const myA = data.state.answers?.[username]
      const otherA = data.state.answers?.[otherUsername]
      setMyCompletionSaved(myA || null)
      setOtherCompletion(otherA || null)
      if (myA && otherA) setRevealed(true)
    }
  }, [username, otherUsername])

  useEffect(() => {
    loadActiveSession()
  }, [loadActiveSession])

  useEffect(() => {
    const channel = supabase
      .channel('completa-session')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'dynamics_sessions',
        filter: `type=eq.completa_la_frase`,
      }, () => loadActiveSession())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [loadActiveSession])

  const startSession = async () => {
    const randomStarter = starters[Math.floor(Math.random() * starters.length)]
    setCurrentStarter(randomStarter)
    try {
      const { data } = await supabase
        .from('dynamics_sessions')
        .insert({
          type: 'completa_la_frase',
          state: { starter: randomStarter, answers: {} },
          created_by: username,
        })
        .select()
        .single()
      setSession(data)
    } catch (e) {
      console.error(e)
    }
  }

  const submitCompletion = async () => {
    if (!myCompletion.trim() || !session) return
    setSubmitting(true)
    try {
      const newState = {
        ...session.state,
        answers: {
          ...(session.state.answers || {}),
          [username]: myCompletion.trim(),
        },
      }
      await supabase
        .from('dynamics_sessions')
        .update({ state: newState })
        .eq('id', session.id)
      setMyCompletionSaved(myCompletion.trim())
      setMyCompletion('')
      await loadActiveSession()
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const finishSession = async () => {
    if (!session) return
    await supabase
      .from('dynamics_sessions')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', session.id)
    setSession(null)
    setCurrentStarter(null)
    setMyCompletionSaved(null)
    setOtherCompletion(null)
    setRevealed(false)
  }

  if (!session) {
    return (
      <div
        className="card p-6 text-center"
        style={{ border: '1px solid rgba(61,26,36,0.6)' }}
      >
        <div className="text-3xl mb-3">✍️</div>
        <h3
          className="text-lg font-bold mb-2"
          style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
        >
          Completa la Frase
        </h3>
        <p className="text-sm mb-5" style={{ color: '#B89FA8' }}>
          La app les da un inicio de frase. Ambos lo completan en secreto y luego se revelan juntos.
        </p>
        <button onClick={startSession} className="btn-primary">
          Nueva frase aleatoria ✨
        </button>
      </div>
    )
  }

  return (
    <div
      className="card p-5"
      style={{
        background: 'linear-gradient(135deg, #1F0D14, #250F18)',
        border: '1px solid rgba(232,104,138,0.25)',
      }}
    >
      <div className="text-center mb-5">
        <p className="text-xs mb-2" style={{ color: '#E8688A' }}>Completa la frase:</p>
        <p
          className="text-xl font-bold"
          style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
        >
          "{currentStarter}"
        </p>
      </div>

      {!revealed ? (
        <>
          {!myCompletionSaved ? (
            <div className="space-y-3">
              <textarea
                className="input-field resize-none"
                rows={3}
                placeholder="Tu completación..."
                value={myCompletion}
                onChange={e => setMyCompletion(e.target.value)}
              />
              <button
                onClick={submitCompletion}
                disabled={!myCompletion.trim() || submitting}
                className="btn-primary"
                style={{ opacity: !myCompletion.trim() ? 0.5 : 1 }}
              >
                {submitting ? <span className="gold-pulse"><span /><span /><span /></span> : 'Guardar mi respuesta ✨'}
              </button>
            </div>
          ) : (
            <div
              className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(61,26,36,0.4)', border: '1px solid #3D1A24' }}
            >
              <div className="text-2xl mb-2">⏳</div>
              <p className="text-sm" style={{ color: '#C9A84C' }}>
                Esperando a {otherProfile.display_name}...
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-3 reveal-animation">
          <p className="text-center text-sm font-semibold" style={{ color: '#C9A84C' }}>
            ✨ ¡Revelación!
          </p>
          {[
            { username: username, answer: myCompletionSaved, label: 'Tú' },
            { username: otherUsername, answer: otherCompletion, label: otherProfile.display_name },
          ].map(({ username, answer, label }) => {
            const p = getUserProfile(username)
            return (
              <div
                key={username}
                className="rounded-xl p-4"
                style={{
                  background: username === 'mimmis' ? 'rgba(232,104,138,0.08)' : 'rgba(201,168,76,0.08)',
                  border: `1px solid ${username === 'mimmis' ? 'rgba(232,104,138,0.25)' : 'rgba(201,168,76,0.25)'}`,
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span>{p.avatar_emoji}</span>
                  <span className="text-xs font-semibold" style={{ color: username === 'mimmis' ? '#E8688A' : '#C9A84C' }}>
                    {label}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#B89FA8', fontStyle: 'italic', fontSize: '0.75rem' }}>
                  "{currentStarter}"
                </p>
                <p className="text-sm mt-1" style={{ color: '#FFF8F0' }}>{answer}</p>
              </div>
            )
          })}
          <button onClick={finishSession} className="btn-primary mt-2">
            Nueva frase →
          </button>
        </div>
      )}
    </div>
  )
}

// ─── TRIVIA ─────────────────────────────────────────────────────────────────

function Trivia({ username }) {
  const profile = getUserProfile(username)
  const [questions, setQuestions] = useState([])
  const [currentQ, setCurrentQ] = useState(0)
  const [score, setScore] = useState(0)
  const [selected, setSelected] = useState(null)
  const [finished, setFinished] = useState(false)
  const [loading, setLoading] = useState(false)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)

  const otherUsername = getOtherUser(username)
  const otherProfile = getUserProfile(otherUsername)

  useEffect(() => {
    const checkTotal = async () => {
      const { count } = await supabase
        .from('question_answers')
        .select('id', { count: 'exact', head: true })
      setTotalAnswered(count || 0)
    }
    checkTotal()
  }, [])

  const startTrivia = async () => {
    setLoading(true)
    try {
      // Get other user's answers to make questions about them
      const { data } = await supabase
        .from('question_answers')
        .select('*')
        .eq('username', otherUsername)
        .limit(20)

      if (!data || data.length < 3) {
        setLoading(false)
        return
      }

      // Build trivia questions
      const pool = data.filter(a => a.answer?.length > 5)
      const selected = pool.slice(0, 5)
      const triviaQs = selected.map(ans => {
        const others = pool
          .filter(a => a.question_id !== ans.question_id)
          .sort(() => 0.5 - Math.random())
          .slice(0, 3)
          .map(a => a.answer)

        const options = [...others, ans.answer].sort(() => 0.5 - Math.random())
        return {
          question: `¿Qué respondió ${otherProfile.display_name} a: "${ans.question_text.slice(0, 60)}${ans.question_text.length > 60 ? '...' : ''}"?`,
          correct: ans.answer,
          options,
        }
      })

      setQuestions(triviaQs)
      setCurrentQ(0)
      setScore(0)
      setSelected(null)
      setFinished(false)
      setGameStarted(true)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (totalAnswered < 30) {
    return (
      <div
        className="card p-6 text-center"
        style={{ border: '1px solid rgba(61,26,36,0.5)' }}
      >
        <div className="text-3xl mb-3">🧠</div>
        <h3
          className="text-lg font-bold mb-2"
          style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
        >
          Trivia sobre ti
        </h3>
        <p className="text-sm mb-3" style={{ color: '#B89FA8' }}>
          Disponible después de responder 15 preguntas juntos. Llevan {Math.floor(totalAnswered / 2)} preguntas completadas.
        </p>
        <div
          className="h-2 rounded-full"
          style={{ background: 'rgba(61,26,36,0.5)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min((totalAnswered / 30) * 100, 100)}%`,
              background: 'linear-gradient(90deg, #C9A84C, #E8C87C)',
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: '#B89FA8' }}>
          {Math.floor(totalAnswered / 2)}/15 preguntas
        </p>
      </div>
    )
  }

  if (!gameStarted) {
    return (
      <div
        className="card p-6 text-center"
        style={{ border: '1px solid rgba(61,26,36,0.6)' }}
      >
        <div className="text-3xl mb-3">🧠</div>
        <h3
          className="text-lg font-bold mb-2"
          style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
        >
          Trivia sobre ti
        </h3>
        <p className="text-sm mb-5" style={{ color: '#B89FA8' }}>
          ¿Recuerdas lo que {otherProfile.display_name} respondió? Responde 5 preguntas basadas en sus respuestas reales.
        </p>
        <button onClick={startTrivia} disabled={loading} className="btn-primary">
          {loading ? <span className="gold-pulse"><span /><span /><span /></span> : 'Empezar trivia 🧠'}
        </button>
      </div>
    )
  }

  if (finished) {
    const msgs = [
      { min: 5, text: '¡Perfecto! 🌟 Los conoces de memoria.', emoji: '🏆' },
      { min: 4, text: '¡Excelente! Casi perfecto.', emoji: '⭐' },
      { min: 3, text: '¡Bien! Siguen conociéndose.', emoji: '😊' },
      { min: 0, text: 'Hay mucho por descubrir todavía.', emoji: '🌱' },
    ]
    const msg = msgs.find(m => score >= m.min)
    return (
      <div
        className="card p-6 text-center reveal-animation"
        style={{ border: '1px solid rgba(201,168,76,0.3)' }}
      >
        <div className="text-5xl mb-4">{msg.emoji}</div>
        <h3
          className="text-xl font-bold mb-2"
          style={{ fontFamily: 'Playfair Display, serif', color: '#C9A84C' }}
        >
          {score}/5 respuestas correctas
        </h3>
        <p className="text-sm mb-5" style={{ color: '#B89FA8' }}>{msg.text}</p>
        <button onClick={startTrivia} className="btn-primary">
          Jugar otra vez →
        </button>
      </div>
    )
  }

  const q = questions[currentQ]
  if (!q) return null

  return (
    <div
      className="card p-5"
      style={{
        background: 'linear-gradient(135deg, #1F0D14, #1A1024)',
        border: '1px solid rgba(107,26,42,0.4)',
      }}
    >
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs" style={{ color: '#B89FA8' }}>
          Pregunta {currentQ + 1} de {questions.length}
        </span>
        <span className="text-xs" style={{ color: '#C9A84C' }}>
          🌟 {score} correctas
        </span>
      </div>

      <div className="h-1 rounded-full mb-5" style={{ background: 'rgba(61,26,36,0.5)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${((currentQ) / questions.length) * 100}%`,
            background: 'linear-gradient(90deg, #C9A84C, #E8C87C)',
          }}
        />
      </div>

      <p
        className="text-base font-semibold mb-5 leading-relaxed"
        style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
      >
        {q.question}
      </p>

      <div className="space-y-2">
        {q.options.map((option, i) => {
          let borderColor = 'rgba(61,26,36,0.6)'
          let bgColor = 'rgba(31,13,20,0.5)'
          let textColor = '#FFF8F0'

          if (selected !== null) {
            if (option === q.correct) {
              borderColor = 'rgba(201,168,76,0.6)'
              bgColor = 'rgba(201,168,76,0.15)'
              textColor = '#C9A84C'
            } else if (option === selected && selected !== q.correct) {
              borderColor = 'rgba(232,104,138,0.5)'
              bgColor = 'rgba(232,104,138,0.1)'
              textColor = '#E8688A'
            }
          }

          return (
            <button
              key={i}
              onClick={() => {
                if (selected !== null) return
                setSelected(option)
                if (option === q.correct) setScore(s => s + 1)
                setTimeout(() => {
                  setSelected(null)
                  if (currentQ + 1 >= questions.length) {
                    setFinished(true)
                  } else {
                    setCurrentQ(q => q + 1)
                  }
                }, 1200)
              }}
              className="w-full text-left py-3 px-4 rounded-xl transition-all duration-200"
              style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                color: textColor,
                cursor: selected !== null ? 'default' : 'pointer',
                fontFamily: 'Inter, sans-serif',
                fontSize: '0.875rem',
              }}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── MAIN ───────────────────────────────────────────────────────────────────

export default function Dinamicas() {
  const { username } = useAuth()
  const [activeTab, setActiveTab] = useState('yo_nunca')

  const tabs = [
    { id: 'yo_nunca', label: 'Yo Nunca', emoji: '🙅' },
    { id: 'completa', label: 'Completa', emoji: '✍️' },
    { id: 'trivia', label: 'Trivia', emoji: '🧠' },
  ]

  if (!username) return null
  const profile = getUserProfile(username)

  return (
    <div className="page-enter px-4 pt-4 pb-6">
      <div className="mb-5">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
        >
          Dinámicas 🎮
        </h1>
        <p className="text-sm" style={{ color: '#B89FA8' }}>
          Juegos para conocerse de otra manera
        </p>
      </div>

      {/* Tab selector */}
      <div
        className="flex rounded-xl mb-5 p-1"
        style={{ background: '#1F0D14', border: '1px solid #3D1A24' }}
      >
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === tab.id ? 'rgba(201,168,76,0.2)' : 'transparent',
              color: activeTab === tab.id ? '#C9A84C' : '#B89FA8',
              border: activeTab === tab.id ? '1px solid rgba(201,168,76,0.3)' : '1px solid transparent',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {tab.emoji} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'yo_nunca' && <YoNunca username={username} />}
      {activeTab === 'completa' && <CompletaLaFrase username={username} />}
      {activeTab === 'trivia' && <Trivia username={username} />}
    </div>
  )
}
