// ============================================================
// AI 服务层 — 支持多个 AI 提供商
// ============================================================

import { AIProvider, AIConfig, DecomposeResult } from '../types';

// ---- Provider 配置 ----

const PROVIDER_DEFAULTS: Record<AIProvider, { name: string; models: string[]; defaultModel: string; endpoint: string; free: boolean }> = {
  gemini: {
    name: 'Google Gemini (免费)',
    models: ['gemini-2.5-flash', 'gemini-2.5-pro'],
    defaultModel: 'gemini-2.5-flash',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
    free: true,
  },
  zhipu: {
    name: '智谱 GLM (免费)',
    models: ['glm-4-flash', 'glm-4-plus', 'glm-4-air'],
    defaultModel: 'glm-4-flash',
    endpoint: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
    free: true,
  },
  anthropic: {
    name: 'Anthropic Claude',
    models: ['claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-opus-4-8'],
    defaultModel: 'claude-sonnet-4-6',
    endpoint: 'https://api.anthropic.com/v1/messages',
    free: false,
  },
  custom: {
    name: '自定义端点',
    models: [],
    defaultModel: '',
    endpoint: '',
    free: false,
  },
};

// ---- 获取默认配置 ----

export function getProviderDefaults(provider: AIProvider) {
  return PROVIDER_DEFAULTS[provider];
}

// ---- AI 任务拆解 Prompt ----

function buildDecomposePrompt(input: string): string {
  return `你是一个任务拆解专家。请将用户输入的模糊任务拆解为 3-5 个清晰、可执行的子步骤。

要求：
1. 每个子步骤必须具体、可操作
2. 按逻辑顺序排列（先规划后执行）
3. 使用中文回复
4. 以 JSON 格式输出，格式为：
{
  "subtasks": ["步骤1", "步骤2", "步骤3", ...],
  "reasoning": "拆解逻辑说明（一句话）"
}

用户任务：${input}

只输出 JSON，不要包含其他内容。`;
}

// ---- 解析 AI 响应 ----

function parseAIResponse(text: string, input: string): DecomposeResult {
  // 尝试提取 JSON
  let json: { subtasks?: string[]; reasoning?: string } = {};

  // 尝试匹配 ```json ... ``` 代码块
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = codeBlock ? codeBlock[1].trim() : text.trim();

  try {
    json = JSON.parse(candidate);
  } catch {
    // 尝试找到第一个 { 到最后一个 }
    const objMatch = candidate.match(/\{[\s\S]*\}/);
    if (objMatch) {
      try {
        json = JSON.parse(objMatch[0]);
      } catch {
        // 解析失败，尝试按行提取
      }
    }
  }

  // 如果 JSON 解析失败，尝试按数字序号行提取
  if (!json.subtasks || json.subtasks.length === 0) {
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => /^\d+[.、)\s]/.test(l))
      .map((l) => l.replace(/^\d+[.、)\s]+/, '').trim())
      .filter(Boolean);

    if (lines.length >= 2) {
      return {
        original: input,
        subtasks: lines.slice(0, 5),
        reasoning: json.reasoning || 'AI 自动拆解（按序号提取）',
      };
    }

    // 完全失败，返回原文
    return {
      original: input,
      subtasks: [text.trim().slice(0, 200)],
      reasoning: 'AI 响应格式异常，已保留原始输出',
    };
  }

  return {
    original: input,
    subtasks: json.subtasks.slice(0, 5).map((s, i) => {
      // 如果子任务没有序号，自动添加
      return /^\d+[.、)]/.test(s) ? s : `${i + 1}. ${s}`;
    }),
    reasoning: json.reasoning || 'AI 自动拆解',
  };
}

// ---- Gemini API 调用 ----

