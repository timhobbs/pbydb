export interface DatabaseList {
    name: string;
}

export interface Vpslookup {
    id: number;
    GameFileName: string;
    GameName: string;
    GameDisplay: string;
    MediaSearch: string;
    Manufact: string;
    GameYear: number;
    NumPlayers: number;
    GameType: string;
    Category: string;
    GameTheme: string | null;
    WebLinkURL: string;
    IPDBNum: number;
    AltRunMode: string;
    DesignedBy: string | null;
    Author: string;
    GAMEVER: string;
    Rom: string;
    Tags: string | null;
    VPSID: string;
}

export interface Stats {
    id: number;
    Game: string;
    GameName: string;
    GameSystem: string;
    LastPlayed: string;
    PlayCount: string;
    PlayTime: string;
    IsFavorite: string;
    Rating: string;
    AudioVolume: string;
    Categories: string;
    IsHidden: string;
    DateAdded: string;
    HighScoreStyle: string;
    MarkedForCapture: string;
    ShowWhenRunning: string;
}
