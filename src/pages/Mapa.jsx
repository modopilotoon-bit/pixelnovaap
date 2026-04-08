import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase, getOtherUser, getUserProfile } from '../lib/supabase'
import questionsData from '../data/questions.json'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from 'recharts'

const CATEGORIES = questionsData.categories
const CATEGORY_KEYS = Object.keys(CATEGORIES)

function getCategoryLabel(key) {
  return `${CATEGORIES[key]?.emoji} ${CATEGORIES[key]?.label}`
}

function getCategoryMax(categoryKey) {
  const allQs = [
    ...questionsData.levels['1'].questions,
    ...questionsData.levels['2'].questions,
    ...questionsData.levels['3'].questions,
  ]
  return allQs.filter(q => q.category === categoryKey).length
}

function CustomAngleAxis({ payload, x, y, cx, cy, ...rest }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      style={{
        fontSize: '10px',
        fill: '#B89FA8',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      {payload.value}
    </text>
  )
}

export default function Mapa() {
  const { username } = useAuth()
  const [chartData, setChartData] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalExplored, setTotalExplored] = useState(0)
  const [richCategories, setRichCategories] = useState([])

  const otherUsername = getOtherUser(username)

  const loadData = useCallback(async () => {
    if (!username) return
    setLoading(true)
    try {
      // Get all answers
      const { data: answers } = await supabase
        .from('question_answers')
        .select('question_id, username, question_level')

      const myAnswers = new Set((answers || []).filter(a => a.username === username).map(a => a.question_id))
      const otherAnswers = new Set((answers || []).filter(a => a.username === otherUsername).map(a => a.question_id))

      // Both answered
      const bothAnswered = [...myAnswers].filter(id => otherAnswers.has(id))

      // Build category progress
      const allQs = [
        ...questionsData.levels['1'].questions,
        ...questionsData.levels['2'].questions,
        ...questionsData.levels['3'].questions,
      ]

      const categoryProgress = {}
      CATEGORY_KEYS.forEach(cat => {
        const catQs = allQs.filter(q => q.category === cat)
        const myAnsweredInCat = catQs.filter(q => myAnswers.has(q.id)).length
        const otherAnsweredInCat = catQs.filter(q => otherAnswers.has(q.id)).length
        const bothInCat = catQs.filter(q => bothAnswered.includes(q.id)).length
        const max = catQs.length

        categoryProgress[cat] = {
          my: Math.round((myAnsweredInCat / max) * 100),
          other: Math.round((otherAnsweredInCat / max) * 100),
          both: bothInCat,
          max,
        }
      })

      const data = CATEGORY_KEYS.map(cat => ({
        subject: getCategoryLabel(cat),
        key: cat,
        [username]: categoryProgress[cat].my,
        [otherUsername]: categoryProgress[cat].other,
        both: categoryProgress[cat].both,
        max: categoryProgress[cat].max,
      }))

      setChartData(data)

      // Count deeply explored dimensions (>50%)
      const deepDimensions = CATEGORY_KEYS.filter(cat => {
        const { both, max } = categoryProgress[cat]
        return both / max >= 0.5
      })
      setTotalExplored(deepDimensions.length)

      // Richest categories
      const sorted = CATEGORY_KEYS
        .map(cat => ({
          key: cat,
          ...categoryProgress[cat],
          label: CATEGORIES[cat].label,
          emoji: CATEGORIES[cat].emoji,
        }))
        .sort((a, b) => b.both - a.both)
        .filter(c => c.both > 0)
        .slice(0, 4)
      setRichCategories(sorted)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [username, otherUsername])

  useEffect(() => {
    loadData()
  }, [loadData])

  const myProfile = getUserProfile(username)
  const otherProfile = getUserProfile(otherUsername)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="gold-pulse"><span /><span /><span /></div>
      </div>
    )
  }

  const hasData = chartData.some(d => d[username] > 0 || d[otherUsername] > 0)

  return (
    <div className="page-enter px-4 pt-4 pb-6">
      <div className="mb-5">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
        >
          Mapa de Conexión 🗺️
        </h1>
        <p className="text-sm" style={{ color: '#B89FA8' }}>
          Las dimensiones que han explorado juntos
        </p>
      </div>

      {!hasData ? (
        <div
          className="card p-8 text-center"
          style={{ border: '1px solid rgba(61,26,36,0.5)' }}
        >
          <div className="text-5xl mb-4">🗺️</div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'Playfair Display, serif', color: '#FFF8F0' }}
          >
            El mapa está en blanco
          </h3>
          <p className="text-sm" style={{ color: '#B89FA8' }}>
            El mapa se irá llenando conforme respondan preguntas juntos. Cada respuesta traza un camino.
          </p>
        </div>
      ) : (
        <>
          {/* Radar chart */}
          <div
            className="card p-4 mb-5"
            style={{
              background: 'linear-gradient(135deg, #1F0D14, #2A0F1A)',
              border: '1px solid rgba(201,168,76,0.2)',
            }}
          >
            <div className="flex items-center justify-center gap-6 mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: '#E8688A' }}
                />
                <span className="text-xs" style={{ color: '#B89FA8' }}>
                  {myProfile?.avatar_emoji} {getUserProfile('mimmis').display_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: '#C9A84C' }}
                />
                <span className="text-xs" style={{ color: '#B89FA8' }}>
                  {myProfile?.avatar_emoji === '⚡' ? myProfile?.avatar_emoji : '⚡'} {getUserProfile('russell').display_name}
                </span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={chartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                <PolarGrid
                  stroke="rgba(61,26,36,0.6)"
                  gridType="polygon"
                />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={<CustomAngleAxis />}
                />
                <Radar
                  name={getUserProfile('mimmis').display_name}
                  dataKey="mimmis"
                  stroke="#E8688A"
                  fill="#E8688A"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Radar
                  name={getUserProfile('russell').display_name}
                  dataKey="russell"
                  stroke="#C9A84C"
                  fill="#C9A84C"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary */}
          <div
            className="card p-4 mb-5"
            style={{ border: '1px solid rgba(201,168,76,0.15)' }}
          >
            <p className="text-center text-sm" style={{ color: '#B89FA8' }}>
              Han explorado{' '}
              <span
                className="font-bold text-base"
                style={{ color: '#C9A84C' }}
              >
                {totalExplored} de 8
              </span>{' '}
              dimensiones profundamente
            </p>
            <p
              className="text-center text-xs mt-1"
              style={{ color: '#B89FA8', fontStyle: 'italic', fontFamily: 'Playfair Display, serif' }}
            >
              {totalExplored === 0
                ? 'El viaje apenas comienza...'
                : totalExplored <= 3
                ? 'La conexión crece con cada respuesta.'
                : totalExplored <= 6
                ? 'Están construyendo algo profundo juntos.'
                : 'Han explorado casi todo. Alma completa.'}
            </p>
          </div>

          {/* Category bars */}
          <div className="space-y-3">
            {CATEGORY_KEYS.map(cat => {
              const d = chartData.find(c => c.key === cat)
              if (!d) return null
              const catInfo = CATEGORIES[cat]
              const pct = Math.round((d.both / d.max) * 100)

              return (
                <div
                  key={cat}
                  className="card p-4"
                  style={{ border: '1px solid rgba(61,26,36,0.5)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{catInfo.emoji}</span>
                      <span className="text-sm font-medium" style={{ color: '#FFF8F0' }}>
                        {catInfo.label}
                      </span>
                    </div>
                    <span className="text-xs" style={{ color: '#B89FA8' }}>
                      {d.both}/{d.max} juntos
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(61,26,36,0.5)' }}>
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: pct >= 50
                          ? 'linear-gradient(90deg, #C9A84C, #E8C87C)'
                          : 'linear-gradient(90deg, #6B1A2A, #E8688A)',
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs" style={{ color: '#B89FA8' }}>
                      {pct}% explorado juntos
                    </span>
                    {pct >= 50 && (
                      <span className="text-xs" style={{ color: '#C9A84C' }}>
                        ✨ Profundo
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
