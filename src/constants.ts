export const URL_SERVER = 'http://play.degrensrp.be:30120';
export const FETCH_OPS = {
  cache: 'no-cache',
  method: 'GET',
  headers: {
    'User-Agent': `De-Grens bot, Node ${process.version} (${process.platform}${process.arch})`
  }
};
export const roleIds = {
  staff: '747854877094576129',
  // dev: "706903572058603541",
  dev: '738152103868104727',
  intaker: '832985559986602036',
}

export const patreonRoleIds = {
  general: '711196903429374003',
  5: '762947901974380554',
  10: '762947978830151710',
  20: '762948041438396416',
  50: '762948093754343445',
}