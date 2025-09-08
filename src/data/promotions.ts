export interface Promotion {
    id: number;
    title: string;
    image: string;
    description: string;
}

const promotions: Promotion[] = [
    {
        id: 1,
        title: '🍕 Fuego de la Tribu',
        image: process.env.PUBLIC_URL + '/images/Pizza.jpeg',
        description: '1 Pizza Mediana Clásica',
    },
    {
        id: 2,
        title: '🥤 Espíritus Refrescantes',
        image: process.env.PUBLIC_URL + '/images/Drink.jpeg',
        description: '1 Bebida Gratis',
    },
    {
        id: 3,
        title: '🍝 Manjar del Guerrero',
        image: process.env.PUBLIC_URL + '/images/Pasta.jpeg',
        description: '1 Pasta individual',
    },
    {
        id: 4,
        title: '🥗 Ofrenda Verde',
        image: process.env.PUBLIC_URL + '/images/Ensalada.jpeg',
        description: '1 Ensalada Personal',
    },
    {
        id: 5,
        title: '🎟️ Pase directo a la Rifa Mensual Familiar',
        image: process.env.PUBLIC_URL + '/images/Boleto.jpeg',
        description: 'Participa en Rifa Familiar',
    },
    {
        id: 6,
        title: '❌ Risa del Chaman',
        image: process.env.PUBLIC_URL + '/images/Chaman.jpeg',
        description: 'Suerte para la Próxima',
    },
];

export default promotions;
