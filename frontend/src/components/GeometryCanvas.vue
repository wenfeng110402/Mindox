<template>
  <div class="canvas-wrapper" ref="wrapper">
    <div 
      class="canvas-container"
      :style="containerStyle"
      @wheel.prevent="handleWheel"
      @mousedown="startDrag"
      @mousemove="handleDrag"
      @mouseup="endDrag"
      @mouseleave="endDrag"
    >
      <svg
        v-if="spec"
        :width="spec.canvas.width"
        :height="spec.canvas.height"
        :viewBox="`0 0 ${spec.canvas.width} ${spec.canvas.height}`"
        xmlns="http://www.w3.org/2000/svg"
        class="geometry-canvas"
      >
        <!-- Coordinate Axes -->
        <template v-if="coord.show">
          <line
            :x1="0" :y1="coord.xAxisY"
            :x2="spec.canvas.width" :y2="coord.xAxisY"
            stroke="currentColor" stroke-width="1.5" marker-end="url(#arrowhead)"
          />
          <line
            :x1="coord.yAxisX" :y1="spec.canvas.height"
            :x2="coord.yAxisX" :y2="0"
            stroke="currentColor" stroke-width="1.5" marker-end="url(#arrowhead)"
          />
          <template v-for="tick in xTicks" :key="'xtick-'+tick.val">
            <line
              :x1="tick.px" :y1="coord.xAxisY - 4"
              :x2="tick.px" :y2="coord.xAxisY + 4"
              stroke="currentColor" stroke-width="1"
            />
            <text
              v-if="tick.val !== 0"
              :x="tick.px" :y="coord.xAxisY + 18"
              font-size="11" fill="currentColor" text-anchor="middle"
            >{{ tick.val }}</text>
          </template>
          <template v-for="tick in yTicks" :key="'ytick-'+tick.val">
            <line
              :x1="coord.yAxisX - 4" :y1="tick.px"
              :x2="coord.yAxisX + 4" :y2="tick.px"
              stroke="currentColor" stroke-width="1"
            />
            <text
              v-if="tick.val !== 0"
              :x="coord.yAxisX - 10" :y="tick.px + 4"
              font-size="11" fill="currentColor" text-anchor="end"
            >{{ tick.val }}</text>
          </template>
          <text :x="spec.canvas.width - 8" :y="coord.xAxisY - 8" font-size="14" fill="currentColor" text-anchor="middle">x</text>
          <text :x="coord.yAxisX + 8" :y="14" font-size="14" fill="currentColor" text-anchor="middle">y</text>
        </template>

        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill="currentColor" />
          </marker>
        </defs>

        <template v-if="spec.curves">
          <path
            v-for="curve in spec.curves"
            :key="curve.id"
            :d="buildCurvePath(curve)"
            fill="none"
            :stroke="curve.color || 'currentColor'"
            :stroke-width="curve.thickness || 2"
            stroke-linecap="round"
          />
        </template>

        <template v-if="spec.circles">
          <circle
            v-for="c in spec.circles"
            :key="c.id"
            :cx="pointMap[c.center]?.x"
            :cy="pointMap[c.center]?.y"
            :r="c.radius"
            fill="none"
            :stroke="c.color || 'currentColor'"
            :stroke-width="c.thickness || 2"
            :stroke-dasharray="c.type === 'dashed' ? '6,4' : undefined"
          />
        </template>

        <template v-if="spec.arcs">
          <path
            v-for="arc in spec.arcs"
            :key="arc.id"
            :d="buildArcPath(arc)"
            fill="none"
            :stroke="arc.color || 'currentColor'"
            :stroke-width="arc.thickness || 1.5"
          />
        </template>

        <template v-if="spec.segments">
          <line
            v-for="seg in spec.segments"
            :key="seg.id"
            :x1="pointMap[seg.start]?.x"
            :y1="pointMap[seg.start]?.y"
            :x2="pointMap[seg.end]?.x"
            :y2="pointMap[seg.end]?.y"
            :stroke="seg.color || 'currentColor'"
            :stroke-width="seg.thickness || 2"
            :stroke-dasharray="seg.type === 'dashed' ? '6,4' : undefined"
            stroke-linecap="round"
          />
        </template>

        <template v-if="spec.angles">
          <g v-for="angle in spec.angles" :key="angle.id">
            <path
              :d="buildAnglePath(angle)"
              fill="none"
              :stroke="angle.color || 'currentColor'"
              :stroke-width="1.5"
            />
            <rect
              v-if="angle.type === 'right'"
              :x="buildRightAngleRect(angle).x"
              :y="buildRightAngleRect(angle).y"
              :width="buildRightAngleRect(angle).size"
              :height="buildRightAngleRect(angle).size"
              fill="none"
              :stroke="angle.color || 'currentColor'"
              stroke-width="1.5"
              :transform="buildRightAngleRect(angle).transform"
            />
            <text
              v-if="angle.label"
              :x="buildAngleLabelPos(angle).x"
              :y="buildAngleLabelPos(angle).y"
              font-size="12" fill="currentColor" text-anchor="middle"
            >{{ angle.label }}</text>
          </g>
        </template>

        <template v-if="spec.points">
          <g v-for="pt in spec.points" :key="pt.id">
            <circle
              :cx="pt.x" :cy="pt.y"
              :r="pt.radius || 3"
              :fill="pt.color || 'currentColor'"
              stroke="none"
            />
            <text
              :x="pt.x + (pt.labelOffset?.dx ?? 10)"
              :y="pt.y + (pt.labelOffset?.dy ?? -8)"
              font-size="14"
              :fill="pt.color || 'currentColor'"
              text-anchor="middle"
              font-weight="500"
            >{{ pt.label }}</text>
          </g>
        </template>

        <template v-if="spec.annotations">
          <text
            v-for="ann in spec.annotations"
            :key="ann.id || ann.text"
            :x="ann.x" :y="ann.y"
            :font-size="ann.fontSize || 13"
            :fill="ann.color || 'currentColor'"
            :text-anchor="ann.anchor || 'middle'"
          >{{ ann.text }}</text>
        </template>
      </svg>
    </div>
    
    <div class="canvas-controls">
      <button @click="zoomIn" title="放大">+</button>
      <button @click="zoomOut" title="缩小">-</button>
      <button @click="resetView" title="重置">⟲</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  spec: { type: Object, default: null }
})

