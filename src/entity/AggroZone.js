import { screenToMap } from "../util/conversion";
import {eventEmitter} from '../event/EventEmitter';

export class AggroZone extends Phaser.GameObjects.Zone {
  constructor(scene, x, y, width, height, owner) {
    super(scene, x, y, width, height);
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.owner = owner; //the entity this aggro zone belongs to
    this.target = undefined;
    this.scene.physics.add.existing(this);
    this.targetLastKnownX = undefined;
    this.targetLastKnownY = undefined;
  }

  expandAggroZone() {
    this.width = 300;
    this.height = 300;
    this.body.width = 300;
    this.body.height = 300;
  }

  setAggroTarget(target) {
    if(this.target !== target) {
      this.expandAggroZone();
      this.target = target;
      eventEmitter.emit('monsterAggroedPlayer', {
        monsterId: this.id,
        playerCharacterId: target.id
      });
    }
  }

  shrinkAggroZone() {
    this.width = 100;
    this.height = 100;
    this.x = this.owner.x; //- 100;
    this.y = this.owner.y; //- 100;
    this.body.width = 100;
    this.body.height = 100; //300;
  }

  //make the aggro zone follow it's owner
  shadowOwner() {
    if (!this.target) {
      this.x = this.owner.x;
      this.y = this.owner.y;
    } else {
      this.x = this.owner.x - 100;
      this.y = this.owner.y - 100;
    }
  }

  resetAggro() {
    this.shrinkAggroZone();
    this.targetLastKnownX = undefined;
    this.targetLastKnownY = undefined;
    this.target = undefined;
  }

  hasTarget() {
    return this.target !== undefined;
  }

  checkZone() {
    const zoneStatus = {
      isTargetInZone: false,
      isNextToTarget: false,
      targetHasMoved: false,
      targetX: false,
      targetY: false,
    };
    if (this.target) {
      const isTargetWithinZone = this.scene.physics.overlap(this, this.target, () => {});

      //if the player is within the monsters aggro zone
      if (isTargetWithinZone) {
        zoneStatus.isTargetInZone = true; //is the player in the zone?
        zoneStatus.isNextToTarget = this.scene.physics.overlap(this.owner, this.target); //is the owner of this zone next to the target?

        //if the player and monster aren't next to each other
        if (!zoneStatus.isNextToTarget) {
          const endNode = screenToMap(this.target.x, this.target.y); //the tile the player is standing on
          zoneStatus.targetX = endNode.x;
          zoneStatus.targetY = endNode.y;
          //check if the player has moved, if so then follow them otherwise no pathing is necessary
          if (endNode.x !== this.targetLastKnownX || endNode.y !== this.targetLastKnownY) {
            this.targetLastKnownX = endNode.x;
            this.targetLastKnownY = endNode.y;
            zoneStatus.targetHasMoved = true;
          }
        }
      } else {
        //the player has left the monsters aggro zone, lets reset the monster back to it's original location
        zoneStatus.isTargetInZone = false;
        this.resetAggro();
      }
    }
    return zoneStatus;
  }
}
