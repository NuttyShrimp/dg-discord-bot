import { Client } from "discord.js";
import { roleIds } from "../constants";
import { AddRoleCmd } from "../lib/classes/AddRoleCmd";

export class AddMember extends AddRoleCmd {
  constructor(bot: Client) {
    super(roleIds.burger, 'burger', [roleIds.intaker, roleIds.hoofdIntaker, roleIds.dev], bot)
  }
}

export class AddIntaker extends AddRoleCmd {
  constructor(bot: Client) {
    super(roleIds.intaker, 'intaker', [roleIds.hoofdIntaker], bot)
  }
}

export class AddIntakerTrainee extends AddRoleCmd {
  constructor(bot: Client) {
    super(roleIds.intakerTrainee, 'intakertrainee', [roleIds.hoofdIntaker], bot)
  }
}
