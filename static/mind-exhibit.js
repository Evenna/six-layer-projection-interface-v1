const layerMeta = {
  overall: {
    name: "整体舞台",
    visual: "黑底测绘视图、爆炸分层、白色骨架线稿、红色激活通路",
    narrative: "把 Evans 的思维过程呈现成一张被层层剖开的认知地形图。",
    tags: ["Exploded Atlas", "Wireframe", "Live Runtime"],
  },
  perception: {
    name: "感知入口",
    visual: "前层轮廓、细碎路径、外部输入映射",
    narrative: "图像、文字与环境参数在前层被拆解为低层线索。",
    tags: ["Camera", "Text", "Sensor", "Observe"],
  },
  fusion: {
    name: "场景汇流",
    visual: "交织线网、收束路径、场景整体化",
    narrative: "离散输入在这一层汇聚成一个场景结构。",
    tags: ["Fusion", "Scene", "Blend", "Context"],
  },
  cognition: {
    name: "认知推断",
    visual: "高密线束、中心节点、关系穿透",
    narrative: "Belief、Desire、Intention 被逐步点亮，开始推断用户状态与意图。",
    tags: ["Belief", "Desire", "Intention", "Emotion"],
  },
  decision: {
    name: "阈值选择",
    visual: "分叉路径、中心枢纽、单一路径被高亮",
    narrative: "系统判断是否主动介入，以及介入的时机和方式。",
    tags: ["Need", "Threshold", "Intervene", "Decision"],
  },
  orchestration: {
    name: "路径编排",
    visual: "路由分发、设备线束、执行拓扑",
    narrative: "抽象决策被拆解成可执行路径并向设备网络发射。",
    tags: ["Device", "Route", "Task", "Dispatch"],
  },
  execution: {
    name: "执行反馈",
    visual: "命令脉冲、外发路径、执行反馈回波",
    narrative: "编排完成后，指令、语音和执行反馈在这一层真正出栈。",
    tags: ["Command", "Voice", "Feedback", "Device"],
  },
};

const demoSequence = [
  {
    key: "capture",
    label: "输入捕获",
    status: "DEMO MODE / INPUT WAITING",
    text: "当前是风格演示状态。连接 Live 后，这里会被真实摄像头、聊天和后端推理结果驱动。",
    layer: null,
    line: 0,
  },
  {
    key: "perception",
    label: "感知层解析",
    status: "LOW-LEVEL SIGNAL PARSED",
    text: "前层开始吸收图像、文字与环境信号，把外部世界切成一组细小线索。",
    layer: "perception",
    line: 0,
  },
  {
    key: "fusion",
    label: "场景汇流",
    status: "SCENE STRUCTURE FORMING",
    text: "不同线索在中层汇流，逐渐从杂音变成整体场景。",
    layer: "fusion",
    line: 1,
  },
  {
    key: "cognition",
    label: "认知推断",
    status: "INTENTION MODELING ACTIVE",
    text: "Belief、Desire、Intention 被逐一标出，Evans 开始理解用户状态。",
    layer: "cognition",
    line: 2,
  },
  {
    key: "decision",
    label: "阈值选择",
    status: "INTERVENTION THRESHOLD EVALUATING",
    text: "系统评估是否应该主动介入，以及此刻出手是否会打扰用户。",
    layer: "decision",
    line: 3,
  },
  {
    key: "orchestration",
    label: "路径编排",
    status: "TASK ROUTING GENERATED",
    text: "决策开始变成具体任务路径，沿设备和交互节点分发。",
    layer: "orchestration",
    line: 4,
  },
  {
    key: "execution",
    label: "执行反馈",
    status: "COMMAND EXECUTION ACTIVE",
    text: "设备命令、语音反馈和执行结果开始流出系统，影响外部环境。",
    layer: "execution",
    line: 4,
  },
  {
    key: "writeback",
    label: "写回更新",
    status: "MEMORY / PROFILE / PREVIEW",
    text: "执行之后，事件摘要、画像线索和主动预告被写回系统，成为下一轮认知的起点。",
    layer: null,
    line: 4,
  },
];

const STEP_ORDER = ["capture", "perception", "fusion", "cognition", "decision", "orchestration", "execution", "writeback"];

const canvas = document.getElementById("neuralCanvas");
const ctx = canvas.getContext("2d");
const viewport = document.getElementById("mindViewport");
const cluster = document.getElementById("layerCluster");
const layers = Array.from(document.querySelectorAll(".survey-layer"));
const storySteps = Array.from(document.querySelectorAll(".story-step"));
const activationLines = Array.from(document.querySelectorAll(".activation-line"));

const connDot = document.getElementById("connDot");
const connText = document.getElementById("connText");
const backendOriginText = document.getElementById("backendOriginText");
const thoughtStatus = document.getElementById("thoughtStatus");
const currentThoughtText = document.getElementById("currentThoughtText");
const focusValue = document.getElementById("focusValue");
const detailVisual = document.getElementById("detailVisual");
const detailNarrative = document.getElementById("detailNarrative");
const detailTags = document.getElementById("detailTags");
const runtimeScene = document.getElementById("runtimeScene");
const runtimeAnalyzeCount = document.getElementById("runtimeAnalyzeCount");
const runtimeMemoryCount = document.getElementById("runtimeMemoryCount");
const runtimeAdvice = document.getElementById("runtimeAdvice");
const runtimeLog = document.getElementById("runtimeLog");
const runtimeTimeline = document.getElementById("runtimeTimeline");
const writebackStream = document.getElementById("writebackStream");
const layerOverlay = document.getElementById("layerOverlay");
const overlayLayerCode = document.getElementById("overlayLayerCode");
const overlayLayerTitle = document.getElementById("overlayLayerTitle");
const overlayLayerSubtitle = document.getElementById("overlayLayerSubtitle");
const overlayStepStatus = document.getElementById("overlayStepStatus");
const overlayFlowCount = document.getElementById("overlayFlowCount");
const overlaySvgShell = document.getElementById("overlaySvgShell");
const overlayChain = document.getElementById("overlayChain");
const overlayInputList = document.getElementById("overlayInputList");
const overlayOutputList = document.getElementById("overlayOutputList");
const overlayFieldList = document.getElementById("overlayFieldList");
const overlaySummaryText = document.getElementById("overlaySummaryText");
const overlayFullscreenBtn = document.getElementById("overlayFullscreenBtn");
const overlayCloseBtn = document.getElementById("overlayCloseBtn");

const connectLiveBtn = document.getElementById("connectLiveBtn");
const cameraBtn = document.getElementById("cameraBtn");
const analyzeBtn = document.getElementById("analyzeBtn");
const resetViewBtn = document.getElementById("resetViewBtn");
const pulseBtn = document.getElementById("pulseBtn");
const promptInput = document.getElementById("promptInput");
const cameraShell = document.getElementById("cameraShell");
const cameraVideo = document.getElementById("cameraVideo");
const cameraCanvas = document.getElementById("cameraCanvas");
const stageIndex = viewport.querySelector(".stage-layer-index");
const mindSidePanel = document.querySelector(".mind-side");
const writebackPanel = viewport.querySelector(".writeback-panel");
const sequenceShell = viewport.querySelector(".sequence-shell");
const layerTagContainers = Object.fromEntries(
  Array.from(document.querySelectorAll("[data-layer-tags]")).map((el) => [el.dataset.layerTags, el]),
);
const layerSvgs = Object.fromEntries(
  layers.map((layer) => [layer.dataset.layer, layer.querySelector(".trace-svg")]),
);

const params = new URLSearchParams(location.search);
const explicitBackend = params.get("backend");
const backendOrigin = explicitBackend || (location.pathname === "/mind" ? location.origin : "http://127.0.0.1:8010");
const wsOrigin = backendOrigin.replace(/^http/, "ws");

const state = {
  width: window.innerWidth,
  height: window.innerHeight,
  rotateX: 62,
  rotateZ: -22,
  scale: 0.92,
  fitScale: 1,
  autoScale: 1,
  offsetX: 0,
  offsetY: 0,
  focus: "overall",
  hoverLayer: null,
  dragPointer: null,
  dragging: false,
  lastX: 0,
  lastY: 0,
  pulseEnabled: true,
  stepIndex: 0,
  demoTimer: null,
  mode: "demo",
  ws: null,
  pingTimer: null,
  reconnectTimer: null,
  reconnectCount: 0,
  cameraStream: null,
  latestResult: null,
  session: null,
  logItems: [],
  timelineItems: [],
  flowPackets: [],
  flowTexts: [],
  overlayPackets: [],
  overlayTexts: [],
  activeStepKey: "capture",
  lastFrameTime: 0,
  currentFlowState: buildDemoFlowState(),
  currentNarrativeState: {},
  overlayLayer: null,
  fitRaf: null,
};

const particles = [];
const diagonals = [];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function shortText(text, max = 18) {
  const raw = String(text || "").trim();
  if (!raw) return "";
  return raw.length > max ? `${raw.slice(0, max)}…` : raw;
}

