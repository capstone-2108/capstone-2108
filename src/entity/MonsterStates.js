import {DIRECTION_CONVERSION} from '../constants/constants';

export const MONSTER_STATES = {
  NEUTRAL: "NEUTRAL",
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

  constructor(scene, monster) {
    this.monster = monster;
  }

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

  neutralUpdate() {
    this.monster.animationPlayer("idle");
  }

  controlledAttackUpdate() {
    this.monster.animationPlayer("attack");
  }

  controlledWalkUpdate() {
    this.monster.animationPlayer("walk");
  }

  controlledHitEnter() {
    this.monster.animationPlayer("hit");
  }

  controlledIdleUpdate() {
    this.monster.animationPlayer("idle");
  }

  controllingAttackUpdate() {
    this.monster.animationPlayer("attack");
  }

  controllingWalkUpdate() {
    this.monster.animationPlayer("walk");
  }

  controllingIdleUpdate() {
    this.monster.animationPlayer("idle");
  }

  controllingHitEnter() {
    this.monster.animationPlayer("hit");
  }
}