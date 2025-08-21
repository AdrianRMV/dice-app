import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import DiceThreeComponent from './components/DiceThreeComponent';
import PromotionModal from './components/PromotionModal';
import logoPizzas from './images/logo-pizzas.png';
import fireSound from './soundsEffect/fire-sound.mp3';
import './App.css';

const AppContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background-color: #200c04;
    padding: 20px;
`;

const Title = styled.h1`
    color: #fff;
    /* margin-bottom: 30px; */
    text-align: center;
`;

// Splash (pantalla de carga inicial)
const SplashOverlay = styled.div`
    position: fixed;
    inset: 0;
    background: #200c04; /* mismo café del fondo/logotipo */
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    opacity: ${(p) => (p.$fadeOut ? 0 : 1)};
    transition: opacity 500ms ease; /* mantener en sync con FADE_DURATION_MS */
`;

const SplashLogo = styled.img`
    width: clamp(160px, 40vw, 280px); /* grande y responsivo */
    height: auto;
    filter: drop-shadow(0 8px 30px rgba(0, 0, 0, 0.5));
`;

// Constantes compartidas para precisión exacta
const SPLASH_DURATION_MS = 2000; // tiempo de espera antes del fade
const FADE_DURATION_MS = 500; // debe coincidir con la transición CSS
const FIRE_VOLUME = 0.5; // volumen inicial del sonido (subido para mayor percepción)
const SOUND_LEAD_MS = 120; // adelanto del audio antes del inicio del fade visual

function App() {
    const [isRolling, setIsRolling] = useState(false);
    const [hasRolled] = useState(false); // quitar setter no usado para evitar warning ESLint
    const [showModal, setShowModal] = useState(false);
    const [currentPromotion, setCurrentPromotion] = useState(null);

    // Splash state
    const [showSplash, setShowSplash] = useState(false);
    const [fadeSplash, setFadeSplash] = useState(false);
    const splashRafRef = useRef(null);
    const soundFadeRafRef = useRef(null);
    const fireAudioRef = useRef(null);
    const audioUnlockedRef = useRef(false); // flag desbloqueo audio por gesto
    const unlockAudioRef = useRef(null); // exponer función al overlay
    const hasStartedSoundRef = useRef(false); // iniciar audio solo una vez

    useEffect(() => {
        setShowSplash(true);
        // preparar audio
        const audio = new Audio(fireSound);
        audio.preload = 'auto';
        audio.volume = FIRE_VOLUME;
        fireAudioRef.current = audio;

        const unlockAudio = () => {
            const a = fireAudioRef.current;
            if (!a || audioUnlockedRef.current) return;
            try {
                a.muted = true;
                const p = a.play();
                if (p && p.then) {
                    p.then(() => {
                        a.pause();
                        a.currentTime = 0;
                        a.muted = false;
                        audioUnlockedRef.current = true;
                    }).catch(() => {});
                } else {
                    a.pause();
                    a.currentTime = 0;
                    a.muted = false;
                    audioUnlockedRef.current = true;
                }
            } catch (_) {}
        };
        unlockAudioRef.current = unlockAudio;

        const onUserGesture = () => unlockAudio();
        window.addEventListener('pointerdown', onUserGesture, { once: true });
        window.addEventListener('keydown', onUserGesture, { once: true });

        const start = performance.now();
        const tick = () => {
            const elapsed = performance.now() - start;

            // Iniciar audio ligeramente antes del fade visual
            if (!hasStartedSoundRef.current && elapsed >= Math.max(0, SPLASH_DURATION_MS - SOUND_LEAD_MS)) {
                hasStartedSoundRef.current = true;
                const a = fireAudioRef.current;
                if (a) {
                    try {
                        a.currentTime = 0;
                        a.volume = 0;
                        a.play().catch(() => {});
                    } catch (_) {}

                    const soundStart = performance.now();
                    const attackMs = 30;
                    const totalMs = SOUND_LEAD_MS + FADE_DURATION_MS;
                    const fadeSound = () => {
                        const t = performance.now() - soundStart;
                        let vol = 0;
                        if (t < attackMs) {
                            const at = Math.max(0, Math.min(1, t / Math.max(1, attackMs)));
                            vol = FIRE_VOLUME * at;
                        } else {
                            const dt = Math.max(0, Math.min(1, (t - attackMs) / Math.max(1, totalMs - attackMs)));
                            const easedD = 1 - Math.pow(1 - dt, 3);
                            vol = FIRE_VOLUME * (1 - easedD);
                        }
                        a.volume = Math.max(0, Math.min(1, vol));

                        if (t < totalMs) {
                            soundFadeRafRef.current = requestAnimationFrame(fadeSound);
                        } else {
                            a.pause();
                            a.currentTime = 0;
                            a.volume = FIRE_VOLUME;
                        }
                    };
                    soundFadeRafRef.current = requestAnimationFrame(fadeSound);
                }
            }

            if (elapsed >= SPLASH_DURATION_MS) {
                setFadeSplash(true);
                setTimeout(() => {
                    setShowSplash(false);
                }, FADE_DURATION_MS);
            } else {
                splashRafRef.current = requestAnimationFrame(tick);
            }
        };
        splashRafRef.current = requestAnimationFrame(tick);

        return () => {
            if (splashRafRef.current) cancelAnimationFrame(splashRafRef.current);
            if (soundFadeRafRef.current) cancelAnimationFrame(soundFadeRafRef.current);
            window.removeEventListener('pointerdown', onUserGesture);
            window.removeEventListener('keydown', onUserGesture);
            if (fireAudioRef.current) {
                try { fireAudioRef.current.pause(); } catch (_) {}
            }
        };
    }, []);

    // Promotions for each side of the dice (1-6)
    const promotions = [
        {
            id: 1,
            title: 'Free Appetizer',
            image: 'https://images.unsplash.com/photo-1546241072-48010ad2862c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Enjoy a free appetizer with your next meal!',
        },
        {
            id: 2,
            title: '10% Off Dinner',
            image: 'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Get 10% off your next dinner!',
        },
        {
            id: 3,
            title: 'Free Dessert',
            image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Enjoy a free dessert with your meal!',
        },
        {
            id: 4,
            title: 'Buy One Get One Free',
            image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Buy one entrée, get one free!',
        },
        {
            id: 5,
            title: 'Free Drink',
            image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Enjoy a free drink with your meal!',
        },
        {
            id: 6,
            title: '25% Off Total Bill',
            image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            description: 'Get 25% off your total bill!',
        },
    ];

    useEffect(() => {
        // Desactivado para fines demostrativos
        // const hasUserRolled = localStorage.getItem('hasRolled');
        // if (hasUserRolled === 'true') {
        //     setHasRolled(true);
        //     // Get the saved promotion if it exists
        //     const savedPromotion = localStorage.getItem('currentPromotion');
        //     if (savedPromotion) {
        //         setCurrentPromotion(JSON.parse(savedPromotion));
        //     }
        // }
    }, []);

    const handleRollComplete = (value) => {
        // value is 1-6 representing the dice face
        setIsRolling(false);
        const promotion = promotions[value - 1];
        setCurrentPromotion(promotion);
        setShowModal(true);

        // Save to localStorage
        localStorage.setItem('hasRolled', 'true');
        localStorage.setItem('currentPromotion', JSON.stringify(promotion));
    };

    const handleRollClick = () => {
        if (!isRolling) {
            setIsRolling(true);
            // Comentado para fines demostrativos
            // setHasRolled(true);
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    return (
        <AppContainer>
            {showSplash && (
                <SplashOverlay
                    $fadeOut={fadeSplash}
                    onPointerDown={() => {
                        if (unlockAudioRef.current) unlockAudioRef.current();
                    }}
                >
                    <SplashLogo src={logoPizzas} alt="pizzas" />
                </SplashOverlay>
            )}
            <img
                src={logoPizzas}
                alt="pizzas"
                style={{ maxWidth: '150px', marginBottom: '10px' }}
            />
            <Title>DADO SORPRESA</Title>
            {/* <Instructions>
                {
                    '¡Haz clic en el dado para lanzarlo y ganar una promoción especial para nuestro restaurante! Modo demostración: puedes lanzar múltiples veces.'
                }
            </Instructions> */}

            <DiceThreeComponent
                isRolling={isRolling}
                onRollComplete={handleRollComplete}
                onClick={handleRollClick}
                disabled={hasRolled}
            />

            {showModal && currentPromotion && (
                <PromotionModal
                    promotion={currentPromotion}
                    onClose={handleCloseModal}
                />
            )}
        </AppContainer>
    );
}

export default App;
