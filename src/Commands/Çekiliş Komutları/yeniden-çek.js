const Command = require("../../Base/Struct/Command");

module.exports = class extends Command {
	constructor(client) {
		super(client, {
			name: "yeniden-çek",
			usage: "[mesaj ID]",
		});
	}

	exec(message, args) {
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
			.reroll(giveaway.messageID, {
				messages: {
					congrat:
						"🎉 Yeni kazanan(lar): {winners}! Tebrikler, **{prize}** çekilişini kazandınız!",
					error: "⛔ Geçerli katılım bulunamadı, kazanan(lar) yeniden çekilemez!",
				},
			})
			.then(() => {
				message.channel.send(
					"☑️ Çekiliş kazanan(lar)ı yeniden çekildi!"
				);
			})
			.catch((e) => {
				if (
					e.startsWith(
						`Giveaway with message ID ${giveaway.messageID} is not ended.`
					)
				) {
					message.channel.send("⛔ Bu çekiliş bitmemiş!");
				} else {
					console.error(e);
					message.channel.send("⛔ Bir hata oluştu...");
				}
			});
	}
};
