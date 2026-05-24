// Sample product data
import paracetamol from '../assets/paracetamol.jpg';
import ibuprofen from '../assets/ibuprofen.jpg';
import aspirin from '../assets/aspirin.avif';
import amoxicillin from '../assets/amoxicillin.jpeg';
import moisturizing from '../assets/moisturizing cream.webp';
import antiAging from '../assets/anti-aging serum.webp';
import sunscreen from '../assets/sunscreen spf.webp';
import vitaminCMask from '../assets/vitamin c mask.webp';
import vitaminD3 from '../assets/vitamin d2 iu.jpg';
import multivitamin from '../assets/multi-vitamin.webp';
import omega3 from '../assets/omega 3.jpg';
import vitaminB from '../assets/vitamin b complex.avif';
import handSoap from '../assets/antibacterial hand soap.jpg';
import dentalKit from '../assets/dental care kit.jpg';
import bodyLotion from '../assets/BODY LOTION.webp';
import shampoo from '../assets/hair care shampoo.jpg';

export const products = [
  // Medicines
  {
    id: 1,
    name: 'Paracetamol 500mg',
    category: 'Medicines',
    price: 5.99,
    description: 'Pain relief and fever reducer',
    image: paracetamol,
    inStock: true,
    sales: 120,
    rating: 4.4,
  },
  {
    id: 2,
    name: 'Ibuprofen 400mg',
    category: 'Medicines',
    price: 7.99,
    description: 'Anti-inflammatory medication',
    image: ibuprofen,
    inStock: true,
    sales: 95,
    rating: 4.3,
  },
  {
    id: 3,
    name: 'Aspirin 100mg',
    category: 'Medicines',
    price: 4.99,
    description: 'Blood thinner and pain relief',
    image: aspirin,
    inStock: true,
    sales: 180,
    rating: 4.6,
  },
  {
    id: 4,
    name: 'Amoxicillin 500mg',
    category: 'Medicines',
    price: 12.99,
    description: 'Antibiotic for bacterial infections',
    image: amoxicillin,
    inStock: false,
    sales: 40,
    rating: 4.2,
  },

  // Cosmetics
  {
    id: 5,
    name: 'Moisturizing Face Cream',
    category: 'Cosmetics',
    price: 24.99,
    description: 'Hydrating cream for all skin types',
    image: moisturizing,
    inStock: true,
    sales: 85,
    rating: 4.5,
  },
  {
    id: 6,
    name: 'Anti-Aging Serum',
    category: 'Cosmetics',
    price: 35.99,
    description: 'Reduces wrinkles and fine lines',
    image: antiAging,
    inStock: true,
    sales: 60,
    rating: 4.4,
  },
  {
    id: 7,
    name: 'Sunscreen SPF 50',
    category: 'Cosmetics',
    price: 18.99,
    description: 'Broad spectrum sun protection',
    image: sunscreen,
    inStock: true,
    sales: 140,
    rating: 4.6,
  },
  {
    id: 8,
    name: 'Vitamin C Face Mask',
    category: 'Cosmetics',
    price: 15.99,
    description: 'Brightening and rejuvenating mask',
    image: vitaminCMask,
    inStock: true,
    sales: 70,
    rating: 4.3,
  },

  // Vitamins
  {
    id: 9,
    name: 'Vitamin D3 2000 IU',
    category: 'Vitamins',
    price: 14.99,
    description: 'Supports bone and immune health',
    image: vitaminD3,
    inStock: true,
    sales: 150,
    rating: 4.5,
  },
  {
    id: 10,
    name: 'Multivitamin Complex',
    category: 'Vitamins',
    price: 22.99,
    description: 'Complete daily vitamin supplement',
    image: multivitamin,
    inStock: true,
    sales: 340,
    rating: 4.8,
  },
  {
    id: 11,
    name: 'Omega-3 Fish Oil',
    category: 'Vitamins',
    price: 19.99,
    description: 'Heart and brain health support',
    image: omega3,
    inStock: true,
    sales: 290,
    rating: 4.7,
  },
  {
    id: 12,
    name: 'Vitamin B Complex',
    category: 'Vitamins',
    price: 16.99,
    description: 'Energy and metabolism support',
    image: vitaminB,
    inStock: true,
    sales: 300,
    rating: 4.6,
  },

  // Personal Care
  {
    id: 13,
    name: 'Antibacterial Hand Soap',
    category: 'Personal Care',
    price: 6.99,
    description: 'Kills 99.9% of germs',
    image: handSoap,
    inStock: true,
    sales: 210,
    rating: 4.5,
  },
  {
    id: 14,
    name: 'Dental Care Kit',
    category: 'Personal Care',
    price: 12.99,
    description: 'Complete oral hygiene set',
    image: dentalKit,
    inStock: true,
    sales: 75,
    rating: 4.2,
  },
  {
    id: 15,
    name: 'Body Lotion',
    category: 'Personal Care',
    price: 11.99,
    description: 'Nourishing body moisturizer',
    image: bodyLotion,
    inStock: true,
    sales: 130,
    rating: 4.4,
  },
  {
    id: 16,
    name: 'Hair Care Shampoo',
    category: 'Personal Care',
    price: 9.99,
    description: 'Strengthening and volumizing',
    image: shampoo,
    inStock: true,
    sales: 110,
    rating: 4.3,
  },
];
