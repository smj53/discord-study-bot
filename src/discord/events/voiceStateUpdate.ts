import { Events, VoiceState } from "discord.js";
import Study from "../../study/index.js";
import { loungeChannelId } from "../../utils/index.js";

const name = Events.VoiceStateUpdate;

async function listener(oldState: VoiceState, newState: VoiceState) {
  // Voice 채널 입장
  if (
    (!oldState.channelId || oldState.channelId === loungeChannelId) &&
    newState.channelId &&
    newState.channelId !== loungeChannelId
  ) {
    await Study.start(newState.id);
  }

  // Voice 채널 퇴장
  else if (
    oldState.channelId &&
    oldState.channelId !== loungeChannelId &&
    (!newState.channelId || newState.channelId === loungeChannelId)
  ) {
    await Study.end(newState.id);
  }
}

export { name, listener };
