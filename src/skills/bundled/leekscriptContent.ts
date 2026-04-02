// Content for the leekscript bundled skill.
// Each .md file is inlined as a string at build time via Bun's text loader.

import skillPrompt from './leekscript/SKILL.md'
import apiReference from './leekscript/api-reference.md'
import patterns from './leekscript/patterns.md'

export const SKILL_PROMPT: string = skillPrompt

export const SKILL_FILES: Record<string, string> = {
  'api-reference.md': apiReference,
  'patterns.md': patterns,
}
