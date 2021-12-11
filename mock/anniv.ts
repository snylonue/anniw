import { MockMethod } from "vite-plugin-mock";

export default [
    {
        url: "/api/info",
        method: "get",
        response: () => {
            return {
                status: 0,
                data: {
                    site_name: "某昨的音乐小屋",
                    description: "摸了 摸了",
                    protocol_version: "1",
                    features: ["2fa", "invite"],
                },
            };
        },
    },
    {
        url: "/api/user/login",
        method: "post",
        response: () => {
            return {
                status: 0,
                data: {
                    user_id: "1",
                    username: "Test-User",
                    email: "mail@example.com",
                    nickname: "Test-User",
                },
            };
        },
    },
    {
        url: "/api/user/revoke",
        method: "post",
        response: () => {
            return {
                status: 0,
                data: {},
            };
        },
    },
] as MockMethod[];