const scale = ref(1)
const translateX = ref(0)
const translateY = ref(0)
const isDragging = ref(false)
const lastX = ref(0)
const lastY = ref(0)

const containerStyle = computed(() => ({
  transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
  transformOrigin: 'center center',
  cursor: isDragging.value ? 'grabbing' : 'grab'
}))

const pointMap = computed(() => {
  if (!props.spec?.points) return {}
  const map = {}
  for (const pt of props.spec.points) map[pt.id] = pt
  return map
})

const coord = computed(() => {
  const c = props.spec?.coordinate || {}
  return {
    show: c.show ?? false,
    xAxisY: c.xAxisY ?? (props.spec?.canvas?.height ?? 400) / 2,
    yAxisX: c.yAxisX ?? (props.spec?.canvas?.width ?? 400) / 2,
    scale: c.scale ?? 40,
    tickInterval: c.tickInterval ?? 1,
  }
})

const xTicks = computed(() => {
  if (!coord.value.show) return []
  const { xAxisY, yAxisX, scale, tickInterval } = coord.value
  const W = props.spec.canvas.width
  const ticks = []
  const minUnit = Math.ceil(-yAxisX / scale)
  const maxUnit = Math.floor((W - yAxisX) / scale)
  for (let v = minUnit; v <= maxUnit; v += tickInterval) {
    ticks.push({ val: v, px: yAxisX + v * scale })
  }
  return ticks
})

const yTicks = computed(() => {
  if (!coord.value.show) return []
  const { xAxisY, yAxisX, scale, tickInterval } = coord.value
  const H = props.spec.canvas.height
  const ticks = []
  const minUnit = Math.ceil(-xAxisY / scale)
  const maxUnit = Math.floor((H - xAxisY) / scale)
  for (let v = minUnit; v <= maxUnit; v += tickInterval) {
    ticks.push({ val: -v, px: xAxisY + v * scale })
  }
  return ticks
})

function handleWheel(e) {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.max(0.5, Math.min(3, scale.value + delta))
}

function startDrag(e) {
  isDragging.value = true
  lastX.value = e.clientX
  lastY.value = e.clientY
}

function handleDrag(e) {
  if (!isDragging.value) return
  translateX.value += e.clientX - lastX.value
  translateY.value += e.clientY - lastY.value
  lastX.value = e.clientX
  lastY.value = e.clientY
}

function endDrag() {
  isDragging.value = false
}

function zoomIn() {
  scale.value = Math.min(3, scale.value + 0.2)
}

function zoomOut() {
  scale.value = Math.max(0.5, scale.value - 0.2)
}

function resetView() {
  scale.value = 1
  translateX.value = 0
  translateY.value = 0
}

