import { AGENT_TOOL_NAME } from '../../tools/AgentTool/constants.js'
import { registerBundledSkill } from '../bundledSkills.js'

const LEEK_TEST_PROMPT = `# LeekWars AI Test & Debug

Test your LeekScript AI by running fights and analyzing results.

## Steps

### Step 1: Identify the AI Code

Find .lk or .leekscript files in the current directory. Read the AI code to understand what it does.
If no local files exist, ask the user which AI they want to test.

### Step 2: Static Analysis

Before running a fight, analyze the code for common issues:
1. **Null safety**: Check that \`getNearestEnemy()\`, \`getWeakestAlly()\`, etc. results are null-checked
2. **TP management**: Verify TP is checked before actions (\`getTP() >= cost\`)
3. **Operations budget**: Look for potential infinite loops or O(n^3) patterns that might hit 20M limit
4. **Global state**: Check that \`global\` is used for cross-turn state, not \`var\`
5. **Dead code**: Functions defined but never called
6. **Missing cooldown checks**: \`useChip()\` calls without \`getChipCooldown()\` checks

### Step 3: Run a Fight (if MCP tools available)

If LeekWars MCP tools are available:
1. Use \`leekwars_save_ai\` to upload the latest code
2. Use \`leekwars_start_fight\` to start a test fight
3. Use \`leekwars_get_fight\` to get results
4. Analyze the fight log for:
   - Wasted TP (actions that failed)
   - Wasted MP (movement with no purpose)
   - Missed attacks
   - Damage dealt vs received
   - Turn efficiency

### Step 4: Suggest Improvements

Based on the analysis, suggest specific code changes:
- Fix any bugs found
- Optimize TP usage
- Improve targeting logic
- Better positioning strategy
- Add missing edge case handling

Use the ${AGENT_TOOL_NAME} tool to launch a code review agent if the AI is complex.
`

export function registerLeekTestSkill(): void {
  registerBundledSkill({
    name: 'leek-test',
    description:
      'Test and debug LeekScript AI code. Runs static analysis and optionally executes test fights.',
    allowedTools: ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash', 'Agent'],
    userInvocable: true,
    async getPromptForCommand(args) {
      let prompt = LEEK_TEST_PROMPT
      if (args) {
        prompt += `\n## Additional Context\n\n${args}`
      }
      return [{ type: 'text', text: prompt }]
    },
  })
}
