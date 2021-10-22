export default interface Post {
    id: number;
    title: string;
    content: string;
    created_at: string;
    updated_at: string;
    views: number;
    copyright_holder: string;
    owner_id: number;
    category: string;
}