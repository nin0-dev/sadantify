export type AdManagers = {
    adStateReporter: {
        focusState: any;
        history: History;
        setAdStateKey(e: any, t: any): void;
        onFocusedChanged(element: any): void;
    };
    audio: {
        audioApi: any;
        enabled: boolean;
        getContextAdInfo(): Promise<any>;
        inStreamApi: InStreamApi;
        onAdMessage: (ad: any) => void;
        subscription: any | null;
        disable: () => Promise<void>;
    };
    billboard: {
        activating: boolean;
        billboardApi: {
            adsCoreConnector: any;
        };
        displayBillboard(): Promise<void>;
        enabled: boolean;
        finish(): void;
        focusMinimize(): void;
        focusState: any;
        onActivity(activity: any): Promise<void>;
        onAdMessage(ad: any): void;
        triggerAutoMinimizeIfPossible(): void;
        viewedTimestamp: number;
    };
    config: {
        getAdsSlotConfig(): Promise<any>;
    };
    home: {
        enableLegacyHptoContainerLoader: boolean;
        fetchHomeAd: () => Promise<Ad>;
    };
};

export type InStreamApi = {
    adsCoreConnector: any;
    enabled: boolean;
    inStreamAd: any | null;
    inStreamAdsSubscription: any | null;
    /**
     * I'm just making this up omE
     */
    onAdMessageCallbacks: ((m: any) => void)[];
};

export type Ad = {
    adId: string;
    audio: any[];
    clickthroughUrl: string;
    companions: any[];
    coverArt: any[];
    display: {
        audioFileId?: string;
        bitrate: number;
        duration: number;
        height: number;
        imageFileId?: string;
        mimeType: string;
        text: string;
        url?: string;
        videoManifestId?: string;
        width: number;
    }[];
    format: number;
    isDsaEligible: boolean;
    isDummy: boolean;
    metadata: {
        bookmarkable: string;
    };
    requestId: string;
    slot: string;
    trackingEvents: any;
    video: any[];
};