function splitSegments(text, limit = 3, max = 18) {
  return String(text || "")
    .split(/[，。；、,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit)
    .map((item) => shortText(item, max));
}

function ensureList(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function buildDemoFlowState() {
  return {
    layers: {
      perception: ["camera_frame", "user_text", "sensor_null", "lighting_map"],
      fusion: ["dominant_visual", "scene_cluster", "context_merge", "confidence"],
      cognition: ["user_activity", "user_emotion", "tom_belief", "tom_intention"],
      decision: ["identified_need", "intervene?", "timing", "task_plan"],
      orchestration: ["task_route", "device_map", "strategy", "conflict_none"],
      execution: ["device_command", "voice_response", "feedback", "effect"],
    },
    writeback: ["memory_update", "profile_hint", "proactive_preview"],
  };
}

function buildLiveFlowState(data) {
  const l1 = data.layer1_perception || {};
  const l2 = data.layer2_fusion || {};
  const l3 = data.layer3_cognition || {};
  const l4 = data.layer4_decision || {};
  const l5 = data.layer5_orchestration || {};
  const l6 = data.layer6_execution || {};
  const memory = data.memory_update || {};

  const identifiedNeeds = ensureList(l4.identified_needs)
    .slice(0, 3)
    .map((need) => {
      const desc = need.description || need.type || "need";
      const urgency = need.urgency !== undefined ? Math.round(Number(need.urgency) * 100) : null;
      return urgency !== null ? `${shortText(desc, 12)}@${urgency}%` : shortText(desc, 14);
    });

  const scheduledTasks = ensureList(l5.scheduled_tasks)
    .slice(0, 4)
    .map((task) => {
      const taskName = shortText(task.task || task.task_id || "task", 12);
      const device = shortText(task.device || "device", 10);
      return `${taskName}>${device}`;
    });

  const deviceCommands = ensureList(l6.device_commands)
    .slice(0, 4)
    .map((cmd) => `${shortText(cmd.device_id || "device", 10)}:${shortText(cmd.action || "act", 10)}`);

  return {
    layers: {
      perception: [
        ...splitSegments(l1.visual, 3, 14).map((item) => `视:${item}`),
        l1.audio && l1.audio !== "无" ? `音:${shortText(l1.audio, 12)}` : "",
        l1.sensors ? `传:${shortText(l1.sensors, 12)}` : "",
        l1.lighting ? `光:${l1.lighting}` : "",
        l1.time_context ? `时:${shortText(l1.time_context, 10)}` : "",
      ].filter(Boolean).slice(0, 6),
      fusion: [
        l2.dominant_signal ? `主:${shortText(l2.dominant_signal, 10)}` : "",
        l2.scene_label ? `景:${shortText(l2.scene_label, 12)}` : "",
        l2.fusion_confidence !== undefined ? `置信:${Math.round(Number(l2.fusion_confidence) * 100)}%` : "",
        l2.context_summary ? `概:${shortText(l2.context_summary, 14)}` : "",
      ].filter(Boolean).slice(0, 6),
      cognition: [
        l3.user_activity ? `活动:${shortText(l3.user_activity, 12)}` : "",
        l3.user_posture ? `姿态:${shortText(l3.user_posture, 10)}` : "",
        l3.user_emotion ? `情绪:${shortText(l3.user_emotion, 10)}` : "",
        ...ensureList(l3.people_present).slice(0, 2).map((item) => `人物:${shortText(item, 10)}`),
        l3.tom_belief ? `B:${shortText(l3.tom_belief, 12)}` : "",
        l3.tom_desire ? `D:${shortText(l3.tom_desire, 12)}` : "",
        l3.tom_intention ? `I:${shortText(l3.tom_intention, 12)}` : "",
      ].filter(Boolean).slice(0, 7),
      decision: [
        ...identifiedNeeds,
        `介入:${l4.should_intervene ? "yes" : "no"}`,
        l4.intervention_timing ? `时机:${shortText(l4.intervention_timing, 10)}` : "",
        l4.intervention_reason ? `因:${shortText(l4.intervention_reason, 12)}` : "",
        l4.task_plan ? `策:${shortText(l4.task_plan, 14)}` : "",
      ].filter(Boolean).slice(0, 7),
      orchestration: [
        ...scheduledTasks,
        l5.execution_strategy ? `策略:${shortText(l5.execution_strategy, 12)}` : "",
        l5.conflict_notes ? `冲突:${shortText(l5.conflict_notes, 12)}` : "",
      ].filter(Boolean).slice(0, 7),
      execution: [
        ...deviceCommands,
        l6.voice_response ? `语音:${shortText(l6.voice_response, 12)}` : "",
        l6.execution_feedback ? `反馈:${shortText(l6.execution_feedback, 14)}` : "",
      ].filter(Boolean).slice(0, 7),
    },
    writeback: [
      memory.should_record ? "record:true" : "record:false",
      memory.event_summary ? `事件:${shortText(memory.event_summary, 16)}` : "",
      memory.profile_hint ? `画像:${shortText(memory.profile_hint, 16)}` : "",
      data.proactive_preview ? `预告:${shortText(data.proactive_preview, 16)}` : "",
    ].filter(Boolean),
  };
}

function buildDemoLayerDetailState() {
  return {
    perception: {
      input: ["camera_frame", "user_text", "sensor_snapshot"],
      output: ["visual", "audio", "lighting", "time_context"],
      fields: [
        { key: "layer1_perception.visual", value: "检测到人物、桌面、光照边界" },
        { key: "layer1_perception.audio", value: "当前无音频输入" },
        { key: "layer1_perception.sensors", value: "桌面演示模式，传感器为空" },
      ],
      summary: "感知层把外部世界拆成低层信号，供后续融合层继续压缩。",
    },
    fusion: {
      input: ["visual", "audio", "sensor_tokens"],
      output: ["dominant_signal", "scene_label", "context_summary"],
      fields: [
        { key: "layer2_fusion.scene_label", value: "demo_observation" },
        { key: "layer2_fusion.dominant_signal", value: "视觉输入占主导" },
        { key: "layer2_fusion.context_summary", value: "当前为演示环境，没有真实场景摘要" },
      ],
      summary: "融合层把离散输入压缩成一个场景整体结构。",
    },
    cognition: {
      input: ["scene_label", "dominant_signal", "context_summary"],
      output: ["user_activity", "user_emotion", "tom_belief", "tom_intention"],
      fields: [
        { key: "layer3_cognition.user_activity", value: "等待真实输入" },
        { key: "layer3_cognition.user_emotion", value: "等待真实输入" },
        { key: "layer3_cognition.tom_belief", value: "系统正在等待用户状态" },
      ],
      summary: "认知层生成对用户状态和意图的解释。",
    },
    decision: {
      input: ["user_activity", "user_emotion", "tom_intention"],
      output: ["identified_needs", "should_intervene", "task_plan"],
      fields: [
        { key: "layer4_decision.identified_needs", value: "[]" },
        { key: "layer4_decision.should_intervene", value: "false" },
        { key: "layer4_decision.task_plan", value: "等待真实分析结果" },
      ],
      summary: "决策层在这里判断是否应该主动介入。",
    },
    orchestration: {
      input: ["task_plan", "identified_needs"],
      output: ["scheduled_tasks", "execution_strategy"],
      fields: [
        { key: "layer5_orchestration.scheduled_tasks", value: "[]" },
        { key: "layer5_orchestration.execution_strategy", value: "none" },
      ],
      summary: "调度层把抽象计划拆成外部可执行路径。",
    },
    execution: {
      input: ["scheduled_tasks", "execution_strategy"],
      output: ["device_commands", "voice_response", "execution_feedback"],
      fields: [
        { key: "layer6_execution.device_commands", value: "[]" },
        { key: "layer6_execution.voice_response", value: "等待真实系统响应" },
      ],
      summary: "执行层把动作真正发往设备和用户。",
    },
  };
}

function buildDemoNarrativeState() {
  return {
    perception: [
      "camera frame enters perception layer",
      "user text sensor snapshot lighting time context",
      "external world is decomposed into low level cues",
    ],
    fusion: [
      "multi modal inputs converge into scene structure",
      "scene_label dominant_signal confidence context_summary",
      "discrete cues are compressed into one situation",
    ],
    cognition: [
      "activity posture emotion people present",
      "belief desire intention become explicit here",
      "user state is modeled as interpretable cognition",
    ],
    decision: [
      "identified needs intervention threshold timing reason",
      "should_intervene is resolved against disturbance risk",
      "task plan is formed if intervention is approved",
    ],
    orchestration: [
      "scheduled_tasks execution_strategy conflict_notes",
      "abstract decision becomes routable task network",
      "device routes are assembled before execution",
    ],
    execution: [
      "device_commands voice_response execution_feedback",
      "intention is released into environment and interface",
      "writeback will archive event profile and preview",
    ],
  };
}

function buildLiveLayerDetailState(data) {
  const l1 = data.layer1_perception || {};
  const l2 = data.layer2_fusion || {};
  const l3 = data.layer3_cognition || {};
  const l4 = data.layer4_decision || {};
  const l5 = data.layer5_orchestration || {};
  const l6 = data.layer6_execution || {};

  return {
    perception: {
      input: ["camera_frame", "user_text", "sensor_snapshot"],
      output: ["visual", "audio", "sensors", "lighting", "time_context"],
      fields: Object.entries({
        "layer1_perception.visual": l1.visual,
        "layer1_perception.audio": l1.audio,
        "layer1_perception.sensors": l1.sensors,
        "layer1_perception.lighting": l1.lighting,
        "layer1_perception.time_context": l1.time_context,
      }).filter(([, value]) => value).map(([key, value]) => ({ key, value })),
      summary: "真实输入在这里被拆成视觉、音频、环境与时间信号。",
    },
    fusion: {
      input: ["visual", "audio", "sensors", "lighting", "time_context"],
      output: ["dominant_signal", "scene_label", "fusion_confidence", "context_summary"],
      fields: Object.entries({
        "layer2_fusion.dominant_signal": l2.dominant_signal,
        "layer2_fusion.scene_label": l2.scene_label,
        "layer2_fusion.fusion_confidence": l2.fusion_confidence,
        "layer2_fusion.context_summary": l2.context_summary,
      }).filter(([, value]) => value !== undefined && value !== null && value !== "").map(([key, value]) => ({ key, value })),
      summary: "融合层把感知信号压缩成一个整体场景。",
    },
    cognition: {
      input: ["scene_label", "dominant_signal", "context_summary"],
      output: ["user_activity", "user_posture", "user_emotion", "tom_belief", "tom_desire", "tom_intention"],
      fields: Object.entries({
        "layer3_cognition.user_activity": l3.user_activity,
        "layer3_cognition.user_posture": l3.user_posture,
        "layer3_cognition.user_emotion": l3.user_emotion,
        "layer3_cognition.people_present": ensureList(l3.people_present).join(", "),
        "layer3_cognition.tom_belief": l3.tom_belief,
        "layer3_cognition.tom_desire": l3.tom_desire,
        "layer3_cognition.tom_intention": l3.tom_intention,
      }).filter(([, value]) => value).map(([key, value]) => ({ key, value })),
      summary: "认知层对用户意图、情绪与 ToM 状态进行推断。",
    },
    decision: {
      input: ["user_activity", "user_emotion", "tom_intention"],
      output: ["identified_needs", "should_intervene", "intervention_timing", "task_plan"],
      fields: [
        { key: "layer4_decision.identified_needs", value: JSON.stringify(ensureList(l4.identified_needs).slice(0, 3)) || "[]" },
        { key: "layer4_decision.should_intervene", value: String(Boolean(l4.should_intervene)) },
        { key: "layer4_decision.intervention_timing", value: l4.intervention_timing || "" },
        { key: "layer4_decision.intervention_reason", value: l4.intervention_reason || "" },
        { key: "layer4_decision.task_plan", value: l4.task_plan || "" },
      ].filter((item) => item.value),
      summary: "决策层给出是否介入、为何介入以及下一步任务计划。",
    },
    orchestration: {
      input: ["task_plan", "identified_needs", "should_intervene"],
      output: ["scheduled_tasks", "execution_strategy", "conflict_notes"],
      fields: [
        { key: "layer5_orchestration.scheduled_tasks", value: JSON.stringify(ensureList(l5.scheduled_tasks).slice(0, 4)) || "[]" },
        { key: "layer5_orchestration.execution_strategy", value: l5.execution_strategy || "" },
        { key: "layer5_orchestration.conflict_notes", value: l5.conflict_notes || "" },
      ].filter((item) => item.value),
      summary: "调度层把决策拆成可执行任务和设备路径。",
    },
    execution: {
      input: ["scheduled_tasks", "execution_strategy", "conflict_notes"],
      output: ["device_commands", "voice_response", "execution_feedback"],
      fields: [
        { key: "layer6_execution.device_commands", value: JSON.stringify(ensureList(l6.device_commands).slice(0, 4)) || "[]" },
        { key: "layer6_execution.voice_response", value: l6.voice_response || "" },
        { key: "layer6_execution.execution_feedback", value: l6.execution_feedback || "" },
      ].filter((item) => item.value),
      summary: "执行层将命令、语音和反馈真正送往外部。",
    },
  };
}

function buildLiveNarrativeState(data) {
  const l1 = data.layer1_perception || {};
  const l2 = data.layer2_fusion || {};
  const l3 = data.layer3_cognition || {};
  const l4 = data.layer4_decision || {};
  const l5 = data.layer5_orchestration || {};
  const l6 = data.layer6_execution || {};
  const memory = data.memory_update || {};

  const firstNeed = ensureList(l4.identified_needs)[0];
  const firstTask = ensureList(l5.scheduled_tasks)[0];
  const firstCommand = ensureList(l6.device_commands)[0];

  return {
    perception: [
      `visual ${shortText(l1.visual || "unknown", 36)}`,
      `audio ${shortText(l1.audio || "none", 16)} sensors ${shortText(l1.sensors || "none", 16)}`,
      `lighting ${shortText(l1.lighting || "unknown", 12)} time ${shortText(l1.time_context || "unknown", 12)}`,
    ],
    fusion: [
      `scene ${shortText(l2.scene_label || "unknown", 22)} dominant ${shortText(l2.dominant_signal || "none", 18)}`,
      `confidence ${l2.fusion_confidence !== undefined ? `${Math.round(Number(l2.fusion_confidence) * 100)}%` : "na"}`,
      `context ${shortText(l2.context_summary || "none", 30)}`,
    ],
    cognition: [
      `activity ${shortText(l3.user_activity || "unknown", 18)} posture ${shortText(l3.user_posture || "unknown", 18)}`,
      `emotion ${shortText(l3.user_emotion || "unknown", 16)} people ${shortText(ensureList(l3.people_present).join(" ") || "none", 20)}`,
      `belief ${shortText(l3.tom_belief || "none", 20)} desire ${shortText(l3.tom_desire || "none", 20)} intention ${shortText(l3.tom_intention || "none", 20)}`,
    ],
    decision: [
      `need ${shortText(firstNeed?.description || firstNeed?.type || "none", 24)} intervene ${l4.should_intervene ? "true" : "false"}`,
      `timing ${shortText(l4.intervention_timing || "none", 16)} reason ${shortText(l4.intervention_reason || "none", 22)}`,
      `task_plan ${shortText(l4.task_plan || "none", 28)}`,
    ],
    orchestration: [
      `task ${shortText(firstTask?.task || firstTask?.task_id || "none", 22)} route ${shortText(firstTask?.device || "none", 16)}`,
      `strategy ${shortText(l5.execution_strategy || "none", 18)}`,
      `conflict ${shortText(l5.conflict_notes || "none", 20)} scheduled_tasks ready`,
    ],
    execution: [
      `command ${shortText(firstCommand ? `${firstCommand.device_id}:${firstCommand.action}` : "none", 28)}`,
      `voice ${shortText(l6.voice_response || "none", 24)} feedback ${shortText(l6.execution_feedback || "none", 24)}`,
      `writeback event ${shortText(memory.event_summary || "none", 20)}`,
    ],
  };
}

function setConnectionState(isOnline, label) {
  connDot.classList.toggle("online", isOnline);
  connText.textContent = label;
}

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1;
  state.width = window.innerWidth;
  state.height = window.innerHeight;
  canvas.width = state.width * dpr;
  canvas.height = state.height * dpr;
  canvas.style.width = `${state.width}px`;
  canvas.style.height = `${state.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  buildBackgroundField();
  updateFitScale();
  state.autoScale = 1;
  renderCluster();
  scheduleClusterFit();
}

function buildBackgroundField() {
  particles.length = 0;
  diagonals.length = 0;

  const particleCount = Math.max(40, Math.floor(state.width / 28));
  for (let i = 0; i < particleCount; i += 1) {
    particles.push({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      radius: Math.random() * 1.5 + 0.4,
      driftX: (Math.random() - 0.5) * 0.12,
      driftY: (Math.random() - 0.5) * 0.12,
      alpha: Math.random() * 0.45 + 0.08,
    });
  }

  const lineCount = 12;
  for (let i = 0; i < lineCount; i += 1) {
    diagonals.push({
      startX: state.width * 0.1 + i * (state.width * 0.055),
      startY: state.height * 0.14,
      endX: state.width * 0.06 + i * (state.width * 0.06),
      endY: state.height * 0.88,
      phase: Math.random() * Math.PI * 2,
    });
  }
}

function drawGlow(x, y, radius, color, alpha) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, `${color}${Math.round(alpha * 255).toString(16).padStart(2, "0")}`);
  gradient.addColorStop(1, `${color}00`);
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawBackground(time) {
  ctx.clearRect(0, 0, state.width, state.height);

  const activeColorMap = {
    perception: ["#8df0d1", "#ffffff"],
    fusion: ["#8dbbff", "#ffffff"],
    cognition: ["#ffffff", "#ff224d"],
    decision: ["#ffd6dd", "#ff224d"],
    orchestration: ["#bfcfff", "#ffffff"],
    execution: ["#ffffff", "#ff224d"],
  };
  const [glowA, glowB] = activeColorMap[state.activeStepKey] || ["#ffffff", "#ff224d"];

  drawGlow(state.width * 0.62, state.height * 0.38, 180, glowA, 0.055);
  drawGlow(state.width * 0.68, state.height * 0.52, 220, glowB, 0.08);
  drawGlow(state.width * 0.46, state.height * 0.56, 160, "#ffffff", state.activeStepKey === "cognition" ? 0.055 : 0.024);

  ctx.save();
  diagonals.forEach((line, index) => {
    ctx.beginPath();
    ctx.strokeStyle = index % 3 === state.stepIndex % 3 ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)";
    ctx.lineWidth = index % 3 === state.stepIndex % 3 ? 1 : 0.6;
    const wave = Math.sin(time * 0.001 + line.phase) * 18;
    ctx.moveTo(line.startX + wave, line.startY);
    ctx.lineTo(line.endX - wave, line.endY);
    ctx.stroke();
  });
  ctx.restore();

  particles.forEach((particle) => {
    particle.x += particle.driftX;
    particle.y += particle.driftY;
    if (particle.x < -10) particle.x = state.width + 10;
    if (particle.x > state.width + 10) particle.x = -10;
    if (particle.y < -10) particle.y = state.height + 10;
    if (particle.y > state.height + 10) particle.y = -10;

    ctx.fillStyle = `rgba(255,255,255,${particle.alpha})`;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fill();
  });

  if (state.pulseEnabled) {
    const activeLineX = state.width * (0.32 + state.stepIndex * 0.06);
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(activeLineX, state.height * 0.08, 1, state.height * 0.84);
  }
}

function animate(time) {
  drawBackground(time);
  const delta = state.lastFrameTime ? time - state.lastFrameTime : 16;
  state.lastFrameTime = time;
  updateFlowPackets(delta);
  updateFlowTexts(delta);
  updateOverlayPackets(delta);
  window.requestAnimationFrame(animate);
}

function renderCluster() {
  cluster.style.setProperty("--rx", `${state.rotateX}deg`);
  cluster.style.setProperty("--rz", `${state.rotateZ}deg`);
  cluster.style.setProperty("--scale", `${(state.fitScale * state.scale * state.autoScale).toFixed(4)}`);
  cluster.style.setProperty("--tx", `${state.offsetX}px`);
  cluster.style.setProperty("--ty", `${state.offsetY}px`);
}

function updateFitScale() {
  const viewportWidth = viewport.clientWidth || window.innerWidth;
  const viewportHeight = viewport.clientHeight || window.innerHeight;
  const baseWidth = Math.min(760, viewportWidth - 280);
  const baseHeight = Math.min(420, viewportHeight - 200);
  const usableWidth = Math.max(baseWidth * 1.2, viewportWidth - 40);
  const usableHeight = Math.max(baseHeight * 1.2, viewportHeight - 80);
  const fit = Math.min(
    usableWidth / (baseWidth * 1.8),
    usableHeight / (baseHeight * 1.6),
  );
  state.fitScale = clamp(fit, 0.78, 1.02);
  state.offsetX = clamp((viewportWidth - baseWidth * 1.4) * 0.01, -18, 12);
  state.offsetY = clamp((viewportHeight - baseHeight * 1.3) * 0.008, -6, 10);
}

function getClusterBounds() {
  const rects = layers
    .map((layer) => layer.getBoundingClientRect())
    .filter((rect) => rect.width > 0 && rect.height > 0);
  if (!rects.length) return null;
  return {
    left: Math.min(...rects.map((rect) => rect.left)),
    right: Math.max(...rects.map((rect) => rect.right)),
    top: Math.min(...rects.map((rect) => rect.top)),
    bottom: Math.max(...rects.map((rect) => rect.bottom)),
  };
}

function getSafeViewportBounds() {
  const frameRect = viewport.getBoundingClientRect();
  const safe = {
    left: frameRect.left + 10,
    right: frameRect.right - 10,
    top: frameRect.top + 10,
    bottom: frameRect.bottom - 10,
  };
  return safe;
}

function fitClusterToViewport(pass = 0) {
  const bounds = getClusterBounds();
  if (!bounds) return;
  const safe = getSafeViewportBounds();
  const safeWidth = Math.max(420, safe.right - safe.left);
  const safeHeight = Math.max(280, safe.bottom - safe.top);
  const boundsWidth = Math.max(1, bounds.right - bounds.left);
  const boundsHeight = Math.max(1, bounds.bottom - bounds.top);
  const scaleAdjust = Math.min(safeWidth / boundsWidth, safeHeight / boundsHeight, 1);
  const safeCenterX = (safe.left + safe.right) / 2;
  const safeCenterY = (safe.top + safe.bottom) / 2;
  const boundsCenterX = (bounds.left + bounds.right) / 2;
  const boundsCenterY = (bounds.top + bounds.bottom) / 2;
  const dx = safeCenterX - boundsCenterX;
  const dy = safeCenterY - boundsCenterY;

  let changed = false;
  if (scaleAdjust < 0.985) {
    state.autoScale = clamp(state.autoScale * Math.max(scaleAdjust, 0.94), 0.82, 1.04);
    changed = true;
  }
  if (Math.abs(dx) > 1) {
    state.offsetX += clamp(dx, -64, 64);
    changed = true;
  }
  if (Math.abs(dy) > 1) {
    state.offsetY += clamp(dy, -42, 42);
    changed = true;
  }

  if (!changed) return;
  renderCluster();
  if (pass < 3) {
    window.requestAnimationFrame(() => fitClusterToViewport(pass + 1));
  }
}

function scheduleClusterFit() {
  if (state.fitRaf) {
    window.cancelAnimationFrame(state.fitRaf);
  }
  state.fitRaf = window.requestAnimationFrame(() => {
    state.fitRaf = null;
    fitClusterToViewport(0);
  });
}

function renderDetails(key) {
  const meta = layerMeta[key] || layerMeta.overall;
  viewport.dataset.activeLayer = key;
  document.body.dataset.activeLayer = key;
  focusValue.textContent = meta.name;
  detailVisual.textContent = meta.visual;
  detailNarrative.textContent = meta.narrative;
  detailTags.innerHTML = meta.tags.map((tag) => `<span class="detail-tag">${tag}</span>`).join("");
}

function ambientDetailKey() {
  return layerMeta[state.activeStepKey] ? state.activeStepKey : "overall";
}

function setHoverLayer(key) {
  state.hoverLayer = key;
  cluster.classList.toggle("hover-mode", Boolean(key));
  layers.forEach((layer) => {
    layer.classList.toggle("hover-active", Boolean(key) && layer.dataset.layer === key);
  });
  renderDetails(key || ambientDetailKey());
}

function setFocus(key) {
  state.focus = key;
  const inFocus = key !== "overall";
  cluster.classList.toggle("focus-mode", inFocus);
  layers.forEach((layer) => {
    layer.classList.toggle("active", inFocus && layer.dataset.layer === key);
  });
  renderDetails(key);
}

function activateGuideLine(index) {
  activationLines.forEach((line, i) => {
    line.classList.toggle("active", i === index);
  });
}

function applyStep(step) {
  state.stepIndex = STEP_ORDER.indexOf(step.key);
  if (state.stepIndex < 0) state.stepIndex = 0;
  state.activeStepKey = step.key;

  thoughtStatus.textContent = step.status;
  currentThoughtText.textContent = step.text;
  cluster.classList.add("thought-mode");
  viewport.dataset.runtimeStep = step.key;
  viewport.dataset.activeLayer = step.layer || "overall";
  document.body.dataset.activeLayer = step.layer || "overall";

  layers.forEach((layer) => {
    layer.classList.toggle("thought-active", step.layer && layer.dataset.layer === step.layer);
  });
  storySteps.forEach((button) => {
    button.classList.toggle("active", button.dataset.step === step.key);
  });
  activateGuideLine(step.line);

  if (state.focus === "overall") {
    if (!state.hoverLayer) {
      renderDetails(step.layer || "overall");
    }
  }
  if (state.overlayLayer) renderOverlay(state.overlayLayer);
}

function renderLayerFlow(flowState) {
  state.currentFlowState = flowState;
  const layerFlows = flowState.layers || {};
  Object.entries(layerSvgs).forEach(([layerKey, svg]) => {
    renderDenseBackbone(svg, layerKey, "main");
  });
  Object.entries(layerTagContainers).forEach(([layerKey, container]) => {
    const items = (layerFlows[layerKey] || []).slice(0, 7);
    container.innerHTML = items.length
      ? items.map((item) => `<span class="layer-flow-tag">${escapeHtml(item)}</span>`).join("")
      : `<span class="layer-flow-tag">waiting</span>`;
  });

  const writebacks = (flowState.writeback || []).slice(0, 6);
  writebackStream.innerHTML = writebacks.length
    ? writebacks.map((item, index) => `
      <div class="writeback-item" data-rank="${index + 1}">
        <span class="wb-index">S${String(index + 1).padStart(2, "0")}</span>
        <span class="wb-text">${escapeHtml(item)}</span>
      </div>
    `).join("")
    : `<div class="writeback-item"><span class="wb-index">S00</span><span class="wb-text">waiting</span></div>`;

  rebuildFlowPackets(layerFlows);
  if (state.overlayLayer) {
    renderOverlay(state.overlayLayer);
  }
}

function ensurePathIds(svg, layerKey, prefix) {
  const scopedPaths = Array.from(svg.querySelectorAll(".dense-backbone path"));
  const sourcePaths = scopedPaths.length ? scopedPaths : Array.from(svg.querySelectorAll("path"));
  return sourcePaths.map((path, index) => {
    if (!path.id) {
      path.id = `${prefix}-${layerKey}-path-${index}`;
    }
    return path;
  });
}

function renderNarrativesForSvg(svg, layerKey, sentences, prefix, bucketName) {
  const pathRefs = ensurePathIds(svg, layerKey, prefix);
  let textGroup = svg.querySelector(".flow-texts");
  if (!textGroup) {
    textGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    textGroup.setAttribute("class", "flow-texts");
    svg.appendChild(textGroup);
  }
  textGroup.innerHTML = "";
  if (bucketName === "overlay") state.overlayTexts = [];

  sentences.slice(0, 4).forEach((sentence, index) => {
    const path = pathRefs[index % pathRefs.length];
    if (!path) return;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("class", "flow-text");
    const textPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
    textPath.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${path.id}`);
    textPath.setAttribute("startOffset", `${10 + index * 16}%`);
    textPath.textContent = shortText(sentence, 72);
    text.appendChild(textPath);
    textGroup.appendChild(text);
  });
}

