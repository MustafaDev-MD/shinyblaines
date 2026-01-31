import Link from 'next/link';

export default function Footer() {
  const footerLinks = {
    services: [
      { name: 'Create Pokémon', href: '/create' },
      { name: 'Mystery Gifts', href: '/mystery-gift' },
      { name: 'Cloning Service', href: '/clone' },
      { name: 'Trade System', href: '/trade' },
      { name: 'Pokédex', href: '/pokedex' }
    ],
    games: [
      { name: 'Legends Z-A', href: '#' },
      { name: 'Scarlet & Violet', href: '#' },
      { name: 'Sword & Shield', href: '#' },
      { name: 'Brilliant Diamond', href: '#' },
      { name: 'Legends Arceus', href: '#' },
      { name: "Let's Go", href: '#' }
    ],
    resources: [
      { name: 'Competitive Sets', href: '#' },
      { name: 'IV Calculator', href: '#' },
      { name: 'Team Builder', href: '#' },
      { name: 'Type Chart', href: '#' },
      { name: 'Trade Forum', href: '#' }
    ],
    support: [
      { name: 'Help Center', href: '#' },
      { name: 'Discord Server', href: '#' },
      { name: 'YouTube Channel', href: '#' },
      { name: 'Status Page', href: '#' },
      { name: 'Contact Us', href: '#' }
    ]
  };

  return (
    <div className="py-8 text-center text-gray-500 text-sm">
      © 2024 Shiny Blaines. All rights reserved.
    </div>
  );
}