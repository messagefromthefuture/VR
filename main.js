import * as THREE from '../../libs/three.js-r132/build/three.module.js';
import { ARButton } from '../../libs/three.js-r132/examples/jsm/webxr/ARButton.js';
import { RGBELoader } from '../../libs/three.js-r132/examples/jsm/loaders/RGBELoader.js';
import { loadGLTF } from './libs/loader.js';

document.addEventListener('DOMContentLoaded', () => {
  const initialize = async () => {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    // Enhanced lighting setup
    const ambientLight = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.5);
    scene.add(ambientLight);

    // Strong directional light for better reflections
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(1, 2, 1).normalize();
    scene.add(directionalLight);

    // Load HDR environment
    const loadHDR = async () => {
      const hdrLoader = new RGBELoader();
      try {
        const texture = await hdrLoader.loadAsync('../../assets/hdr/studio.hdr');
        texture.mapping = THREE.EquirectangularReflectionMapping;
        scene.environment = texture;
        scene.background = null;
        scene.environmentIntensity = 2.0;
        console.log('HDR loaded successfully!');
      } catch (error) {
        console.error('Error loading HDR:', error);
      }
    };
    await loadHDR();

    // Reticle setup
    const reticleGeometry = new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2);
    const reticleMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const reticle = new THREE.Mesh(reticleGeometry, reticleMaterial);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // AR Button
    const arButton = ARButton.createButton(renderer, {
      requiredFeatures: ['hit-test'],
      optionalFeatures: ['dom-overlay'],
      domOverlay: { root: document.body }
    });
    document.body.appendChild(renderer.domElement);
    document.body.appendChild(arButton);

    // Allowed numbers (as strings for accurate comparison)
    const allowedNumbers = ["7 8 12 6 5 127 3 10 8"];

    // Distance UI setup
    const distanceUI = document.createElement('div');
    distanceUI.id = 'distance-ui';
    distanceUI.style.position = 'fixed';
    distanceUI.style.top = '10px';
    distanceUI.style.visibility = "hidden";
    distanceUI.style.left = '10px';
    distanceUI.style.background = 'rgba(0, 0, 0, 0.7)';
    distanceUI.style.color = 'white';
    distanceUI.style.padding = '10px';
    distanceUI.style.borderRadius = '5px';
    distanceUI.style.fontFamily = 'Arial, sans-serif';
    distanceUI.style.zIndex = '999';
    distanceUI.innerHTML = 'Distance: Calculating...';
    document.body.appendChild(distanceUI);

    const title = document.getElementById("heading");

    const textInput = document.createElement('input');
    textInput.type = 'text';
    textInput.id = 'text-input';
    textInput.style.position = 'fixed';
    textInput.style.top = '12%';
    textInput.style.left = '50%';
    textInput.style.transform = 'translateX(-50%)';
    textInput.style.visibility = 'hidden';
    textInput.style.padding = '10px';
    textInput.style.background = 'rgba(0, 0, 0, 0.8)';
    textInput.style.color = '#15F4EE';
    textInput.style.border = '2px solid #15F4EE';
    textInput.style.borderRadius = '10px';
    textInput.style.fontSize = '20px';
    textInput.style.fontWeight = 'bold';
    textInput.style.textAlign = 'center';
    textInput.style.outline = 'none';
    textInput.style.boxShadow = '0px 0px 15px rgba(21, 244, 238, 0.8)';
    textInput.style.width = '80%';
    textInput.style.maxWidth = '400px';
    textInput.style.fontFamily = "'MyCustomFont', MoreSugar-Regular"; 
    document.body.appendChild(textInput);

    const instructionText = document.createElement('div');
    instructionText.id = 'instruction-text';
    instructionText.textContent = 'Enter the code to open the box';
    instructionText.style.position = 'fixed';
    instructionText.style.top = '8%';
    instructionText.style.left = '50%';
    instructionText.style.transform = 'translateX(-50%)';
    instructionText.style.visibility = 'hidden';
    instructionText.style.color = '#15F4EE';
    instructionText.style.fontSize = '18px';
    instructionText.style.fontWeight = 'bold';
    instructionText.style.textAlign = 'center';
    instructionText.style.textShadow = '0 0 5px rgba(21, 244, 238, 0.8)';
    instructionText.style.marginBottom = '20px';
    instructionText.style.width = '100%';
    instructionText.style.fontFamily = "'MyCustomFont', MoreSugar-Regular"; 
    document.body.appendChild(instructionText);

    // Particle system setup
    const createParticles = () => {
      const particleCount = 200;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 1;
        positions[i * 3 + 1] = Math.random() * 1;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 1;
      }
    
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
      const createCircleTexture = () => {
        const size = 64;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const ctx = canvas.getContext('2d');
    
        const gradient = ctx.createRadialGradient(
          size / 2, size / 2, 0,
          size / 2, size / 2, size / 2
        );
        gradient.addColorStop(0, 'rgba(21, 244, 238, 1)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
    
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
        ctx.fill();
    
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
      };
    
      const texture = createCircleTexture();
    
      const material = new THREE.PointsMaterial({
        size: 0.03,
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: 0.9,
        blending: THREE.AdditiveBlending
      });
    
      const particles = new THREE.Points(geometry, material);
      particles.visible = false;
      return particles;
    };
    
    const particles = createParticles();
    scene.add(particles);

    // Fireworks system
    class Firework {
      constructor(position, color) {
        this.color = color || new THREE.Color(
          Math.random() * 0.5 + 0.5,
          Math.random() * 0.5 + 0.5,
          Math.random() * 0.5 + 0.5
        );
        
        this.particleCount = 300;
        this.particles = new THREE.BufferGeometry();
        this.particlePositions = new Float32Array(this.particleCount * 3);
        this.particleSizes = new Float32Array(this.particleCount);
        this.particleColors = new Float32Array(this.particleCount * 3);
        
        // Create particle texture
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = 32;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(0.2, `rgba(${this.color.r * 255},${this.color.g * 255},${this.color.b * 255},1)`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        this.texture = new THREE.CanvasTexture(canvas);
        
        // Initial position
        this.position = position.clone();
        this.velocity = new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          Math.random() * 0.02 + 0.02,
          (Math.random() - 0.5) * 0.02
        );
        
        // Initialize particles
        for (let i = 0; i < this.particleCount; i++) {
          this.particlePositions[i * 3] = this.position.x;
          this.particlePositions[i * 3 + 1] = this.position.y;
          this.particlePositions[i * 3 + 2] = this.position.z;
          this.particleSizes[i] = Math.random() * 0.2 + 0.1;
        }
        
        this.particles.setAttribute('position', new THREE.BufferAttribute(this.particlePositions, 3));
        this.particles.setAttribute('size', new THREE.BufferAttribute(this.particleSizes, 1));
        
        this.particleMaterial = new THREE.PointsMaterial({
          size: 0.05,
          map: this.texture,
          transparent: true,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          color: this.color
        });
        
        this.points = new THREE.Points(this.particles, this.particleMaterial);
        scene.add(this.points);
        
        this.lifetime = 0;
        this.maxLifetime = 100 + Math.random() * 50;
        this.exploded = false;
      }
      
      update() {
        if (!this.exploded) {
          // Rising phase
          this.position.add(this.velocity);
          
          // Random chance to explode
          if (this.position.y > 1 + Math.random() || this.lifetime > this.maxLifetime * 0.7) {
            this.explode();
          } else {
            // Update all particles to follow the rising firework
            for (let i = 0; i < this.particleCount; i++) {
              this.particlePositions[i * 3] = this.position.x;
              this.particlePositions[i * 3 + 1] = this.position.y;
              this.particlePositions[i * 3 + 2] = this.position.z;
            }
            this.particles.attributes.position.needsUpdate = true;
          }
        } else {
          // Exploded phase - particles disperse
          for (let i = 0; i < this.particleCount; i++) {
            this.particlePositions[i * 3] += (Math.random() - 0.5) * 0.05;
            this.particlePositions[i * 3 + 1] += (Math.random() - 0.5) * 0.05;
            this.particlePositions[i * 3 + 2] += (Math.random() - 0.5) * 0.05;
            
            // Gravity effect
            this.particlePositions[i * 3 + 1] -= 0.005;
            
            // Fade out
            this.particleSizes[i] *= 0.98;
          }
          this.particles.attributes.position.needsUpdate = true;
          this.particles.attributes.size.needsUpdate = true;
        }
        
        this.lifetime++;
        
        // Remove if all particles are too small or lifetime exceeded
        if (this.lifetime > this.maxLifetime || 
            (this.exploded && this.particleSizes[0] < 0.01)) {
          scene.remove(this.points);
          return false; // Mark for removal
        }
        
        return true;
      }
      
      explode() {
        this.exploded = true;
        
        // Create explosion pattern
        for (let i = 0; i < this.particleCount; i++) {
          // Random direction from center
          const angle1 = Math.random() * Math.PI * 2;
          const angle2 = Math.random() * Math.PI;
          const speed = Math.random() * 0.1 + 0.05;
          
          this.particlePositions[i * 3] += Math.cos(angle1) * Math.sin(angle2) * speed;
          this.particlePositions[i * 3 + 1] += Math.cos(angle2) * speed;
          this.particlePositions[i * 3 + 2] += Math.sin(angle1) * Math.sin(angle2) * speed;
        }
        
        // Play explosion sound
        this.playExplosionSound();
      }
      
      playExplosionSound() {
        const sounds = [
          '../../assets/audio/firework_01.mp3',
          '../../assets/audio/firework_01.mp3',
          '../../assets/audio/firework_01.mp3'
        ];
        
        const sound = new Audio(sounds[Math.floor(Math.random() * sounds.length)]);
        sound.volume = 0.3;
        sound.play().catch(e => console.log("Audio play failed:", e));
      }
    }

    // Fireworks controller
    class FireworksController {
      constructor() {
        this.fireworks = [];
        this.isActive = false;
      }
      
      update() {
        // Only update if fireworks are active
        if (!this.isActive) return;
        
        // Remove finished fireworks
        this.fireworks = this.fireworks.filter(firework => firework.update());
        
        // Add new fireworks periodically when active
        if (this.isActive && Math.random() < 0.03) {
          this.addFirework();
        }
      }
      
      addFirework() {
        if (!chestClone) return;
        
        // Position fireworks around the chest
        const angle = Math.random() * Math.PI * 2;
        const distance = 1.5 + Math.random() * 1.5;
        const x = chestClone.position.x + Math.cos(angle) * 0.5;
        const z = chestClone.position.z + Math.sin(angle) * 0.5;
        const y = chestClone.position.y - 0.5;
        
        const position = new THREE.Vector3(x, y, z);
        
        // Random color or specific color scheme
        let color;
        if (Math.random() > 0.7) {
          // Special colorful firework
          color = new THREE.Color().setHSL(Math.random(), 1, 0.7);
        } else {
          // Theme color (cyan/gold)
          color = new THREE.Color(Math.random() > 0.5 ? 0x15F4EE : 0xFFD700);
        }
        
        this.fireworks.push(new Firework(position, color));
      }
      
      start() {
        this.isActive = true;
        this.burst(10); // Initial burst when starting
      }
      
      stop() {
        this.isActive = false;
      }
      
      burst(count = 10) {
        if (!chestClone) return;
        
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * 2;
          const x = chestClone.position.x + Math.cos(angle) * distance;
          const z = chestClone.position.z + Math.sin(angle) * distance;
          const y = chestClone.position.y + Math.random() * 1.5;
          
          const position = new THREE.Vector3(x, y, z);
          const color = new THREE.Color().setHSL(i / count, 1, 0.7);
          
          const firework = new Firework(position, color);
          firework.explode(); // Explode immediately
          this.fireworks.push(firework);
        }
      }
    }

    const fireworksController = new FireworksController();

    // Load GLTF Models
    let chestModel, secondModel, mixer;
    let chestClone, secondClone;
    let modelPlaced = false;
    let chestAnimationClip;
    let chestAnimationAction;

    try {
      chestModel = await loadGLTF('../../assets/models/chest.glb');
      secondModel = await loadGLTF('../../assets/models/Place_Object.glb');
      
      if (chestModel.animations && chestModel.animations.length > 0) {
        chestAnimationClip = chestModel.animations[0];
        console.log('Chest animation loaded:', chestAnimationClip.name);
      }
    } catch (error) {
      console.error('Error loading models:', error);
    }

    const applyHDRToChest = (chest) => {
      chest.traverse((child) => {
        if (child.isMesh && child.material) {
          if (!child.material.isMeshStandardMaterial && !child.material.isMeshPhysicalMaterial) {
            child.material = new THREE.MeshStandardMaterial({
              map: child.material.map,
              color: child.material.color,
              roughness: 0.2,
              metalness: 0.9,
              envMapIntensity: 2.0
            });
          }
          child.material.envMap = scene.environment;
          child.material.needsUpdate = true;
        }
      });
    };

    // Load audio
    const chestOpenSound = new Audio('../../assets/audio/chest_open_2.mp3'); 
    chestOpenSound.preload = 'auto'; 
    chestOpenSound.volume = 1.0;

    const rewardSound = new Audio('../../assets/audio/celebration.mp3');
    rewardSound.preload = 'auto';
    rewardSound.volume = 1.0;

    const victorySound = new Audio('../../assets/audio/victory_3.mp3');
    victorySound.preload = 'auto';
    victorySound.volume = 1.0;

    const playChestAnimation = () => {
      if (!chestClone || !chestAnimationClip) return;
      
      if (!mixer) {
        mixer = new THREE.AnimationMixer(chestClone);
      }
      
      if (chestAnimationAction) {
        chestAnimationAction.stop();
      }
      
      chestAnimationAction = mixer.clipAction(chestAnimationClip);
      chestAnimationAction.setLoop(THREE.LoopOnce);
      chestAnimationAction.clampWhenFinished = true;
      chestAnimationAction.play();

      setTimeout(() => {
        mixer.timeScale = 0;
      }, 5000);

      chestOpenSound.currentTime = 0;
      chestOpenSound.play();
      
      console.log('Playing chest animation');

      setTimeout(() => {
        popRewardOutOfChest();
      }, 4000);

      setTimeout(() => {
        showRewardEffect();
      }, 7000);

      setTimeout(() => {
        //victorySound.currentTime = 0;
        //victorySound.play();
        document.getElementById('endScreen').style.display = 'flex';
      }, 19000);
    };

    const showRewardEffect = () => {
      if (!chestClone) return;
    
      rewardSound.currentTime = 0;
      rewardSound.play();
      
      // Start fireworks celebration
      fireworksController.start();
      
      // Stop fireworks after 15 seconds
      /* setTimeout(() => {
        fireworksController.stop();
      }, 15000); */

      victorySound.play();
    };

    const popRewardOutOfChest = () => {
      if (!chestClone) return;

      // Create a coin geometry
      var texture = new THREE.TextureLoader().load('../../assets/textures/aztec.jpg');
      
      const coinGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.05, 100);
      
      // Create proper silver material
      const coinMaterial = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        map: texture,
        metalness: 0.98,
        roughness: 0.05,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        envMap: scene.environment,
        envMapIntensity: 3.0,
        ior: 0.2,
        transmission: 0,
        specularIntensity: 1.0,
        displacementMap: texture,
        displacementScale: 0.01,
      });
      
      // Create the coin mesh
      const coin = new THREE.Mesh(coinGeometry, coinMaterial);
      coin.rotation.x = Math.PI / 2;
      coin.scale.set(0.5, 0.5, 0.5);
      coin.position.copy(chestClone.position);
      coin.position.y += 0.4;
      scene.add(coin);

      let startTime = null;
      const duration = 2000;

      const animateReward = (timestamp) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / duration, 1);

        coin.position.y = chestClone.position.y + 0.4 + progress * 0.8;
        coin.rotation.z += 0.05;

        if (progress < 1) {
          requestAnimationFrame(animateReward);
        } else {
          const spinCoin = () => {
            coin.rotation.z += 0.05;
            requestAnimationFrame(spinCoin);
          };
          spinCoin();
        }
      };

      requestAnimationFrame(animateReward);
    };

    let distanceCheckActive = true;

    const updateDistance = () => {
      if (!distanceCheckActive || !chestClone) return;
      if (chestClone) {
        const chestPosition = chestClone.position;
        const cameraPosition = camera.position;
        const distance = chestPosition.distanceTo(cameraPosition);
        distanceUI.innerHTML = `Distance: ${distance.toFixed(2)} meters`;

        if (distance < 2.5) {
          textInput.style.visibility = 'visible';
          instructionText.style.visibility = 'visible';
          textInput.focus();
          particles.position.copy(chestClone.position);
          particles.visible = true;
        }
      }
    };

    textInput.addEventListener('input', () => {
      const raw = textInput.value.replace(/\D/g, '');
      const numberGroupLengths = [1, 1, 2, 1, 1, 3, 1, 2, 1];
      let formatted = '';
      let index = 0;
    
      for (let i = 0; i < numberGroupLengths.length; i++) {
        const len = numberGroupLengths[i];
        const nextChunk = raw.slice(index, index + len);
        if (!nextChunk) break;
        formatted += nextChunk + ' ';
        index += len;
      }
    
      formatted = formatted.trim();
      textInput.value = formatted;
      textInput.setSelectionRange(textInput.value.length, textInput.value.length);
    
      if (formatted.split(' ').length === numberGroupLengths.length) {
        if (allowedNumbers.includes(formatted)) {
          console.log(`✅ Valid input: ${formatted}`);
          playChestAnimation();
          distanceCheckActive = false;
          textInput.style.visibility = 'hidden';
          instructionText.style.visibility = 'hidden';
          textInput.value = '';
        } else {
          console.log(`❌ Invalid input: ${formatted}`);
          textInput.style.borderColor = 'red';
          setTimeout(() => {
            textInput.style.borderColor = '#15F4EE';
          }, 500);
        }
      }
    });

    const placeModels = (position) => {
      if (!modelPlaced && chestModel && secondModel) {
        chestClone = chestModel.scene.clone();
        chestClone.position.set(0, -1.5, 2.8);
        chestClone.scale.set(0.7, 0.7, -0.7);
        applyHDRToChest(chestClone);
        scene.add(chestClone);

        secondClone = secondModel.scene.clone();
        secondClone.position.set(0, 0.7, -2);
        secondClone.scale.set(0.17, 0.17, 0.17);
        scene.add(secondClone);

        modelPlaced = true;
        reticle.visible = false;
      }
    };

    renderer.xr.addEventListener('sessionstart', async () => {
      const session = renderer.xr.getSession();
      const viewerReferenceSpace = await session.requestReferenceSpace('viewer');
      const hitTestSource = await session.requestHitTestSource({ space: viewerReferenceSpace });
      
      let lastFrameTime = 0;
      
      renderer.setAnimationLoop((timestamp, frame) => {
        if (!frame) return;

        const deltaTime = (timestamp - lastFrameTime) / 1000;
        lastFrameTime = timestamp;

        // Update fireworks (they won't do anything unless active)
        fireworksController.update();

        if (!modelPlaced) {
          const hitTestResults = frame.getHitTestResults(hitTestSource);

          if (hitTestResults.length) {
            const hit = hitTestResults[0];
            const referenceSpace = renderer.xr.getReferenceSpace();
            const hitPose = hit.getPose(referenceSpace);

            if (hitPose) {
              reticle.visible = true;
              reticle.matrix.fromArray(hitPose.transform.matrix);
              const position = new THREE.Vector3();
              position.setFromMatrixPosition(reticle.matrix);
              placeModels(position);
            }
          } else {
            reticle.visible = false;
          }
        }

        updateDistance();

        if (mixer) {
          mixer.update(deltaTime);
        }

        if (particles.visible) {
          const positions = particles.geometry.attributes.position.array;
          for (let i = 1; i < positions.length; i += 3) {
            positions[i] += 0.005;
            if (positions[i] > 1) positions[i] = 0;
          }
          particles.geometry.attributes.position.needsUpdate = true;
        }

        renderer.render(scene, camera);
      });
    });

    renderer.xr.addEventListener('sessionend', () => {
      console.log('Session ended');
    });

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });
  };

  initialize();
});