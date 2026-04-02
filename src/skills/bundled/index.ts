import { registerDebugSkill } from './debug.js'
import { registerRememberSkill } from './remember.js'
import { registerStuckSkill } from './stuck.js'
import { registerUpdateConfigSkill } from './updateConfig.js'
import { registerVerifySkill } from './verify.js'
import { registerLeekScriptSkill } from './leekscript.js'
import { registerLeekTestSkill } from './leekTest.js'
import { registerLeekSyncSkill } from './leekSync.js'
import { registerLeekOptimizeSkill } from './leekOptimize.js'

/**
 * Initialize all bundled skills.
 * Called at startup to register skills that ship with the CLI.
 *
 * This is a LeekWars-focused build. Only LeekScript skills and essential
 * utility skills (debug, stuck, verify, config, remember) are registered.
 */
export function initBundledSkills(): void {
  // Core utility skills (still useful for LeekWars development)
  registerUpdateConfigSkill()
  registerVerifySkill()
  registerDebugSkill()
  registerRememberSkill()
  registerStuckSkill()

  // LeekWars-specific skills
  registerLeekScriptSkill()
  registerLeekTestSkill()
  registerLeekSyncSkill()
  registerLeekOptimizeSkill()
}