function renderLayerNarratives(narrativeState) {
  state.currentNarrativeState = narrativeState;
  state.flowTexts = [];
  Object.entries(layerSvgs).forEach(([layerKey, svg]) => {
    renderNarrativesForSvg(svg, layerKey, narrativeState[layerKey] || [], "main", "main");
  });
  if (state.overlayLayer) {
    renderOverlay(state.overlayLayer);
  }
}

function fieldMap(detailState) {
  return Object.fromEntries((detailState.fields || []).map((item) => [item.key, item.value]));
}

function scoreFromValue(value) {
  const raw = String(value || "");
  if (!raw) return 0.18;
  return Math.max(0.18, Math.min(0.96, raw.length / 44));
}

function layerPalette(layerKey) {
  const palettes = {
    perception: ["#9cd3ff", "#84b7ff", "#79ffd1", "#d8ff95", "#ffd48d", "#ff9bb0"],
    fusion: ["#b9d4ff", "#a6bbff", "#9fdcff", "#f3f4f7", "#ffd4a0", "#c2ffe9"],
    cognition: ["#9cd3ff", "#d7c1ff", "#ffd4cf", "#bfffd8", "#f7f7f7", "#e8cbff", "#ffb8d6"],
    decision: ["#ffd58c", "#ff9bb2", "#f3f3f3", "#9ed4ff", "#c8ffc2", "#e4d1ff"],
    orchestration: ["#8ec7ff", "#bcd6ff", "#b8ffc9", "#ffd1aa", "#f2f2f2", "#d8c8ff"],
    execution: ["#ff9aa8", "#ffd58f", "#9cd6ff", "#caffd3", "#f3f3f3", "#ddbaff"],
  };
  return palettes[layerKey] || ["#f2f2f2"];
}

