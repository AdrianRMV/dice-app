export interface Promotion {
  id: number;
  title: string;
  image: string;
  description: string;
}

const promotions: Promotion[] = [
  {
    id: 1,
    title: 'Promocion Ejemplo Dado 1',
    image:
      'https://images.unsplash.com/photo-1546241072-48010ad2862c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Texto mas descriptivo de la promocion ejemplo dado 1',
  },
  {
    id: 2,
    title: 'Promocion Ejemplo Dado 2',
    image:
      'https://images.unsplash.com/photo-1559847844-5315695dadae?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Texto mas descriptivo de la promocion ejemplo dado 2',
  },
  {
    id: 3,
    title: 'Promocion Ejemplo Dado 3',
    image:
      'https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Texto mas descriptivo de la promocion ejemplo dado 3',
  },
  {
    id: 4,
    title: 'Promocion Ejemplo Dado 4',
    image:
      'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Texto mas descriptivo de la promocion ejemplo dado 4',
  },
  {
    id: 5,
    title: 'Promocion Ejemplo Dado 5',
    image:
      'https://images.unsplash.com/photo-1551024709-8f23befc6f87?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Texto mas descriptivo de la promocion ejemplo dado 5',
  },
  {
    id: 6,
    title: 'Promocion Ejemplo Dado 6',
    image:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    description: 'Texto mas descriptivo de la promocion ejemplo dado 6',
  },
];

export default promotions;
