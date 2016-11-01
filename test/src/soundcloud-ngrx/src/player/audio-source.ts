export class AudioSource extends HTMLAudioElement {}

export const AUDIO_SOURCE_PROVIDER = {
  provide: AudioSource,
  useFactory: () => new Audio()
};