function getLayerColumns(layerKey) {
  const detail = getLayerDetailState()[layerKey] || { fields: [], input: [], output: [] };
  const map = fieldMap(detail);
  const palette = layerPalette(layerKey);
  const layerFlow = state.currentFlowState.layers?.[layerKey] || [];
  const textInput = promptInput.value.trim();

  const specs = {
    perception: [
      ["VISUAL", map["layer1_perception.visual"]],
      ["AUDIO", map["layer1_perception.audio"]],
      ["SENSOR", map["layer1_perception.sensors"]],
      ["LIGHT", map["layer1_perception.lighting"]],
      ["TIME", map["layer1_perception.time_context"]],
      ["TEXT", textInput || "none"],
    ],
    fusion: [
      ["DOM", map["layer2_fusion.dominant_signal"]],
      ["SCENE", map["layer2_fusion.scene_label"]],
      ["CONF", map["layer2_fusion.fusion_confidence"]],
      ["CTX", map["layer2_fusion.context_summary"]],
      ["VIS", layerFlow[0] || "visual"],
      ["MIX", layerFlow[1] || "blend"],
    ],
    cognition: [
      ["ACT", map["layer3_cognition.user_activity"]],
      ["POST", map["layer3_cognition.user_posture"]],
      ["EMO", map["layer3_cognition.user_emotion"]],
      ["PEOPLE", map["layer3_cognition.people_present"]],
      ["BELIEF", map["layer3_cognition.tom_belief"]],
      ["DESIRE", map["layer3_cognition.tom_desire"]],
      ["INTENT", map["layer3_cognition.tom_intention"]],
    ],
    decision: [
      ["NEEDS", map["layer4_decision.identified_needs"]],
      ["INTERVENE", map["layer4_decision.should_intervene"]],
      ["TIMING", map["layer4_decision.intervention_timing"]],
      ["REASON", map["layer4_decision.intervention_reason"]],
      ["PLAN", map["layer4_decision.task_plan"]],
      ["RISK", layerFlow[1] || "observe"],
    ],
    orchestration: [
      ["TASKS", map["layer5_orchestration.scheduled_tasks"]],
      ["STRATEGY", map["layer5_orchestration.execution_strategy"]],
      ["CONFLICT", map["layer5_orchestration.conflict_notes"]],
      ["ROUTE-A", layerFlow[0] || "route"],
      ["ROUTE-B", layerFlow[1] || "dispatch"],
      ["ROUTE-C", layerFlow[2] || "device"],
    ],
    execution: [
      ["COMMAND", map["layer6_execution.device_commands"]],
      ["VOICE", map["layer6_execution.voice_response"]],
      ["FEEDBACK", map["layer6_execution.execution_feedback"]],
      ["EFFECT", layerFlow[0] || "effect"],
      ["USER", layerFlow[1] || "response"],
      ["RETURN", layerFlow[2] || "writeback"],
    ],
  };
  const extra = layerFlow
    .slice(0, 4)
    .map((value, index) => [`SIG-${String(index + 1).padStart(2, "0")}`, value]);
  const merged = [...(specs[layerKey] || []), ...extra].slice(0, 10);

  return merged.map(([label, value], index) => ({
    id: `${layerKey}-${label.toLowerCase()}`,
    label,
    value: String(value || "none"),
    short: shortText(value || "none", 18),
    color: palette[index % palette.length],
    score: scoreFromValue(value),
  }));
}

function getLayerConnectors(layerKey, columns) {
  const by = (label) => columns.findIndex((col) => col.label === label);
  const sets = {
    perception: [["VISUAL", "SENSOR", "merge"], ["AUDIO", "TEXT", "hint"], ["LIGHT", "TIME", "context"], ["TEXT", "VISUAL", "condition"]],
    fusion: [["DOM", "SCENE", "dominates"], ["VIS", "MIX", "mix"], ["MIX", "CTX", "summary"], ["CONF", "SCENE", "weight"]],
    cognition: [["ACT", "EMO", "state"], ["EMO", "BELIEF", "mind"], ["BELIEF", "DESIRE", "drive"], ["DESIRE", "INTENT", "plan"], ["PEOPLE", "BELIEF", "social"]],
    decision: [["NEEDS", "INTERVENE", "gate"], ["INTERVENE", "TIMING", "when"], ["TIMING", "PLAN", "plan"], ["REASON", "PLAN", "why"], ["RISK", "INTERVENE", "observe"]],
    orchestration: [["TASKS", "STRATEGY", "mode"], ["TASKS", "ROUTE-A", "dispatch"], ["ROUTE-A", "ROUTE-B", "handoff"], ["ROUTE-B", "ROUTE-C", "device"], ["CONFLICT", "STRATEGY", "resolve"]],
    execution: [["COMMAND", "VOICE", "sync"], ["COMMAND", "FEEDBACK", "result"], ["VOICE", "USER", "speak"], ["FEEDBACK", "RETURN", "loop"], ["EFFECT", "RETURN", "echo"]],
  };
  return (sets[layerKey] || []).map(([fromLabel, toLabel, label]) => ({
    from: by(fromLabel),
    to: by(toLabel),
    label,
  })).filter((item) => item.from >= 0 && item.to >= 0);
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
  Object.entries(attrs).forEach(([key, value]) => {
    el.setAttribute(key, String(value));
  });
  return el;
}

function renderCognitionBackbone(group, columns, _connectors, _prefix, _layerKey) {
  const leftBox = { x: 68, y: 76, width: 186, height: 274 };
  const coreBox = { x: 286, y: 66, width: 182, height: 294 };
  const rightBox = { x: 506, y: 76, width: 178, height: 274 };
  const leftRows = [112, 170, 228, 286];
  const rightRows = [120, 212, 304];
  const belief = columns.find((item) => item.label === "BELIEF");
  const desire = columns.find((item) => item.label === "DESIRE");
  const intent = columns.find((item) => item.label === "INTENT");

  [leftBox, coreBox, rightBox].forEach((box) => {
    group.appendChild(svgEl("rect", {
      class: "logic-panel-box",
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    }));
  });
  group.appendChild(svgEl("line", { class: "logic-flow-line", x1: 254, y1: 214, x2: 286, y2: 214 }));
  group.appendChild(svgEl("line", { class: "logic-flow-line", x1: 468, y1: 214, x2: 506, y2: 214 }));

  [["OBSERVED STATE", 78, 64], ["COGNITIVE MODEL", 376, 54], ["INFERRED OUTPUT", 510, 64]].forEach(([textValue, x, y]) => {
    const text = svgEl("text", { class: "axis-head", x, y, "text-anchor": "start" });
    text.textContent = textValue;
    group.appendChild(text);
  });
  group.appendChild(svgEl("text", {
    class: "micro-label",
    x: 377,
    y: 338,
    "text-anchor": "middle",
  })).textContent = "observe -> model -> infer";

  columns.slice(0, 4).forEach((column, index) => {
    const y = leftRows[index];
    group.appendChild(svgEl("rect", {
      class: "logic-row-box",
      x: 88,
      y: y - 16,
      width: 146,
      height: 30,
    }));
    const label = svgEl("text", { class: "axis-head", x: 100, y: y - 5, "text-anchor": "start" });
    label.textContent = column.label;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 100, y: y + 10, "text-anchor": "start" });
    value.textContent = shortText(column.short, 20);
    group.appendChild(value);
    group.appendChild(svgEl("path", {
      class: "logic-path",
      d: `M 234 ${y - 2} C 254 ${y - 2}, 270 ${180 + index * 18}, 286 180`,
    }));
  });

  const stack = [
    { label: "BELIEF", value: belief?.short || "none", y: 120 },
    { label: "DESIRE", value: desire?.short || "none", y: 206 },
    { label: "INTENT", value: intent?.short || "none", y: 292 },
  ];
  stack.forEach((item) => {
    group.appendChild(svgEl("rect", {
      class: "logic-core-cell",
      x: 310,
      y: item.y - 26,
      width: 134,
      height: 46,
    }));
    const label = svgEl("text", { class: "axis-head", x: 322, y: item.y - 9, "text-anchor": "start" });
    label.textContent = item.label;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 322, y: item.y + 8, "text-anchor": "start" });
    value.textContent = shortText(item.value, 24);
    group.appendChild(value);
  });
  group.appendChild(svgEl("line", { class: "logic-divider", x1: 377, y1: 144, x2: 377, y2: 266 }));
  group.appendChild(svgEl("line", { class: "logic-divider", x1: 324, y1: 170, x2: 430, y2: 170 }));
  group.appendChild(svgEl("line", { class: "logic-divider", x1: 324, y1: 256, x2: 430, y2: 256 }));
  [
    ["SOCIAL FILTER", 392, 161],
    ["GOAL RESOLVE", 392, 247],
  ].forEach(([txt, x, y]) => {
    const t = svgEl("text", { class: "field-note", x, y, "text-anchor": "middle" });
    t.textContent = txt;
    group.appendChild(t);
  });

  const rightItems = [
    { label: "MENTAL MODEL", value: columns[4]?.short || "none", y: rightRows[0] },
    { label: "SOCIAL READ", value: columns[3]?.short || "none", y: rightRows[1] },
    { label: "ACTION INTENT", value: intent?.short || "none", y: rightRows[2] },
  ];
  rightItems.forEach((item, index) => {
    group.appendChild(svgEl("rect", {
      class: "logic-row-box",
      x: 512,
      y: item.y - 17,
      width: 156,
      height: 32,
    }));
    const label = svgEl("text", { class: "axis-head", x: 524, y: item.y - 6, "text-anchor": "start" });
    label.textContent = item.label;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 524, y: item.y + 10, "text-anchor": "start" });
    value.textContent = shortText(item.value, 18);
    group.appendChild(value);
    group.appendChild(svgEl("path", {
      class: "logic-soft-path",
      d: `M 444 ${120 + index * 92} C 470 ${120 + index * 92}, 492 ${item.y}, 512 ${item.y}`,
    }));
  });

}

function renderDecisionBackbone(group, columns, _connectors, _prefix, _layerKey) {
  const leftBox = { x: 68, y: 78, width: 202, height: 278 };
  const gateBox = { x: 304, y: 80, width: 150, height: 274 };
  const rightBox = { x: 490, y: 78, width: 194, height: 278 };
  const leftRows = [112, 162, 212, 262, 312];
  const branchYs = [120, 212, 304];
  const decisionValue = (columns.find((item) => item.label === "INTERVENE")?.value || "").toLowerCase();
  const activeBranch = /(true|yes|介入|主动)/.test(decisionValue) ? 2 : 1;

  [leftBox, gateBox, rightBox].forEach((box) => {
    group.appendChild(svgEl("rect", {
      class: "logic-panel-box",
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    }));
  });
  [["EVIDENCE INPUT", 78, 66], ["GATE EVALUATION", 316, 66], ["DECISION OUTPUT", 504, 66]].forEach(([textValue, x, y]) => {
    const text = svgEl("text", { class: "axis-head", x, y, "text-anchor": "start" });
    text.textContent = textValue;
    group.appendChild(text);
  });
  const gateSub = svgEl("text", { class: "micro-label", x: 379, y: 332, "text-anchor": "middle" });
  gateSub.textContent = "score -> compare -> decide";
  group.appendChild(gateSub);

  columns.slice(0, 5).forEach((column, index) => {
    const y = leftRows[index];
    group.appendChild(svgEl("rect", {
      class: "logic-row-box",
      x: 88,
      y: y - 16,
      width: 164,
      height: 30,
    }));
    const label = svgEl("text", { class: "axis-head", x: 100, y: y - 5, "text-anchor": "start" });
    label.textContent = column.label;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 100, y: y + 10, "text-anchor": "start" });
    value.textContent = shortText(column.short, 22);
    group.appendChild(value);
    const fill = svgEl("rect", {
      class: "decision-metric-fill",
      x: 216,
      y: y - 9,
      width: Math.max(8, column.score * 24).toFixed(2),
      height: 5,
    });
    group.appendChild(fill);
    group.appendChild(svgEl("path", {
      class: "logic-path",
      d: `M 252 ${y - 1} C 278 ${y - 1}, 288 ${188 + index * 10}, 304 188`,
    }));
  });

  group.appendChild(svgEl("rect", {
    class: "logic-core-cell",
    x: 324,
    y: 104,
    width: 108,
    height: 44,
  }));
  const needLabel = svgEl("text", { class: "axis-head", x: 336, y: 122, "text-anchor": "start" });
  needLabel.textContent = "NEED SCORE";
  group.appendChild(needLabel);
  const needValue = svgEl("text", { class: "field-note", x: 336, y: 138, "text-anchor": "start" });
  needValue.textContent = shortText(columns.find((item) => item.label === "NEEDS")?.short || "none", 18);
  group.appendChild(needValue);
  const riskLabel = svgEl("text", { class: "axis-head", x: 336, y: 194, "text-anchor": "start" });
  riskLabel.textContent = "DISTURBANCE";
  group.appendChild(riskLabel);
  const riskValue = svgEl("text", { class: "field-note", x: 336, y: 210, "text-anchor": "start" });
  riskValue.textContent = shortText(columns.find((item) => item.label === "RISK")?.short || "observe", 16);
  group.appendChild(riskValue);
  const timingLabel = svgEl("text", { class: "axis-head", x: 336, y: 266, "text-anchor": "start" });
  timingLabel.textContent = "TIMING";
  group.appendChild(timingLabel);
  const timingValue = svgEl("text", { class: "field-note", x: 336, y: 282, "text-anchor": "start" });
  timingValue.textContent = shortText(columns.find((item) => item.label === "TIMING")?.short || "none", 16);
  group.appendChild(timingValue);
  [["ALLOW", 182], ["GATE", 220], ["DELAY", 258]].forEach(([txt, y]) => {
    group.appendChild(svgEl("line", { class: "logic-divider", x1: 332, y1: y, x2: 424, y2: y }));
    const t = svgEl("text", { class: "field-note", x: 438, y: y - 2, "text-anchor": "end" });
    t.textContent = txt;
    group.appendChild(t);
  });
  group.appendChild(svgEl("rect", {
    class: "decision-threshold-box",
    x: 360,
    y: 146,
    width: 32,
    height: 124,
  }));
  const pointerY = [170, 214, 258][activeBranch];
  group.appendChild(svgEl("line", {
    class: "decision-pointer",
    x1: 352,
    y1: pointerY,
    x2: 404,
    y2: pointerY,
  }));

  const branchLabels = ["NO-OP", "OBSERVE", "INTERVENE"];
  branchYs.forEach((y, index) => {
    group.appendChild(svgEl("rect", {
      class: `decision-window ${index === activeBranch ? "active" : ""}`,
      x: 512,
      y: y - 20,
      width: 156,
      height: 38,
    }));
    group.appendChild(svgEl("path", {
      class: `decision-branch ${index === activeBranch ? "active" : ""}`,
      d: `M 448 ${pointerY} C 470 ${pointerY}, 482 ${y}, 512 ${y}`,
    }));
    const label = svgEl("text", { class: "axis-head", x: 524, y: y - 5, "text-anchor": "start" });
    label.textContent = branchLabels[index];
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 524, y: y + 11, "text-anchor": "start" });
    value.textContent = index === 2
      ? shortText(columns.find((item) => item.label === "PLAN")?.short || "task plan", 18)
      : shortText(columns.find((item) => item.label === "REASON")?.short || "hold", 18);
    group.appendChild(value);
    const sub = svgEl("text", { class: "micro-label", x: 656, y: y + 11, "text-anchor": "end" });
    sub.textContent = ["keep state", "watch user", "launch plan"][index];
    group.appendChild(sub);
  });

}

