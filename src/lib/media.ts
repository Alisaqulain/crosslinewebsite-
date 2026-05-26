/** Cricket & stadium images — verified working URLs (Unsplash + Pexels) */

/** Local assets in /public */
export const localMedia = {
  logo: "/crossline-logo.png",
  heroVideo: "/Cricket_stadium_Crossline_video_202605262345.mp4",
  groundVideo: "/Video-942.mp4",
  stadiumPhoto: "/Crossline_Logo(PDF)_page-0001.jpg",
} as const;

/** Build optimized CDN URLs */
function unsplash(photoId: string, width = 1200) {
  return `https://images.unsplash.com/${photoId}?w=${width}&q=80&auto=format&fit=crop`;
}

function pexels(photoId: number, width = 1200) {
  return `https://images.pexels.com/photos/${photoId}/pexels-photo-${photoId}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
}

/** Verified Unsplash photo IDs (2025–2026 cricket stadium set) */
const US = {
  stadiumAerial: "photo-1774600551775-747997267949",
  stadiumGreen: "photo-1774168062260-b0a1b63026ba",
  stadiumWide: "photo-1774167766011-004b8acb8e3b",
  stadiumSunset: "photo-1771909712681-314d5b0ad6e5",
  practiceNets: "photo-1593341646782-e0b495cff86d",
  cricketBalls: "photo-1566577739112-5180d4bf9390",
  sportsField: "photo-1574629810360-7efbbe195018",
} as const;

/** Verified Pexels photo IDs */
const PX = {
  cricket1: 3800547,
  cricket2: 11455409,
  stadium1: 209977,
  stadium2: 3601094,
  floodlights: 1008155,
  team: 274506,
  field: 274422,
  sports: 1595483,
  action: 433308,
} as const;

export const images = {
  hero: unsplash(US.stadiumAerial, 1920),

  home: {
    ground: unsplash(US.stadiumWide, 1200),
    match: unsplash(US.stadiumGreen, 1200),
    floodlights: unsplash(US.stadiumSunset, 1200),
  },

  slots: {
    morning: pexels(PX.field, 800),
    day: unsplash(US.stadiumGreen, 800),
    afternoon: pexels(PX.cricket1, 800),
    evening: unsplash(US.stadiumSunset, 800),
    night: pexels(PX.floodlights, 800),
  },

  about: {
    hero: unsplash(US.stadiumAerial, 1920),
    story: unsplash(US.stadiumGreen, 1200),
    facilities: unsplash(US.practiceNets, 800),
    pitch: unsplash(US.sportsField, 800),
    team: pexels(PX.cricket2, 800),
    tournament: unsplash(US.stadiumWide, 800),
    floodlit: unsplash(US.stadiumSunset, 800),
    qualityPitch: unsplash(US.sportsField, 800),
    practiceNets: unsplash(US.practiceNets, 800),
  },

  booking: {
    hero: unsplash(US.stadiumGreen, 1920),
    sidebar: unsplash(US.stadiumWide, 800),
    ground: unsplash(US.stadiumAerial, 800),
  },

  live: {
    hero: pexels(PX.cricket2, 1920),
    streaming: pexels(PX.action, 800),
  },

  gallery: {
    hero: pexels(PX.cricket1, 1920),
    aerial: unsplash(US.stadiumAerial, 800),
    matchAction: unsplash(US.stadiumGreen, 800),
    floodlights: unsplash(US.stadiumSunset, 800),
    celebration: pexels(PX.team, 800),
    pitch: unsplash(US.sportsField, 800),
    batsman: pexels(PX.cricket2, 800),
    panorama: unsplash(US.stadiumWide, 800),
    nets: unsplash(US.practiceNets, 800),
    equipment: unsplash(US.cricketBalls, 800),
  },

  contact: {
    hero: unsplash(US.stadiumAerial, 1920),
    map: unsplash(US.stadiumWide, 1200),
    location: unsplash(US.stadiumGreen, 1200),
  },

  rules: {
    hero: unsplash(US.stadiumSunset, 1920),
    groundUsage: unsplash(US.stadiumGreen, 600),
    liability: unsplash(US.sportsField, 600),
    cancellation: unsplash(US.stadiumSunset, 600),
    booking: unsplash(US.practiceNets, 600),
    payment: unsplash(US.cricketBalls, 600),
    prohibited: unsplash(US.practiceNets, 600),
  },

  cta: pexels(PX.team, 1920),
  adminLogin: unsplash(US.stadiumSunset, 1920),

  features: {
    booking: unsplash(US.stadiumGreen, 600),
    payment: unsplash(US.cricketBalls, 600),
    slots: unsplash(US.stadiumSunset, 600),
    email: pexels(PX.team, 600),
    live: pexels(PX.cricket2, 600),
    inventory: unsplash(US.cricketBalls, 600),
    admin: pexels(PX.stadium2, 600),
    mobile: pexels(PX.action, 600),
  },
} as const;

/** Video assets — hero uses local Crossline stadium footage */
export const videos = {
  heroBackground: localMedia.heroVideo,
  stadiumTour: localMedia.heroVideo,
  matchAction: localMedia.heroVideo,
  practiceNets:
    "https://videos.pexels.com/video-files/3135914/3135914-hd_1920_1080_30fps.mp4",
} as const;

/** YouTube embed URLs — cricket / stadium related */
export const youtube = {
  liveMain: "https://www.youtube.com/embed/tpph2AECuVY",
  highlight1: "https://www.youtube.com/embed/wR7F-ttieto",
  highlight2: "https://www.youtube.com/embed/Z5-RoiX9644",
  stadiumDrone: "https://www.youtube.com/embed/1Ee7hDqXxwY",
} as const;

export const galleryMedia = [
  { id: "g1", type: "image" as const, src: images.gallery.aerial, alt: "Stadium aerial view", category: "Stadium" },
  { id: "g2", type: "image" as const, src: images.gallery.matchAction, alt: "Cricket match action", category: "Matches" },
  { id: "g3", type: "image" as const, src: images.gallery.floodlights, alt: "Evening floodlights", category: "Stadium" },
  { id: "g4", type: "image" as const, src: images.gallery.nets, alt: "Practice nets", category: "Facilities" },
  { id: "g5", type: "image" as const, src: images.gallery.celebration, alt: "Team celebration", category: "Events" },
  { id: "g6", type: "image" as const, src: images.gallery.pitch, alt: "Pitch close-up", category: "Stadium" },
  { id: "g7", type: "image" as const, src: images.gallery.batsman, alt: "Batsman at crease", category: "Matches" },
  { id: "g8", type: "image" as const, src: images.gallery.equipment, alt: "Cricket equipment", category: "Facilities" },
  { id: "g9", type: "image" as const, src: images.gallery.panorama, alt: "Ground panorama", category: "Stadium" },
  {
    id: "v1",
    type: "video" as const,
    src: youtube.highlight1,
    poster: images.gallery.matchAction,
    alt: "Cricket batting highlights",
    category: "Videos",
  },
  {
    id: "v2",
    type: "video" as const,
    src: youtube.stadiumDrone,
    poster: images.gallery.aerial,
    alt: "Stadium drone view",
    category: "Videos",
  },
  {
    id: "v3",
    type: "video" as const,
    src: youtube.highlight2,
    poster: images.gallery.floodlights,
    alt: "Match day atmosphere",
    category: "Videos",
  },
];

export const liveMatchVideos = [
  { id: "l1", title: "Crossline Premier League — Final", embed: youtube.liveMain, isLive: true },
  { id: "l2", title: "Weekend League Highlights", embed: youtube.highlight1, isLive: false },
  { id: "l3", title: "Stadium & Ground Tour", embed: youtube.stadiumDrone, isLive: false },
];
