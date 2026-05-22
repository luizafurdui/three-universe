export type MediaItem =
  | { type: 'image'; url: string }
  | { type: 'video'; url: string };

const IMAGE_FILES = [
  '038454c526dc1add2b52c3b9c396228c 3.JPEG',
  '7CAE604D-3818-4703-98AD-70D733C4336C 2.JPG',
  '8DACB00B-D12C-4727-8A08-D18E77680D88_1_105_c.jpeg',
  'IMG_1659 2.JPG',
  'IMG_1712.JPG',
  'IMG_1713.JPG',
  'IMG_1714.JPG',
  'IMG_1715.JPG',
  'IMG_1716.JPG',
  'IMG_1717.JPG',
  'IMG_1718.JPG',
  'IMG_1719.JPG',
  'IMG_1720.JPG',
  'IMG_1721.JPG',
  'IMG_1722.JPG',
  'IMG_1723.JPG',
  'IMG_1724.JPG',
  'IMG_1725.JPG',
  'IMG_1726 2.JPG',
  'IMG_1726.JPG',
  'IMG_1727 2.JPG',
  'IMG_1727.JPG',
  'IMG_1728 2.JPG',
  'IMG_1728.JPG',
  'IMG_1729.JPG',
  'IMG_1730.JPG',
  'IMG_1731.JPG',
  'IMG_1732.JPG',
  'IMG_1736.JPG',
  'IMG_1737.JPG',
  'IMG_1738.JPG',
  'IMG_1739.JPG',
  'IMG_1740.JPG',
  'IMG_1741.JPG',
  'IMG_1742.JPG',
  'IMG_1743.JPG',
  'IMG_1744.JPG',
  'IMG_1745.JPG',
  'IMG_1746.JPG',
  'IMG_1747.JPG',
  'IMG_1748.JPG',
  'IMG_1749.JPG',
  'IMG_1750.JPG',
  'IMG_1751.JPG',
  'IMG_1752.JPG',
  'IMG_1753.JPG',
  'IMG_1754.JPG',
  'IMG_1755.JPG',
  'IMG_1756.JPG',
  'IMG_1757.JPG',
  'IMG_1758.JPG',
  'asciikit-2026-05-07T18-15-24 2.PNG',
];

const VIDEO_FILES = [
  'Kapture 2026-05-06 at 20.57.59.mov',
  'Kapture 2026-05-14 at 14.58.43.mov',
  'Kapture 2026-05-15 at 14.20.19.mov',
];

const toUrl = (name: string) => `/media/${encodeURIComponent(name)}`;

export const MEDIA_POOL: MediaItem[] = [
  ...IMAGE_FILES.map((name) => ({ type: 'image' as const, url: toUrl(name) })),
  ...VIDEO_FILES.map((name) => ({ type: 'video' as const, url: toUrl(name) })),
];
