import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { join } from "path";
import {
  Cors,
  LambdaIntegration,
  ResourceOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Billing, TableV2 } from "aws-cdk-lib/aws-dynamodb";

export class TsRestApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const employeeTable = new TableV2(this, "EmployeeTable", {
      partitionKey: {
        name: "id",
        type: AttributeType.STRING,
      },
      billing: Billing.onDemand(),
    });

    const employeeLambda = new NodejsFunction(this, "Ts-EmployeeLambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: join(__dirname, "..", "services", "handler.ts"),
      environment: {
        TABLE_NAME: employeeTable.tableName,
      },
    });

    employeeTable.grantReadWriteData(employeeLambda);

    const api = new RestApi(this, "EmployeeApi");

    const optionsWithCors: ResourceOptions = {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
        allowMethods: Cors.ALL_METHODS,
      },
    };

    const employeeResource = api.root.addResource("employee", optionsWithCors);

    const employeeLambdaIntegration = new LambdaIntegration(employeeLambda);

    employeeResource.addMethod("GET", employeeLambdaIntegration);
    employeeResource.addMethod("POST", employeeLambdaIntegration);
  }
}
