import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import diceSfx from '../soundsEffect/dice-142528.mp3';

const DiceThreeComponent = ({
    isRolling,
    onRollComplete,
    onClick,
    disabled,
}) => {
    const mountRef = useRef(null);
    const [result, setResult] = useState(1);
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const diceRef = useRef(null);
    const animationFrameRef = useRef(null);
    const rollTimeoutRef = useRef(null);
    const audioRef = useRef(null);
    const rollDurationMsRef = useRef(1800);

    // Inicializar escena
    useEffect(() => {
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x200c04);
        sceneRef.current = scene;

        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.z = 6;
        cameraRef.current = camera;

        if (mountRef.current && !rendererRef.current) {
            const renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(150, 150);
            mountRef.current.innerHTML = '';
            mountRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;
        }
        const renderer = rendererRef.current;

        // Luces
        scene.add(new THREE.AmbientLight(0xffffff, 0.4));
        const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight.position.set(5, 5, 5);
        scene.add(dirLight);

        createDice();

        const animate = () => {
            animationFrameRef.current = requestAnimationFrame(animate);
            if (diceRef.current && !isRolling) {
                diceRef.current.rotation.x += 0.003;
                diceRef.current.rotation.y += 0.003;
            }
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
            if (rollTimeoutRef.current) clearTimeout(rollTimeoutRef.current);
            if (renderer) renderer.dispose();
            if (diceRef.current) {
                scene.remove(diceRef.current);
                diceRef.current.geometry.dispose();
                const mats = Array.isArray(diceRef.current.material)
                    ? diceRef.current.material
                    : [diceRef.current.material];
                mats.forEach((m) => {
                    if (m.map) m.map.dispose();
                    if (m.bumpMap) m.bumpMap.dispose();
                    m.dispose();
                });
            }
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, []);

    // Crear dado realista
    const createDice = () => {
        if (sceneRef.current && diceRef.current) {
            sceneRef.current.remove(diceRef.current);
        }

        // Geometría redondeada
        const geometry = new RoundedBoxGeometry(2, 2, 2, 8, 0.3);

        // Helper: dibujar pips en un canvas
        const drawPips = (ctx, value, size, color) => {
            const cx = size / 2;
            const cy = size / 2;
            const r = size * 0.08; // radio del punto
            const s = size * 0.28; // separación desde el centro
            const positions = {
                1: [[0, 0]],
                2: [
                    [-1, -1],
                    [1, 1],
                ],
                3: [
                    [-1, -1],
                    [0, 0],
                    [1, 1],
                ],
                4: [
                    [-1, -1],
                    [-1, 1],
                    [1, -1],
                    [1, 1],
                ],
                5: [
                    [-1, -1],
                    [-1, 1],
                    [0, 0],
                    [1, -1],
                    [1, 1],
                ],
                6: [
                    [-1, -1],
                    [-1, 0],
                    [-1, 1],
                    [1, -1],
                    [1, 0],
                    [1, 1],
                ],
            }[value];

            ctx.fillStyle = color;
            positions.forEach(([ix, iy]) => {
                const x = cx + ix * s;
                const y = cy + iy * s;
                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        // Crear texturas (color + bump) para cada cara
        const createFaceTextures = (value, size = 512) => {
            const create = () => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                return { canvas, ctx };
            };

            // Color
            const { canvas: cColor, ctx: ctxColor } = create();
            ctxColor.fillStyle = '#ffffff';
            ctxColor.fillRect(0, 0, cColor.width, cColor.height);
            drawPips(ctxColor, value, cColor.width, '#000000');

            // Bump (base gris medio, puntos más oscuros para simular hueco)
            const { canvas: cBump, ctx: ctxBump } = create();
            ctxBump.fillStyle = '#808080';
            ctxBump.fillRect(0, 0, cBump.width, cBump.height);
            drawPips(ctxBump, value, cBump.width, '#404040');

            const map = new THREE.CanvasTexture(cColor);
            const bumpMap = new THREE.CanvasTexture(cBump);
            const aniso = rendererRef.current
                ? rendererRef.current.capabilities.getMaxAnisotropy()
                : 1;
            map.anisotropy = aniso;
            bumpMap.anisotropy = aniso;
            map.needsUpdate = true;
            bumpMap.needsUpdate = true;
            return { map, bumpMap };
        };

        // Crear materiales por cara (orden BoxGeometry: +X, -X, +Y, -Y, +Z, -Z)
        const makeMaterial = (value) => {
            const { map, bumpMap } = createFaceTextures(value);
            return new THREE.MeshPhysicalMaterial({
                color: 0xffffff,
                roughness: 0.35,
                metalness: 0.1,
                clearcoat: 0.7,
                clearcoatRoughness: 0.25,
                map,
                bumpMap,
                bumpScale: -0.08, // negativo para hundir los puntos
            });
        };

        const materials = [
            makeMaterial(3), // +X (derecha)
            makeMaterial(4), // -X (izquierda)
            makeMaterial(2), // +Y (arriba)
            makeMaterial(5), // -Y (abajo)
            makeMaterial(1), // +Z (frente)
            makeMaterial(6), // -Z (atrás)
        ];

        const dice = new THREE.Mesh(geometry, materials);

        diceRef.current = dice;
        sceneRef.current.add(dice);

        dice.rotation.x = Math.PI * 0.25;
        dice.rotation.y = Math.PI * 0.25;
    };

    // Preparar audio de lanzamiento (una sola vez)
    useEffect(() => {
        const audio = new Audio(diceSfx);
        audio.volume = 0.3; // volumen agradable
        audio.preload = 'auto';
        const onLoaded = () => {
            if (isFinite(audio.duration) && audio.duration > 0) {
                rollDurationMsRef.current = Math.round(audio.duration * 1000);
            }
        };
        audio.addEventListener('loadedmetadata', onLoaded);
        audioRef.current = audio;
        return () => {
            audio.removeEventListener('loadedmetadata', onLoaded);
            audio.pause();
        };
    }, []);

    // Función para generar resultado con probabilidades ponderadas
    const getWeightedRandomResult = () => {
        // Probabilidades: cara 1 (menor) -> cara 6 (mayor)
        // Cara 1: 5%, Cara 2: 10%, Cara 3: 15%, Cara 4: 20%, Cara 5: 25%, Cara 6: 25%
        const weights = [5, 10, 15, 20, 25, 25]; // suma = 100
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < weights.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return i + 1; // retorna 1-6
            }
        }
        
        return 6; // fallback a la cara con mayor probabilidad
    };

    // Animación de lanzamiento
    useEffect(() => {
        if (isRolling && diceRef.current) {
            // velocidades reducidas para un giro más suave
            const speedX = Math.random() * 0.1 + 0.12;
            const speedY = Math.random() * 0.1 + 0.12;
            const speedZ = Math.random() * 0.1 + 0.12;

            const newResult = getWeightedRandomResult();
            setResult(newResult);

            let elapsedTime = 0;
            const animationDuration = rollDurationMsRef.current || 1800;
            const startTime = Date.now();

            const rollAnimation = () => {
                elapsedTime = Date.now() - startTime;

                if (elapsedTime < animationDuration) {
                    const slowdown = 1 - elapsedTime / animationDuration;
                    diceRef.current.rotation.x += speedX * slowdown;
                    diceRef.current.rotation.y += speedY * slowdown;
                    diceRef.current.rotation.z += speedZ * slowdown;
                    animationFrameRef.current =
                        requestAnimationFrame(rollAnimation);
                } else {
                    positionDiceToShowResult(newResult);
                    rollTimeoutRef.current = setTimeout(() => {
                        onRollComplete(newResult);
                    }, 50);
                }
            };
            rollAnimation();
        }
    }, [isRolling, onRollComplete]);

    const positionDiceToShowResult = (value) => {
        if (!diceRef.current) return;

        switch (value) {
            case 1:
                diceRef.current.rotation.set(0, 0, 0);
                break;
            case 2:
                diceRef.current.rotation.set(Math.PI / 2, 0, 0);
                break;
            case 3:
                diceRef.current.rotation.set(0, Math.PI / 2, 0);
                break;
            case 4:
                diceRef.current.rotation.set(0, -Math.PI / 2, 0);
                break;
            case 5:
                diceRef.current.rotation.set(0, Math.PI, 0);
                break;
            case 6:
                diceRef.current.rotation.set(-Math.PI / 2, 0, 0);
                break;
            default:
                break;
        }
    };

    // Manejar click: reproducir sonido y delegar al padre para iniciar el roll
    const handleClick = async () => {
        if (disabled) return;
        if (audioRef.current) {
            try {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
                audioRef.current.volume = 0.3;
                audioRef.current.playbackRate = 1.0; // mantener tono natural
                await audioRef.current.play();
                // sincronizar duración si está disponible
                if (
                    isFinite(audioRef.current.duration) &&
                    audioRef.current.duration > 0
                ) {
                    rollDurationMsRef.current = Math.round(
                        audioRef.current.duration * 1000
                    );
                }
            } catch (e) {
                // silencio por políticas del navegador; la animación seguirá
            }
        }
        if (onClick) onClick();
    };

    return (
        <div
            ref={mountRef}
            onClick={!disabled ? handleClick : undefined}
            style={{
                width: '150px',
                height: '150px',
                margin: '40px auto',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.5 : 1,
            }}
        />
    );
};

export default DiceThreeComponent;