function buildCurvePath(curve) {
  const { xAxisY, yAxisX, scale } = coord.value
  const W = props.spec.canvas.width
  const { a, b, c } = curve.coefficients || {}
  if (a === undefined) return ''
  const points = []
  const steps = 200
  const xStart = -yAxisX / scale
  const xEnd = (W - yAxisX) / scale
  for (let i = 0; i <= steps; i++) {
    const mathX = xStart + (i / steps) * (xEnd - xStart)
    const mathY = a * mathX * mathX + b * mathX + c
    const px = yAxisX + mathX * scale
    const py = xAxisY - mathY * scale
    points.push(`${px.toFixed(2)},${py.toFixed(2)}`)
  }
  if (points.length === 0) return ''
  return 'M ' + points[0] + ' L ' + points.slice(1).join(' L ')
}

function buildArcPath(arc) {
  if (!arc.cx && !arc.center) return ''
  let cx, cy
  if (arc.center && pointMap.value[arc.center]) {
    cx = pointMap.value[arc.center].x
    cy = pointMap.value[arc.center].y
  } else {
    cx = arc.cx; cy = arc.cy
  }
  const r = arc.radius || 20
  const startAngle = (arc.startAngle || 0) * Math.PI / 180
  const endAngle = (arc.endAngle || 90) * Math.PI / 180
  const x1 = cx + r * Math.cos(startAngle)
  const y1 = cy + r * Math.sin(startAngle)
  const x2 = cx + r * Math.cos(endAngle)
  const y2 = cy + r * Math.sin(endAngle)
  const largeArc = (arc.endAngle - arc.startAngle) > 180 ? 1 : 0
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

function buildAnglePath(angle) {
  const vp = pointMap.value[angle.vertex]
  const fp = pointMap.value[angle.from]
  const tp = pointMap.value[angle.to]
  if (!vp || !fp || !tp) return ''
  const r = angle.radius || 18
  const a1 = Math.atan2(fp.y - vp.y, fp.x - vp.x)
  const a2 = Math.atan2(tp.y - vp.y, tp.x - vp.x)
  const x1 = vp.x + r * Math.cos(a1)
  const y1 = vp.y + r * Math.sin(a1)
  const x2 = vp.x + r * Math.cos(a2)
  const y2 = vp.y + r * Math.sin(a2)
  let diff = a2 - a1
  while (diff < 0) diff += 2 * Math.PI
  while (diff > 2 * Math.PI) diff -= 2 * Math.PI
  const sweep = diff < Math.PI ? 1 : 0
  const large = diff > Math.PI ? 1 : 0
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} ${sweep} ${x2.toFixed(2)} ${y2.toFixed(2)}`
}

function buildRightAngleRect(angle) {
  const vp = pointMap.value[angle.vertex]
  const fp = pointMap.value[angle.from]
  if (!vp || !fp) return { x: 0, y: 0, size: 10, transform: '' }
  const size = angle.radius || 12
  const a1 = Math.atan2(fp.y - vp.y, fp.x - vp.x)
  const deg = a1 * 180 / Math.PI
  return { x: vp.x, y: vp.y - size, size, transform: `rotate(${deg.toFixed(1)}, ${vp.x}, ${vp.y})` }
}

function buildAngleLabelPos(angle) {
  const vp = pointMap.value[angle.vertex]
  const fp = pointMap.value[angle.from]
  const tp = pointMap.value[angle.to]
  if (!vp || !fp || !tp) return { x: 0, y: 0 }
  const a1 = Math.atan2(fp.y - vp.y, fp.x - vp.x)
  const a2 = Math.atan2(tp.y - vp.y, tp.x - vp.x)
  const mid = (a1 + a2) / 2
  const r = (angle.radius || 18) + 14
  return { x: vp.x + r * Math.cos(mid), y: vp.y + r * Math.sin(mid) }
}
</script>

<style scoped>
.canvas-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: var(--bg-secondary);
  border-radius: 8px;
}

.canvas-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
  transition: transform 0.1s ease-out;
}

.geometry-canvas {
  max-width: 100%;
  display: block;
}

.canvas-controls {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
}

.canvas-controls button {
  width: 28px;
  height: 28px;
  border: 1px solid var(--border-color);
  background: var(--bg-primary);
  color: var(--text-title);
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.canvas-controls button:hover {
  background: var(--btn-hover-bg);
}

@media (max-width: 768px) {
  .canvas-controls {
    bottom: 12px;
    right: 12px;
  }
  
  .canvas-controls button {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }
}
</style>
