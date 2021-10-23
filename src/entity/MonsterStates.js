import { DIRECTION_CONVERSION } from "../constants/constants";

export const MONSTER_CONTROL_STATES = {
  NEUTRAL: "NEUTRAL",
  CONTROLLING: "CONTROLLING",
  CONTROLLED: "CONTROLLED",
}

export const MONSTER_STATES = {
  WALK: "WALK",
  ATTACK: "ATTACK",
  IDLE: "IDLE",
  HIT: "HIT",
};

export class MonsterStates {
  constructor() {}

  /**
   * @this Monster
   */
  hitEnter() {
    console.log('hit start');
    // this.animationPlayer("hit");
    // let convertedDir = DIRECTION_CONVERSION[this.direction];
    // const flash = (animation, frame) => {
      // if (frame.index === 3) {
        this.scene.tweens.addCounter({
          from: 0,
          to: 100,
          duration: 200,
          onUpdate: (tween) => {
            const tweenVal = tween.getValue();
            if (tweenVal % 2) {
              this.setTintFill(0xffffff);
            } else {
              this.clearTint();
            }
          }
        });
      // }
    // };
    // flash();
    // this.on(Phaser.Animations.Events.ANIMATION_UPDATE, flash);
    // this.once(
    //   Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + `${this.templateName}-hit-` + convertedDir,
    //   () => {
    //     this.clearTint();
    //     this.off(Phaser.Animations.Events.ANIMATION_UPDATE, flash);
    //     console.log(this.aggroZone.hasTarget());
    //     if(this.controlStateMachine.isCurrentState(MONSTER_CONTROL_STATES.CONTROLLED)) {
    //       console.log('hit end');
    //       this.animationComplete = true;
    //     }
    //     this.stateMachine.setState(this.stateMachine.previousStateName);
    //   }
    // );
  }


  /**
   * @this Monster
   */
  attackEnter() {
    let convertedDir = DIRECTION_CONVERSION[this.direction];
    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
      `${this.templateName}-attack-` + convertedDir,
      () => {
        this.stateMachine.setState(MONSTER_STATES.IDLE);
        this.instant = false;
      }
    );
    this.animationPlayer("attack");
  }

  /**
   * @this Monster
   */
  walkUpdate() {
    this.animationPlayer("walk");
  }

  /**
   * @this Monster
   */
  idleUpdate() {
    this.animationPlayer("idle");
  }


}
