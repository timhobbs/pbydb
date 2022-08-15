export interface Table {
    id: number;
    name: string;
    description: string;
    type?: string;
    rom?: string;
    manufacturer?: string;
    year: number;
    rating: number;
    ipdbid: number;
    vpsid?: string;
    b2s?: string;
    haspup?: boolean;
}
