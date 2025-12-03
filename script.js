// --- Configuration ---
const CONFIG = {
    camSmoothness: 0.03,
    rotationSpeed: 0.002, 
    orbitSpeedMultiplier: 0.5
};

const BODIES = [
    { 
        name: "The Sun", nameHi: "सूर्य",
        type: "Star", typeHi: "तारा",
        radius: 12, distance: 0, speed: 0, genType: 'star',
        fact: "The Sun contains 99.8% of the total mass of our entire Solar System.",
        factHi: "सूर्य में हमारे पूरे सौर मंडल का 99.8% द्रव्यमान समाहित है।"
    },
    { 
        name: "Mercury", nameHi: "बुध",
        type: "Terrestrial Planet", typeHi: "स्थलीय ग्रह",
        radius: 2, distance: 30, speed: 0.02, genType: 'mercury',
        fact: "Mercury shrinks as it cools! It has gotten about 9 miles smaller since it was born.",
        factHi: "बुध ग्रह ठंडा होने पर सिकुड़ता है! अपने जन्म के बाद से यह लगभग 9 मील छोटा हो गया है।"
    },
    { 
        name: "Venus", nameHi: "शुक्र",
        type: "Terrestrial Planet", typeHi: "स्थलीय ग्रह",
        radius: 3.5, distance: 45, speed: 0.015, genType: 'venus',
        fact: "Venus is the only planet that spins clockwise. On Venus, the sun rises in the west.",
        factHi: "शुक्र एकमात्र ऐसा ग्रह है जो घड़ी की दिशा में घूमता है। यहाँ सूर्य पश्चिम में उगता है।"
    },
    { 
        name: "Earth", nameHi: "पृथ्वी",
        type: "Terrestrial Planet", typeHi: "स्थलीय ग्रह",
        radius: 3.6, distance: 65, speed: 0.01, genType: 'earth',
        fact: "Earth is the only place in the known universe confirmed to host life.",
        factHi: "पृथ्वी ब्रह्मांड में एकमात्र ज्ञात स्थान है जहाँ जीवन है और सतह पर तरल पानी मौजूद है।"
    },
    { 
        name: "Mars", nameHi: "मंगल",
        type: "Terrestrial Planet", typeHi: "स्थलीय ग्रह",
        radius: 2.5, distance: 85, speed: 0.008, genType: 'mars',
        fact: "Mars is home to Olympus Mons, the tallest volcano in the solar system.",
        factHi: "मंगल ग्रह पर सौर मंडल का सबसे ऊंचा ज्वालामुखी, ओलंपस मॉन्स है।"
    },
    { 
        name: "Jupiter", nameHi: "बृहस्पति",
        type: "Gas Giant", typeHi: "गैस दानव",
        radius: 8, distance: 120, speed: 0.004, genType: 'jupiter',
        fact: "Jupiter is so massive that more than 1,300 Earths could fit inside it.",
        factHi: "बृहस्पति इतना विशाल है कि इसमें 1,300 से अधिक पृथ्वी समा सकती हैं।"
    },
    { 
        name: "Saturn", nameHi: "शनि",
        type: "Gas Giant", typeHi: "गैस दानव",
        radius: 7, distance: 160, speed: 0.003, genType: 'saturn', hasRings: true, 
        fact: "Saturn's rings are made mostly of ice and rock fragments.",
        factHi: "शनि के छल्ले मुख्य रूप से बर्फ और चट्टानों के टुकड़ों से बने हैं।"
    },
    { 
        name: "Uranus", nameHi: "अरुण",
        type: "Ice Giant", typeHi: "बर्फ दानव",
        radius: 5, distance: 200, speed: 0.002, genType: 'uranus',
        fact: "Uranus rotates on its side, rolling around the Sun like a ball.",
        factHi: "अरुण ग्रह अपनी तरफ झुका हुआ घूमता है, जैसे कोई गेंद लुढ़क रही हो।"
    },
    { 
        name: "Neptune", nameHi: "वरुण",
        type: "Ice Giant", typeHi: "बर्फ दानव",
        radius: 4.8, distance: 230, speed: 0.0015, genType: 'neptune',
        fact: "Neptune has the strongest winds in the solar system, reaching supersonic speeds.",
        factHi: "वरुण ग्रह पर सौर मंडल की सबसे तेज हवाएं चलती हैं, जो सुपरसोनिक गति तक पहुंचती हैं।"
    }
];

let scene, camera, renderer, starField;
let planets = []; 
let currentIndex = 0; 
let targetCameraPos;
let touchStartY = 0;
let isStarted = false;
let currentLang = 'en'; 
let touchFingerCount = 0;
const synth = window.speechSynthesis;

