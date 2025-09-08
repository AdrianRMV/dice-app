import React from 'react';
import styled from 'styled-components';
import type { Promotion } from '../data/promotions';

const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    padding: 16px; /* evita que el contenido toque los bordes en pantallas pequeñas */
`;

const ModalContent = styled.div`
    background-color: white;
    border-radius: 12px;
    padding: 20px;
    width: 92vw;
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto; /* permite scroll si el contenido es largo */
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    text-align: center;
    position: relative;
    animation: fadeIn 0.3s ease-out;

    @media (min-width: 480px) {
        padding: 24px;
    }

    @media (min-width: 768px) {
        padding: 28px;
        width: 90vw; /* un poco más estrecho en pantallas medianas */
        max-width: 640px;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;

const CloseButton = styled.button`
    position: absolute;
    top: 10px;
    right: 10px;
    background: none;
    border: none;
    font-size: 28px;
    cursor: pointer;
    color: #333;
    width: 44px; /* tamaño táctil mínimo recomendado */
    height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &:hover {
        color: #000;
    }

    @media (min-width: 768px) {
        font-size: 32px;
    }
`;

const PromotionTitle = styled.h2`
    color: #333;
    margin-bottom: 16px;
    font-size: clamp(20px, 4vw, 28px);
`;

const PromotionImage = styled.img.attrs({ loading: 'lazy' })`
    display: block;
    width: 90%;
    margin: 0 auto;
    height: auto;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
    max-height: 50vh; /* no exceder la mitad de la altura de la pantalla */
    object-fit: cover; /* llena completamente el contenedor sin bordes blancos */

    @media (min-width: 768px) {
        max-height: 460px;
    }
`;

const PromotionDescription = styled.p`
    font-size: clamp(16px, 2.4vw, 18px);
    line-height: 1.5;
    margin-bottom: 24px;
    color: #555;
`;

interface PromotionModalProps {
    promotion: Promotion;
    onClose: () => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({
    promotion,
    onClose,
}) => {
    return (
        <ModalOverlay onClick={onClose}>
            <ModalContent onClick={(e) => e.stopPropagation()}>
                <CloseButton onClick={onClose}>&times;</CloseButton>
                <PromotionTitle>Felicidades!</PromotionTitle>
                <PromotionImage src={promotion.image} alt={promotion.title} />
                <PromotionTitle>{promotion.title}</PromotionTitle>
                <PromotionDescription>
                    {promotion.description}
                </PromotionDescription>
            </ModalContent>
        </ModalOverlay>
    );
};

export default PromotionModal;
