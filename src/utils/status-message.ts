import { deleteMessageDiscord } from "../discord/send.js";
import { logVerbose } from "../globals.js";
import { deleteSlackMessage } from "../slack/actions.js";
import { deleteMessageTelegram } from "../telegram/send.js";

export async function deleteStatusMessage(
  channel: string,
  to: string,
  messageId: string,
): Promise<boolean> {
  try {
    // Best-effort: not all channels support deleting messages.
    if (channel === "telegram") {
      await deleteMessageTelegram(to, messageId, { verbose: false });
      logVerbose(`[status-message] Deleted telegram message ${messageId} (${to})`);
      return true;
    }
    if (channel === "discord") {
      await deleteMessageDiscord(to, messageId);
      logVerbose(`[status-message] Deleted discord message ${messageId} (${to})`);
      return true;
    }
    if (channel === "slack") {
      await deleteSlackMessage(to, messageId);
      logVerbose(`[status-message] Deleted slack message ${messageId} (${to})`);
      return true;
    }
    logVerbose(`[status-message] Delete unsupported for channel=${channel}`);
    return false;
  } catch (err) {
    logVerbose(
      `[status-message] Failed to delete messageId=${messageId} channel=${channel} to=${to}: ${String(err)}`,
    );
    return false;
  }
}