async function callGemini(config: AIConfig, input: string): Promise<DecomposeResult> {
  const model = config.model || PROVIDER_DEFAULTS.gemini.defaultModel;
  const url = `${PROVIDER_DEFAULTS.gemini.endpoint}/${model}:generateContent?key=${config.apiKey}`;

  const body = {
    contents: [
      {
        parts: [{ text: buildDecomposePrompt(input) }],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    const msg = (err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`;
    throw new Error(`Gemini API 错误: ${msg}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  if (!text) throw new Error('Gemini 返回了空响应');

  return parseAIResponse(text, input);
}

// ---- Anthropic API 调用 ----

async function callAnthropic(config: AIConfig, input: string): Promise<DecomposeResult> {
  const model = config.model || PROVIDER_DEFAULTS.anthropic.defaultModel;
  const url = config.customEndpoint || PROVIDER_DEFAULTS.anthropic.endpoint;

  const body = {
    model,
    max_tokens: 1024,
    temperature: 0.7,
    system: '你是一个任务拆解专家。请用中文回复，并且只输出 JSON。',
    messages: [
      {
        role: 'user',
        content: buildDecomposePrompt(input),
      },
    ],
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    const msg = (err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`;
    throw new Error(`Claude API 错误: ${msg}`);
  }

  const data = (await res.json()) as {
    content?: { type: string; text?: string }[];
  };

  const text = data.content?.map((c) => c.text || '').join('') || '';
  if (!text) throw new Error('Claude 返回了空响应');

  return parseAIResponse(text, input);
}

// ---- 智谱 GLM API 调用（OpenAI 兼容）----

async function callZhipu(config: AIConfig, input: string): Promise<DecomposeResult> {
  const model = config.model || PROVIDER_DEFAULTS.zhipu.defaultModel;
  const url = PROVIDER_DEFAULTS.zhipu.endpoint;

  const body = {
    model,
    messages: [
      { role: 'system', content: '你是一个任务拆解专家。请用中文回复，并且只输出 JSON。' },
      { role: 'user', content: buildDecomposePrompt(input) },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    const msg = (err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`;
    throw new Error(`智谱 GLM API 错误: ${msg}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const text = data.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('智谱 GLM 返回了空响应');

  return parseAIResponse(text, input);
}

// ---- Custom OpenAI 兼容 API 调用 ----

async function callCustom(config: AIConfig, input: string): Promise<DecomposeResult> {
  if (!config.customEndpoint) throw new Error('请先配置自定义 API 端点');

  const body = {
    model: config.model || 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: '你是一个任务拆解专家。请用中文回复，并且只输出 JSON。' },
      { role: 'user', content: buildDecomposePrompt(input) },
    ],
    max_tokens: 1024,
    temperature: 0.7,
  };

  const res = await fetch(config.customEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    const msg = (err as { error?: { message?: string } }).error?.message || `HTTP ${res.status}`;
    throw new Error(`自定义 API 错误: ${msg}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };

  const text = data.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('自定义 API 返回了空响应');

  return parseAIResponse(text, input);
}

// ---- 主入口 ----

export async function decomposeWithAI(config: AIConfig, input: string): Promise<DecomposeResult> {
  if (!config.apiKey) throw new Error('请先配置 API Key');
  if (!input.trim()) throw new Error('请输入任务描述');

  switch (config.provider) {
    case 'gemini':
      return callGemini(config, input);
    case 'zhipu':
      return callZhipu(config, input);
    case 'anthropic':
      return callAnthropic(config, input);
    case 'custom':
      return callCustom(config, input);
    default:
      throw new Error(`不支持的 AI 提供商: ${config.provider}`);
  }
}

// ---- 获取免费 API Key 帮助信息 ----

export function getFreeAPIHelp(provider: AIProvider): string {
  switch (provider) {
    case 'gemini':
      return '访问 https://aistudio.google.com/apikey 免费获取 Gemini API Key（无需信用卡，15 RPM 免费额度）';
    case 'zhipu':
      return '访问 https://open.bigmodel.cn/ 注册智谱 AI，免费获取 API Key（glm-4-flash 免费）';
    case 'anthropic':
      return '访问 https://console.anthropic.com/ 获取 Claude API Key（需要付费）';
    case 'custom':
      return '输入任意兼容 OpenAI 格式的 API 端点和 Key';
  }
}
