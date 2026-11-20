const hoursAgo = (n) => new Date(Date.now() - n * 60 * 60 * 1000).toISOString();
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();

export const img = (id, w = 1400) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const avatarOf = (gender, n) =>
  `https://randomuser.me/api/portraits/${gender}/${n}.jpg`;

const PROFILES = [
  {
    id: "u_aarav",
    username: "aaravmehta",
    full_name: "Aarav Mehta",
    avatar_url: avatarOf("men", 32),
    bio: "Cinematic worldbuilder. I prompt cities that don't exist yet.",
    created_at: daysAgo(540),
  },
  {
    id: "u_neha",
    username: "nehasingh",
    full_name: "Neha Singh",
    avatar_url: avatarOf("women", 44),
    bio: "3D artist exploring light, foliage and quiet places.",
    created_at: daysAgo(410),
  },
  {
    id: "u_elena",
    username: "elenarossi",
    full_name: "Elena Rossi",
    avatar_url: avatarOf("women", 68),
    bio: "Abstract systems, liquid chrome, colour studies.",
    created_at: daysAgo(620),
  },
  {
    id: "u_marcus",
    username: "marcuschen",
    full_name: "Marcus Chen",
    avatar_url: avatarOf("men", 75),
    bio: "Architecture student. Concrete, glass, impossible geometry.",
    created_at: daysAgo(300),
  },
  {
    id: "u_yuki",
    username: "yukitanaka",
    full_name: "Yuki Tanaka",
    avatar_url: avatarOf("women", 65),
    bio: "Character design and stylised portraits.",
    created_at: daysAgo(275),
  },
  {
    id: "u_diego",
    username: "diegoalvarez",
    full_name: "Diego Alvarez",
    avatar_url: avatarOf("men", 46),
    bio: "Space, nebulae and deep-field composites.",
    created_at: daysAgo(700),
  },
  {
    id: "u_amara",
    username: "amaraokafor",
    full_name: "Amara Okafor",
    avatar_url: avatarOf("women", 26),
    bio: "Environmental storytelling. Mist, moss and morning light.",
    created_at: daysAgo(190),
  },
  {
    id: "u_sofia",
    username: "sofialind",
    full_name: "Sofia Lind",
    avatar_url: avatarOf("women", 90),
    bio: "Art direction & motion. Editorial covers for imaginary magazines.",
    created_at: daysAgo(460),
  },
];

export const DEMO_USER = {
  id: "u_me",
  username: "nayspera",
  full_name: "Alex Rivera",
  avatar_url: avatarOf("men", 12),
  bio: "Exploring generative art one prompt at a time.",
  created_at: daysAgo(120),
};

