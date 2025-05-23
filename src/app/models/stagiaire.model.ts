import { Supervisor } from "./supervisor.model";

export interface Stagiaire {
    id?: number;
    name: string;
    surname: string;
    profile: string;
    email: string;
    number: string;
    startDate : string;
    endDate: string;
    provenance: string;
    supervisor: Supervisor;
    theme: string;
    profession: string;
    duree?: number; // optional: calculated automatically
}





