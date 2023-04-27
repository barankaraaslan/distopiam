import { Construct } from "constructs";
import { App, Fn, S3Backend, TerraformStack } from "cdktf";
import * as aws from "@cdktf/provider-aws";
import { Workforce } from "../lib/cdktf/workforce";
import { DefaultTerraformStack } from "../lib/cdktf/utils/default-stack";

// class DefaultTerraformStack extends TerraformStack {
//   constructor(scope: Construct, id: string) {
//     super(scope, id);
//     new S3Backend(this, {
//       bucket: "terraform-backend-322343128595",
//       key: id,
//       region: "eu-west-1",
//     });
//   }
// }

class TerraformBackend extends DefaultTerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    new aws.provider.AwsProvider(this, "provider");

    const callerId = new aws.dataAwsCallerIdentity.DataAwsCallerIdentity(
      this,
      "current"
    );
    new aws.s3Bucket.S3Bucket(this, "terraform-backend", {
      bucket: `terraform-backend-${callerId.accountId}`,
    });
  }
}

// // before deploying this stack, iam identity center must be enabled
// class WorkforceManagement extends DefaultTerraformStack {
//   constructor(scope: Construct, id: string) {
//     super(scope, id);
//     new aws.provider.AwsProvider(this, "provider");
//     const ssoAdminInstances =
//       new aws.dataAwsSsoadminInstances.DataAwsSsoadminInstances(
//         this,
//         "intances"
//       );
//     const user = new aws.identitystoreUser.IdentitystoreUser(this, "baran", {
//       displayName: "baran",
//       identityStoreId: Fn.element(ssoAdminInstances.identityStoreIds, 0),
//       name: {
//         familyName: "Karaaslan",
//         givenName: "Baran",
//       },
//       userName: "baran",
//       emails: {
//         primary: true,
//         value: "barankaraaslan@protonmail.com",
//       },
//     });
//     const group = new aws.identitystoreGroup.IdentitystoreGroup(
//       this,
//       "PlatformEngineers",
//       {
//         displayName: "Platform Engineers",
//         identityStoreId: Fn.element(ssoAdminInstances.identityStoreIds, 1),
//       }
//     );
//     const pmSet = new aws.ssoadminPermissionSet.SsoadminPermissionSet(
//       this,
//       "PlatformEngineersPS",
//       {
//         instanceArn: Fn.element(ssoAdminInstances.arns, 0),
//         name: "PlatformEngineers",
//       }
//     );
//     new aws.ssoadminManagedPolicyAttachment.SsoadminManagedPolicyAttachment(
//       this,
//       "PlatformEngineersPSAttachment",
//       {
//         instanceArn: Fn.element(ssoAdminInstances.arns, 0),
//         managedPolicyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
//         permissionSetArn: pmSet.arn,
//       }
//     );

//     const callerId = new aws.dataAwsCallerIdentity.DataAwsCallerIdentity(
//       this,
//       "current"
//     );
//     new aws.ssoadminAccountAssignment.SsoadminAccountAssignment(
//       this,
//       "SsoadminAccountAssignment",
//       {
//         instanceArn: Fn.element(ssoAdminInstances.arns, 0),
//         permissionSetArn: pmSet.arn,
//         principalId: group.groupId,
//         principalType: "GROUP",
//         targetId: callerId.accountId,
//         targetType: "AWS_ACCOUNT",
//       }
//     );
//     new aws.identitystoreGroupMembership.IdentitystoreGroupMembership(
//       this,
//       "IdentitystoreGroupMembership",
//       {
//         groupId: group.groupId,
//         identityStoreId: Fn.element(ssoAdminInstances.identityStoreIds, 0),
//         memberId: user.userId,
//       }
//     );
//   }
// }

const app = new App();
new TerraformBackend(app, "TerraformBackend");
new Workforce(app, "Workforce");
app.synth();