window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    const content = document.getElementById('start-content');

    // 1. Check for Three.js
    if (typeof THREE === 'undefined') {
        if(loader) {
            loader.innerText = "Error: Failed to load 3D Engine. Please check internet connection.";
            loader.style.color = "#ff4444";
            loader.style.animation = "none";
        }
        return;
    }

    // 2. Initialize 3D with Error Handling to prevent "forever loading"
    try {
        init3D();
        // If successful, hide loader and show start button
        if(loader) loader.style.display = 'none';
        if(content) content.style.display = 'flex';
    } catch (error) {
        console.error("3D Init Error:", error);
        if(loader) {
            loader.innerHTML = "Error initializing graphics.<br>Your device may not support WebGL.";
            loader.style.color = "#ff4444";
            loader.style.animation = "none";
        }
    }
});

// --- Helper: Fullscreen Logic ---
function attemptFullscreen() {
    const docEl = document.documentElement;
    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    
    if (requestFullScreen && !document.fullscreenElement) {
        requestFullScreen.call(docEl).catch(err => {
            console.log("Fullscreen blocked or not supported:", err);
        });
    }
}

// --- Procedural Texture Generation (Canvas API) ---
function createNoiseCanvas(width, height, type) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill Base Color
    if(type === 'star') ctx.fillStyle = '#ffaa00';
    else if(type === 'earth') ctx.fillStyle = '#1e60a3'; // Deep Vibrant Blue
    else if(type === 'mars') ctx.fillStyle = '#883300';
    else if(type === 'venus') ctx.fillStyle = '#eeb622';
    else if(type === 'mercury') ctx.fillStyle = '#666666';
    else if(type === 'jupiter') ctx.fillStyle = '#c99039';
    else if(type === 'saturn') ctx.fillStyle = '#e3cfa1';
    else if(type === 'uranus') ctx.fillStyle = '#4fd0e7';
    else if(type === 'neptune') ctx.fillStyle = '#2233ff';
    ctx.fillRect(0, 0, width, height);

    // Draw procedural details
    if(type === 'star') {
        for(let i=0; i<3000; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = Math.random() * 20 + 5;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2);
            ctx.fillStyle = `rgba(255, ${50 + Math.random()*150}, 0, 0.1)`;
            ctx.fill();
        }
        ctx.filter = 'blur(10px)'; 
    }

    if(type === 'earth') {
        ctx.filter = 'blur(15px)';
        for(let i=0; i<45; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const isPole = y < height*0.1 || y > height*0.9;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            for(let j=0; j<6; j++) {
                ctx.lineTo(x + (Math.random()-0.5)*200, y + (Math.random()-0.5)*150);
            }
            ctx.closePath();
            
            if(isPole) ctx.fillStyle = 'rgba(255,255,255,0.9)'; 
            else ctx.fillStyle = Math.random() > 0.5 ? '#4b8f2c' : '#8b7355'; 
            ctx.fill();
        }
        ctx.filter = 'blur(8px)';
        for(let i=0; i<100; i++) {
             ctx.beginPath();
             ctx.arc(Math.random()*width, Math.random()*height, Math.random()*30, 0, Math.PI*2);
             ctx.fillStyle = 'rgba(255,255,255,0.4)';
             ctx.fill();
        }
    }

    if(type === 'jupiter' || type === 'saturn') {
        ctx.filter = 'blur(40px)';
        const bands = type === 'jupiter' ? 15 : 25;
        for(let i=0; i<bands; i++) {
            const y = (i/bands) * height;
            const h = (height/bands);
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
            ctx.fillRect(0, y, width, h);
        }
        if(type === 'jupiter') {
            ctx.filter = 'blur(20px)';
            ctx.fillStyle = 'rgba(100,0,0,0.3)';
            ctx.beginPath();
            ctx.ellipse(width*0.7, height*0.6, 60, 30, 0, 0, Math.PI*2);
            ctx.fill();
        }
    }
    
    if(type === 'mars' || type === 'mercury' || type === 'venus') {
        ctx.filter = 'blur(20px)';
        for(let i=0; i<100; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = Math.random() * 40;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI*2);
            const shade = Math.random() > 0.5 ? 255 : 0;
            ctx.fillStyle = `rgba(${shade},${shade},${shade},0.05)`;
            ctx.fill();
        }
    }

    return new THREE.CanvasTexture(canvas);
}

function createAtmosphereMaterial(color) {
    const vertexShader = `
        varying vec3 vNormal;
        void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `;
    const fragmentShader = `
        varying vec3 vNormal;
        void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 4.0);
            gl_FragColor = vec4(${color.r}, ${color.g}, ${color.b}, 1.0) * intensity * 1.5;
        }
    `;
    return new THREE.ShaderMaterial({
        uniforms: {},
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true
    });
}

