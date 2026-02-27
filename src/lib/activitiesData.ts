import type { CarouselImage } from '../components/ActivityCarousel';

const placeholder = (activity: string, n: number) =>
  `https://placehold.co/800x450/e5e7eb/6b7280?text=${encodeURIComponent(activity + ' ' + n)}`;

export interface ActivitySection {
  id: string;
  title: string;
  description: string;
  /** Optional list items (e.g. for Spiritual Events) */
  listItems?: string[];
  images: CarouselImage[];
}

export const ACTIVITIES: ActivitySection[] = [
  {
    id: 'book-club',
    title: 'Book Club',
    description:
      'A regular gathering for reading and discussion. We choose books together and meet to share reflections and conversation in a relaxed, welcoming setting.',
    images: [1, 2, 3, 4, 5].map((n) => ({
      src: placeholder('Book Club', n),
      alt: `Book Club ${n}`,
    })),
  },
  {
    id: 'neighborhood-cleaning',
    title: 'Local Neighborhood Cleaning',
    description:
      'Community clean-up sessions in our neighborhood. We meet to pick up litter, care for shared spaces, and connect with neighbors who want to make the area a better place for everyone.',
    images: [1, 2, 3, 4, 5].map((n) => ({
      src: placeholder('Neighborhood Cleaning', n),
      alt: `Local Neighborhood Cleaning ${n}`,
    })),
  },
  {
    id: 'films-documentaries',
    title: 'Films & Documentaries',
    description:
      'Screening evenings for films and documentaries, followed by optional discussion. A space to watch together and reflect on the stories that move us.',
    images: [1, 2, 3, 4, 5].map((n) => ({
      src: placeholder('Films & Documentaries', n),
      alt: `Films & Documentaries ${n}`,
    })),
  },
  {
    id: 'spiritual-events',
    title: 'Spiritual Events',
    description:
      'A variety of gatherings for reflection and practice, including spiritual talks, yoga, full moon and new moon rituals, and chanting sessions. All are welcome.',
    listItems: [
      'Spiritual talks',
      'Yoga',
      'Full moon rituals',
      'New moon rituals',
      'Chanting sessions',
    ],
    images: [1, 2, 3, 4, 5].map((n) => ({
      src: placeholder('Spiritual Events', n),
      alt: `Spiritual Events ${n}`,
    })),
  },
];
