var toggleLoadingIndicator = function(show) {
  show = !!show;
  var loaderEls = document.querySelectorAll(".js-loading-indicator");
  for (var i = 0; i < loaderEls.length; i++) {
    if (loaderEls[i].style.display === "none" || show)
      loaderEls[i].style.display = "block";
    else
      loaderEls[i].style.display = "none";
  }
};

var init = function() {
  document.querySelector(".js-intro").style.display = "none";
  toggleLoadingIndicator(true);
  setTimeout(function() {
    init3D();
  }, 100);
};

var init3D = function() {
  var getMousePos = function(canvas, e) {
    var rect = canvas.getBoundingClientRect();

    var
      x = e.clientX,//x = e.movementX || e.webkitMovementX || e.clientX,
      y = e.clientY;//e.movementY || e.webkitMovementY || e.clientY;

    //console.log("%d;%d", x, y);
    return {
      x: x - rect.left,
      y: y - rect.top
    };
  };

  window.mousePos = { x: null, y: null };
  window.factor = { x: null, y: null };
  window.stars = [];

  var cameraOpts = {
    angle: 45,
    aspect: constants.SCENE_SIZE.width / constants.SCENE_SIZE.height,
    near: 0.1,
    far: 10000,
    position: {
      x: constants.GAME_AREA_SIZE.width,//780,//0,
      y: -1500,//-1500,
      z: 1130//930//800
    },
    rotation: {
      x: 1.25234,
      y: 0,//-0.02890,
      z: 0
    }
  };

  var renderer = new THREE.WebGLRenderer({ antialias: true });

  window.camera = new THREE.PerspectiveCamera(
    cameraOpts.angle,
    cameraOpts.aspect,
    cameraOpts.near,
    cameraOpts.far
  );
  camera.position.x = cameraOpts.position.x;
  camera.position.y = cameraOpts.position.y;
  camera.position.z = cameraOpts.position.z;
  camera.rotation.x = cameraOpts.rotation.x;
  camera.rotation.y = cameraOpts.rotation.y;
  camera.rotation.z = cameraOpts.rotation.z;

  window.scene = new THREE.Scene();
  scene.add(camera);

  renderer.setSize(constants.SCENE_SIZE.width, constants.SCENE_SIZE.height);
  renderer.setClearColor(0xD0D0D0, 1);

  /**
   * DEBUG START
   */
  //var
    //planeW = 30, // pixels
    //planeH = 30, // pixels 
    //numW = 30, // how many wide (50*50 = 2500 pixels wide)
    //numH = 30; // how many tall (50*50 = 2500 pixels tall)
  //window.plane = new THREE.Mesh(
    //new THREE.PlaneGeometry(planeW*50, planeH*50, planeW, planeH),
    //new THREE.MeshBasicMaterial({ color: 0x000000, wireframe: true })
  //);
  //plane.position.y = plane.geometry.height/2;
  //scene.add(plane);
  window.axisHelper = new THREE.AxisHelper(constants.GAME_AREA_SIZE.width);
  scene.add(axisHelper);

  var dir = new THREE.Vector3( 1, 0, 0 );
  var origin = new THREE.Vector3( 0, 0, 0 );
  var length = 1;
  var hex = 0xffff00;

  var arrowHelper = new THREE.ArrowHelper( dir, origin, length, hex );
  scene.add( arrowHelper );

  window.gridXZ = new THREE.GridHelper(constants.GAME_AREA_SIZE.width, 30);
  gridXZ.position.set(
    constants.GAME_AREA_SIZE.width,
    0,
    constants.GAME_AREA_SIZE.width
  );
  //scene.add(gridXZ);

  window.gridXY = new THREE.GridHelper(constants.GAME_AREA_SIZE.width, 30);
  gridXY.position.set(
    constants.GAME_AREA_SIZE.width,
    constants.GAME_AREA_SIZE.width,
    0
  );
  gridXY.rotation.x = Math.PI/2;
  //scene.add(gridXY);

  window.gridYZ = new THREE.GridHelper(constants.GAME_AREA_SIZE.width, 30);
  gridYZ.position.set(
    0,
    constants.GAME_AREA_SIZE.width,
    constants.GAME_AREA_SIZE.width
  );
  gridYZ.rotation.z = Math.PI/2;
  //scene.add(gridYZ);

  window.gridXZ_2 = new THREE.GridHelper(constants.GAME_AREA_SIZE.width, 1);
  gridXZ_2.position.set(
    constants.GAME_AREA_SIZE.width,
    constants.MAX_RANDOM_POS.y,
    constants.GAME_AREA_SIZE.width
  );
  //scene.add(gridXZ_2);
  /**
   * DEBUG END
   */

  document.body.appendChild(renderer.domElement);

  var
    handleGeometry = new THREE.CubeGeometry(
      constants.SCENE_SIZE.width * 0.2,
      (constants.SCENE_SIZE.width*0.2) * 0.32,
      (constants.SCENE_SIZE.width*0.2) * 0.32
    ),
    playerHandleMaterial = new THREE.MeshLambertMaterial({
      color: 0x00FF00
    });
    opponentPlayerHandleMaterial = new THREE.MeshLambertMaterial({
      color: 0xFF0000
    });

  window.playerHandle = new THREE.Mesh(
    handleGeometry,
    playerHandleMaterial
  );
  window.opponentPlayerHandle = new THREE.Mesh(
    handleGeometry,
    opponentPlayerHandleMaterial
  );
  playerHandle.position.x = constants.GAME_AREA_SIZE.width;
  playerHandle.position.y = 0;
  playerHandle.position.z = playerHandle.geometry.height/2;
  opponentPlayerHandle.position.x = constants.GAME_AREA_SIZE.width;
  opponentPlayerHandle.position.y = constants.MAX_RANDOM_POS.y;
  opponentPlayerHandle.position.z = opponentPlayerHandle.geometry.height/2;
  scene.add(playerHandle);
  scene.add(opponentPlayerHandle);

  var
    ballGeometry = new THREE.SphereGeometry(handleGeometry.width/5 / 2),
    ballMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFFFFF
    });
  window.ball = new THREE.Mesh(
    ballGeometry,
    ballMaterial
  );
  ball.position.x = playerHandle.position.x;
  ball.position.y = playerHandle.position.y;
  ball.position.y = playerHandle.position.y + playerHandle.geometry.depth;
  ball.targetPos = {
    x: utils.getRandomPosX(),
    y: opponentPlayerHandle.position.y,
    z: opponentPlayerHandle.position.z
  };
  scene.add(ball);

  var pointLight = new THREE.PointLight(0xFFFFFF);
  pointLight.position.x = 10;
  pointLight.position.y = 50;
  pointLight.position.z = 300;
  scene.add(pointLight);

  var
    randomPos = {
      x: utils.getRandomPosX(),
      y: opponentPlayerHandle.position.y,
      z: opponentPlayerHandle.position.z
    };


  //camera.position.set(
    //-900,
    //-1500,
    //870
  //);
  //camera.rotation.set(
    //1.2200270748300115,
    //-0.2925643469971401,
    //0
  //);

  /*****************************************************************************************************************
   * RENDER
   *****************************************************************************************************************/
  console.log('randomPos: ', randomPos);
  var render = function() {
    //playerHandle.position.z -= 0.5;
    //playerHandle.position.x = 0;
    //playerHandle.position.y = sceneHeight - playerHandle.height;

    //console.log('randomPos: ', randomPos);
    ball.position.x += (ball.targetPos.x / 100);
    ball.position.y += (ball.targetPos.y / 100);
    if (ball.position.x <= ball.geometry.radius || ball.position.x >= constants.MAX_RANDOM_POS.x) {
      ball.targetPos.x *= -1;
    }
    if (ball.position.y <= ball.geometry.radius) {
      if (ball.position.x >= playerHandle.position.x-playerHandle.geometry.width/2 && ball.position.x <= playerHandle.position.x+playerHandle.geometry.width/2) {
        console.log('playerHandle collision');
      } else {
        console.log('player LOSES');
        stopAndContinue();
      }

      ball.targetPos.y *= -1;
    }

    if (ball.position.y >= constants.MAX_RANDOM_POS.y) {
      if (ball.position.x >= opponentPlayerHandle.position.x-opponentPlayerHandle.geometry.width/2 && ball.position.x <= opponentPlayerHandle.position.x+opponentPlayerHandle.geometry.width/2) {
        console.log('opponentPlayerHandle collision');
      } else {
        console.log('opponent LOSES');
        stopAndContinue();
      }

      ball.targetPos.y *= -1;
    }

    pointLight.position.x = 10 + 100*factor.x;//mousePos.x;
    pointLight.position.y = 50 + 100*factor.y;//mousePos.y;

    //camera.position.x = camera.position.x * factor.x;
    //camera.position.y = constants.SCENE_SIZE.width/2 - mousePos.y;
    //camera.position.z += factor.y/80;//= cameraOpts.position.z - 400*factor.x;

    camera.rotation.x += 0.01;
    camera.rotation.x += factor.y/50;
    camera.rotation.y += factor.x/50;
    camera.rotation.y = 0.3 * factor.x;

    renderer.render(scene, camera);
  };
  /**************************************/

  document.addEventListener("mousemove", function(e) {
    mousePos = getMousePos(e.target, e);
    factor = {
      x: (0.5 - mousePos.x / constants.SCENE_SIZE.width) / 0.5,
      y: (0.5 - mousePos.y / constants.SCENE_SIZE.height) / 0.5
    };

    //console.log("%d;%d | %f;%f", mousePos.x, mousePos.y, factor.x, factor.y);
  }, false);

  //document.addEventListener("mousewheel", function(e) {
    //e.preventDefault();
    //camera.position.z += e.wheelDelta / 10;
  //}, false);

  document.addEventListener("keydown", function(e) {
    switch (e.keyCode) {
      case 87:  // W
        e.preventDefault();
        camera.position.y += 10;
        break;
      case 83:  // S
        e.preventDefault();
        camera.position.y -= 10;
        break;
      case 65:  // A
        e.preventDefault();
        camera.position.x -= 20;
        break;
      case 68:  // D
        e.preventDefault();
        camera.position.x += 20;
        break;
      case 37:  // left arrow
        e.preventDefault();
        playerHandle.position.x -= 50;
        break;
      case 39:  // right arrow
        e.preventDefault();
        playerHandle.position.x += 50;
        break;
    }
  }, false);

  //document.addEventListener("resize", function(e) {
    //constants.SCENE_SIZE.width = window.innerWidth;
    //constants.SCENE_SIZE.height = window.innerHeight;

    //scene.setSize(constants.SCENE_SIZE.width, constants.SCENE_SIZE.height);

    //renderer.setSize(constants.SCENE_SIZE.width, constants.SCENE_SIZE.height);

    //renderer.domElement.width = constants.SCENE_SIZE.width;
    //renderer.domElement.height = constants.SCENE_SIZE.height;
  //}, false);

  toggleLoadingIndicator(false);

  //document.body.requestPointerLock = document.body.requestPointerLock    ||
                                     //document.body.mozRequestPointerLock ||
                                     //document.body.webkitRequestPointerLock;
  //document.body.requestPointerLock();

  // render loop
  var anim = null;
  var start = function() {
    (function animLoop(){
      anim = requestAnimationFrame(animLoop);
      render();
    })();
  };
  start();

  var stop = function() {
    renderer.render(scene, camera);
    cancelAnimationFrame(anim);
  };

  var stopAndContinue = function() {
    stop();

    setTimeout(function() {
      start();
    }, 1000);
  };
};


var constants = {};
constants.SCENE_SIZE = {
  width: window.innerWidth,
  height: window.innerHeight
};
constants.GAME_AREA_SIZE = {
  width: constants.SCENE_SIZE.width * 0.8,
  height: constants.SCENE_SIZE.height * 0.8
};
constants.MAX_RANDOM_POS = {
  x: constants.GAME_AREA_SIZE.width * 1.5,
  y: constants.GAME_AREA_SIZE.height * 2
};

var utils = {
  degToRad: function(deg) {
    return deg * (180/Math.PI);
  },

  radToDeg: function(rad) {
    return rad * (180/Math.PI);
  },

  getRandomPosX: function() {
    return Math.random() * constants.MAX_RANDOM_POS.x;
  },

  getReversedPos: function(currentPos) {
    return currentPos * -1;
  }
};