function init3D() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.001);

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    targetCameraPos = new THREE.Vector3(0, 40, 60);
    camera.position.copy(targetCameraPos);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x333333); 
    scene.add(ambientLight);
    
    const sunLight = new THREE.PointLight(0xffffff, 2.0, 1500);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0001;
    scene.add(sunLight);
    
    const fillLight = new THREE.DirectionalLight(0x111122, 0.5);
    fillLight.position.set(0, 50, -50);
    scene.add(fillLight);

    createStarfield();
    createSolarSystem();

    window.addEventListener('resize', handleResizeAndOrientation, false);
    setupInputListeners();
    animate();
}

function handleResizeAndOrientation() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (window.innerWidth > window.innerHeight) {
        attemptFullscreen();
    }
}

function createStarfield() {
    const geometry = new THREE.BufferGeometry();
    const count = 5000;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    
    for (let i = 0; i < count * 3; i+=3) {
        const r = 800 + Math.random() * 400;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        positions[i] = r * Math.sin(phi) * Math.cos(theta);
        positions[i+1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i+2] = r * Math.cos(phi);
        
        const hue = Math.random();
        if(hue > 0.9) { colors[i]=1; colors[i+1]=0.8; colors[i+2]=0.8; }
        else if(hue > 0.7) { colors[i]=0.8; colors[i+1]=0.9; colors[i+2]=1; }
        else { colors[i]=1; colors[i+1]=1; colors[i+2]=1; }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({ 
        size: 1.2, 
        vertexColors: true,
        transparent: true, 
        opacity: 0.9,
        sizeAttenuation: true
    });
    starField = new THREE.Points(geometry, material);
    scene.add(starField);
}

function createSolarSystem() {
    BODIES.forEach(data => {
        if (data.distance > 0) {
            const orbitGeom = new THREE.RingGeometry(data.distance - 0.1, data.distance + 0.1, 128);
            const orbitMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide, transparent: true, opacity: 0.05 });
            const orbit = new THREE.Mesh(orbitGeom, orbitMat);
            orbit.rotation.x = Math.PI / 2;
            scene.add(orbit);
        }

        const pivot = new THREE.Object3D();
        pivot.rotation.y = Math.random() * Math.PI * 2;
        scene.add(pivot);

        const geometry = new THREE.SphereGeometry(data.radius, 64, 64);
        let material;
        
        const texture = createNoiseCanvas(512, 256, data.genType);

        if (data.genType === "star") {
            material = new THREE.MeshBasicMaterial({ map: texture, color: 0xffdd88 });
        } else {
            material = new THREE.MeshStandardMaterial({
                map: texture,
                roughness: data.genType === 'earth' ? 0.4 : 0.8,
                metalness: 0.1,
            });
        }
        
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.x = data.distance;
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        if (data.genType === "star") {
            const glowCanvas = document.createElement('canvas');
            glowCanvas.width=64; glowCanvas.height=64;
            const gCtx = glowCanvas.getContext('2d');
            const grad = gCtx.createRadialGradient(32,32,0,32,32,32);
            grad.addColorStop(0, 'rgba(255, 200, 100, 1)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');
            gCtx.fillStyle = grad; gCtx.fillRect(0,0,64,64);
            const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
                map: new THREE.CanvasTexture(glowCanvas),
                color: 0xffaa00, blending: THREE.AdditiveBlending
            }));
            sprite.scale.set(data.radius*3.5, data.radius*3.5, 1);
            mesh.add(sprite);
        }

        if (data.genType !== 'star') {
            const atmoColor = new THREE.Color(data.genType === 'earth' ? 0x44aaff : 0xffffff);
            const atmoGeom = new THREE.SphereGeometry(data.radius * 1.2, 32, 32);
            const atmoMat = createAtmosphereMaterial(atmoColor);
            const atmoMesh = new THREE.Mesh(atmoGeom, atmoMat);
            mesh.add(atmoMesh);
        }

        if (data.hasRings) {
            const ringGeom = new THREE.RingGeometry(data.radius * 1.5, data.radius * 2.5, 64);
            const ringTexture = createNoiseCanvas(256, 32, 'saturn');
            const ringMat = new THREE.MeshStandardMaterial({ 
                map: ringTexture,
                side: THREE.DoubleSide, 
                transparent: true, 
                opacity: 0.8
            });
            const ring = new THREE.Mesh(ringGeom, ringMat);
            ring.rotation.x = Math.PI / 2.3;
            mesh.add(ring);
        }

        pivot.add(mesh);
        planets.push({ mesh: mesh, pivot: pivot, data: data });
    });
}

