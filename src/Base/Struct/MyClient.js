const { Client, Collection } = require("discord.js");
const Logger = require("../Modules/Logger");
const Functions = require("../Functions");
const { PREFIX, TOKEN, AUTHOR_ID } = process.env;
const { GiveawaysManager } = require("discord-giveaways");

class MyClient extends Client {
	constructor(options = {}) {
		super(options);

		this.commands = new Collection();
		this.cooldowns = new Collection();

		this.logger = new Logger();
		this.function = new Functions(this);

		this.prefix = PREFIX;
		this.token = TOKEN;

		this.giveawaysManager = new GiveawaysManager(this, {
			storage: "./giveaways.json",
			updateCountdownEvery: 10000,
			hasGuildMembersIntent: false,
			default: {
				botsCanWin: false,
				embedColor: "#FF0000",
				embedColorEnd: "#000000",
				reaction: "🎉",
			},
		});

		this.once("ready", this.ready);
		this.on("message", this.handle);
	}

	async ready() {
		console.log(`- Bot Etiketi        >   ${this.user.tag}`);
		console.log(`- Sunucu Sayısı      >   ${this.guilds.cache.size}`);
		console.log(`- Komut Sayısı       >   ${this.commands.size}`);
		console.log(`- Davet URL'si       >   ${await this.generateInvite(8)}`);
		this.logger.log("Bot hazır!", "READY");
	}

	handle(message) {
		if (message.author.bot || !message.content.startsWith(this.prefix))
			return;

		let [command, ...args] = message.content
			.slice(this.prefix.length)
			.trim()
			.split(/ +/g);

		let cmd =
			this.commands.get(command.toLowerCase()) ||
			this.commands.find(
				(data) =>
					data.aliases && data.aliases.includes(command.toLowerCase())
			);

		if (!cmd) return;

		if (cmd.guildOnly && !message.guild) return;

		if (cmd.usage && !args.length) {
			let reply = "⛔ Doğru kullanım:";
			if (cmd.usage)
				reply += `\n\`\`\`${this.prefix}${cmd.name} ${cmd.usage}\`\`\``;
			return message.channel.send(reply);
		}

		if (cmd.ownerOnly && message.author.id !== AUTHOR_ID) return;

		if (!this.cooldowns.has(cmd.name))
			this.cooldowns.set(cmd.name, new Collection());

		let now = Date.now();
		let timestamps = this.cooldowns.get(cmd.name);
		let cooldownAmount = cmd.cooldown * 1000;
		if (timestamps.has(message.author.id)) {
			const expirationTime =
				timestamps.get(message.author.id) + cooldownAmount;

			if (now < expirationTime) {
				const timeLeft = (expirationTime - now) / 1000;
				return;
			}
		}

		timestamps.set(message.author.id, now);
		setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

		try {
			cmd.exec(message, args);
		} catch (e) {
			this.logger.log(
				`Komut İşleyici Hatası (${cmd.name}): ${e}`,
				"ERROR"
			);
		}
	}

	async launch() {
		Promise.all([this.function.load(), super.login(this.token)]);
	}
}

module.exports = MyClient;
