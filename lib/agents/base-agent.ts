import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase/server";
import type {
  Member,
  Event,
  AgentMessage,
  AgentType,
  MessageChannel,
  MessageDirection,
  MessageStatus,
} from "@/lib/types";

export interface LogMessageParams {
  memberId: string | null;
  eventId: string | null;
  channel: MessageChannel;
  direction: MessageDirection;
  subject: string | null;
  content: string;
  status: MessageStatus;
  sentAt: string | null;
}

export abstract class BaseAgent {
  protected supabase = supabaseAdmin;
  protected anthropic: Anthropic;
  abstract readonly agentType: AgentType;

  constructor() {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("Missing ANTHROPIC_API_KEY environment variable.");
    }
    this.anthropic = new Anthropic({ apiKey });
  }

  protected async generateMessage(
    systemPrompt: string,
    userContext: string
  ): Promise<string> {
    try {
      const response = await this.anthropic.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: userContext }],
      });

      const block = response.content[0];
      if (block.type !== "text") {
        throw new Error("Unexpected response type from Anthropic API.");
      }
      return block.text;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`generateMessage failed: ${message}`);
    }
  }

  protected async logMessage(params: LogMessageParams): Promise<AgentMessage> {
    try {
      const { data, error } = await this.supabase
        .from("agent_messages")
        .insert({
          agent_type: this.agentType,
          member_id: params.memberId,
          event_id: params.eventId,
          channel: params.channel,
          direction: params.direction,
          subject: params.subject,
          content: params.content,
          status: params.status,
          sent_at: params.sentAt,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      if (!data) throw new Error("No data returned from agent_messages insert.");
      return data as unknown as AgentMessage;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`logMessage failed: ${message}`);
    }
  }

  protected async getMemberProfile(memberId: string): Promise<Member | null> {
    try {
      const { data, error } = await this.supabase
        .from("members")
        .select("*")
        .eq("id", memberId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
      }
      return data as unknown as Member;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`getMemberProfile failed: ${message}`);
    }
  }

  protected async getEventDetails(eventId: string): Promise<Event | null> {
    try {
      const { data, error } = await this.supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw new Error(error.message);
      }
      return data as unknown as Event;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`getEventDetails failed: ${message}`);
    }
  }
}
