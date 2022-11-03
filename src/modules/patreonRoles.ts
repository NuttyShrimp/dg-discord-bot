import * as Sentry from "@sentry/node";
import { rest } from "../lib/classes/SlashCommands";
import { APIGuildMember, Routes } from "discord-api-types/v10";
import { config } from "../lib/config";
import { patreonRoleIds } from "../constants";
import { bot } from "../lib/botInfo";
import { GuildMember } from "discord.js";
import axios from 'axios';

class PatreonRoles {
  private interval: NodeJS.Timer;

  private async cleanupRoles(members: GuildMember[]) {
    // Intersection of patreonRoleIds and member roles
    const patreonIds = Object.values(patreonRoleIds);
    for (const member of members) {
      const rolesToDelete = member.roles.cache.filter(r => patreonIds.includes(r.id));
      await member.roles.remove(rolesToDelete);
    }
  }

  private async fetchRoles() {
    console.log("Starting Patreon role update");
    try {
      // Fetch members with patreon rank
      const guild = bot.guilds.cache.get(config.GUILD_ID);
      if (!guild) return;
      guild.members.fetch();
      let patreonMembers: GuildMember[] = [];
      for (const roleId of Object.values(patreonRoleIds)) {
        const role = await guild.roles.fetch(roleId);
        if (!role) continue;
        role.members.forEach(m => patreonMembers.push(m));
      }

      const patreonMetaData = await axios.get<{ meta: { count: number } }>(encodeURI("https://www.patreon.com/api/oauth2/api/campaigns/4967469/pledges?page[count]=1"), {
        headers: {
          Authorization: "Bearer NXyL5nFXq9t1MRKZYy0gT-1FKaHYYtBJPCw_FQba7PA",
        }
      });
      if (!patreonMetaData) return;
      if (!patreonMetaData.data.meta.count) return;

      const patreonRes = await axios.get<Patreon.PledeResponse>(encodeURI(`https://www.patreon.com/api/oauth2/api/campaigns/4967469/pledges?page[count]=${patreonMetaData.data.meta.count}&include=patron.null,reward.null`), {
        headers: {
          Authorization: "Bearer NXyL5nFXq9t1MRKZYy0gT-1FKaHYYtBJPCw_FQba7PA",
        }
      });
      const patreonData = patreonRes.data;
      if (!patreonData) return;
      const activePledges = patreonData.data.filter(p => p.attributes.declined_since === null);
      const users = patreonData.included.filter(e => e.type === "user") as Patreon.User[];
      const rewards = patreonData.included.filter(e => e.type === "reward") as Patreon.Reward[];
      for (const pledge of activePledges) {
        const user = users.find(u => u.id === pledge.relationships.patron.data.id);
        const reward = rewards.find(r => r.id === pledge.relationships.reward.data.id);
        const userDiscordId = user?.attributes.social_connections?.discord?.user_id;
        if (!userDiscordId) continue;
        patreonMembers = patreonMembers.filter(m => m.id !== userDiscordId);
        try {
          const discordUser = await rest.get(Routes.guildMember(config.GUILD_ID, userDiscordId)) as APIGuildMember;
          if (!discordUser) return;
          if (!reward?.attributes.discord_role_ids) return;
          for (const role of reward?.attributes?.discord_role_ids ?? []) {
            await rest.put(Routes.guildMemberRole(config.GUILD_ID, userDiscordId, role));
          }
        } catch (e) {
          // console.error(e)
        }
      }
      console.log(`Removing patreon roles for ${patreonMembers.length} member`);
      await this.cleanupRoles(patreonMembers);
      console.log("Updated patreon roles");
    } catch (e) {
      Sentry.captureException(e);
      console.error(e);
    }
  }

  public initialize() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.fetchRoles();
    this.interval = setInterval(() => {
      this.fetchRoles();
    }, 1000 * 60 * 60 * 24);
  }
}

export const patreonRoles = new PatreonRoles();