function animate() {
    requestAnimationFrame(animate);

    planets.forEach(p => {
        p.mesh.rotation.y += CONFIG.rotationSpeed;
        if (p.data.speed > 0) p.pivot.rotation.y += p.data.speed * CONFIG.orbitSpeedMultiplier;
    });

    const targetPlanet = planets[currentIndex];
    if (targetPlanet && targetPlanet.mesh) {
        const targetPos = new THREE.Vector3();
        targetPlanet.mesh.getWorldPosition(targetPos);
        
        const offsetDistance = targetPlanet.data.radius * 4 + 10;
        
        if (currentIndex === 0) {
            targetCameraPos.set(0, 40, 80);
        } else {
            targetCameraPos.set(targetPos.x, targetPos.y + (targetPlanet.data.radius * 1.5) + 5, targetPos.z + offsetDistance);
        }

        camera.position.lerp(targetCameraPos, CONFIG.camSmoothness);
        camera.lookAt(targetPos);
    }

    if(starField) starField.rotation.y -= 0.0001;
    renderer.render(scene, camera);
}

function setupInputListeners() {
    document.addEventListener('touchstart', e => { 
        touchFingerCount = e.touches.length;
        touchStartY = e.touches[0].screenY; 
    }, false);
    
    document.addEventListener('touchend', e => {
        let touchEndY = e.changedTouches[0].screenY;
        handleSwipe(touchStartY, touchEndY, touchFingerCount);
        touchFingerCount = 0; 
    }, false);

    document.addEventListener('keydown', (e) => {
        if(e.key === "ArrowDown" || e.key === "ArrowRight") changeFocus(1);
        if(e.key === "ArrowUp" || e.key === "ArrowLeft") changeFocus(-1);
        if(e.key === "l" || e.key === "L") toggleLanguage();
    });
}

function handleSwipe(start, end, fingerCount) {
    if (!isStarted) return;
    const threshold = 40;
    const diff = end - start;
    if (Math.abs(diff) < threshold) return;

    if (fingerCount === 2 && diff > 0) {
        toggleLanguage();
        return;
    }
    if (fingerCount === 1) {
        if (diff > 0) changeFocus(1); 
        else changeFocus(-1); 
    }
}

function toggleLanguage() {
    currentLang = (currentLang === 'en') ? 'hi' : 'en';
    const instructions = document.getElementById('instructions');
    instructions.innerText = (currentLang === 'hi') ? "भाषा: हिंदी" : "Language: English";
    setTimeout(() => {
        instructions.innerHTML = "Swipe Down (1 Finger) to Explore<br>Swipe Down (2 Fingers) for Hindi/English";
    }, 1500);
    updateUI();
}

function changeFocus(direction) {
    currentIndex += direction;
    if (currentIndex >= planets.length) currentIndex = 0;
    if (currentIndex < 0) currentIndex = planets.length - 1;
    updateUI();
}

window.tryStartGame = function() {
    if(isStarted) return;
    isStarted = true;
    document.getElementById('start-screen').style.opacity = '0';
    setTimeout(() => { document.getElementById('start-screen').style.display = 'none'; }, 500);
    document.getElementById('ui-layer').style.opacity = '1';
    document.getElementById('restart-game-btn').style.display = 'block';
    
    if (window.innerWidth > window.innerHeight) {
        attemptFullscreen();
    }

    try { if (synth) { synth.cancel(); synth.getVoices(); } } catch(e) {}
    currentIndex = 0;
    updateUI();
};

window.resetGame = function() {
    currentIndex = 0;
    currentLang = 'en';
    updateUI();
};

function updateUI() {
    const data = planets[currentIndex].data;
    const name = (currentLang === 'hi') ? data.nameHi : data.name;
    const type = (currentLang === 'hi') ? data.typeHi : data.type;
    const fact = (currentLang === 'hi') ? data.factHi : data.fact;

    const nameEl = document.getElementById('planet-name');
    const typeEl = document.getElementById('planet-type');
    
    if(nameEl) {
        nameEl.innerText = name;
        // FIX FOR HINDI SPACING ISSUES:
        nameEl.style.letterSpacing = (currentLang === 'hi') ? 'normal' : '4px';
    }
    if(typeEl) {
        typeEl.innerText = type;
        // FIX FOR HINDI SPACING ISSUES:
        typeEl.style.letterSpacing = (currentLang === 'hi') ? 'normal' : '2px';
    }
    
    const speakText = (currentLang === 'hi') ? `${name}. ${fact}` : `${name}. ${fact}`;
    speak(speakText, currentLang);
}

function speak(text, lang) {
    if (!synth) return;
    try {
        if (synth.speaking) synth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        const voices = synth.getVoices();
        let voice;
        if (lang === 'hi') {
            voice = voices.find(v => v.lang === 'hi-IN' || v.name.includes('Hindi'));
        } else {
            voice = voices.find(v => v.name.includes("Google US English")) || voices.find(v => v.lang.startsWith('en'));
        }
        if (voice) utterance.voice = voice;
        utterance.lang = (lang === 'hi') ? 'hi-IN' : 'en-US';
        utterance.rate = 0.9;
        synth.speak(utterance);
    } catch (e) {}
}

