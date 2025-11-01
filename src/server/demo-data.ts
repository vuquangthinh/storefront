export type DemoProduct = {
  slug: string;
  name: string;
  price: number;
  pictures: { url: string }[];
  variants?: { id: string }[];
  categories?: string[];
  tags?: string[];
  colors?: string[];
  sizes?: string[];
  brand?: string;
  description?: string;
};

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    slug: 'classic-tshirt',
    name: 'Classic T‑Shirt',
    price: 19.99,
    pictures: [{ url: '/images/demo/classic-tshirt.jpg' }],
    variants: [{ id: 'v1' }],
    categories: ['apparel'],
    tags: ['tshirt'],
    colors: ['black', 'white'],
    sizes: ['S', 'M', 'L', 'XL'],
    brand: 'POD Basics',
    description: 'Soft cotton unisex T-shirt, DTG printed on demand.'
  },
  {
    slug: 'super-sense-watch-two',
    name: 'Super Sense Watch 2',
    price: 129.0,
    pictures: [{ url: '/images/demo/super-sense-watch-two.jpg' }],
    variants: [{ id: 'v1' }],
    categories: ['accessories'],
    tags: ['watch'],
    colors: ['black', 'silver'],
    sizes: [],
    brand: 'POD Gear',
    description: 'Smart watch with customizable POD bands and faces.'
  },
  {
    slug: 'premium-hoodie',
    name: 'Premium Hoodie',
    price: 39.99,
    pictures: [{ url: '/images/demo/premium-hoodie.jpg' }],
    variants: [{ id: 'v1' }],
    categories: ['apparel'],
    tags: ['hoodie'],
    colors: ['black', 'heather'],
    sizes: ['S', 'M', 'L', 'XL'],
    brand: 'POD Select',
    description: 'Heavyweight fleece hoodie with front pouch pocket.'
  },
  {
    slug: 'ceramic-mug',
    name: 'Ceramic Mug 11oz',
    price: 12.5,
    pictures: [{ url: '/images/demo/ceramic-mug.jpg' }],
    variants: [{ id: 'v1' }],
    categories: ['home'],
    tags: ['mug'],
    colors: ['white'],
    sizes: [],
    brand: 'POD Home',
    description: 'Dishwasher & microwave safe ceramic mug.'
  }
];
