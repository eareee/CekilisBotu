const Command = require("../../Base/Struct/Command");

module.exports = class extends Command {
	constructor(client) {
		super(client, {
			name: "bitir",
			usage: "[mesaj ID]",
		});
	}

	async exec(message, args) {
		if (
			!message.member.hasPermission("MANAGE_MESSAGES") &&
			!message.member.roles.cache.some(
				(r) => r.name === "Çekiliş Yetkilisi"
			)
		) {
			return message.channel.send(
				"⛔ Çekiliş başlatmak için mesajları yönetme iznine veya `Çekiliş Yetkilisi` adlı bir role sahip olmanız gerekmektedir!"
			);
		}

		if (!args[0]) {
			return message.channel.send(
				"⛔ Geçerli bir mesaj IDsi belirtmelisiniz!"
			);
		}

		let giveaway =
			this.client.giveawaysManager.giveaways.find(
				(g) => g.prize === args.join(" ")
			) ||
			this.client.giveawaysManager.giveaways.find(
				(g) => g.messageID === args[0]
			);

		if (!giveaway) {
			return message.channel.send("⛔ Çekiliş bulunamadı.");
		}

		this.client.giveawaysManager
			.edit(giveaway.messageID, {
				setEndTimestamp: Date.now(),
			})
			.then(() => {
				message.channel.send("☑️ Çekiliş bitiriliyor...");
			})
			.catch((e) => {
				if (
					e.startsWith(
						`Giveaway with message ID ${giveaway.messageID} is already ended.`
					)
				) {
					message.channel.send("⛔ Bu çekiliş zaten bitmiş!");
				} else {
					console.error(e);
					message.channel.send("⛔ Bir hata oluştu...");
				}
			});
	}
};
