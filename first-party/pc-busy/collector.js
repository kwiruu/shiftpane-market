import { defineCollector } from '@shiftpane/widget-sdk'

// "Is my PC busy?", from two sources and one config value.
export default defineCollector(({ sources, config }) => {
  const cpu = sources.cpu.percent ?? 0
  const memory = sources.memory.percent ?? 0
  const busy = cpu > config.threshold || memory > config.threshold
  return { busy, status: busy ? 'Busy' : 'All clear', load: Math.max(cpu, memory), cpu, memory }
})