function renderPerceptionBackbone(group, columns, _connectors, _prefix, _layerKey) {
  const leftBox = { x: 68, y: 80, width: 188, height: 270 };
  const coreBox = { x: 290, y: 80, width: 168, height: 270 };
  const rightBox = { x: 492, y: 80, width: 192, height: 270 };
  const leftRows = [116, 184, 252];
  const centerRows = [120, 198, 276];
  const rightRows = [112, 156, 200, 244, 288];

  [leftBox, coreBox, rightBox].forEach((box) => {
    group.appendChild(svgEl("rect", {
      class: "logic-panel-box",
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    }));
  });
  [["RAW INPUT", 78, 66], ["SIGNAL PARSE", 304, 66], ["PERCEPTION OUTPUT", 506, 66]].forEach(([textValue, x, y]) => {
    const text = svgEl("text", { class: "axis-head", x, y, "text-anchor": "start" });
    text.textContent = textValue;
    group.appendChild(text);
  });
  const stageText = svgEl("text", { class: "micro-label", x: 374, y: 332, "text-anchor": "middle" });
  stageText.textContent = "capture -> detect -> emit";
  group.appendChild(stageText);

  const inputItems = [
    { label: "CAMERA", value: columns[0]?.short || "none", y: leftRows[0] },
    { label: "TEXT", value: columns[5]?.short || "none", y: leftRows[1] },
    { label: "SENSOR", value: columns[2]?.short || "none", y: leftRows[2] },
  ];
  inputItems.forEach((item) => {
    group.appendChild(svgEl("rect", {
      class: "logic-row-box",
      x: 88,
      y: item.y - 16,
      width: 152,
      height: 30,
    }));
    const label = svgEl("text", { class: "axis-head", x: 100, y: item.y - 5, "text-anchor": "start" });
    label.textContent = item.label;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 100, y: item.y + 10, "text-anchor": "start" });
    value.textContent = shortText(item.value, 18);
    group.appendChild(value);
    group.appendChild(svgEl("path", {
      class: "logic-path",
      d: `M 240 ${item.y - 1} C 262 ${item.y - 1}, 276 ${150 + leftRows.indexOf(item.y) * 36}, 290 ${150 + leftRows.indexOf(item.y) * 36}`,
    }));
  });

  [["DETECT", columns[0]?.short || "none"], ["SEGMENT", columns[1]?.short || "none"], ["ALIGN", columns[4]?.short || "none"]].forEach(([labelText, valueText], index) => {
    const y = centerRows[index];
    group.appendChild(svgEl("rect", {
      class: "logic-core-cell",
      x: 308,
      y: y - 22,
      width: 132,
      height: 40,
    }));
    const label = svgEl("text", { class: "axis-head", x: 320, y: y - 6, "text-anchor": "start" });
    label.textContent = labelText;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 320, y: y + 10, "text-anchor": "start" });
    value.textContent = shortText(valueText, 20);
    group.appendChild(value);
  });
  group.appendChild(svgEl("line", { class: "logic-divider", x1: 374, y1: 148, x2: 374, y2: 266 }));

  const outputItems = [
    columns[0], columns[1], columns[2], columns[3], columns[4],
  ];
  outputItems.forEach((column, index) => {
    const y = rightRows[index];
    group.appendChild(svgEl("rect", {
      class: "logic-row-box",
      x: 512,
      y: y - 14,
      width: 156,
      height: 26,
    }));
    const label = svgEl("text", { class: "axis-head", x: 524, y: y - 3, "text-anchor": "start" });
    label.textContent = column?.label || `OUT-${index + 1}`;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 524, y: y + 10, "text-anchor": "start" });
    value.textContent = shortText(column?.short || "none", 20);
    group.appendChild(value);
    group.appendChild(svgEl("path", {
      class: "logic-path",
      d: `M 440 ${120 + Math.min(index, 2) * 78} C 466 ${120 + Math.min(index, 2) * 78}, 486 ${y}, 512 ${y}`,
    }));
  });

}

function renderFusionBackbone(group, columns, _connectors, _prefix, _layerKey) {
  const leftBox = { x: 68, y: 80, width: 192, height: 270 };
  const coreBox = { x: 292, y: 80, width: 176, height: 270 };
  const rightBox = { x: 500, y: 80, width: 184, height: 270 };
  const leftRows = [112, 166, 220, 274];
  const rightRows = [112, 156, 200, 244];
  const confValue = columns.find((item) => item.label === "CONF");

  [leftBox, coreBox, rightBox].forEach((box) => {
    group.appendChild(svgEl("rect", {
      class: "logic-panel-box",
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    }));
  });
  [["INPUT SIGNALS", 78, 66], ["SCENE SYNTHESIS", 306, 66], ["FUSED OUTPUT", 512, 66]].forEach(([textValue, x, y]) => {
    const text = svgEl("text", { class: "axis-head", x, y, "text-anchor": "start" });
    text.textContent = textValue;
    group.appendChild(text);
  });
  const synthNote = svgEl("text", { class: "micro-label", x: 380, y: 334, "text-anchor": "middle" });
  synthNote.textContent = "merge -> compress -> score";
  group.appendChild(synthNote);

  columns.slice(0, 4).forEach((column, index) => {
    const y = leftRows[index];
    group.appendChild(svgEl("rect", {
      class: "logic-row-box",
      x: 88,
      y: y - 15,
      width: 156,
      height: 28,
    }));
    const label = svgEl("text", { class: "axis-head", x: 100, y: y - 4, "text-anchor": "start" });
    label.textContent = column.label;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 100, y: y + 10, "text-anchor": "start" });
    value.textContent = shortText(column.short, 20);
    group.appendChild(value);
    group.appendChild(svgEl("path", {
      class: "logic-path",
      d: `M 244 ${y - 1} C 268 ${y - 1}, 278 ${152 + index * 34}, 292 ${152 + index * 34}`,
    }));
  });

  group.appendChild(svgEl("rect", {
    class: "logic-core-cell",
    x: 314,
    y: 108,
    width: 132,
    height: 48,
  }));
  const coreHead = svgEl("text", { class: "axis-head", x: 326, y: 128, "text-anchor": "start" });
  coreHead.textContent = "SCENE LABEL";
  group.appendChild(coreHead);
  const coreValue = svgEl("text", { class: "field-note", x: 326, y: 145, "text-anchor": "start" });
  coreValue.textContent = shortText(columns.find((item) => item.label === "SCENE")?.short || "none", 22);
  group.appendChild(coreValue);
  group.appendChild(svgEl("line", { class: "logic-divider", x1: 326, y1: 176, x2: 434, y2: 176 }));
  group.appendChild(svgEl("line", { class: "logic-divider", x1: 326, y1: 236, x2: 434, y2: 236 }));
  [["DOMINANT", columns.find((item) => item.label === "DOM")?.short || "none", 196], ["CONTEXT", columns.find((item) => item.label === "CTX")?.short || "none", 256]].forEach(([labelText, valueText, y]) => {
    const label = svgEl("text", { class: "axis-head", x: 326, y, "text-anchor": "start" });
    label.textContent = labelText;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 326, y: y + 14, "text-anchor": "start" });
    value.textContent = shortText(valueText, 22);
    group.appendChild(value);
  });
  const confText = svgEl("text", { class: "micro-label", x: 380, y: 316, "text-anchor": "middle" });
  confText.textContent = `CONF ${shortText(confValue?.value || "na", 10)}`;
  group.appendChild(confText);

  columns.slice(0, 4).forEach((column, index) => {
    const y = rightRows[index];
    group.appendChild(svgEl("rect", {
      class: "logic-row-box",
      x: 512,
      y: y - 15,
      width: 156,
      height: 28,
    }));
    const label = svgEl("text", { class: "axis-head", x: 524, y: y - 4, "text-anchor": "start" });
    label.textContent = column.label;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 524, y: y + 10, "text-anchor": "start" });
    value.textContent = shortText(column.short, 18);
    group.appendChild(value);
    group.appendChild(svgEl("path", {
      class: "logic-path",
      d: `M 446 ${120 + index * 60} C 470 ${120 + index * 60}, 492 ${y - 1}, 512 ${y - 1}`,
    }));
  });
}

function renderOrchestrationBackbone(group, columns, _connectors, _prefix, _layerKey) {
  const leftBox = { x: 68, y: 80, width: 192, height: 270 };
  const coreBox = { x: 292, y: 80, width: 176, height: 270 };
  const rightBox = { x: 500, y: 80, width: 184, height: 270 };
  const leftRows = [112, 166, 220, 274];
  const rightRows = [112, 156, 200, 244];

  [leftBox, coreBox, rightBox].forEach((box) => {
    group.appendChild(svgEl("rect", {
      class: "logic-panel-box",
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    }));
  });
  [["TASK INPUT", 78, 66], ["ROUTE PLANNER", 306, 66], ["DEVICE MAP", 512, 66]].forEach(([textValue, x, y]) => {
    const text = svgEl("text", { class: "axis-head", x, y, "text-anchor": "start" });
    text.textContent = textValue;
    group.appendChild(text);
  });
  const orchNote = svgEl("text", { class: "micro-label", x: 380, y: 334, "text-anchor": "middle" });
  orchNote.textContent = "queue -> resolve -> dispatch";
  group.appendChild(orchNote);

  columns.slice(0, 4).forEach((column, index) => {
    const y = leftRows[index];
    group.appendChild(svgEl("rect", {
      class: "logic-row-box",
      x: 88,
      y: y - 15,
      width: 156,
      height: 28,
    }));
    const label = svgEl("text", { class: "axis-head", x: 100, y: y - 4, "text-anchor": "start" });
    label.textContent = column.label;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 100, y: y + 10, "text-anchor": "start" });
    value.textContent = shortText(column.short, 20);
    group.appendChild(value);
    group.appendChild(svgEl("path", {
      class: "logic-path",
      d: `M 244 ${y - 1} C 268 ${y - 1}, 278 ${152 + index * 34}, 292 ${152 + index * 34}`,
    }));
  });

  group.appendChild(svgEl("rect", {
    class: "logic-core-cell",
    x: 314,
    y: 108,
    width: 132,
    height: 48,
  }));
  const coreHead = svgEl("text", { class: "axis-head", x: 326, y: 128, "text-anchor": "start" });
  coreHead.textContent = "ROUTE TABLE";
  group.appendChild(coreHead);
  const coreValue = svgEl("text", { class: "field-note", x: 326, y: 145, "text-anchor": "start" });
  coreValue.textContent = shortText(columns[0]?.short || "none", 22);
  group.appendChild(coreValue);
  group.appendChild(svgEl("line", { class: "logic-divider", x1: 326, y1: 176, x2: 434, y2: 176 }));
  group.appendChild(svgEl("line", { class: "logic-divider", x1: 326, y1: 236, x2: 434, y2: 236 }));
  [["STRATEGY", columns[1]?.short || "none", 196], ["CONFLICT", columns[2]?.short || "none", 256]].forEach(([labelText, valueText, y]) => {
    const label = svgEl("text", { class: "axis-head", x: 326, y, "text-anchor": "start" });
    label.textContent = labelText;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 326, y: y + 14, "text-anchor": "start" });
    value.textContent = shortText(valueText, 22);
    group.appendChild(value);
  });

  columns.slice(0, 4).forEach((column, index) => {
    const y = rightRows[index];
    group.appendChild(svgEl("rect", {
      class: "logic-row-box",
      x: 512,
      y: y - 15,
      width: 156,
      height: 28,
    }));
    const label = svgEl("text", { class: "axis-head", x: 524, y: y - 4, "text-anchor": "start" });
    label.textContent = columns[3 + index]?.label || column.label;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 524, y: y + 10, "text-anchor": "start" });
    value.textContent = shortText(columns[3 + index]?.short || column.short, 18);
    group.appendChild(value);
    group.appendChild(svgEl("path", {
      class: "logic-path",
      d: `M 446 ${120 + index * 60} C 470 ${120 + index * 60}, 492 ${y - 1}, 512 ${y - 1}`,
    }));
  });
}

