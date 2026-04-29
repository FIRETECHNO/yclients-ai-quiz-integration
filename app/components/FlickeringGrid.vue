<template>
  <div ref="containerRef" :class="cn('w-full h-full', props.class)">
    <canvas ref="canvasRef" class="pointer-events-none" />
  </div>
</template>

<script lang="ts" setup>
import { cn } from "@/lib/utils";
import { ref, onMounted, onBeforeUnmount, toRefs, computed } from "vue";

interface FlickeringGridProps {
  squareSize?: number;
  gridGap?: number;
  flickerChance?: number;
  color?: string;
  width?: number;
  height?: number;
  class?: string;
  maxOpacity?: number;
}

const props = withDefaults(defineProps<FlickeringGridProps>(), {
  squareSize: 4,
  gridGap: 6,
  flickerChance: 0.3,
  color: "rgb(0, 0, 0)",
  maxOpacity: 0.3,
});

const { squareSize, gridGap, flickerChance, color, maxOpacity, width, height } = toRefs(props);

const containerRef = ref<HTMLDivElement>();
const canvasRef = ref<HTMLCanvasElement>();
const context = ref<CanvasRenderingContext2D>();

const isInView = ref(false);

const computedColor = computed(() => {
  if (!context.value) return "rgba(255, 0, 0,";

  const hex = color.value.replace(/^#/, "");
  const bigint = Number.parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b},`;
});

const MAX_BITMAP_EDGE = 1600;
const MAX_DPR = 1.25;

function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): {
  cols: number;
  rows: number;
  squares: Float32Array;
  dpr: number;
} {
  const rawDpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const dpr = Math.min(rawDpr, MAX_DPR);
  const wPx = Math.min(width, MAX_BITMAP_EDGE);
  const hPx = Math.min(height, MAX_BITMAP_EDGE);
  canvas.width = Math.max(1, Math.floor(wPx * dpr));
  canvas.height = Math.max(1, Math.floor(hPx * dpr));
  canvas.style.width = `${wPx}px`;
  canvas.style.height = `${hPx}px`;

  const cols = Math.floor(wPx / (squareSize.value + gridGap.value));
  const rows = Math.floor(hPx / (squareSize.value + gridGap.value));

  const squares = new Float32Array(cols * rows);
  for (let i = 0; i < squares.length; i++) {
    squares[i] = Math.random() * maxOpacity.value;
  }
  return { cols, rows, squares, dpr };
}

function updateSquares(squares: Float32Array, deltaTime: number) {
  const n = squares.length;
  if (n === 0) return;
  // Не трогаем каждую ячейку каждый кадр — дешевле на мобильных
  const budget = Math.max(32, Math.min(480, Math.floor(n * 0.08)));
  for (let b = 0; b < budget; b++) {
    const i = (Math.random() * n) | 0;
    if (Math.random() < flickerChance.value * deltaTime * 12) {
      squares[i] = Math.random() * maxOpacity.value;
    }
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cols: number,
  rows: number,
  squares: Float32Array,
  dpr: number,
) {
  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "transparent";
  ctx.fillRect(0, 0, width, height);
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const opacity = squares[i * rows + j];
      ctx.fillStyle = `${computedColor.value}${opacity})`;
      ctx.fillRect(
        i * (squareSize.value + gridGap.value) * dpr,
        j * (squareSize.value + gridGap.value) * dpr,
        squareSize.value * dpr,
        squareSize.value * dpr,
      );
    }
  }
}

const gridParams = ref<ReturnType<typeof setupCanvas>>();

function updateCanvasSize() {
  const wProp = width.value;
  const hProp = height.value;
  const cw = containerRef.value!.clientWidth || 1;
  const ch = containerRef.value!.clientHeight || 1;
  const newWidth = wProp != null && wProp > 0 ? wProp : cw;
  const newHeight = hProp != null && hProp > 0 ? hProp : ch;

  gridParams.value = setupCanvas(canvasRef.value!, newWidth, newHeight);
}

let animationFrameId: number | undefined;
let resizeObserver: ResizeObserver | undefined;
let intersectionObserver: IntersectionObserver | undefined;
let lastTime = 0;
let lastRenderTime = 0;
/** ~28 fps: меньше нагрузка на GPU/CPU чем полные 60 */
const MIN_FRAME_MS = 1000 / 28;

let reduceMotion = false;

function scheduleFrame() {
  if (animationFrameId != null) cancelAnimationFrame(animationFrameId);
  animationFrameId = requestAnimationFrame(animate);
}

function animate(time: number) {
  animationFrameId = undefined;

  if (!isInView.value || !gridParams.value || !context.value || !canvasRef.value) {
    return;
  }

  if (reduceMotion) {
    drawGrid(
      context.value,
      canvasRef.value.width,
      canvasRef.value.height,
      gridParams.value.cols,
      gridParams.value.rows,
      gridParams.value.squares,
      gridParams.value.dpr,
    );
    return;
  }

  if (time - lastRenderTime < MIN_FRAME_MS) {
    scheduleFrame();
    return;
  }
  lastRenderTime = time;

  const deltaTime = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 1 / 60;
  lastTime = time;

  updateSquares(gridParams.value.squares, deltaTime);
  drawGrid(
    context.value,
    canvasRef.value.width,
    canvasRef.value.height,
    gridParams.value.cols,
    gridParams.value.rows,
    gridParams.value.squares,
    gridParams.value.dpr,
  );
  scheduleFrame();
}

onMounted(() => {
  if (!canvasRef.value || !containerRef.value) return;
  context.value = canvasRef.value.getContext("2d")!;
  if (!context.value) return;

  reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  updateCanvasSize();

  if (
    reduceMotion &&
    gridParams.value &&
    context.value &&
    canvasRef.value
  ) {
    drawGrid(
      context.value,
      canvasRef.value.width,
      canvasRef.value.height,
      gridParams.value.cols,
      gridParams.value.rows,
      gridParams.value.squares,
      gridParams.value.dpr,
    );
  }

  resizeObserver = new ResizeObserver(() => {
    updateCanvasSize();
    if (reduceMotion && gridParams.value) {
      drawGrid(
        context.value!,
        canvasRef.value!.width,
        canvasRef.value!.height,
        gridParams.value.cols,
        gridParams.value.rows,
        gridParams.value.squares,
        gridParams.value.dpr,
      );
    }
  });
  intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      isInView.value = entry?.isIntersecting ?? true;
      if (animationFrameId != null) cancelAnimationFrame(animationFrameId);
      if (isInView.value) {
        lastTime = 0;
        lastRenderTime = 0;
        scheduleFrame();
      }
    },
    { threshold: 0 },
  );

  resizeObserver.observe(containerRef.value);
  intersectionObserver.observe(canvasRef.value);
});

onBeforeUnmount(() => {
  if (animationFrameId != null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = undefined;
  }
  resizeObserver?.disconnect();
  intersectionObserver?.disconnect();
});
</script>