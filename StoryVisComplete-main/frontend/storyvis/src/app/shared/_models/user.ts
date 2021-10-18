import { Role } from "./role";
import{ UserInterface } from './userInterface';

export class User {
    _id: string;
    username: number;
    password: string;
    group: UserInterface;
    role: Role;
    token?: string;
}