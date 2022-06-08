import axios from "axios";
import config from "./config";
import { APIUser, RESTGetAPIUserResult, RESTPostOAuth2AccessTokenResult } from "discord-api-types/v10";
const axiosInstance = axios.create({
    baseURL: `https://discord.com/api`,
});

export function getDiscordOAuthTokens(code: string) {
    return new Promise<RESTPostOAuth2AccessTokenResult>((resolve, reject) => {
        axiosInstance.post<RESTPostOAuth2AccessTokenResult>("/oauth2/token", new URLSearchParams({
            client_id: config.discordClientId,
            client_secret: config.discordClientSecret,
            code,
            grant_tdype: "authorization_code",
            redirect_uri: config.discordRedirectUri,
        })).then(response => resolve(response.data)).catch(reject);
    })
}

export function getDiscordUserData() {
    return new Promise<APIUser>((resolve, reject) => {
        axiosInstance.get<RESTGetAPIUserResult>("/users/@me", {
            headers: {
                Authorization: `Bot ${config.discordBotToken}`,
            },
        }).then(response => resolve(response.data)).catch(reject);
    })
}