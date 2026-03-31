// Types
export interface PostData {
  title: string;
  content: string;
  excerpt: string;
  coverImage: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'scheduled';
  visibility: 'public' | 'private' | 'followers';
  publishDate?: string;
  allowComments: boolean;
  featured: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

// Sample data
export const categories: Category[] = [
  { id: '1', name: 'Anime Reviews', description: 'In-depth anime series and movie reviews', color: 'pink' },
  { id: '2', name: 'Manga Discussion', description: 'Manga analysis and discussions', color: 'blue' },
  { id: '3', name: 'Character Analysis', description: 'Deep dives into character development', color: 'purple' },
 ];

export const popularTags = [
  'AttackOnTitan', 'OnePiece', 'DemonSlayer', 'JujutsuKaisen', 'MyHeroAcademia',
  'Naruto', 'DragonBall', 'StudioGhibli', 'MAPPA', 'WITStudio', 'Toei',
  'Shonen', 'Seinen', 'Shoujo', 'Isekai', 'Mecha', 'Romance', 'Action',
  'Comedy', 'Drama', 'Thriller', 'Horror', 'Slice of Life'
];
