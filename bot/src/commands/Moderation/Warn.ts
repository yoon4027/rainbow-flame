import { Command } from 'discord-akairo';
import { Message, GuildMember } from 'discord.js';
import { Repository } from 'typeorm';
import { Warn } from '../../models/Warn';

export default class WarnCommand extends Command {
  constructor() {
    super('warn', {
      aliases: ['warn'],
      category: 'Moderation',
      description: {
        content: 'Warn a member in this server',
        usage: 'warn <member> <reason>',
        examples: ['warn MindOfFlame causing a paradoxical dilemma'],
      },
      ratelimit: 3,
      userPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: {
            start: (msg: Message) => `you need to pass in a member to warn!`,
            retry: (msg: Message) => `you need to pass in a valid member to warn!`,
          },
        },
        {
          id: 'reason',
          type: 'string',
          prompt: {
            start: (msg: Message) => `you need to pass a reason to warn the member!`,
          },
        },
      ],
    });
  }
  async exec(message: Message, { member, reason }: { member: GuildMember; reason: string }) {
    const warnRepo: Repository<Warn> = this.client.db.getRepository(Warn);
    if (member.roles.highest.position >= message.member.roles.highest.position && message.author.id !== message.guild.ownerID)
      return message.util.reply("This member has a higher roles or equal roles to you!");

    await warnRepo.insert({
      guild: message.guild.id,
      user: member.id,
      moderator: message.author.id,
      reason: reason
    });
    return message.util.send(`**${member.user.tag}** has been warned by **${message.author.tag}** for **\`${reason}\`**`);


  }
}