function renderExecutionBackbone(group, columns, _connectors, _prefix, _layerKey) {
  const leftBox = { x: 68, y: 80, width: 192, height: 270 };
  const coreBox = { x: 292, y: 80, width: 176, height: 270 };
  const rightBox = { x: 500, y: 80, width: 184, height: 270 };
  const leftRows = [126, 214, 302];
  const rightRows = [112, 156, 200, 244];

  [leftBox, coreBox, rightBox].forEach((box) => {
    group.appendChild(svgEl("rect", {
      class: "logic-panel-box",
      x: box.x,
      y: box.y,
      width: box.width,
      height: box.height,
    }));
  });
  [["COMMAND BUS", 78, 66], ["EXECUTION CHANNEL", 300, 66], ["FEEDBACK RETURN", 512, 66]].forEach(([textValue, x, y]) => {
    const text = svgEl("text", { class: "axis-head", x, y, "text-anchor": "start" });
    text.textContent = textValue;
    group.appendChild(text);
  });
  const execNote = svgEl("text", { class: "micro-label", x: 380, y: 334, "text-anchor": "middle" });
  execNote.textContent = "issue -> perform -> verify";
  group.appendChild(execNote);

  const inputItems = [
    { label: "DEVICE CMD", value: columns[0]?.short || "none", y: leftRows[0] },
    { label: "VOICE CMD", value: columns[1]?.short || "none", y: leftRows[1] },
    { label: "STATE ECHO", value: columns[2]?.short || "none", y: leftRows[2] },
  ];
  inputItems.forEach((item, index) => {
    group.appendChild(svgEl("rect", {
      class: "logic-row-box",
      x: 88,
      y: item.y - 16,
      width: 156,
      height: 30,
    }));
    const label = svgEl("text", { class: "axis-head", x: 100, y: item.y - 5, "text-anchor": "start" });
    label.textContent = item.label;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 100, y: item.y + 10, "text-anchor": "start" });
    value.textContent = shortText(item.value, 18);
    group.appendChild(value);
    group.appendChild(svgEl("path", {
      class: "logic-path",
      d: `M 244 ${item.y - 1} C 268 ${item.y - 1}, 278 ${150 + index * 72}, 292 ${150 + index * 72}`,
    }));
  });

  [["ISSUE", columns[0]?.short || "none", 120], ["PERFORM", columns[1]?.short || "none", 206], ["VERIFY", columns[2]?.short || "none", 292]].forEach(([labelText, valueText, y]) => {
    group.appendChild(svgEl("rect", {
      class: "logic-core-cell",
      x: 314,
      y: y - 26,
      width: 132,
      height: 46,
    }));
    const label = svgEl("text", { class: "axis-head", x: 326, y: y - 9, "text-anchor": "start" });
    label.textContent = labelText;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 326, y: y + 8, "text-anchor": "start" });
    value.textContent = shortText(valueText, 22);
    group.appendChild(value);
  });
  group.appendChild(svgEl("line", { class: "logic-divider", x1: 326, y1: 170, x2: 434, y2: 170 }));
  group.appendChild(svgEl("line", { class: "logic-divider", x1: 326, y1: 256, x2: 434, y2: 256 }));

  columns.slice(0, 4).forEach((column, index) => {
    const y = rightRows[index];
    group.appendChild(svgEl("rect", {
      class: "logic-row-box",
      x: 512,
      y: y - 15,
      width: 156,
      height: 28,
    }));
    const label = svgEl("text", { class: "axis-head", x: 524, y: y - 4, "text-anchor": "start" });
    label.textContent = column.label;
    group.appendChild(label);
    const value = svgEl("text", { class: "field-note", x: 524, y: y + 10, "text-anchor": "start" });
    value.textContent = shortText(column.short, 18);
    group.appendChild(value);
    group.appendChild(svgEl("path", {
      class: index === rightRows.length - 1 ? "logic-soft-path" : "logic-path",
      d: `M 446 ${120 + Math.min(index, 2) * 86} C 470 ${120 + Math.min(index, 2) * 86}, 492 ${y - 1}, 512 ${y - 1}`,
    }));
  });
}

function renderDenseBackbone(svg, layerKey, prefix) {
  const columns = getLayerColumns(layerKey);
  const connectors = getLayerConnectors(layerKey, columns);
  let group = svg.querySelector(".dense-backbone");
  if (!group) {
    group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("class", "dense-backbone");
    svg.insertBefore(group, svg.firstChild);
  }
  group.innerHTML = "";

  if (layerKey === "cognition") {
    renderCognitionBackbone(group, columns, connectors, prefix, layerKey);
    return;
  }
  if (layerKey === "decision") {
    renderDecisionBackbone(group, columns, connectors, prefix, layerKey);
    return;
  }
  if (layerKey === "perception") {
    renderPerceptionBackbone(group, columns, connectors, prefix, layerKey);
    return;
  }
  if (layerKey === "fusion") {
    renderFusionBackbone(group, columns, connectors, prefix, layerKey);
    return;
  }
  if (layerKey === "orchestration") {
    renderOrchestrationBackbone(group, columns, connectors, prefix, layerKey);
    return;
  }
  if (layerKey === "execution") {
    renderExecutionBackbone(group, columns, connectors, prefix, layerKey);
    return;
  }

  const xPad = 68;
  const usableW = 760 - xPad * 2;
  const topY = 34;
  const axisTop = 64;
  const orbitY = 94;
  const symbolY = 136;
  const barTop = 172;
  const barBottom = 312;
  const arcBaseY = 334;
  const tailY = 380;

  const xFor = (index) => xPad + (usableW * index) / Math.max(columns.length - 1, 1);

  columns.forEach((column, index) => {
    const x = xFor(index);
    const guide = document.createElementNS("http://www.w3.org/2000/svg", "line");
    guide.setAttribute("class", `axis-guide ${index % 3 === 0 ? "accent" : ""}`);
    guide.setAttribute("x1", x);
    guide.setAttribute("x2", x);
    guide.setAttribute("y1", topY);
    guide.setAttribute("y2", 396);
    group.appendChild(guide);

    const head = document.createElementNS("http://www.w3.org/2000/svg", "text");
    head.setAttribute("class", "axis-head");
    head.setAttribute("x", x);
    head.setAttribute("y", axisTop);
    head.setAttribute("text-anchor", "middle");
    head.textContent = column.label;
    group.appendChild(head);

    const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring.setAttribute("class", "orbit-ring");
    ring.setAttribute("cx", x);
    ring.setAttribute("cy", orbitY);
    ring.setAttribute("r", (14 + column.score * 54).toFixed(2));
    ring.style.opacity = String(0.14 + column.score * 0.18);
    group.appendChild(ring);

    const ring2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ring2.setAttribute("class", "orbit-ring");
    ring2.setAttribute("cx", x);
    ring2.setAttribute("cy", orbitY);
    ring2.setAttribute("r", (6 + column.score * 24).toFixed(2));
    ring2.style.opacity = String(0.06 + column.score * 0.14);
    group.appendChild(ring2);

    const core = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    core.setAttribute("class", "orbit-core");
    core.setAttribute("cx", x);
    core.setAttribute("cy", orbitY);
    core.setAttribute("r", (3 + column.score * 10).toFixed(2));
    group.appendChild(core);

    const symbolType = index % 4;
    if (symbolType === 0) {
      const symbol = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      symbol.setAttribute("class", "axis-symbol");
      symbol.setAttribute("cx", x);
      symbol.setAttribute("cy", symbolY);
      symbol.setAttribute("r", "5");
      group.appendChild(symbol);
    } else if (symbolType === 1) {
      const symbol = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      symbol.setAttribute("class", "axis-symbol");
      symbol.setAttribute("x", (x - 5).toFixed(2));
      symbol.setAttribute("y", (symbolY - 5).toFixed(2));
      symbol.setAttribute("width", "10");
      symbol.setAttribute("height", "10");
      group.appendChild(symbol);
    } else if (symbolType === 2) {
      const symbol = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
      symbol.setAttribute("class", "axis-symbol");
      symbol.setAttribute("points", `${x},${symbolY - 6} ${x + 6},${symbolY} ${x},${symbolY + 6} ${x - 6},${symbolY}`);
      group.appendChild(symbol);
    } else {
      const symbol = document.createElementNS("http://www.w3.org/2000/svg", "path");
      symbol.setAttribute("class", "axis-symbol");
      symbol.setAttribute("d", `M ${x - 6} ${symbolY} L ${x + 6} ${symbolY} M ${x} ${symbolY - 6} L ${x} ${symbolY + 6}`);
      group.appendChild(symbol);
    }

    const segmentCount = 24;
    const activeCount = Math.max(2, Math.round(segmentCount * column.score));
    for (let i = 0; i < segmentCount; i += 1) {
      const y1 = barTop + i * ((barBottom - barTop) / segmentCount);
      const y2 = y1 + 2.8;
      const bar = document.createElementNS("http://www.w3.org/2000/svg", "line");
      bar.setAttribute("class", "axis-bar");
      bar.setAttribute("x1", x);
      bar.setAttribute("x2", x);
      bar.setAttribute("y1", y1.toFixed(2));
      bar.setAttribute("y2", y2.toFixed(2));
      bar.style.stroke = i < activeCount ? column.color : "rgba(255,255,255,0.08)";
      bar.style.opacity = i < activeCount ? "0.88" : "0.3";
      group.appendChild(bar);
    }

    const value = document.createElementNS("http://www.w3.org/2000/svg", "text");
    value.setAttribute("class", "value-caption");
    value.setAttribute("x", x);
    value.setAttribute("y", barBottom + 18);
    value.setAttribute("text-anchor", "middle");
    value.textContent = column.short;
    group.appendChild(value);

    const note = document.createElementNS("http://www.w3.org/2000/svg", "text");
    note.setAttribute("class", "field-note");
    note.setAttribute("x", x);
    note.setAttribute("y", barTop - 10);
    note.setAttribute("text-anchor", "middle");
    note.textContent = `${Math.round(column.score * 100)}%`;
    group.appendChild(note);

    const tail = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tail.setAttribute("class", "axis-tail");
    tail.setAttribute("x", x);
    tail.setAttribute("y", tailY);
    tail.setAttribute("text-anchor", "middle");
    tail.textContent = `AXIS ${String(index + 1).padStart(2, "0")}`;
    group.appendChild(tail);
  });

  connectors.forEach((connector, index) => {
    const fromX = xFor(connector.from);
    const toX = xFor(connector.to);
    const arc = document.createElementNS("http://www.w3.org/2000/svg", "path");
    const dip = 34 + Math.abs(connector.to - connector.from) * 16 + index * 4;
    const d = `M ${fromX} ${arcBaseY} C ${fromX} ${arcBaseY + dip}, ${toX} ${arcBaseY + dip}, ${toX} ${arcBaseY}`;
    arc.setAttribute("class", `connector-arc ${index % 2 === 0 ? "" : "soft"}`);
    arc.setAttribute("d", d);
    const arcId = `${prefix}-${layerKey}-connector-${index}`;
    arc.setAttribute("id", arcId);
    group.appendChild(arc);

    const arcLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    arcLabel.setAttribute("class", "connector-label");
    const arcTextPath = document.createElementNS("http://www.w3.org/2000/svg", "textPath");
    arcTextPath.setAttributeNS("http://www.w3.org/1999/xlink", "href", `#${arcId}`);
    arcTextPath.setAttribute("startOffset", "38%");
    arcTextPath.textContent = connector.label;
    arcLabel.appendChild(arcTextPath);
    group.appendChild(arcLabel);
  });
}

