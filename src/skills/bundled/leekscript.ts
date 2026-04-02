import { registerBundledSkill } from '../bundledSkills.js'

type SkillContent = typeof import('./leekscriptContent.js')

function buildPrompt(args: string, content: SkillContent): string {
  const parts: string[] = [content.SKILL_PROMPT]

  parts.push('---\n\n## Included Documentation\n')
  for (const [path, md] of Object.entries(content.SKILL_FILES).sort()) {
    parts.push(`<doc path="${path}">\n${md.trim()}\n</doc>`)
  }

  if (args) {
    parts.push(`\n## User Request\n\n${args}`)
  }

  return parts.join('\n\n')
}

export function registerLeekScriptSkill(): void {
  registerBundledSkill({
    name: 'leekscript',
    description:
      'LeekScript language expert for LeekWars AI programming.\n' +
      'TRIGGER when: files have .lk or .leekscript extension, code uses LeekWars API functions ' +
      '(useWeapon, useChip, getEnemies, moveToward, etc.), or user mentions LeekWars/LeekScript.\n' +
      'DO NOT TRIGGER when: general JavaScript/TypeScript programming unrelated to LeekWars.',
    allowedTools: ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash', 'WebFetch'],
    userInvocable: true,
    async getPromptForCommand(args) {
      const content = await import('./leekscriptContent.js')
      const prompt = buildPrompt(args, content)
      return [{ type: 'text', text: prompt }]
    },
  })
}
