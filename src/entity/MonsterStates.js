import { DIRECTION_CONVERSION } from "../constants/constants";

export const MONSTER_CONTROL_STATES = {
  NEUTRAL: "NEUTRAL",
  CONTROLLING: "CONTROLLING",
  CONTROLLED: "CONTROLLED"
};

export const MONSTER_STATES = {
  WALK: "WALK",
  ATTACK: "ATTACK",
  IDLE: "IDLE",
  HIT: "HIT"

};

export class MonsterStates {
  constructor() {}

  /**
   * @this Monster
   */
  hitEnter() {
    this.createNewSnapshot(MONSTER_STATES.HIT);

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
  hitUpdate() {
    if(this.direction !== this.openSnapshot.direction) {
      this.closeSnapshot();
      this.createNewSnapshot(MONSTER_STATES.HIT);
    }
  }

  /**
   * @this Monster
   */
  hitExit() {
    this.closeSnapshot(MONSTER_STATES.HIT);
  }

  /**
   * @this Monster
   */
  attackEnter() {
    this.createNewSnapshot(MONSTER_STATES.WALK);
    let convertedDir = DIRECTION_CONVERSION[this.direction];
    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
        `${this.templateName}-attack-` +
        convertedDir,
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
  attackUpdate() {
    if(this.direction !== this.openSnapshot.direction) {
      this.closeSnapshot();
      this.createNewSnapshot(MONSTER_STATES.ATTACK);
    }
  }

  /**
   * @this Monster
   */
  attackExit() {
    this.closeSnapshot(MONSTER_STATES.ATTACK);
  }

  /**
   * @this Monster
   */
  walkEnter() {
    this.createNewSnapshot(MONSTER_STATES.WALK);
  }

  /**
   * @this Monster
   */
  walkUpdate() {
    if(this.direction !== this.openSnapshot.direction) {
      this.closeSnapshot();
      this.createNewSnapshot(MONSTER_STATES.WALK);
    }
    this.animationPlayer("walk");
  }

  /**
   * @this Monster
   */
  walkExit() {
    this.closeSnapshot(MONSTER_STATES.WALK);
  }


  /**
   * @this Monster
   */
  idleEnter() {
    this.createNewSnapshot(MONSTER_STATES.IDLE);
  }
  /**
   * @this Monster
   */
  idleUpdate() {
    if(this.direction !== this.openSnapshot.direction) {
      this.closeSnapshot();
      this.createNewSnapshot(MONSTER_STATES.IDLE);
    }
    this.animationPlayer("idle");
  }

  /**
   * @this Monster
   */
  idleExit() {
    this.closeSnapshot(MONSTER_STATES.IDLE);
  }
}