function renderPathBundles(svg, _layerKey, _prefix) {
  let bundleGroup = svg.querySelector(".flow-bundles");
  if (!bundleGroup) {
    bundleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    bundleGroup.setAttribute("class", "flow-bundles");
    svg.insertBefore(bundleGroup, svg.firstChild);
  }
  bundleGroup.innerHTML = "";
}

function renderMicroAnnotations(svg, layerKey, _flowItems, prefix) {
  if (prefix === "main") {
    let labelGroup = svg.querySelector(".micro-labels");
    if (!labelGroup) {
      labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
      labelGroup.setAttribute("class", "micro-labels");
      svg.appendChild(labelGroup);
    }
    labelGroup.innerHTML = "";
    return;
  }
  const paths = ensurePathIds(svg, layerKey, prefix);
  const columns = getLayerColumns(layerKey);
  let labelGroup = svg.querySelector(".micro-labels");
  if (!labelGroup) {
    labelGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    labelGroup.setAttribute("class", "micro-labels");
    svg.appendChild(labelGroup);
  }
  labelGroup.innerHTML = "";

  const configMap = {
    perception: { max: 5, anchors: [0.14, 0.28, 0.44, 0.62, 0.78], spread: 22 },
    fusion: { max: 5, anchors: [0.12, 0.24, 0.46, 0.66, 0.82], spread: 20 },
    cognition: { max: 6, anchors: [0.08, 0.2, 0.34, 0.58, 0.72, 0.86], spread: 18 },
    decision: { max: 5, anchors: [0.12, 0.26, 0.52, 0.72, 0.86], spread: 18 },
    orchestration: { max: 5, anchors: [0.14, 0.3, 0.48, 0.68, 0.84], spread: 20 },
    execution: { max: 5, anchors: [0.16, 0.34, 0.52, 0.72, 0.86], spread: 20 },
  };
  const config = configMap[layerKey] || { max: 5, anchors: [0.18, 0.36, 0.54, 0.72, 0.86], spread: 20 };

  columns.slice(0, config.max).forEach((item, index) => {
    const path = paths[index % paths.length];
    if (!path) return;
    const length = path.getTotalLength();
    const ratio = config.anchors[index] ?? (0.18 + index * 0.14);
    const anchor = path.getPointAtLength(length * ratio);
    if (anchor.x > 286 && anchor.x < 496 && anchor.y > 150 && anchor.y < 284) return;
    const dir = index % 2 === 0 ? -1 : 1;
    const x2 = anchor.x + config.spread * dir;
    const y2 = anchor.y - 10 - (index % 4) * 6;

    const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
    tick.setAttribute("class", "micro-tick");
    tick.setAttribute("x1", anchor.x.toFixed(2));
    tick.setAttribute("y1", anchor.y.toFixed(2));
    tick.setAttribute("x2", x2.toFixed(2));
    tick.setAttribute("y2", y2.toFixed(2));
    labelGroup.appendChild(tick);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("class", "micro-label");
    text.setAttribute("x", (x2 + 4 * dir).toFixed(2));
    text.setAttribute("y", (y2 - 1).toFixed(2));
    text.setAttribute("text-anchor", dir > 0 ? "start" : "end");
    text.textContent = `${item.label} ${shortText(item.value, 14)}`;
    labelGroup.appendChild(text);
  });
}

function rebuildFlowPackets(layerFlows) {
  state.flowPackets.forEach((packet) => packet.el.remove());
  state.flowPackets = [];

  Object.entries(layerSvgs).forEach(([layerKey, svg]) => {
    renderPathBundles(svg, layerKey, "main");
    renderMicroAnnotations(svg, layerKey, layerFlows[layerKey] || [], "main");
    const packetGroup = svg.querySelector(".flow-packets");
    if (!packetGroup) return;
    packetGroup.innerHTML = "";

    const paths = ensurePathIds(svg, layerKey, "main");
    const items = getLayerColumns(layerKey).slice(0, 10);
    items.forEach((item, index) => {
      const path = paths[index % paths.length];
      if (!path) return;
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("class", "flow-packet");
      circle.setAttribute("r", index % 4 === 0 ? "1.9" : "1.35");
      circle.dataset.label = item.label;
      circle.style.fill = index % 5 === 0 ? "rgba(255,34,77,0.92)" : "rgba(255,255,255,0.92)";
      circle.style.filter = index % 5 === 0 ? "drop-shadow(0 0 3px rgba(255,34,77,0.22))" : "drop-shadow(0 0 2px rgba(255,255,255,0.08))";
      packetGroup.appendChild(circle);
      state.flowPackets.push({
        el: circle,
        path,
        layerKey,
        progress: (index / Math.max(items.length, 1)) % 1,
        speed: 0.00004 + index * 0.000012,
      });
    });
  });
}

function updateFlowPackets(deltaMs) {
  state.flowPackets.forEach((packet) => {
    const isActive = packet.layerKey === state.activeStepKey;
    const boost = isActive ? 1.6 : 0.45;
    packet.progress = (packet.progress + packet.speed * deltaMs * boost) % 1;
    const total = packet.path.getTotalLength();
    const point = packet.path.getPointAtLength(total * packet.progress);
    packet.el.setAttribute("cx", point.x.toFixed(2));
    packet.el.setAttribute("cy", point.y.toFixed(2));
    packet.el.style.opacity = isActive ? "0.92" : "0.28";
    packet.el.setAttribute("r", isActive ? "2.05" : "1.2");
  });
}

function updateFlowTexts(deltaMs) {
  return deltaMs;
}

function getLayerDetailState() {
  return state.latestResult ? buildLiveLayerDetailState(state.latestResult) : buildDemoLayerDetailState();
}

function buildOverlayChain(activeKey) {
  return STEP_ORDER.slice(1).map((key) => `
    <span class="overlay-chain-step ${key === activeKey ? "active" : ""}">${escapeHtml(key.toUpperCase())}</span>
  `).join("");
}

function renderOverlayFlow(layerKey) {
  state.overlayPackets.forEach((packet) => packet.el.remove());
  state.overlayPackets = [];
  state.overlayTexts = [];
  overlaySvgShell.innerHTML = "";

  const sourceLayer = layers.find((layer) => layer.dataset.layer === layerKey);
  if (!sourceLayer) return;

  const board = document.createElement("div");
  board.className = "overlay-layer-board";

  const cloneLayer = sourceLayer.cloneNode(true);
  cloneLayer.classList.add("active");
  board.appendChild(cloneLayer);
  overlaySvgShell.appendChild(board);

  const cloneSvg = cloneLayer.querySelector(".trace-svg");
  if (!cloneSvg) return;

  renderDenseBackbone(cloneSvg, layerKey, "overlay");
  renderPathBundles(cloneSvg, layerKey, "overlay");
  const packetGroup = cloneSvg.querySelector(".flow-packets");
  if (packetGroup) {
    packetGroup.innerHTML = "";
  }
  renderNarrativesForSvg(cloneSvg, layerKey, state.currentNarrativeState[layerKey] || [], "overlay", "overlay");
  renderMicroAnnotations(cloneSvg, layerKey, state.currentFlowState.layers?.[layerKey] || [], "overlay");

  const items = (state.currentFlowState.layers?.[layerKey] || []).slice(0, 8);
  const paths = ensurePathIds(cloneSvg, layerKey, "overlay");
  items.forEach((_, index) => {
    const path = paths[index % paths.length];
    if (!path || !packetGroup) return;
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", "flow-packet");
    circle.setAttribute("r", index % 2 === 0 ? "2.2" : "1.6");
    circle.style.fill = index % 5 === 0 ? "rgba(255,34,77,0.92)" : "rgba(255,255,255,0.92)";
    packetGroup.appendChild(circle);
    state.overlayPackets.push({
      el: circle,
      path,
      progress: (index / Math.max(items.length, 1)) % 1,
      speed: 0.00005 + index * 0.000012,
    });
  });
  overlayFlowCount.textContent = `${items.length} TOKENS`;
}

function updateOverlayPackets(deltaMs) {
  state.overlayPackets.forEach((packet) => {
    packet.progress = (packet.progress + packet.speed * deltaMs * 1.25) % 1;
    const total = packet.path.getTotalLength();
    const point = packet.path.getPointAtLength(total * packet.progress);
    packet.el.setAttribute("cx", point.x.toFixed(2));
    packet.el.setAttribute("cy", point.y.toFixed(2));
    packet.el.style.opacity = "0.88";
  });
}

function renderOverlay(layerKey) {
  const meta = layerMeta[layerKey];
  if (!meta) return;

  const detailState = getLayerDetailState()[layerKey];
  const layerCodeMap = {
    perception: "L1 / PERCEPTION",
    fusion: "L2 / FUSION",
    cognition: "L3 / COGNITION",
    decision: "L4 / DECISION",
    orchestration: "L5 / ORCHESTRATION",
    execution: "L6 / EXECUTION",
  };

  overlayLayerCode.textContent = layerCodeMap[layerKey] || "LAYER";
  overlayLayerTitle.textContent = meta.name;
  overlayLayerSubtitle.textContent = meta.visual;
  overlayStepStatus.textContent = state.activeStepKey.toUpperCase();
  overlayChain.innerHTML = buildOverlayChain(layerKey);
  overlayInputList.innerHTML = (detailState.input || []).map((item) => `<div class="overlay-chip">${escapeHtml(item)}</div>`).join("") || `<div class="overlay-chip">none</div>`;
  overlayOutputList.innerHTML = (detailState.output || []).map((item) => `<div class="overlay-chip">${escapeHtml(item)}</div>`).join("") || `<div class="overlay-chip">none</div>`;
  overlayFieldList.innerHTML = (detailState.fields || []).map((item) => `
    <div class="overlay-field-item">
      <span class="overlay-field-key">${escapeHtml(item.key)}</span>
      <span class="overlay-field-value">${escapeHtml(item.value)}</span>
    </div>
  `).join("") || `<div class="overlay-field-item"><span class="overlay-field-key">NO DATA</span></div>`;
  overlaySummaryText.textContent = detailState.summary || meta.narrative;
  renderOverlayFlow(layerKey);
}

function openLayerOverlay(layerKey) {
  state.overlayLayer = layerKey;
  layerOverlay.hidden = false;
  renderOverlay(layerKey);
}

function closeLayerOverlay() {
  state.overlayLayer = null;
  state.overlayPackets.forEach((packet) => packet.el.remove());
  state.overlayPackets = [];
  layerOverlay.hidden = true;
  setHoverLayer(null);
  setFocus("overall");
  renderCluster();
}

function stopDemo() {
  if (state.demoTimer) {
    window.clearInterval(state.demoTimer);
    state.demoTimer = null;
  }
}

function startDemo() {
  stopDemo();
  state.mode = "demo";
  let index = state.stepIndex || 0;
  renderLayerFlow(buildDemoFlowState());
  renderLayerNarratives(buildDemoNarrativeState());
  applyStep(demoSequence[index]);
  state.demoTimer = window.setInterval(() => {
    index = (index + 1) % demoSequence.length;
    applyStep(demoSequence[index]);
  }, 2600);
}

function resetView() {
  state.rotateX = 62;
  state.rotateZ = -22;
  state.scale = 0.92;
  state.offsetX = 0;
  state.offsetY = 0;
  updateFitScale();
  state.autoScale = 1;
  renderCluster();
  scheduleClusterFit();
  setFocus("overall");
  setHoverLayer(null);
  if (state.mode === "demo") startDemo();
}

function renderList(target, items, placeholder) {
  if (!items.length) {
    target.innerHTML = `<div class="runtime-item"><div class="item-body">${placeholder}</div></div>`;
    return;
  }

  target.innerHTML = items.map((item) => `
    <div class="runtime-item">
      <div class="item-top">
        <span>${escapeHtml(item.type || item.role || "EVENT")}</span>
        <span>${escapeHtml(item.ts || item.time || item.timestamp || "--:--")}</span>
      </div>
      <div class="item-body">${escapeHtml(item.detail || item.summary || item.content || "")}</div>
    </div>
  `).join("");
}

function renderRuntimeSnapshot() {
  const result = state.latestResult || {};
  const session = state.session || {};
  runtimeScene.textContent = result.layer2_fusion?.scene_label || "WAITING";
  runtimeAnalyzeCount.textContent = String(session.analyze_count || 0);
  runtimeMemoryCount.textContent = String(session.memory_count || session.memories?.length || 0);
  runtimeAdvice.textContent = result.proactive_preview || "OBSERVE";
}

async function fetchJson(path) {
  const response = await fetch(`${backendOrigin}${path}`);
  if (!response.ok) {
    throw new Error(`请求失败: ${path}`);
  }
  return response.json();
}

async function refreshRuntimeData() {
  try {
    const [latest, timeline] = await Promise.all([
      fetchJson("/api/mobile/latest"),
      fetchJson("/api/mobile/timeline?limit=10"),
    ]);
    if (latest?.result) {
      state.latestResult = latest.result;
      renderLayerFlow(buildLiveFlowState(latest.result));
      renderLayerNarratives(buildLiveNarrativeState(latest.result));
    }
    state.timelineItems = timeline?.items || [];
    renderList(runtimeTimeline, state.timelineItems, "等待时间线数据");
    renderRuntimeSnapshot();
  } catch (error) {
    console.warn(error);
  }
}

