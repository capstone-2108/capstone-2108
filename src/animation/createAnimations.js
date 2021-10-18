import { DIRECTION_CONVERSION, EAST, NORTH, SOUTH, WEST } from "../constants/constants";

export const createPlayerAnimation = (player) => {
  const modes = ["idle", "walk", "melee"];
  const directions = {
    [NORTH]: { start: 12, end: 15 },
    [EAST]: { start: 8, end: 11 },
    [SOUTH]: { start: 0, end: 3 },
    [WEST]: { start: 4, end: 7 }
  };

  for (const [dir, dirOptions] of Object.entries(directions)) {
    for (const mode of modes) {
      const animationName = `${player.templateName}-${mode}-${dir}`; //what to call the animation so we can refer to it later
      const atlasKey = `${player.templateName}`; //which atlas should we use
      player.anims.create({
        key: animationName,
        frameRate: 10,
        frames: player.anims.generateFrameNames(atlasKey, {
          prefix: `${atlasKey}_${mode}-`, //this will match the file name in the .json file for this atlas
          suffix: ".png",
          start: dirOptions.start,
          end: dirOptions.end
          // repeat: -1
        })
      });
    }
  }
}

export const createMonsterAnimations = (monster) => {
  const states = {
    idle: {
      frameConfigs: {
        // [NORTH]: {0, 1, 2, 1],
        [NORTH]: [
          { frame: "_idle-0", duration: 640 },
          { frame: "_idle-1", duration: 80 },
          { frame: "_idle-2", duration: 640 },
          { frame: "_idle-1", duration: 80 }
        ],
        // [EAST]: [0, 1, 2, 1],
        [EAST]: [
          { frame: "_idle-0", duration: 640 },
          { frame: "_idle-1", duration: 80 },
          { frame: "_idle-2", duration: 640 },
          { frame: "_idle-1", duration: 80 }
        ],
        [SOUTH]: [
          { frame: "_idle-0", duration: 640 },
          { frame: "_idle-1", duration: 80 },
          { frame: "_idle-2", duration: 640 },
          { frame: "_idle-1", duration: 80 }
        ],
        [WEST]: [
          { frame: "_idle-0", duration: 640 },
          { frame: "_idle-1", duration: 80 },
          { frame: "_idle-2", duration: 640 },
          { frame: "_idle-1", duration: 80 }
        ]
      },
      repeat: "yoyo"
    },
    hit: {
      frameConfigs: {
        // [NORTH]: [9, 10, 11, 10, 11, 9],
        [NORTH]: [
          { frame: "_hit-9", duration: 120 },
          { frame: "_hit-10", duration: 80 },
          { frame: "_hit-11", duration: 80 },
          { frame: "_hit-10", duration: 80 },
          { frame: "_hit-11", duration: 80 },
          { frame: "_hit-9", duration: 80 }
        ],
        // [EAST]: [6, 7, 8, 7, 8, 6],
        [EAST]: [
          { frame: "_hit-6", duration: 120 },
          { frame: "_hit-7", duration: 80 },
          { frame: "_hit-8", duration: 80 },
          { frame: "_hit-7", duration: 80 },
          { frame: "_hit-8", duration: 80 },
          { frame: "_hit-6", duration: 80 }
        ],
        // [SOUTH]: [0, 1, 2, 1, 2, 0],
        [SOUTH]: [
          { frame: "_hit-0", duration: 120 },
          { frame: "_hit-1", duration: 80 },
          { frame: "_hit-2", duration: 80 },
          { frame: "_hit-1", duration: 80 },
          { frame: "_hit-2", duration: 80 },
          { frame: "_hit-0", duration: 80 }
        ],
        // [WEST]: [3, 4, 5, 4, 5, 3]
        [WEST]: [
          { frame: "_hit-3", duration: 120 },
          { frame: "_hit-4", duration: 80 },
          { frame: "_hit-5", duration: 80 },
          { frame: "_hit-4", duration: 80 },
          { frame: "_hit-5", duration: 80 },
          { frame: "_hit-3", duration: 80 }
        ]
      }
    },
    walk: {
      frameConfigs: {
        // [NORTH]: [12, 13, 14, 15],
        [NORTH]: [
          { frame: "_walk-12", duration: 120 },
          { frame: "_walk-13", duration: 120 },
          { frame: "_walk-14", duration: 120 },
          { frame: "_walk-15", duration: 120 }
        ],
        // [EAST]: [8, 9, 10, 11],
        [EAST]: [
          { frame: "_walk-8", duration: 120 },
          { frame: "_walk-9", duration: 120 },
          { frame: "_walk-10", duration: 120 },
          { frame: "_walk-11", duration: 120 }
        ],
        // [SOUTH]: [0, 1, 2, 3],
        [SOUTH]: [
          { frame: "_walk-0", duration: 120 },
          { frame: "_walk-1", duration: 120 },
          { frame: "_walk-2", duration: 120 },
          { frame: "_walk-3", duration: 120 }
        ],
        // [WEST]: [4, 5, 6, 7]
        [WEST]: [
          { frame: "_walk-4", duration: 120 },
          { frame: "_walk-5", duration: 120 },
          { frame: "_walk-6", duration: 120 },
          { frame: "_walk-7", duration: 120 }
        ]
      }
    },
    attack: {
      frameConfigs: {
        // [NORTH]: [12, 13, 14, 15],
        [NORTH]: [
          { frame: "_attack-12", duration: 300 },
          { frame: "_attack-13", duration: 100 },
          { frame: "_attack-14", duration: 100 },
          { frame: "_attack-15", duration: 200 }
        ],
        // [EAST]: [8, 9, 10, 11],
        [EAST]: [
          { frame: "_attack-8", duration: 300 },
          { frame: "_attack-9", duration: 100 },
          { frame: "_attack-10", duration: 100 },
          { frame: "_attack-11", duration: 200 }
        ],
        // [SOUTH]: [0, 1, 2, 3],
        [SOUTH]: [
          { frame: "_attack-0", duration: 300 },
          { frame: "_attack-1", duration: 100 },
          { frame: "_attack-2", duration: 100 },
          { frame: "_attack-3", duration: 200 }
        ],
        // [WEST]: [4, 5, 6, 7]
        [WEST]: [
          { frame: "_attack-4", duration: 300 },
          { frame: "_attack-5", duration: 100 },
          { frame: "_attack-6", duration: 100 },
          { frame: "_attack-7", duration: 200 }
        ]
      }
    }
  };

  for (const [stateName, config] of Object.entries(states)) {
    for (const [direction, frameConfigs] of Object.entries(config.frameConfigs)) {
      let frameNames = [];
      for (let i = 0; i < frameConfigs.length; i++) {
        frameNames.push({
          key: monster.name,
          frame: monster.name + frameConfigs[i].frame + ".png",
          delay: frameConfigs[i].delay,
          duration: frameConfigs[i].duration
        });
      }
      const animationName = `${monster.name}-${stateName}-${direction}`; //what to call the animation so we can refer to it later
      monster.anims.create({
        key: animationName,
        frameRate: 10,
        frames: frameNames
        // repeat: frameConfigs.repeat
      });
    }
  }
}