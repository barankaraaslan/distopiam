import { TerraformStack } from "cdktf";
import * as aws from "@cdktf/provider-aws";

export function shareTerraformProp(
  stack: TerraformStack,
  stackId: string,
  propId: string,
  propValue: string
) {
  new aws.provider.AwsProvider(stack, "provider");
  new aws.ssmParameter.SsmParameter(stack, propId, {
    name: `/shared-terraform-prop/${stackId}/${propId}`,
    type: "String",
    value: propValue,
  });
}
