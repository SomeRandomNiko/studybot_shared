import dotenv from 'dotenv';
dotenv.config();

export default {
    authServerPort: process.env.AUTH_SERVER_PORT || 8081,
    apiServerPort: process.env.API_SERVER_PORT || 8080,
    frontendServerUri: process.env.FRONTEND_SERVER_URI || 'http://localhost:4200',
    authServerUri: process.env.AUTH_SERVER_URI || 'http://localhost:8081',
    apiServerUri: process.env.API_SERVER_URI || 'http://localhost:8080',
    mongodbURI: process.env.MONGODB_URI || 'mongodb://localhost:27017/studybot',
    jwtSecret: process.env.JWT_SECRET || 'secret',
    digregClientId: process.env.DIGREG_CLIENT_ID || '',
    digregClientSecret: process.env.DIGREG_CLIENT_SECRET || '',
    digregRedirectUri: process.env.DIGREG_REDIRECT_URI || '',
    discordClientId: process.env.DISCORD_CLIENT_ID || '',
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',
    discordRedirectUri: process.env.DISCORD_REDIRECT_URI || '',
    jwtExpiration: process.env.JWT_EXPIRATION || '1h',
    discordBotToken: process.env.DISCORD_BOT_TOKEN || '',
    guildIds: process.env.GUILD_IDS ? process.env.GUILD_IDS.split(',') : [],
}