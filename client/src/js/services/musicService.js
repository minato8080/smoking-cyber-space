/**
 * 音楽サービスモジュール
 *
 * このモジュールは、YouTubeプレーヤーを使用して音楽を再生する機能を提供します。
 * ユーザーが音楽を選択し、再生、停止、次の曲に進むことができます。
 *
 * @module musicService
 */

import { radio, state } from "../models/gameObjects";
import { isSmartPhone } from "../config/gameConfig";
import { startButton, selectButton } from "../config/elementConfig";

let ytPlayer;

/**
 * YouTubeプレーヤーが準備完了したときに呼び出される関数
 * @param {Object} _event - イベントオブジェクト
 */
function onYouTubePlayerReady(_event) {
  console.log("player ready");
  // TODO: スマホでインライン再生は不可
  if (isSmartPhone) {
    ytPlayer.playsinline = 0;
  }
}

/**
 * YouTubeプレーヤーの状態が変化したときに呼び出される関数
 * @param {Object} event - 状態変化イベント
 */
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.ENDED) {
    radio.nextNumber += 1;
    if (radio.playList.length === radio.nextNumber) {
      radio.nextNumber = 0;
    }
    ytPlayer.loadVideoById({ videoId: radio.playList[radio.nextNumber] });
    ytPlayer.playVideo();
    radio.msg = "Next No." + (radio.nextNumber + 1);
  }
  if (event.data == YT.PlayerState.BUFFERING) {
    radio.msg = "LOADING..";
  }
  if (event.data == YT.PlayerState.CUED) {
    radio.msg = "READY";
  }
  if (event.data == YT.PlayerState.PLAYING) {
    radio.msg = "♪♪♪♪♪♪";
    radio.isPlaying = true;
  }
  if (event.data == YT.PlayerState.PAUSED) {
    radio.msg = "PAUSED";
  }
}

/**
 * YouTubeプレーヤーを作成する関数
 * @param {number} count - 試行回数
 */
export async function createYouTubePlayer(count) {
  if (YT && count > 0) {
    if (!YT.loaded) {
      console.log("YouTube Player API is still loading.  Retrying...");
      setTimeout(() => createYouTubePlayer(count - 1), 1000);
    } else {
      ytPlayer = new YT.Player("youtubePlayer", {
        height: "0",
        width: "0",
        playsinline: 1,
        origin: window.location.origin,
        enablejsapi: 1,
        events: {
          onReady: onYouTubePlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
      console.log("iframe api ready");
      return true;
    }
  } else {
    console.log("iframe was unsuccessful");
    return false;
  }
}

/**
 * 音楽を初期化する関数
 */
export async function initializeMusic() {
  await createYouTubePlayer(10);
  if (!ytPlayer) return;

  startButton.click(function () {
    if (radio.playList.length === 0) return;

    if (!state.isYtPlayerLoadVideoById) {
      radio.nextNumber = (radio.nextNumber + 1) % radio.playList.length;
      ytPlayer.loadVideoById({ videoId: radio.playList[radio.nextNumber] });
      state.isYtPlayerLoadVideoById = true;
    } else if (!isSmartPhone() && radio.isPlaying) {
      ytPlayer.pauseVideo();
    } else {
      ytPlayer.playVideo();
    }
    return;
  });

  selectButton.click(function () {
    if (radio.playList.length === 0) return;

    radio.nextNumber += 1;

    if (radio.playList.length < radio.nextNumber) radio.nextNumber = 0;
    ytPlayer.loadVideoById({ videoId: radio.playList[radio.nextNumber] });
    radio.msg = "Next No." + (radio.nextNumber + 1);
    return;
  });
}
