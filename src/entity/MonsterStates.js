import {DIRECTION_CONVERSION, EAST, NORTH, SOUTH, WEST} from '../constants/constants';

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
        if(tweenVal === 100) {
          this.clearTint();
        }
        if (tweenVal % 2) {
          this.setTintFill(0xFF0000);
        } else {
          this.setTintFill(0xffffff);
        }
      }
    });
    // this.instant = true;
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
  hitUpdate(time, delta) {
    // if(!this.instant) {
      this.stateMachine.setState(this.stateMachine.previousStateName);
    // }
    this.updateSnapshot(time, MONSTER_STATES.HIT);
  }

  /**
   * @this Monster
   */
  hitExit() {
    this.closeSnapshot(MONSTER_STATES.HIT);
    this.instant = false;
  }



  /**
   * @this Monster
   */
  attackEnter() {
    this.createNewSnapshot(MONSTER_STATES.ATTACK);
    this.dealDamage();
    this.animationPlayer("attack");
  }
  // /**
  //  * @this Monster
  //  */
  // attackEnter() {
  //   this.createNewSnapshot(MONSTER_STATES.WALK);
  //   let convertedDir = DIRECTION_CONVERSION[this.direction];
  //   this.once(
  //     Phaser.Animations.Events.ANIMATION_COMPLETE_KEY +
  //       `${this.templateName}-attack-` +
  //       convertedDir,
  //     () => {
  //       // this.stateMachine.setState(MONSTER_STATES.IDLE);
  //     }
  //   );
  //   this.animationPlayer("attack");
  // }

  /**
   * @this Monster
   */
  attackUpdate(time, delta) {
    if(!this.anims.isPlaying) {
      this.animationPlayer("attack");
      this.dealDamage();
    }

    // this.updateSnapshot(time, MONSTER_STATES.ATTACK);
  }

  /**
   * @this Monster
   */
  attackExit() {
    this.meleeHitbox.body.enable = false;
    this.scene.physics.world.remove(this.meleeHitbox.body);
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
  walkUpdate(time, delta) {
    this.updateSnapshot(time, MONSTER_STATES.WALK);
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
    // this.createNewSnapshot(MONSTER_STATES.IDLE);
  }
  /**
   * @this Monster
   */
  idleUpdate(time, delta) {
    // this.updateSnapshot(time, MONSTER_STATES.IDLE);
    this.animationPlayer("idle");
  }

  /**
   * @this Monster
   */
  idleExit() {
    // this.closeSnapshot(MONSTER_STATES.IDLE);
  }
}
