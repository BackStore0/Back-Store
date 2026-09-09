const express = require('express');
const cors = require('cors');
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ]
});

const BOT_TOKEN = 'MTU0NzAzNTA0OTYyMTE5MjcyNA.G0KrPA.mKkgpIIzBYltE4gKv6Jdu8TFWnW4O99ksEfP5E';
const GUILD_ID = '1412518690963853334';

// مستقبل الطلبات من الموقع لإرسال كود التحقق
app.post('/send-code', async (req, res) => {
    const { username, code } = req.body;
    try {
        const guild = await client.guilds.fetch(GUILD_ID);
        const members = await guild.members.fetch();
        const member = members.find(m => m.user.username.toLowerCase() === username.toLowerCase());

        if (member) {
            const embed = new EmbedBuilder()
                .setTitle('🔐 Back Store - كود التحقق')
                .setDescription(`كود التحقق الخاص بك لترخيص/تسجيل دخول الموقع هو: **${code}**`)
                .setColor('#8a94a6');
            
            await member.send({ embeds: [embed] });
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, message: 'المستخدم غير موجود بالسيرفر' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

client.login(BOT_TOKEN);
app.listen(3000, () => console.log('سيرفر الربط يعمل على المنفذ 3000'));