import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function loadModel(containerId, modelUrl) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    
    // Свет
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    
    // ГЛОБАЛЬНАЯ переменная для вращения ← ПЕРЕМЕСТИЛ ВВЕРХ!
    let loadedModel = null;
    
    // Загрузка модели
    const loader = new GLTFLoader();
    console.log("Загружаем:", modelUrl);
    
    loader.load(modelUrl,
        (gltf) => { 
            console.log("GLTF loaded:", gltf);
            const model = gltf.scene;
            loadedModel = model;  // ← ТЕПЕРЬ работает!
            fitCameraToObject(camera, model, 20.0);  // ← 2.0 вместо 20.15
            model.scale.set(1, 1, 1);
            model.position.set(0, 0, 0);
            scene.add(model);
            console.log("Модель добавлена в сцену");
        },
        (progress) => { 
            console.log("Loading:", (progress.loaded / progress.total * 100) + '%'); 
        },
        (error) => { 
            console.error("LOAD ERROR:", modelUrl, error); 
            container.innerHTML = 'Не удалось загрузить модель';
        }
    );
    
    // Анимация
    function animate() {
        requestAnimationFrame(animate);
        if (loadedModel) {
            loadedModel.rotation.y += 0.005;  // ← ТЕПЕРЬ РАБОТАЕТ!
        }
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

function fitCameraToObject(camera, object, offset = 1.5) {
    const boundingBox = new THREE.Box3();
    boundingBox.setFromObject(object);
    
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 4 * Math.tan(fov / 2));
    cameraZ = Math.min(cameraZ * offset, 50);
    
    camera.position.set(0, 0, cameraZ);
    camera.lookAt(center);
    camera.updateProjectionMatrix();
    
    console.log("FIXED bounds:", maxDim, "Camera Z:", cameraZ);
}