export const URL_SERVER = "http://play.degrensrp.be:30120";
export const FETCH_OPS = {
  cache: "no-cache",
  method: "GET",
  headers: {
    "User-Agent": `De-Grens bot, Node ${process.version} (${process.platform}${process.arch})`
  }
};

export const DG_COLOR = 0xE85476;

// dg server
// export const logChannels = {
//   roleChanges: "1029370423965667409"
// };

// export const roleIds = {
//   staff: "747854877094576129",
//   dev: "738152103868104727",
//   hoofdIntaker: "976540824663916544",
//   intaker: "832985559986602036",
//   intakerTrainee: "999236214244769802",
//   burger: "748523650461859993",
// };

// export const channels = {
//   bugSendChannel: "876533825105174578",
//   bugReceiveChannel: "979481431669620746",
//   suggestionChannel: "756205371638677564",
//   TODO: Add dg log channel
//   messageLogChannel: "978724877546692638",
//   intakeInfoChannel: "873620465543966800",
// };

// DEV
export const logChannels = {
  roleChanges: "931226803832516699"
};

export const roleIds = {
  staff: "747854877094576129",
  dev: "1029358673358761994",
  hoofdIntaker: "976540824663916544",
  intaker: "755025611617206273",
  intakerTrainee: "999236214244769802",
  burger: "755025616310501426",
};

export const channels = {
  // Where bugs are send by users
  bugSendChannel: "978724818880962590",
  // Where bugs are posted
  bugReceiveChannel: "978724834987110400",
  suggestionChannel: "978724858697515028",
  messageLogChannel: "978724877546692638",
  intakeInfoChannel: "978724894793683045",
};

export const patreonRoleIds = {
  general: "711196903429374003",
  5: "762947901974380554",
  10: "762947978830151710",
  20: "762948041438396416",
  50: "762948093754343445",
};
