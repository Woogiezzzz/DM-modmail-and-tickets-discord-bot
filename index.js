const Discord = require('discord.js');
const keepAlive = require('./server');
const db = require('quick.db');
const ms = require('ms');
const botsettings = require('./botsettings.json')


const bot = new Discord.Client({partials: ["MESSAGE", "USER", "REACTION"]});

require("./util/eventHandler")(bot)

const fs = require("fs");
bot.commands = new Discord.Collection();
bot.aliases = new Discord.Collection();

fs.readdir('./commands/', (err, files) => {
	if (err) console.log(err);

	let jsfile = files.filter(f => f.split('.').pop() === 'js');
	if (jsfile.length <= 0) {
		return console.log("[LOGS] Couldn't Find Commands!");
	}

	jsfile.forEach((f, i) => {
		let pull = require(`./commands/${f}`);
		bot.commands.set(pull.config.name, pull);
		pull.config.aliases.forEach(alias => {
			bot.aliases.set(alias, pull.config.name);
		});
	});
});


bot.on("message", async message => {
  if(message.author.bot) return;
  let prefix = botsettings.prefix;
  let messageArray = message.content.split(" ");
  let cmd = messageArray[0];
  let args = message.content.substring(message.content.indexOf(' ')+1);
  
  if(message.content === ">ticket-setup") {
    if(message.author.id != '675359952679731200') return;
    let channel = message.mentions.channels.first();

    let sent = await message.channel.send(new Discord.MessageEmbed()
      .setTitle("Тicket")
      .setDescription("React with 🎫 to open a ticket!")
      .setColor("BLUE")
    );
    message.delete();
    sent.react('🎫');
    db.set(`${message.guild.id}-ticket`, sent.id);
  }

  if(message.content === "close") {
    if(!message.channel.name.includes("ticket-")) return;
    message.channel.delete();
  }
    if (message.content.startsWith('appealwarn')) {
      if(message.channel.type == 'dm') {
        let id = args[0]
        let reason = message.content.split(" ").slice(2).join(" ")
        if(!id) {
        message.delete()
        message.channel.send(`Please add the punishment Id`).then(m => m.delete({ timeout: 5000 }))
        }
        else if (!reason) {
        message.delete()
        message.channel.send(`I cannot send an appeal with no reason.`).then(m => m.delete({ timeout: 5000 }))
        }
        else if (reason < 4) {
        message.delete()
        message.channel.send(`That is too short of a reason please add more`).then(m => m.delete({ timeout: 5000 }))
        }
        if (message.content.includes("eYhh90sEJos3pD")) {
        const embed = new Discord.MessageEmbed()
        .setTitle("Someone is appealing a warn")
        .setDescription(`**User:**\n${message.author.username}\n\n**Warn ID:**\n\`eYhh90sEJos3pD\`\n\n**Reason:**\n${reason}`)
        .setColor("RANDOM")
        message.delete()
        message.channel.send(`Your appeal has been sent and will be reviewed by the staff team :thumbsup:`)
        bot.channels.cache.find(c => c.id === '807163559015874580').send(embed)
    }
      }
      if(message.channel.id !== '807165686732292146') return message.delete()
      let id = args[0]
      let reason = message.content.split(" ").slice(2).join(" ")
      if(!id) {
        message.delete()
        message.channel.send(`Please add the punishment Id`).then(m => m.delete({ timeout: 5000 }))
      }
      else if (!reason) {
        message.delete()
        message.channel.send(`I cannot send an appeal with no reason.`).then(m => m.delete({ timeout: 5000 }))
      }
      else if (reason < 4) {
        message.delete()
        message.channel.send(`That is too short of a reason please add more`).then(m => m.delete({ timeout: 5000 }))
      }
      if (message.content.includes("eYhh90sEJos3pD")) {
      const embed = new Discord.MessageEmbed()
      .setTitle("Someone is appealing a warn")
      .setDescription(`**User:**\n${message.author.username}\n\n**Warn ID:**\n\`eYhh90sEJos3pD\`\n\n**Reason:**\n${reason}`)
      .setColor("RANDOM")
      message.delete()
      message.channel.send(`Your appeal has been sent and will be reviewed by the staff team :thumbsup:`).then(m => m.delete({ timeout: 5000 }))
      bot.channels.cache.find(c => c.id === '807163559015874580').send(embed)
    } 
   } else if (message.channel.id === '807165686732292146') { return message.delete()
   } else if (message.content.includes('dm')) {
     if(!message.channel.type == 'dm') return;
     if(message.channel.type == 'dm') {
       let a = message.author.username
       let b = message.author.discriminator
       let c = message.content.split(" ").slice(1).join(" ")
       if(!c) return message.channel.send("Please specify a statement to put in the Mail")
       let mail = new Discord.MessageEmbed()
       .setTitle("You got mail from DM modmail")
       .setDescription(c)
       .setFooter(a + "#" + b)
       .setTimestamp()
       .setColor("YELLOW")
       message.channel.send("Modmail has been sent to the staff")
       bot.channels.cache.find(c => c.id === '807225089879572490').send(mail)
     }
   } else if(message.channel.type == 'dm') {
     const cool = new Discord.MessageEmbed()
     .setDescription("`appealwarn` - *Appeal any warns that you feel it was a false warn or a warn that unjust by giving it to you*\n\n`dm` - *Put anything so you can talk to mods only for a valid reason like appealing mutes and etc.*")
     .setColor("#00FFFF")
     message.channel.send(cool)
   }
     
  if(!message.content.startsWith(prefix)) return;
  let commandfile = bot.commands.get(cmd.slice(prefix.length)) || bot.commands.get(bot.aliases.get(cmd.slice(prefix.length)))
  if(commandfile) commandfile.run(bot,message,args)
});

bot.on('messageReactionAdd', async (reaction, user) => {
	if(user.partial) await user.fetch();
    if(reaction.partial) await reaction.fetch();
    if(reaction.message.partial) await reaction.message.fetch();

    if(user.bot) return;

    let ticketid = await db.get(`${reaction.message.guild.id}-ticket`);

    if(!ticketid) return;

    if(reaction.message.id == ticketid && reaction.emoji.name == '🎫') {
        reaction.users.remove(user);

        reaction.message.guild.channels.create(`ticket-${user.username}`, {
            permissionOverwrites: [
                {
                    id: user.id,
                    allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
                },
                {
                    id: reaction.message.guild.roles.everyone,
                    deny: ["VIEW_CHANNEL"]
                },
								{
										id: '803911013417222174',
										allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
								},
								{
										id: '803958454540173323',
										allow: ["SEND_MESSAGES", "VIEW_CHANNEL"]
								}
            ],
            type: 'text',
            parent: '800594004126859335',
            reson: `${user.tag} has created a ticket.`
        }).then(async channel => {
            channel.send(`<@${user.id}>`, new Discord.MessageEmbed().setTitle("Welcome to your personal ticket.").setDescription("The staff will contact you soon.").setColor("#6936b8").setFooter('To close the ticket send "close".'))
        })
    }
});

keepAlive();

bot.login(process.env.TOKEN)//can look in the .env file
