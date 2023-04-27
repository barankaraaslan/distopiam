interface WorkfoceConfig {
  identityStoreIdKeyName: string;
  identityArnKeyName: string;
  userIds: Map<string, string>;
}
let userIds = new Map<string, string>();
userIds.set("baran", "/workforce/baran-userId");
export const workforceConfig: WorkfoceConfig = {
  identityStoreIdKeyName: "/workforce/identityStoreId",
  identityArnKeyName: "/workforce/identityArn",
  userIds: userIds,
};
