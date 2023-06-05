import { Events, VoiceState } from "discord.js";
import { loungeChannelId } from "../../utils";
import User from "../../user";

const name = Events.VoiceStateUpdate;

async function listener(oldState: VoiceState, newState: VoiceState) {
  // Voice 채널 입장
  if (
    (!oldState.channelId || oldState.channelId === loungeChannelId) &&
    newState.channelId &&
    newState.channelId !== loungeChannelId
  ) {
    // 이게 조금 거슬려서 User.startStudy(newState.id)로 시작하고
    // startStudy() 내부에서 User 객체 찾아서 시작시키는 것도...
    const user = User.findUserByDiscordId(newState.id);
    await user.startStudy();
  }

  // Voice 채널 퇴장
  else if (
    oldState.channelId &&
    oldState.channelId !== loungeChannelId &&
    (!newState.channelId || newState.channelId === loungeChannelId)
  ) {
    const user = User.findUserByDiscordId(newState.id);
    await user.endStudy();
  }
}

export { name, listener };
