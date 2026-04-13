export type AssetPartition = {
  id: string;
  title: string;
  source: number;
};

// Partitions livrées avec l'application (lecture seule)
export const ASSET_PARTITIONS: AssetPartition[] = [
  {
    id: 'mandrakizay',
    title: 'Mandrakizay',
    source: require('./Mandrakizay.txt'),
  },
];
