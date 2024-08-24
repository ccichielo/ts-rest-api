import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getEmployee } from "./GetEmployee";
import { postEmployee } from "./PostEmployee";

const ddbClient = new DynamoDBClient({});

async function handler(
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> {
  let response: APIGatewayProxyResult = {} as any;

  try {
    switch (event.httpMethod) {
      case "GET":
        const getResponse = await getEmployee(event, ddbClient);
        response = getResponse;
        break;
      case "POST":
        const postResponse = await postEmployee(event, ddbClient);
        response = postResponse;
        break;
    }
  } catch (error: any) {
    response = {
      statusCode: 400,
      body: JSON.stringify(error.message),
    };
  }

  response.headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  };
  return response;
}

export { handler };
