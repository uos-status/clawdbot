type TelegramDeleteApi = {
  deleteMessage: (chatId: string, messageId: number) => Promise<unknown>;
};

const lastHourglassByTarget = new Map<string, number>();

export function isTelegramHourglassStatusText(text?: string): boolean {
  return (text ?? "").trimStart().startsWith("⏳");
}

export function buildTelegramHourglassKey(params: {
  chatId: string;
  messageThreadId?: number | null;
}): string {
  const threadPart = params.messageThreadId == null ? "" : String(params.messageThreadId);
  // Intentionally exclude accountId: the bot instance used for the next outbound
  // message is the one that must delete the prior status message.
  return `${params.chatId}|${threadPart}`;
}

export async function deletePriorTelegramHourglass(params: {
  api: TelegramDeleteApi;
  chatId: string;
  key: string;
  log?: (message: string) => void;
}): Promise<void> {
  const prior = lastHourglassByTarget.get(params.key);
  if (!prior) {
    return;
  }
  // Clear first to avoid races where a new status message arrives while we're deleting.
  lastHourglassByTarget.delete(params.key);
  try {
    params.log?.(
      `telegram outbound (src/telegram/outbound-status.ts): deleting prior ⏳ messageId=${prior} chatId=${params.chatId}`,
    );
    await params.api.deleteMessage(params.chatId, prior);
  } catch (err) {
    params.log?.(
      `telegram outbound (src/telegram/outbound-status.ts): failed deleting prior ⏳ messageId=${prior} chatId=${params.chatId}: ${String(err)}`,
    );
  }
}

export function trackTelegramHourglass(params: { key: string; messageId: number }) {
  if (!Number.isFinite(params.messageId) || params.messageId <= 0) {
    return;
  }
  lastHourglassByTarget.set(params.key, Math.trunc(params.messageId));
}

export function clearTelegramHourglass(key: string) {
  lastHourglassByTarget.delete(key);
}
