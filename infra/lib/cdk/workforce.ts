import { Stack, StackProps } from "aws-cdk-lib";
import { CfnGroup, CfnGroupMembership } from "aws-cdk-lib/aws-identitystore";
import { StringParameter } from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import { workforceConfig } from "../config/workforce";
import { CfnAssignment, CfnPermissionSet } from "aws-cdk-lib/aws-sso";

export class Workforce extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    const identityStoreId = StringParameter.fromStringParameterName(
      this,
      "identityStoreId-StringParameter",
      workforceConfig.identityStoreIdKeyName
    ).stringValue;

    const instanceArn = StringParameter.fromStringParameterName(
      this,
      "instanceArn-StringParameter",
      workforceConfig.identityArnKeyName
    ).stringValue;

    const baranUserId = StringParameter.fromStringParameterName(
      this,
      "baran-userId-StringParameter",
      workforceConfig.userIds.get("baran")!
    ).stringValue;

    const group = new CfnGroup(this, "PlatformEngineers-CfnGroup", {
      displayName: "Platform Engineers",
      identityStoreId: identityStoreId,
    });

    new CfnGroupMembership(this, "Baran-PlatformEngineers-CfnGroup", {
      groupId: group.attrGroupId,
      memberId: {
        userId: baranUserId,
      },
      identityStoreId: identityStoreId,
    });

    const pmSet = new CfnPermissionSet(
      this,
      "PlatformEngineers-CfnPermissionSet",
      {
        instanceArn: instanceArn,
        name: "PlatformEngineers",
        managedPolicies: ["arn:aws:iam::aws:policy/AdministratorAccess"],
      }
    );

    new CfnAssignment(this, "PlatformEngineers-CfnAssignment", {
      instanceArn: instanceArn,
      permissionSetArn: pmSet.attrPermissionSetArn,
      principalId: group.attrGroupId,
      principalType: "GROUP",
      targetId: this.account,
      targetType: "AWS_ACCOUNT",
    });
  }
}
