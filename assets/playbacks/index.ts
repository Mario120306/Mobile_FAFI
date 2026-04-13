export interface PlaybackTrack {
  id: string;
  filename: string;
  source: number;
}

// Ajoutez ici vos fichiers audio mp3 situés dans assets/playbacks.
// Exemple :
// export const PLAYBACK_TRACKS: PlaybackTrack[] = [
//   {
//     id: 'ny-foko',
//     filename: 'ny-foko.mp3',
//     source: require('./ny-foko.mp3'),
//   },
// ];

export const PLAYBACK_TRACKS: PlaybackTrack[] = [
  {
    id: 'fitia-mandainga-zay',
    filename: '_Fitia mandainga_ _Zay.mp3',
    source: require('./_Fitia mandainga_ _Zay.mp3'),
  },
];
