const AWS = require("aws-sdk");
AWS.config.update({ region: "eu-west-1" });

AWS.config.setPromisesDependency(require("bluebird"));

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.DYNAMODB_TABLE || "PrometheusServiceDiscovery";

module.exports = {
  dynamoDb,
  tableName,
};
