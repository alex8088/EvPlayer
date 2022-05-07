import videojs from 'video.js'

class Keyboard {
  private player: videojs.Player
  private repeat = 0
  static timer

  constructor(player: videojs.Player) {
    this.player = player
  }

  /**
   * Bind dom hotkeys
   */
  bind(): void {
    document.addEventListener('keydown', (e) => this.onKeydown(e))
    document.addEventListener('keyup', () => () => {
      this.repeat = 0
    })
  }

  private onKeydown(event: KeyboardEvent): void {
    const e = event || window.event
    const keyCode = e.keyCode
    if (
      e.target === document.body &&
      (keyCode === 37 ||
        keyCode === 38 ||
        keyCode === 39 ||
        keyCode === 40 ||
        keyCode === 32 ||
        keyCode === 70 ||
        keyCode === 77 ||
        keyCode === 122)
    ) {
      e.preventDefault()
      e.cancelBubble = true
      e.returnValue = false
      if (e.repeat) {
        if (this.repeat % 2 === 0) {
          Keyboard.handlerKeyCode(this.player, keyCode)
        }
        this.repeat++
      } else {
        Keyboard.handlerKeyCode(this.player, keyCode)
      }
      return
    }
  }

  static handlerKeyCode(player: videojs.Player, keyCode: number): void {
    if (!player?.hasStarted() || player?.seeking()) {
      return
    }
    switch (keyCode) {
      case 39:
        this.seek(player, false)
        break
      case 37:
        this.seek(player, true)
        break
      case 38:
        this.volume(player, false)
        break
      case 40:
        this.volume(player, true)
        break
      case 32:
        player.paused() ? player.play() : player.pause()
        break
      case 70:
      case 122:
        setTimeout(() => {
          player.isFullscreen() ? player.exitFullscreen() : player.requestFullscreen()
        }, 10)
        break
      case 77:
        player.userActive(true)
        player.muted(!player.muted())
        break
      default:
      //
    }
  }

  static seek(player: videojs.Player, isBack: boolean): void {
    player.userActive(true)
    const seekStep = 5
    const currentTime = player.currentTime()
    if (isBack) {
      if (currentTime - seekStep >= 0) {
        player.currentTime(currentTime - seekStep)
      } else {
        player.currentTime(0)
      }
    } else {
      if (currentTime + seekStep < player.duration()) {
        player.currentTime(currentTime + seekStep)
      } else {
        player.currentTime(player.duration() + 1)
      }
    }
  }

  static volume(player: videojs.Player, isDown: boolean): void {
    player.userActive(true)
    if (this.timer) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      player.$('.vjs-volume-panel')?.classList.remove('vjs-hover')
    }, 1000)
    player.$('.vjs-volume-panel')?.classList.add('vjs-hover')
    const volumeStep = 0.1
    const volume = player.volume()
    if (isDown) {
      if (volume - volumeStep >= 0) {
        player.volume(volume - volumeStep)
      } else {
        player.volume(0)
      }
    } else {
      if (volume + volumeStep < 1) {
        player.volume(volume + volumeStep)
      } else {
        player.volume(1)
      }
    }
  }
}

export default Keyboard
