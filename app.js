"use strict";

const serverless = require("serverless-http");
const express = require("express");
const app = express();

const dynamo = require("./components/dynamodb");

const tableName = dynamo.tableName;
const dynamoDb = dynamo.dynamoDb;

const uuid = require("uuid");
const Joi = require("joi");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/targets", async function (req, res) {
  try {
    // get all targets from the table (only the target name and url)
    const params = {
      TableName: tableName,
      ProjectionExpression: "targets, labels",
    };

    const result = await dynamoDb.scan(params).promise();

    // return the targets as a JSON array
    return res.status(200).json(result.Items);
  } catch (error) {
    console.log(error);
    // return a 500 response if any errors
    res.status(500).json({ error: error.message });
  }
});

const schema = Joi.object({
  targets: Joi.array().items(Joi.string()).required(),
  labels: Joi.object().required(),
});

app.post("/targets", async function (req, res) {
  try {
    const body = req.body;

    const id = uuid.v4();

    const targets = body.targets;
    const labels = body.labels;

    // validate the request body against the schema
    const validation = schema.validate({ targets, labels });

    // if the validation fails, return a 400 Bad Request response
    if (validation.error) {
      return res.status(400).json({ error: validation.error.message });
    }

    // create the params object for the dynamoDb call
    const params = {
      TableName: tableName,
      Item: {
        id,
        targets,
        labels,
      },
    };

    await dynamoDb.put(params).promise();

    // return a 200 response if no errors
    return res.status(200).json(params.Item);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/targets/:id", async function (req, res) {
  try {
    // get the id from the request path
    const id = req.params.id;

    // create the params object for the dynamoDb call
    const params = {
      TableName: tableName,
      Key: {
        id: id,
      },
    };

    await dynamoDb.delete(params).promise();

    return res.status(200).json({});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports.handler = serverless(app);
