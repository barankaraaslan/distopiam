#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Git } from "../lib/cdk/git";
import { Network } from "../lib/cdk/network";
import { Compute } from "../lib/cdk/compute";
import { Workforce } from "../lib/cdk/workforce";

const app = new cdk.App();
const vpc = new Network(app, "Network", {}).vpc;
new Git(app, "Git", {});
new Compute(app, "Compute", { vpc: vpc });
new Workforce(app, "Workforce", {});
