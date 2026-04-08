import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, getUserProfile, getOtherUser } from '../lib/supabase'
import questionsData from '../data/questions.json'

const FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'favoritas', label: '❤️ Favoritas' },
  { id: 'sparks', label: '✨ Sparks' },
  { id: '1', label: '🌱 Nivel 1' },
  { id: '2', label: '🔥 Nivel 2' },
  { id: '3', label: '💜 Nivel 3' },
]

function MemoryCard({ question, mimmisAnswer, russellAnswer, date, isFavorite, onToggleFavorite, myUsername, isScrapbook }) {
  const mimmisProfile = getUserProfile('mimmis')
  const russellProfile = getUserProfile('russell')

  const levelData = question.question_level
    ? questionsData.levels[String(question.question_level)]
    : null

  const rotateClass = isScrapbook
    ? ['rotate-1', 'rotate-neg-1', 'rotate-2', 'rotate-neg-2'][Math.floor(Math.random() * 4)]
    : ''

  return (
    <div
      className={`card p-4 transition-all duration-300 ${isScrapbook ? rotateClass : ''}`}
      style={{
        border: isFavorite
          ? '1px solid rgba(232,104,138,0.4)'
          : '1px solid rgba(61,26,36,0.6)',
        boxShadow: isFavorite
          ? '0 0 20px rgba(232,104,138,0.08), 0 0 40px rgba(201,168,76,0.05)'
          : '0 0 12px rgba(0,0,0,0.3)',
        transform: isScrapbook
          ? `rotate(${Math.random() > 0.5 ? 1 : -1}deg)`
          : 'none',
      }}
    >
      {/* Question */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {levelData && (
            <span className="text-xs" style={{ color: '#C9A84C' }}>
              {levelData.emoji} {levelData.name}
            </span>
          )}
          {!levelData && (
            <span className="text-xs" style={{ color: '#C9A84C' }}>✨ Chispa del Día</span>
          )}
          {isFavorite && <span className="text-xs">❤️</span>}
          <span className="ml-auto text-xs" style={{ color: '#B89FA8' }}>
            {date
              ? new Date(date).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
              : ''}
          </span>
        </div>
        <p
          className="text-sm leading-relaxed"
          style={{
            fontFamily: 'Playfair Display, serif',
            color: '#FFF8F0',
            fontStyle: 'italic',
          }}
        >
          "{question.text || question.question_text}"
        </p>
      </div>

      {/* Answers */}
      <div className="space-y-2">
        {mimmisAnswer && (
          <div
            className="rounded-xl p-3"
            style={{
              background: 'rgba(232,104,138,0.08)',
              border: '1px solid rgba(232,104,138,0.2)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{mimmisProfile.avatar_emoji}</span>
              <span className="text-xs font-semibold" style={{ color: '#E8688A' }}>
                {mimmisProfile.display_name}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#FFF8F0' }}>
              {mimmisAnswer}
            </p>
          </div>
        )}

        {russellAnswer && (
          <div
            className="rounded-xl p-3"
            style={{
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.2)',
            }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-sm">{russellProfile.avatar_emoji}</span>
              <span className="text-xs font-semibold" style={{ color: '#C9A84C' }}>
                {russellProfile.display_name}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#FFF8F0' }}>
              {russellAnswer}
            </p>
          </div>
        )}
      </div>

      {/* Favorite button */}
      {onToggleFavorite && (
        <button
          onClick={onToggleFavorite}
          className="mt-3 w-full py-2 rounded-xl text-sm transition-all"
          style={{
            background: isFavorite ? 'rgba(232,104,138,0.1)' : 'transparent',
            border: `1px solid ${isFavorite ? 'rgba(232,104,138,0.3)' : 'rgba(61,26,36,0.5)'}`,
            color: isFavorite ? '#E8688A' : '#B89FA8',
            cursor: 'pointer',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          {isFavorite ? '❤️ Quitar de favoritas' : '🤍 Marcar como favorita'}
        </button>
      )}
    </div>
  )
}

export default function Memorias() {
  const { username } = useAuth()
  const [filter, setFilter] = useState('todas')
  const [questionAnswers, setQuestionAnswers] = useState([])
  const [sparkAnswers, setSparkAnswers] = useState([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    if (!username) return
    setLoading(true)
    try {
      const [qaRes, saRes] = await Promise.all([
        supabase
          .from('question_answers')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('daily_spark_answers')
          .select('*')
          .order('spark_date', { ascending: false }),
      ])

      setQuestionAnswers(qaRes.data || [])
      setSparkAnswers(saRes.data || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [username])

  useEffect(() => {
    loadData()
  }, [loadData])

  const toggleFavorite = async (answerId, currentValue) => {
    try {
      await supabase
        .from('question_answers')
        .update({ is_favorite: !currentValue })
        .eq('id', answerId)
      loadData()
    } catch (e) {
      console.error(e)
    }
  }

  // Group question answers by question_id
  const groupedQA = {}
  questionAnswers.forEach(a => {
    if (!groupedQA[a.question_id]) {
      groupedQA[a.question_id] = {
        id: a.question_id,
        question_text: a.question_text,
        question_level: a.question_level,
        mimmis: null,
        russell: null,
        date: a.created_at,
        mimmisId: null,
        russellId: null,
        isFavorite: false,
        mimmisIsFav: false,
        russellIsFav: false,
      }
    }
    const group = groupedQA[a.question_id]
    if (a.username === 'mimmis') {
      group.mimmis = a.answer
      group.mimmisId = a.id
      group.mimmisIsFav = a.is_favorite
    } else {
      group.russell = a.answer
      group.russellId = a.id
      group.russellIsFav = a.is_favorite
    }
    group.isFavorite = group.mimmisIsFav || group.russellIsFav
  })

  // Only show questions where both answered
  const bothAnswered = Object.values(groupedQA).filter(g => g.mimmis && g.russell)

  // Group spark answers by spark_date + question_text
  const groupedSparks = {}
  sparkAnswers.forEach(a => {
    const key = `${a.spark_date}|${a.question_text}`
    if (!groupedSparks[key]) {
      groupedSparks[key] = {
        id: key,
        question_text: a.question_text,
        spark_date: a.spark_date,
        mimmis: null,
        russell: null,
        date: a.created_at,
      }
    }
    groupedSparks[key][a.username] = a.answer
  })

  const bothSparks = Object.values(groupedSparks).filter(g => g.mimmis && g.russell)

  // Filter logic
  let displayItems = []

  if (filter === 'todas') {
    displayItems = [
      ...bothAnswered.map(g => ({ ...g, type: 'question' })),
      ...bothSparks.map(g => ({ ...g, type: 'spark' })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
  } else if (filter === 'favoritas') {
    displayItems = bothAnswered
      .filter(g => g.isFavorite)
      .map(g => ({ ...g, type: 'question' }))
  } else if (filter === 'sparks') {
    displayItems = bothSparks.map(g => ({ ...g, type: 'spark' }))
  } else {
    displayItems = bothAnswered
      .filter(g => String(g.question_level) === filter)
      .map(g => ({ ...g, type: 'question' }))
  }

  const totalTogether = bothAnswered.length + bothSparks.length

  return (
    <div className="page-enter px-4 pt-4 pb-6">
      {/* Header */}
      <div className="mb-5">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
        >
          Libro de Memorias 📔
        </h1>
        {totalTogether > 0 && (
          <p className="text-sm" style={{ color: '#B89FA8' }}>
            Han respondido juntos{' '}
            <span style={{ color: '#C9A84C', fontWeight: 600 }}>{totalTogether}</span>{' '}
            preguntas 🌟
          </p>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1 -mx-1 px-1">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{
              background: filter === f.id ? 'rgba(201,168,76,0.2)' : 'rgba(31,13,20,0.8)',
              border: `1px solid ${filter === f.id ? 'rgba(201,168,76,0.5)' : 'rgba(61,26,36,0.6)'}`,
              color: filter === f.id ? '#C9A84C' : '#B89FA8',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="gold-pulse"><span /><span /><span /></div>
        </div>
      ) : displayItems.length === 0 ? (
        <div
          className="card p-8 text-center"
          style={{ border: '1px solid rgba(61,26,36,0.4)' }}
        >
          <div className="text-4xl mb-4">
            {filter === 'favoritas' ? '🤍' : filter === 'sparks' ? '✨' : '📔'}
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
          >
            {filter === 'favoritas'
              ? 'Todavía no hay favoritas'
              : filter === 'sparks'
              ? 'Todavía no hay sparks juntos'
              : 'Aquí vivirán sus memorias'}
          </h3>
          <p className="text-sm" style={{ color: '#B89FA8', fontStyle: 'italic' }}>
            {filter === 'favoritas'
              ? 'Marca las preguntas que más los muevan con ❤️.'
              : filter === 'sparks'
              ? 'Respondan la chispa del día juntos para comenzar.'
              : 'Cada pregunta respondida juntos vive aquí para siempre.'}
          </p>
        </div>
      ) : filter === 'favoritas' ? (
        // Scrapbook layout for favorites
        <div>
          <p
            className="text-xs text-center mb-4"
            style={{
              color: '#B89FA8',
              fontStyle: 'italic',
              fontFamily: 'Playfair Display, serif',
            }}
          >
            Los momentos que más los tocaron ✨
          </p>
          <div className="space-y-4">
            {displayItems.map((item, i) => (
              <div
                key={item.id || i}
                style={{
                  transform: `rotate(${i % 2 === 0 ? 1 : -1}deg)`,
                  transition: 'transform 0.2s ease',
                }}
              >
                <MemoryCard
                  question={{ text: item.question_text, question_level: item.question_level }}
                  mimmisAnswer={item.mimmis}
                  russellAnswer={item.russell}
                  date={item.date || item.spark_date}
                  isFavorite={item.isFavorite}
                  myUsername={username}
                  isScrapbook
                  onToggleFavorite={
                    item.type === 'question'
                      ? () => {
                          const myAnswerId = username === 'mimmis' ? item.mimmisId : item.russellId
                          const myIsFav = username === 'mimmis' ? item.mimmisIsFav : item.russellIsFav
                          if (myAnswerId) toggleFavorite(myAnswerId, myIsFav)
                        }
                      : undefined
                  }
                />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {displayItems.map((item, i) => (
            <MemoryCard
              key={item.id || i}
              question={{ text: item.question_text || item.text, question_level: item.type === 'spark' ? null : item.question_level }}
              mimmisAnswer={item.mimmis}
              russellAnswer={item.russell}
              date={item.date || item.spark_date}
              isFavorite={item.isFavorite}
              myUsername={username}
              isScrapbook={false}
              onToggleFavorite={
                item.type === 'question'
                  ? () => {
                      const myAnswerId = username === 'mimmis' ? item.mimmisId : item.russellId
                      const myIsFav = username === 'mimmis' ? item.mimmisIsFav : item.russellIsFav
                      if (myAnswerId) toggleFavorite(myAnswerId, myIsFav)
                    }
                  : undefined
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
