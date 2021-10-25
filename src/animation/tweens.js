export const damageFlash = (scene, target) =>{
  scene.tweens.addCounter({
    from: 0,
    to: 100,
    duration: 200,
    onUpdate: (tween) => {
      const tweenVal = Math.floor(tween.getValue());
      if (tweenVal > 90) {
        target.clearTint();
      } else if (tweenVal % 2) {
        target.setTintFill(0xff0000);
      } else {
        target.setTintFill(0xffffff);
      }
    }
  });
}

export const deathFadeout = (scene, target) => {
  scene.add.tween({
    targets: [target],
    ease: 'Sine.easeInOut',
    duration: 1000,
    delay: 0,
    alpha: {
      getStart: () => 1,
      getEnd: () => 0
    },
    onComplete: () => {
      target.setVisible(false);
    }
  });
}

export const fadeIn = (scene, target) => {
  scene.add.tween({
    targets: [target],
    ease: 'Sine.easeInOut',
    duration: 1000,
    delay: 0,
    alpha: {
      getStart: () => 0,
      getEnd: () => 1
    },
    onComplete: () => {
      target.setVisible(true);
    }
  });
}