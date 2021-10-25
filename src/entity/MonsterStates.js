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
  // HIT: "HIT",
  DEAD: "DEAD"
};

export class MonsterStates {
  constructor() {}

  /**
   * @this Monster
   */
  attackEnter() {
    this.createNewSnapshot(MONSTER_STATES.ATTACK);
    this.dealDamage();
    this.animationPlayer("attack");
  }

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

  /**
   * @this Monster
   */
  deadEnter() {
    // this.closeSnapshot(MONSTER_STATES.IDLE);
    this.visible = false;
  }
  deadUpdate() {

  }
  deadExit() {
    this.visible = true;
  }
}
