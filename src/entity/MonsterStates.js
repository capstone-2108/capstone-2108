import { DIRECTION_CONVERSION } from "../constants/constants";

export const MONSTER_STATES = {
  NEUTRAL: "NEUTRAL",
  CONTROLLING: "CONTROLLING",
  CONTROLLED: "CONTROLLED",
  CONTROLLING_WALK: "CONTROLLING_WALK",
  CONTROLLING_ATTACK: "CONTROLLING_ATTACK",
  CONTROLLING_IDLE: "CONTROLLING_IDLE",
  CONTROLLING_HIT: "CONTROLLING_HIT",
  CONTROLLED_WALK: "CONTROLLED_WALK",
  CONTROLLED_ATTACK: "CONTROLLED_ATTACK",
  CONTROLLED_IDLE: "CONTROLLED_IDLE",
  CONTROLLED_HIT: "CONTROLLED_HIT"
};

export class MonsterStates {
  constructor() {}

  /**
   * @this Monster
   */
  hitEnter() {
    this.animationPlayer("hit");
    let convertedDir = DIRECTION_CONVERSION[this.direction];
    const flash = (animation, frame) => {
      if (frame.index === 3) {
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
      }
    };
    this.on(Phaser.Animations.Events.ANIMATION_UPDATE, flash);
    this.once(
      Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + `${this.templateName}-hit-` + convertedDir,
      () => {
        this.clearTint();
        this.off(Phaser.Animations.Events.ANIMATION_UPDATE, flash);
        console.log(this.aggroZone.hasTarget());
        this.stateMachine.setState(this.stateMachine.previousStateName);
      }
    );
  }

  /**
   * @this Monster
   */
  attackEnter() {
    // this.animationPlayer("attack"");
    // let convertedDir = DIRECTION_CONVERSION[this.direction];
    // this.once(
    //   Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + `${this.name}-attack-` + convertedDir,
    //   () => {
    //     // this.stateMachine.setState("idle");
    //   }
    // );
  }

  /**
   * @this Monster
   */
  neutralUpdate() {
    this.animationPlayer("idle");
  }

  /**
   * @this Monster
   */
  controlledAttackUpdate() {
    this.animationPlayer("attack");
  }

  /**
   * @this Monster
   */
  controlledWalkUpdate() {
    this.animationPlayer("walk");
  }

  /**
   * @this Monster
   */
  controlledHitEnter() {
    this.animationPlayer("hit");
  }

  /**
   * @this Monster
   */
  controlledIdleUpdate() {
    this.animationPlayer("idle");
  }

  /**
   * @this Monster
   */
  controllingAttackUpdate() {
    this.animationPlayer("attack");
  }

  /**
   * @this Monster
   */
  controllingWalkUpdate() {
    this.animationPlayer("walk");
  }

  /**
   * @this Monster
   */
  controllingIdleUpdate() {
    this.animationPlayer("idle");
  }

  /**
   * @this Monster
   */
  controllingHitEnter() {
    this.animationPlayer("hit");
  }
}
