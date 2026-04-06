interface VideoPlayerProps {
    hlsUrl: string | null;
    onTimeUpdate?: (seconds: number) => void;
    onEnded?: () => void;
    autoPlay?: boolean;
}
export interface VideoPlayerHandle {
    play: () => void;
    pause: () => void;
    getCurrentTime: () => number;
}
export declare const VideoPlayer: import("react").ForwardRefExoticComponent<VideoPlayerProps & import("react").RefAttributes<VideoPlayerHandle>>;
export {};
//# sourceMappingURL=VideoPlayer.d.ts.map