const POSTS = [
  {
    id: "p_1",
    user_id: "u_aarav",
    title: "Futuristic City - AI Concept",
    description: "Exploring the future of urban living with AI.",
    image_url: img("photo-1477959858617-67f85cf4f1df"),
    category: "AI Generate",
    tags: ["AI Generate", "Environment"],
    created_at: hoursAgo(2),
    stats: { likes: 128, comments: 4, reposts: 36 },
  },
  {
    id: "p_2",
    user_id: "u_neha",
    title: "Magical Forest - 3D Render",
    description: "A peaceful forest scene created in 3D.",
    image_url: img("photo-1518495973542-4542c06a5843"),
    category: "3D",
    tags: ["3D", "Nature"],
    created_at: hoursAgo(5),
    stats: { likes: 96, comments: 3, reposts: 21 },
  },
  {
    id: "p_3",
    user_id: "u_aarav",
    title: "Neon District at Midnight",
    description:
      "Dense street-level geometry with wet asphalt reflections. 84 iterations on the lighting pass.",
    image_url: img("photo-1449824913935-59a10b8d2000"),
    category: "Sci-Fi",
    tags: ["AI Generate", "Sci-Fi", "Environment"],
    created_at: hoursAgo(9),
    stats: { likes: 214, comments: 3, reposts: 48 },
  },
  {
    id: "p_4",
    user_id: "u_elena",
    title: "Chromatic Bloom",
    description:
      "A study of iridescent surfaces folding into themselves. No post-processing.",
    image_url: img("photo-1618005182384-a83a8bd57fbe"),
    category: "Abstract",
    tags: ["Abstract", "Art", "3D"],
    created_at: hoursAgo(14),
    stats: { likes: 342, comments: 3, reposts: 77 },
  },
  {
    id: "p_5",
    user_id: "u_marcus",
    title: "Obsidian Spire",
    description:
      "Brutalist tower study — volumetric shadows, thin atmospheric haze at the base.",
    image_url: img("photo-1487958449943-2429e8be8625"),
    category: "Architecture",
    tags: ["Architecture", "AI Generate"],
    created_at: hoursAgo(20),
    stats: { likes: 189, comments: 3, reposts: 29 },
  },
  {
    id: "p_6",
    user_id: "u_diego",
    title: "Nebula Garden",
    description:
      "Deep-field composite built from three exposures. The dust lanes took the longest.",
    image_url: img("photo-1534796636912-3b95b3ab5986"),
    category: "Space",
    tags: ["Space", "AI Generate", "Art"],
    created_at: hoursAgo(26),
    stats: { likes: 402, comments: 3, reposts: 96 },
  },
  {
    id: "p_7",
    user_id: "u_yuki",
    title: "Portrait of a Sky Nomad",
    description:
      "Character sheet for a desert courier. Stylised skin shading, hand-painted highlights.",
    image_url: img("photo-1531123897727-8f129e1688ce"),
    category: "Character",
    tags: ["Character", "3D", "Art"],
    created_at: hoursAgo(31),
    stats: { likes: 267, comments: 3, reposts: 44 },
  },
  {
    id: "p_8",
    user_id: "u_amara",
    title: "Mist Valley at First Light",
    description:
      "A quiet valley before the fog lifts. Colour graded to feel like early morning film.",
    image_url: img("photo-1470071459604-3b5ec3a7fe05"),
    category: "Nature",
    tags: ["Nature", "Photography", "Environment"],
    created_at: hoursAgo(38),
    stats: { likes: 156, comments: 3, reposts: 18 },
  },
  {
    id: "p_9",
    user_id: "u_elena",
    title: "Liquid Chrome Study",
    description:
      "Melting metal forms, rendered at 8K and cropped for a poster series.",
    image_url: img("photo-1620641788421-7a1c342ea42e"),
    category: "Abstract",
    tags: ["Abstract", "3D"],
    created_at: hoursAgo(45),
    stats: { likes: 298, comments: 3, reposts: 61 },
  },
  {
    id: "p_10",
    user_id: "u_diego",
    title: "Aurora Protocol",
    description:
      "What the sky looks like from a station at 62° north. Long exposure, minimal edit.",
    image_url: img("photo-1419242902214-272b3f66ee7a"),
    category: "Space",
    tags: ["Space", "Sci-Fi", "Photography"],
    created_at: hoursAgo(53),
    stats: { likes: 377, comments: 3, reposts: 82 },
  },
  {
    id: "p_11",
    user_id: "u_marcus",
    title: "Concrete Horizons",
    description:
      "Repetition as scale. I wanted the frame to feel like it keeps going past the edges.",
    image_url: img("photo-1486406146926-c627a92ad1ab"),
    category: "Architecture",
    tags: ["Architecture", "Photography"],
    created_at: hoursAgo(62),
    stats: { likes: 143, comments: 3, reposts: 22 },
  },
  {
    id: "p_12",
    user_id: "u_neha",
    title: "Sunlit Canopy",
    description:
      "God rays through old growth. Displacement map sculpted by hand, then lit in 3D.",
    image_url: img("photo-1441974231531-c6227db76b6e"),
    category: "Nature",
    tags: ["Nature", "3D", "Environment"],
    created_at: hoursAgo(70),
    stats: { likes: 221, comments: 3, reposts: 39 },
  },
  {
    id: "p_13",
    user_id: "u_sofia",
    title: "Editorial Cover Vol. 4",
    description:
      "Cover direction for an issue about synthetic colour. Type set in the same palette.",
    image_url: img("photo-1549490349-8643362247b5"),
    category: "Art",
    tags: ["Art", "Motion", "Abstract"],
    created_at: hoursAgo(80),
    stats: { likes: 175, comments: 3, reposts: 27 },
  },
  {
    id: "p_14",
    user_id: "u_sofia",
    title: "Holographic Terrain",
    description:
      "Height data from a real coastline, recoloured as holographic topography.",
    image_url: img("photo-1635070041078-e363dbe005cb"),
    category: "Abstract",
    tags: ["Abstract", "AI Generate", "Environment"],
    created_at: hoursAgo(94),
    stats: { likes: 312, comments: 3, reposts: 58 },
  },
  {
    id: "p_15",
    user_id: "u_me",
    title: "Signal Bloom - Work in Progress",
    description:
      "Testing a slower colour grade on a nebula render. Still deciding how far to push the bloom.",
    image_url: img("photo-1462331940025-496dfbfc7564"),
    category: "Abstract",
    tags: ["Abstract", "AI Generate", "Space"],
    created_at: hoursAgo(18),
    stats: { likes: 47, comments: 1, reposts: 6 },
  },
];

const COMMENT_POOL = [
  "The lighting here is unreal. What did you use for the haze?",
  "This is the kind of image that makes me want to open Blender again.",
  "Colour palette is doing a lot of work — saved for reference.",
  "The depth in the foreground is my favourite part.",
  "How long was the render on this one?",
  "Feels like a film still. Beautiful composition.",
  "The reflections sell it completely.",
  "Bookmarking this for my mood board.",
];

