import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export function loadModel(containerId, modelUrl) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    container.innerHTML = '';  // ← ДОБАВЬ
    container.appendChild(renderer.domElement);  // ← ДОБАВЬ

    // 🔥 Loading UI ← ВСТАВИТЬ ЗДЕСЬ!
    const loaderDiv = document.createElement('div');
    loaderDiv.className = 'loader-overlay';
    loaderDiv.innerHTML = `
        <div style="font-size: 16px; margin-bottom: 20px;">Loading...</div>
        <div class="progress-bar">
            <div class="progress-fill"></div>
        </div>
    `;
    container.appendChild(loaderDiv);
    const progressFill = loaderDiv.querySelector('.progress-fill');

    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;  // Кино-стиль!
    renderer.toneMappingExposure = 1.0;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 0.5;
    controls.maxDistance = 20;

   
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    pmremGenerator.compileEquirectangularShader();
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(renderer)).texture;
    pmremGenerator.dispose();
    

    
    
    // ГЛОБАЛЬНАЯ переменная для вращения ← ПЕРЕМЕСТИЛ ВВЕРХ!
    let loadedModel = null;
    
    // Загрузка модели
    const loader = new GLTFLoader();
    console.log("Загружаем:", modelUrl);
    
    loader.load(modelUrl,
        
        (gltf) => { 
            const model = gltf.scene;
            loadedModel = model;
            scene.add(model);
            fitCameraToObject(camera, model, controls);
            
            
            loaderDiv.style.opacity = '0';
            setTimeout(() => loaderDiv.remove(), 300);
        },
        
        (xhr) => { 
            if (xhr.total > 0) {
                const percent = (xhr.loaded / xhr.total) * 100;
                progressFill.style.width = percent + '%';  // Синяя полоска!
            }
        },
        
        (error) => { 
            console.error('Ошибка загрузки:', error);
            loaderDiv.innerHTML = `
                <div class="error-msg">
                    Ошибка загрузки<br>Проверьте файл
                </div>
            `;
        }
);
    
    // Анимация
   function animate() {
        requestAnimationFrame(animate);
        controls.update();  // ← Обязательно!
        // loadedModel.rotation.y += 0.005;  // ← Закомментировать
        renderer.render(scene, camera);
    }
    animate();
    
    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });
}

function fitCameraToObject(camera, object, controls) {
    const box = new THREE.Box3().setFromObject(object);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    
    object.position.x = -center.x;
    object.position.y = -center.y; 
    object.position.z = -center.z;
    
    
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
    camera.position.set(cameraZ, cameraZ * 0.5, cameraZ);
    camera.lookAt(0, 0, 0);
    
    
    controls.target.set(0, 0, 0);
    controls.update();
}