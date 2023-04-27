import * as aws from "@cdktf/provider-aws";
import { Fn } from "cdktf";
import { Construct } from "constructs";
import { DefaultTerraformStack } from "./utils/default-stack";
import { workforceConfig } from "../config/workforce";
import { shareTerraformProp } from "../utils";
// before deploying this stack, iam identity center must be enabled
export class Workforce extends DefaultTerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new aws.provider.AwsProvider(this, "provider");
    const identityStoreId = Fn.element(
      new aws.dataAwsSsoadminInstances.DataAwsSsoadminInstances(
        this,
        "intances"
      ).identityStoreIds,
      0
    );
    const instanceArn = Fn.element(
      new aws.dataAwsSsoadminInstances.DataAwsSsoadminInstances(
        this,
        "instanceArns"
      ).arns,
      0
    );
    new aws.ssmParameter.SsmParameter(this, "identityStoreId-SsmParameter", {
      name: workforceConfig.identityStoreIdKeyName,
      type: "String",
      value: identityStoreId,
    });

    new aws.ssmParameter.SsmParameter(this, "instanceArn-SsmParameter", {
      name: workforceConfig.identityArnKeyName,
      type: "String",
      value: instanceArn,
    });

    const user = new aws.identitystoreUser.IdentitystoreUser(
      this,
      "baran-IdentitystoreUser",
      {
        displayName: "Baran Karaaslan",
        identityStoreId: identityStoreId,
        name: {
          familyName: "Karaaslan",
          givenName: "Baran",
        },
        userName: "baran",
        emails: {
          primary: true,
          value: "barankaraaslan@protonmail.com",
        },
      }
    );
    new aws.ssmParameter.SsmParameter(this, "baran-userId-SsmParameter", {
      name: workforceConfig.userIds.get("baran")!,
      type: "String",
      value: user.userId,
    });
  }
}