function buildLiveStepMap(data) {
  const l1 = data.layer1_perception || {};
  const l2 = data.layer2_fusion || {};
  const l3 = data.layer3_cognition || {};
  const l4 = data.layer4_decision || {};
  const l5 = data.layer5_orchestration || {};
  const l6 = data.layer6_execution || {};
  const memory = data.memory_update || {};
  const firstNeed = ensureList(l4.identified_needs)[0];
  const firstTask = ensureList(l5.scheduled_tasks)[0];
  const firstCommand = ensureList(l6.device_commands)[0];

  return {
    capture: {
      key: "capture",
      label: "输入捕获",
      status: "LIVE INPUT RECEIVED",
      text: `已收到新的图像输入${l1.time_context ? `，时段 ${l1.time_context}` : ""}${l1.scene_type ? `，场景类型 ${l1.scene_type}` : ""}。`,
      layer: null,
      line: 0,
    },
    perception: {
      key: "perception",
      label: "感知层解析",
      status: "LOW-LEVEL SIGNAL PARSED",
      text: `视觉描述：${shortText(l1.visual || "未明确", 36)}；音频：${shortText(l1.audio || "无", 18)}；传感：${shortText(l1.sensors || "无", 18)}。`,
      layer: "perception",
      line: 0,
    },
    fusion: {
      key: "fusion",
      label: "场景汇流",
      status: "SCENE STRUCTURE FORMED",
      text: `融合场景：${l2.scene_label || "未知"}；主信号：${l2.dominant_signal || "未提供"}；情境概括：${shortText(l2.context_summary || "无", 24)}。`,
      layer: "fusion",
      line: 1,
    },
    cognition: {
      key: "cognition",
      label: "认知推断",
      status: "INTENTION MODELING ACTIVE",
      text: `用户活动：${l3.user_activity || "未知"}；情绪：${l3.user_emotion || "未知"}；Belief/Desire/Intention 已生成。`,
      layer: "cognition",
      line: 2,
    },
    decision: {
      key: "decision",
      label: "阈值选择",
      status: l4.should_intervene ? "INTERVENTION APPROVED" : "OBSERVATION ONLY",
      text: `${firstNeed ? `需求：${firstNeed.description || firstNeed.type}。` : ""}${l4.intervention_reason ? `原因：${l4.intervention_reason}。` : ""}${l4.task_plan ? `计划：${shortText(l4.task_plan, 26)}` : ""}`,
      layer: "decision",
      line: 3,
    },
    orchestration: {
      key: "orchestration",
      label: "路径编排",
      status: "ROUTING GENERATED",
      text: `${firstTask ? `任务：${firstTask.task || firstTask.task_id} -> ${firstTask.device || "device"}。` : "暂无调度任务。"}策略：${l5.execution_strategy || "none"}；冲突：${shortText(l5.conflict_notes || "无", 18)}。`,
      layer: "orchestration",
      line: 4,
    },
    execution: {
      key: "execution",
      label: "执行反馈",
      status: firstCommand ? "COMMAND OUTBOUND" : "VOICE / FEEDBACK ONLY",
      text: `${firstCommand ? `命令：${firstCommand.device_id}:${firstCommand.action}。` : ""}${l6.voice_response ? `语音：${shortText(l6.voice_response, 22)}。` : ""}${l6.execution_feedback ? `反馈：${shortText(l6.execution_feedback, 24)}` : ""}`,
      layer: "execution",
      line: 4,
    },
    writeback: {
      key: "writeback",
      label: "写回更新",
      status: memory.should_record ? "MEMORY UPDATE WRITTEN" : "PROFILE / PREVIEW UPDATED",
      text: `${memory.event_summary ? `事件：${shortText(memory.event_summary, 22)}。` : ""}${memory.profile_hint ? `画像：${shortText(memory.profile_hint, 18)}。` : ""}${data.proactive_preview ? `预告：${shortText(data.proactive_preview, 18)}。` : ""}`,
      layer: null,
      line: 4,
    },
  };
}

function playLiveSequence(data) {
  stopDemo();
  state.mode = "live";
  renderLayerFlow(buildLiveFlowState(data));
  renderLayerNarratives(buildLiveNarrativeState(data));
  const steps = buildLiveStepMap(data);
  const ordered = STEP_ORDER.map((key) => steps[key]);
  let index = 0;
  applyStep(ordered[index]);
  state.demoTimer = window.setInterval(() => {
    index += 1;
    if (index >= ordered.length) {
      stopDemo();
      return;
    }
    applyStep(ordered[index]);
  }, 1250);
}

function startPing() {
  stopPing();
  state.pingTimer = window.setInterval(() => {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      state.ws.send(JSON.stringify({ type: "ping" }));
    }
  }, 20000);
}

function stopPing() {
  if (state.pingTimer) {
    window.clearInterval(state.pingTimer);
    state.pingTimer = null;
  }
}

function scheduleReconnect() {
  if (state.reconnectTimer) return;
  const delay = Math.min(15000, 1200 * Math.pow(1.5, state.reconnectCount));
  state.reconnectTimer = window.setTimeout(() => {
    state.reconnectTimer = null;
    state.reconnectCount += 1;
    connectLive(true);
  }, delay);
}

function pushLogItem(type, detail) {
  const item = {
    type,
    ts: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    detail,
  };
  state.logItems = [...state.logItems.slice(-11), item];
  renderList(runtimeLog, state.logItems, "等待事件日志");
}

function handleLiveMessage(message) {
  switch (message.type) {
    case "session_init":
      state.session = message.data || {};
      pushLogItem("system", "Live 会话已建立");
      renderRuntimeSnapshot();
      refreshRuntimeData();
      break;
    case "analyzing":
      stopDemo();
      state.mode = "live";
      pushLogItem("analyze", `开始第 ${message.count || "-"} 次分析`);
      applyStep({
        key: "capture",
        label: "输入捕获",
        status: `ANALYZE #${message.count || "-"}`,
        text: `后端已收到新的分析请求，时间 ${message.ts || "--:--:--"}。`,
        layer: null,
        line: 0,
      });
      break;
    case "result":
      state.latestResult = message.data || null;
      state.session = message.session || state.session;
      state.logItems = message.log || state.logItems;
      renderList(runtimeLog, state.logItems.slice(-12), "等待事件日志");
      renderRuntimeSnapshot();
      refreshRuntimeData();
      if (message.data) {
        playLiveSequence(message.data);
      }
      break;
    case "chat_response":
      pushLogItem("chat", `返回回复：${message.response || ""}`);
      refreshRuntimeData();
      break;
    case "error":
      pushLogItem("error", message.message || "未知错误");
      break;
    case "reminder_due":
      pushLogItem("reminder", message.message || "提醒触发");
      refreshRuntimeData();
      break;
    default:
      break;
  }
}

function connectLive(isReconnect = false) {
  backendOriginText.textContent = `${backendOrigin} /ws`;
  if (!isReconnect) {
    state.reconnectCount = 0;
  }

  try {
    const socket = new WebSocket(`${wsOrigin}/ws`);
    socket.onopen = () => {
      state.ws = socket;
      state.mode = "live";
      setConnectionState(true, "LIVE CONNECTED");
      connectLiveBtn.textContent = "已连接";
      pushLogItem("system", "WebSocket 已连接");
      startPing();
      refreshRuntimeData();
    };

    socket.onmessage = (event) => {
      try {
        handleLiveMessage(JSON.parse(event.data));
      } catch (error) {
        console.error(error);
      }
    };

    socket.onclose = () => {
      state.ws = null;
      stopPing();
      setConnectionState(false, "CONNECTION LOST");
      connectLiveBtn.textContent = "重新连接";
      pushLogItem("system", "连接已断开，等待重连");
      scheduleReconnect();
    };

    socket.onerror = () => {
      setConnectionState(false, "CONNECTION ERROR");
    };
  } catch (error) {
    console.error(error);
    setConnectionState(false, "CONNECT FAILED");
  }
}

async function toggleCamera() {
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach((track) => track.stop());
    state.cameraStream = null;
    cameraShell.classList.remove("show");
    cameraBtn.textContent = "打开摄像头";
    return;
  }

  try {
    state.cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    cameraVideo.srcObject = state.cameraStream;
    cameraShell.classList.add("show");
    cameraBtn.textContent = "关闭摄像头";
  } catch (error) {
    pushLogItem("error", `摄像头失败: ${error.message}`);
  }
}

function analyzeCurrentFrame() {
  if (!state.cameraStream || !cameraVideo.videoWidth) {
    pushLogItem("error", "请先打开摄像头并等待画面就绪");
    return;
  }

  if (!state.ws || state.ws.readyState !== WebSocket.OPEN) {
    pushLogItem("error", "请先连接 Live");
    connectLive();
    return;
  }

  cameraCanvas.width = cameraVideo.videoWidth;
  cameraCanvas.height = cameraVideo.videoHeight;
  const context = cameraCanvas.getContext("2d");
  context.drawImage(cameraVideo, 0, 0);
  const imageBase64 = cameraCanvas.toDataURL("image/jpeg", 0.9);

  state.ws.send(JSON.stringify({
    type: "analyze",
    image_base64: imageBase64,
    text: promptInput.value.trim(),
    sensors: {},
  }));
}

viewport.addEventListener("pointerdown", (event) => {
  if (event.target.closest(".survey-layer")) return;
  state.dragging = true;
  state.dragPointer = event.pointerId;
  state.lastX = event.clientX;
  state.lastY = event.clientY;
  viewport.classList.add("dragging");
  viewport.setPointerCapture(event.pointerId);
});

viewport.addEventListener("pointermove", (event) => {
  if (!state.dragging || event.pointerId !== state.dragPointer) return;
  const dx = event.clientX - state.lastX;
  const dy = event.clientY - state.lastY;
  state.lastX = event.clientX;
  state.lastY = event.clientY;

  state.rotateZ = clamp(state.rotateZ + dx * 0.08, -44, -8);
  state.rotateX = clamp(state.rotateX - dy * 0.08, 56, 82);
  renderCluster();
});

function stopDrag(event) {
  if (state.dragPointer !== null && event.pointerId !== state.dragPointer) return;
  state.dragPointer = null;
  state.dragging = false;
  viewport.classList.remove("dragging");
}

viewport.addEventListener("pointerup", stopDrag);
viewport.addEventListener("pointercancel", stopDrag);

viewport.addEventListener("wheel", (event) => {
  event.preventDefault();
  state.scale = clamp(state.scale - event.deltaY * 0.0007, 0.56, 1.42);
  renderCluster();
}, { passive: false });

viewport.addEventListener("dblclick", (event) => {
  if (event.target.closest(".survey-layer")) return;
  resetView();
});

layers.forEach((layer) => {
  layer.addEventListener("pointerenter", () => {
    if (state.overlayLayer) return;
    setHoverLayer(layer.dataset.layer);
  });
  layer.addEventListener("pointerleave", () => {
    if (state.overlayLayer) return;
    setHoverLayer(null);
  });
  layer.addEventListener("click", () => {
    const key = layer.dataset.layer;
    state.scale = Math.max(state.scale, 1.02);
    renderCluster();
    openLayerOverlay(key);
  });
});

storySteps.forEach((button, index) => {
  button.addEventListener("click", () => {
    stopDemo();
    if (state.latestResult) {
      renderLayerFlow(buildLiveFlowState(state.latestResult));
      const liveSteps = buildLiveStepMap(state.latestResult);
      applyStep(liveSteps[STEP_ORDER[index]]);
      return;
    }
    renderLayerFlow(buildDemoFlowState());
    applyStep(demoSequence[index]);
  });
});

connectLiveBtn.addEventListener("click", () => connectLive());
cameraBtn.addEventListener("click", toggleCamera);
analyzeBtn.addEventListener("click", analyzeCurrentFrame);
resetViewBtn.addEventListener("click", resetView);
overlayCloseBtn.addEventListener("click", closeLayerOverlay);
overlayFullscreenBtn.addEventListener("click", () => {
  closeLayerOverlay();
});

pulseBtn.addEventListener("click", () => {
  state.pulseEnabled = !state.pulseEnabled;
  pulseBtn.textContent = state.pulseEnabled ? "切换脉冲" : "恢复脉冲";
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.overlayLayer) {
    closeLayerOverlay();
  }
});
layerOverlay.addEventListener("click", (event) => {
  if (event.target === layerOverlay || event.target.classList.contains("overlay-grid") || event.target.classList.contains("overlay-stage")) {
    closeLayerOverlay();
  }
});

backendOriginText.textContent = `${backendOrigin} /ws`;
resizeCanvas();
renderCluster();
scheduleClusterFit();
renderDetails("overall");
renderRuntimeSnapshot();
renderList(runtimeLog, [], "等待事件日志");
renderList(runtimeTimeline, [], "等待时间线数据");
setConnectionState(false, "DEMO MODE");
startDemo();
window.requestAnimationFrame(animate);
