const Command = require("../../Base/Struct/Command");
const ms = require("ms");

module.exports = class extends Command {
	constructor(client) {
		super(client, {
			name: "başlat",
			usage: "[kanal] [süre] [kazanan sayısı] [ödül]",
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

		let giveawayChannel = message.mentions.channels.first();
		if (!giveawayChannel) {
			return message.channel.send(
				"⛔ Geçerli bir kanalı etiketlemelisiniz!"
			);
		}

		let giveawayDuration = args[1];
		if (!giveawayDuration || isNaN(ms(giveawayDuration))) {
			return message.channel.send("⛔ Geçerli bir süre belirtmelisiniz!");
		}

		let giveawayNumberWinners = args[2];
		if (
			isNaN(giveawayNumberWinners) ||
			parseInt(giveawayNumberWinners) <= 0
		) {
			return message.channel.send(
				"⛔ Geçerli bir kazanan sayısı belirtmelisiniz!"
			);
		}

		let giveawayPrize = args.slice(3).join(" ");
		if (!giveawayPrize) {
			return message.channel.send("⛔ Geçerli bir ödül belirtmelisiniz!");
		}

		this.client.giveawaysManager.start(giveawayChannel, {
			time: ms(giveawayDuration),
			prize: giveawayPrize,
			winnerCount: parseInt(giveawayNumberWinners),
			hostedBy: message.author,
			messages: {
				giveaway: "🎉🎉 **ÇEKİLİŞ** 🎉🎉",
				giveawayEnded: "🎉🎉 **ÇEKİLİŞ SONA ERDİ** 🎉🎉",
				timeRemaining: "Kalan süre: **{duration}**!",
				inviteToParticipate: "Katılmak için 🎉 emojisine tıklayın!",
				winMessage:
					"Tebrikler, {winners}! **{prize}** çekilişini kazandınız! 🎉",
				embedFooter: message.guild.name,
				noWinner: "Çekiliş iptal edildi, geçerli katılım bulunamadı.",
				hostedBy: "Başlatan: {user}",
				winners: "kazanan",
				endedAt: "Şu tarihte sona erdi:",
				units: {
					seconds: "saniye",
					minutes: "dakika",
					hours: "saat",
					days: "gün",
					pluralS: false,
				},
			},
		});

		message.channel.send("☑️ Çekiliş başarıyla başlatıldı!");
	}
};
