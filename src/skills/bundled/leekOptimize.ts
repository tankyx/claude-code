import { AGENT_TOOL_NAME } from '../../tools/AgentTool/constants.js'
import { registerBundledSkill } from '../bundledSkills.js'

const LEEK_OPTIMIZE_PROMPT = `# LeekScript AI Optimization

Analyze and optimize LeekScript AI code for competitive play.

## Phase 1: Read the Code

Find and read all .lk / .leekscript files in the current directory.

## Phase 2: Launch Analysis Agents

Use the ${AGENT_TOOL_NAME} tool to launch three review agents in parallel.
Pass each agent the full AI source code.

### Agent 1: Operations Efficiency

Review for computational efficiency (20M operations limit):
1. **Loop complexity**: O(n^2) or worse nested loops
2. **Redundant calculations**: Same value computed multiple times per turn
3. **Unnecessary function calls**: Calling \`getEnemies()\` or \`getAliveEnemies()\` multiple times
4. **Debug overhead**: \`debug()\` calls left in production code
5. **String operations in loops**: String concatenation in hot paths
6. **Excessive array operations**: Repeated sorting, filtering, or mapping of the same data

### Agent 2: TP/MP Efficiency

Review for action point optimization:
1. **Wasted TP**: Actions attempted without checking \`getTP()\` or \`canUseWeapon()\`
2. **Suboptimal weapon choice**: Using high-cost weapons when cheaper ones would suffice
3. **Unnecessary weapon switches**: \`setWeapon()\` costs 1 TP - only worth it if damage gain exceeds the cost
4. **Movement waste**: Moving without a clear tactical purpose
5. **Chip cooldown ignoring**: Attempting to use chips on cooldown
6. **Action ordering**: Should buff/shield before attacking, attack before moving away

### Agent 3: Strategy & Tactics

Review for competitive effectiveness:
1. **Target selection**: Is the targeting logic optimal? Consider focus-firing, prioritizing threats
2. **Positioning**: Using terrain/obstacles for cover, maintaining optimal range
3. **State management**: Is \`global\` state used effectively for multi-turn strategies?
4. **Adaptation**: Does the AI adapt to different enemy types/counts?
5. **Team synergy**: In team fights, are roles properly distributed?
6. **Edge cases**: What happens when alone, surrounded, low HP, facing summons?
7. **Line of sight**: Is LoS checked before ranged attacks?

## Phase 3: Apply Optimizations

After all agents report, aggregate findings and apply fixes:
- Fix bugs and inefficiencies directly in the code
- Add comments only for non-obvious strategic decisions
- Preserve the overall strategy intent while improving execution
- Report a summary of what was optimized and expected improvements
`

export function registerLeekOptimizeSkill(): void {
  registerBundledSkill({
    name: 'leek-optimize',
    description:
      'Optimize LeekScript AI code for competitive play. Analyzes operations efficiency, TP/MP usage, and strategy.',
    allowedTools: ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash', 'Agent'],
    userInvocable: true,
    async getPromptForCommand(args) {
      let prompt = LEEK_OPTIMIZE_PROMPT
      if (args) {
        prompt += `\n## Focus Areas\n\n${args}`
      }
      return [{ type: 'text', text: prompt }]
    },
  })
}
