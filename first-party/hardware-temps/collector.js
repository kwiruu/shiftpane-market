import { defineCollector } from '@shiftpane/widget-sdk'

// LibreHardwareMonitor serves its sensor tree as JSON when its remote web server is on
// (Options → Remote Web Server → Run). Sensors are nested nodes with a Text and a Value like "61.0 °C".
const celsius = (node) => {
  const match = /(-?\d+(?:\.\d+)?)\s*°C/.exec(node?.Value ?? '')
  return match ? Number(match[1]) : null
}

function find(node, pattern) {
  if (pattern.test(node.Text ?? '') && celsius(node) !== null) return celsius(node)
  for (const child of node.Children ?? []) {
    const found = find(child, pattern)
    if (found !== null) return found
  }
  return null
}

export default defineCollector(async ({ fetch, signal }) => {
  const response = await fetch('http://127.0.0.1:8085/data.json', { signal })
  if (!response.ok) throw new Error(`LibreHardwareMonitor answered ${response.status}`)
  const tree = await response.json()
  return {
    cpu: find(tree, /^(CPU Package|Core \(Tctl\/Tdie\))$/),
    gpu: find(tree, /^GPU (Hot Spot|Core)$/),
  }
})
