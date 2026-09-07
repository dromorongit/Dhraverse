import type { SupportIntent, IntentMatchResult, IntentCategory, UserRole } from './types'
import { supportKnowledgeBase } from './knowledge-base'

const CONFIDENCE_THRESHOLD = 0.3

const CATEGORY_ORDER: IntentCategory[] = ['buyer', 'vendor', 'general']

const ROLE_CATEGORY_MAP: Record<UserRole, IntentCategory[]> = {
  CUSTOMER: ['buyer', 'general'],
  VENDOR: ['vendor', 'general'],
  ADMIN: ['buyer', 'vendor', 'general'],
  SUPER_ADMIN: ['buyer', 'vendor', 'general'],
  GUEST: ['general'],
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter((t) => t.length > 1)
}

function overlapScore(keywords: string[], tokens: string[]): number {
  if (keywords.length === 0 || tokens.length === 0) return 0

  const tokenSet = new Set(tokens)
  let matches = 0
  let weightedMatches = 0

  for (const kw of keywords) {
    const kwTokens = kw.toLowerCase().split(/\s+/).filter((t) => t.length > 1)
    if (kwTokens.length === 0) continue

    const allMatch = kwTokens.every((kt) => tokenSet.has(kt))
    const someMatch = kwTokens.some((kt) => tokenSet.has(kt))

    if (allMatch) {
      matches++
      weightedMatches += kwTokens.length
    } else if (someMatch) {
      weightedMatches += 0.5 * kwTokens.filter((kt) => tokenSet.has(kt)).length
    }
  }

  const rawScore = keywords.length > 0 ? (matches + weightedMatches * 0.3) / keywords.length : 0
  return Math.min(rawScore, 1.0)
}

function patternScore(patterns: string[], message: string): number {
  if (patterns.length === 0) return 0
  const normalized = normalize(message)
  let bestMatch = 0

  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'i')
    if (regex.test(normalized)) {
      const wordCount = pattern.split(/\s+/).filter((w) => w.length > 1).length
      const score = Math.min(wordCount / 4, 1.0)
      bestMatch = Math.max(bestMatch, score)
    }
  }

  return bestMatch
}

export function matchIntent(
  message: string,
  userRole: UserRole = 'GUEST'
): IntentMatchResult {
  const tokens = tokenize(message)
  const allowedCategories = ROLE_CATEGORY_MAP[userRole] || ['general']

  let bestMatch: { intent: SupportIntent; score: number } | null = null

  for (const intent of supportKnowledgeBase) {
    if (!allowedCategories.includes(intent.category)) continue

    const kwScore = overlapScore(intent.keywords, tokens)
    const patScore = patternScore(intent.patterns, message)

    const combinedScore = Math.max(kwScore * 0.7 + patScore * 0.3, patScore)

    if (!bestMatch || combinedScore > bestMatch.score) {
      bestMatch = { intent, score: combinedScore }
    }
  }

  if (!bestMatch || bestMatch.score < CONFIDENCE_THRESHOLD) {
    return { intent: null, confidence: bestMatch?.score ?? 0 }
  }

  return { intent: bestMatch.intent, confidence: bestMatch.score }
}

export { CONFIDENCE_THRESHOLD }
