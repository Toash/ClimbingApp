// valid attributes for user data.
export interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    picturePath?: string;
    friends?: string[];
}