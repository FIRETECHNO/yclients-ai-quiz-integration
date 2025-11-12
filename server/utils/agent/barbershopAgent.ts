// server/agents/barbershopAgent.ts
import { createReactAgent } from "langchain/agents";
import { AgentExecutor } from "langchain/agents";
import { PromptTemplate } from "@langchain/core/prompts";
import { ProxyAPIChatModel } from "../proxyapiLLM";
import { tools } from "./tools";

export class BarbershopAgent {
  private agentExecutor?: AgentExecutor;

  async init() {
    const model = new ProxyAPIChatModel();

    // // Упрощаем услуги
    // const shortServices = useServices.simplifyServicesList(this.rawServices);
    // const servicesList = shortServices.map(s => ({
    //   id: s.id,
    //   n: s.name,
    //   p: s.price,
    //   t: s.durationMinutes,
    //   m: s.staff.map((st: any) => st.name).join("|") || "любой",
    // }));
    // const servicesJson = JSON.stringify(servicesList);

    // ← ВАЖНО: полный ReAct-промпт с {tools} и {tool_names}
    const prompt = PromptTemplate.fromTemplate(`
Ты — ИИ-ассистент барбершопа "${this.companyName}".
Твоя задача — отвечать ТОЛЬКО в формате ReAct (Thought → Action → Observation).

ДОСТУПНЫЕ ИНСТРУМЕНТЫ:
{tools}

ИМЕНА ИНСТРУМЕНТОВ:
{tool_names}

ПРАВИЛА:
1. Всегда используй инструмент, если нужно найти услугу или слот.
2. Если не знаешь — используй инструмент.
3. Отвечай ТОЛЬКО в формате:
   Thought: ...
   Action: tool_name
   Action Input: JSON

{agent_scratchpad}

Вопрос: {input}

Thought:`.trim());

    const agent = await createReactAgent({
      llm: model,
      tools,
      prompt,
    });

    this.agentExecutor = new AgentExecutor({
      agent,
      tools,
      verbose: false,
      handleParsingErrors: true,
    });
  }

  constructor(
    private companyName: string,
    private rawServices: any[]
  ) { }

  async ask(message: string, history: any[] = []) {
    if (!this.agentExecutor) {
      throw new Error("Agent not initialized. Call init() first.");
    }

    return await this.agentExecutor.invoke({
      input: message,
    });
  }
}