const SEED_COMMENTS = [
  { post_id: "p_1", user_id: "u_neha", content: "The haze between the towers is so well handled." },
  { post_id: "p_1", user_id: "u_marcus", content: "This is exactly the density I keep failing to get. Prompt notes?" },
  { post_id: "p_1", user_id: "u_elena", content: "Saved instantly. The sky gradient is perfect." },
  { post_id: "p_2", user_id: "u_amara", content: "The light shafts are so soft. Feels genuinely calm." },
  { post_id: "p_2", user_id: "u_aarav", content: "Beautiful render — the moss detail holds up at full size." },
  { post_id: "p_3", user_id: "u_diego", content: "Wet asphalt reflections are the hardest part and you nailed them." },
  { post_id: "p_4", user_id: "u_sofia", content: "This would work as a cover without any type." },
  { post_id: "p_4", user_id: "u_yuki", content: "The iridescence is gorgeous. Any post-processing at all?" },
  { post_id: "p_6", user_id: "u_amara", content: "I could stare at this for an hour." },
  { post_id: "p_9", user_id: "u_marcus", content: "Chrome studies always look flat — this doesn't. Great work." },
  { post_id: "p_12", user_id: "u_elena", content: "The canopy layering reads as real photography." },
  { post_id: "p_14", user_id: "u_yuki", content: "Topographic data as art is such a good idea." },
  { post_id: "p_15", user_id: "u_elena", content: "This palette is heading somewhere good. Push the bloom a little further." },
];

/**
 * Builds a complete, self-consistent demo dataset: profiles, posts, likes,
 * comments, reposts, follows and notifications.
 */
export function createSeedDatabase() {
  const posts = POSTS.map(({ stats, ...post }) => ({ ...post }));

  const likes = [];
  const reposts = [];
  POSTS.forEach((post) => {
    for (let i = 0; i < post.stats.likes; i += 1) {
      likes.push({
        id: `l_${post.id}_${i}`,
        user_id: `guest_${(i * 7) % 997}`,
        post_id: post.id,
        created_at: post.created_at,
      });
    }
    for (let i = 0; i < post.stats.reposts; i += 1) {
      reposts.push({
        id: `r_${post.id}_${i}`,
        user_id: `guest_${(i * 13) % 991}`,
        post_id: post.id,
        created_at: post.created_at,
      });
    }
  });

  const comments = SEED_COMMENTS.map((comment, index) => ({
    id: `c_${index + 1}`,
    created_at: hoursAgo(index * 3 + 1),
    ...comment,
  }));

  const follows = [];
  const followPairs = [
    ["u_me", "u_aarav"],
    ["u_me", "u_neha"],
    ["u_me", "u_diego"],
    ["u_me", "u_elena"],
    ["u_neha", "u_aarav"],
    ["u_aarav", "u_neha"],
    ["u_marcus", "u_aarav"],
    ["u_elena", "u_sofia"],
    ["u_diego", "u_neha"],
    ["u_amara", "u_neha"],
    ["u_yuki", "u_elena"],
    ["u_sofia", "u_marcus"],
    ["u_diego", "u_aarav"],
    ["u_aarav", "u_diego"],
  ];
  followPairs.forEach(([follower_id, following_id], index) => {
    follows.push({
      id: `f_${index + 1}`,
      follower_id,
      following_id,
      created_at: daysAgo(index + 2),
    });
  });

  // Synthetic followers so creator profiles read like an active community.
  [...PROFILES, DEMO_USER].forEach((profile, profileIndex) => {
    const extra = 18 + profileIndex * 7;
    for (let i = 0; i < extra; i += 1) {
      follows.push({
        id: `f_${profile.id}_${i}`,
        follower_id: `guest_f${profileIndex}_${i}`,
        following_id: profile.id,
        created_at: daysAgo(i + 1),
      });
    }
  });

  const bookmarks = [
    { id: "b_1", user_id: "u_me", post_id: "p_4", created_at: hoursAgo(6) },
    { id: "b_2", user_id: "u_me", post_id: "p_9", created_at: hoursAgo(30) },
  ];

  const notifications = [
    {
      id: "n_1",
      recipient_id: "u_me",
      sender_id: "u_aarav",
      type: "like",
      post_id: "p_1",
      is_read: false,
      created_at: hoursAgo(1),
    },
    {
      id: "n_2",
      recipient_id: "u_me",
      sender_id: "u_neha",
      type: "comment",
      post_id: "p_4",
      is_read: false,
      created_at: hoursAgo(3),
    },
    {
      id: "n_3",
      recipient_id: "u_me",
      sender_id: "u_diego",
      type: "follow",
      post_id: null,
      is_read: false,
      created_at: hoursAgo(8),
    },
    {
      id: "n_4",
      recipient_id: "u_me",
      sender_id: "u_elena",
      type: "mention",
      post_id: "p_9",
      is_read: true,
      created_at: hoursAgo(26),
    },
    {
      id: "n_5",
      recipient_id: "u_me",
      sender_id: "u_sofia",
      type: "like",
      post_id: "p_14",
      is_read: true,
      created_at: daysAgo(2),
    },
  ];

  return {
    profiles: [...PROFILES, DEMO_USER].map((profile) => ({ ...profile })),
    posts,
    likes,
    comments,
    reposts,
    follows,
    bookmarks,
    notifications,
  };
}

export { COMMENT_POOL };
