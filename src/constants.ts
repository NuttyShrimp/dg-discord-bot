export const URL_SERVER = "http://play.degrensrp.be:30120";
export const FETCH_OPS = {
  cache: "no-cache",
  method: "GET",
  headers: {
    "User-Agent": `De-Grens bot, Node ${process.version} (${process.platform}${process.arch})`
  }
};

// dg server
export const logChannels = {
  roleChanges: "1029370423965667409"
};

export const roleIds = {
  staff: "747854877094576129",
  dev: "738152103868104727",
  hoofdIntaker: "976540824663916544",
  intaker: "832985559986602036",
  intakerTrainee: "999236214244769802",
  burger: "748523650461859993",
};

// DEV
// export const logChannels = {
//   roleChanges: '931226803832516699'
// }

// export const roleIds = {
//   staff: '747854877094576129',
//   dev: '1029358673358761994',
//   hoofdIntaker: "976540824663916544",
//   intaker: '755025611617206273',
//   intakerTrainee: "999236214244769802",
//   burger: "755025616310501426",
// }

export const patreonRoleIds = {
  general: "711196903429374003",
  5: "762947901974380554",
  10: "762947978830151710",
  20: "762948041438396416",
  50: "762948093754343445",
};
