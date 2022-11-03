import { EmbedBuilder, Message } from "discord.js";
import path from "path";


export const parseAttachments = (message: Message) => {
  if (message.attachments.size > 0) {
    for (const attachment of message.attachments.entries()) {
      const img = attachment[1];
      if ([".jpg", ".png", ".gif", ".jpeg", ".bmp"].includes(path.extname(img?.name?.toLowerCase() ?? ""))) {
        return img.url;
      }
    }
  }
};

export const createMsgEmbed = (title: string, msg: string, author: string, authorimg: string, msgImage?: string) => {
  const embed = new EmbedBuilder()
    .setAuthor({
      name: author,
      iconURL: authorimg
    })
    .setColor("#E95578")
    .setTitle(title)
    .setDescription(msg)
    .setTimestamp(new Date());
  if (msgImage) embed.setImage(msgImage);
  return {
    embeds: [embed]
  };
};

export const doesMessageContain = (message = "", dict: string[] = []) => {
  const lowerMsg = message.toLowerCase();
  return !!dict.find(w => lowerMsg === w.toLowerCase());
};
