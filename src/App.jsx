import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import DiceThreeComponent from './components/DiceThreeComponent';
import PromotionModal from './components/PromotionModal';
import Header from './components/Header';
import promotions from './data/promotions';
import logoPizzas from './images/logo-pizzas.png';
import confetti from 'canvas-confetti';
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

const SplashOverlay = styled.div`
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background-color: #200c04;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    opacity: ${(p) => (p.$fadeOut ? 0 : 1)};
    transition: opacity 400ms ease;
`;

const SplashLogo = styled.img`
    width: clamp(140px, 30vw, 220px);
    height: auto;
    opacity: 0.95;
`;

function App() {
    const [isRolling, setIsRolling] = useState(false);
    const [hasRolled] = useState(false); // Mantener por compatibilidad, actualmente siempre false
    const [showModal, setShowModal] = useState(false);
    const [currentPromotion, setCurrentPromotion] = useState(null);

    // Splash screen state: visible ~2s y luego desvanecer
    const [showSplash, setShowSplash] = useState(true);
    const [splashFading, setSplashFading] = useState(false);

    useEffect(() => {
        const showTimer = setTimeout(() => {
            setSplashFading(true);
            const hideTimer = setTimeout(() => setShowSplash(false), 450); // espera transición
            return () => clearTimeout(hideTimer);
        }, 2000);
        return () => clearTimeout(showTimer);
    }, []);

    useEffect(() => {
        // Lógica previa de localStorage desactivada para demo
        // const hasUserRolled = localStorage.getItem('hasRolled');
        // if (hasUserRolled === 'true') {
        //   const savedPromotion = localStorage.getItem('currentPromotion');
        //   if (savedPromotion) setCurrentPromotion(JSON.parse(savedPromotion));
        // }
    }, []);

    const launchConfetti = () => {
        const duration = 1600;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 45, spread: 360, ticks: 70, zIndex: 3000 }; // sobre el modal

        const interval = setInterval(() => {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
                return clearInterval(interval);
            }
            const particleCount = Math.max(30, 80 * (timeLeft / duration));
            // Disparos desde lados opuestos
            confetti({
                ...defaults,
                particleCount,
                origin: { x: Math.random() * 0.2 + 0.1, y: 0.6 },
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: 0.9 - Math.random() * 0.2, y: 0.6 },
            });
        }, 200);
    };

    useEffect(() => {
        if (showModal) {
            launchConfetti();
        }
    }, [showModal]);

    const handleRollComplete = (value) => {
        setIsRolling(false);
        const promotion = promotions[value - 1];
        setCurrentPromotion(promotion);
        setShowModal(true);

        // Persistencia opcional
        localStorage.setItem('hasRolled', 'true');
        localStorage.setItem('currentPromotion', JSON.stringify(promotion));
    };

    const handleRollClick = () => {
        if (!isRolling) {
            setIsRolling(true);
        }
    };

    const handleCloseModal = () => setShowModal(false);

    return (
        <AppContainer>
            <Header logo={logoPizzas} title="DADO SORPRESA" />

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

            {showSplash && (
                <SplashOverlay $fadeOut={splashFading}>
                    <SplashLogo src={logoPizzas} alt="Logo" />
                </SplashOverlay>
            )}
        </AppContainer>
    );
}

export default App;
