/**
 * DynamoDB Document Client and single-table database access layer.
 * Implements strict user isolation via partition key partitioning (PK = USER#<userId>).
 * Avoids table scans by using GSI1 for all chronological/date queries.
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = process.env.TABLE_NAME || 'SpendWiseTable';
const GSI1_NAME = 'GSI1';

// Initialize AWS SDK DynamoDB Document Client
const baseClient = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(baseClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

/**
 * Build primary keys
 */
export function buildUserPk(userId) {
  return `USER#${userId}`;
}

export function buildTransactionSk(transactionId) {
  return `TX#${transactionId}`;
}

export function buildBudgetSk(month, category) {
  return `BDG#${month}#${category}`;
}

export function buildGsi1Sk(transactionDate, transactionId) {
  return `DATE#${transactionDate}#${transactionId}`;
}

// ------------------------------------------------------------------
// TRANSACTIONS
// ------------------------------------------------------------------

export async function dbGetTransaction(userId, transactionId) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildUserPk(userId),
        SK: buildTransactionSk(transactionId),
      },
    })
  );

  return result.Item || null;
}

export async function dbCreateTransaction(userId, transaction) {
  const item = {
    ...transaction,
    PK: buildUserPk(userId),
    SK: buildTransactionSk(transaction.transactionId),
    GSI1PK: buildUserPk(userId),
    GSI1SK: buildGsi1Sk(transaction.transactionDate, transaction.transactionId),
    userId,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)',
    })
  );

  return item;
}

export async function dbUpdateTransaction(userId, transactionId, updates) {
  // Build dynamic update expression
  const updateKeys = Object.keys(updates);
  if (updateKeys.length === 0) return null;

  const expressionParts = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  updateKeys.forEach((key) => {
    expressionParts.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = updates[key];
  });

  // If transactionDate changed, update GSI1SK too
  if (updates.transactionDate) {
    expressionParts.push('#GSI1SK = :GSI1SK');
    expressionAttributeNames['#GSI1SK'] = 'GSI1SK';
    expressionAttributeValues[':GSI1SK'] = buildGsi1Sk(updates.transactionDate, transactionId);
  }

  // Always touch updatedAt
  const now = new Date().toISOString();
  expressionParts.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = now;

  const result = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildUserPk(userId),
        SK: buildTransactionSk(transactionId),
      },
      UpdateExpression: `SET ${expressionParts.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
      ReturnValues: 'ALL_NEW',
    })
  );

  return result.Attributes;
}

export async function dbDeleteTransaction(userId, transactionId) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildUserPk(userId),
        SK: buildTransactionSk(transactionId),
      },
      ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
    })
  );
}

export async function dbQueryTransactions(userId, {
  month,
  startDate,
  endDate,
  category,
  type,
  limit = 20,
  nextToken,
}) {
  const userPk = buildUserPk(userId);
  let keyConditionExpression = '#GSI1PK = :userPk';
  const expressionAttributeNames = {
    '#GSI1PK': 'GSI1PK',
  };
  const expressionAttributeValues = {
    ':userPk': userPk,
  };

  // Date constraints via GSI1SK
  if (month) {
    keyConditionExpression += ' AND begins_with(#GSI1SK, :monthPrefix)';
    expressionAttributeNames['#GSI1SK'] = 'GSI1SK';
    expressionAttributeValues[':monthPrefix'] = `DATE#${month}`;
  } else if (startDate && endDate) {
    keyConditionExpression += ' AND #GSI1SK BETWEEN :startDate AND :endDate';
    expressionAttributeNames['#GSI1SK'] = 'GSI1SK';
    expressionAttributeValues[':startDate'] = `DATE#${startDate}`;
    expressionAttributeValues[':endDate'] = `DATE#${endDate}#~`;
  } else if (startDate) {
    keyConditionExpression += ' AND #GSI1SK >= :startDate';
    expressionAttributeNames['#GSI1SK'] = 'GSI1SK';
    expressionAttributeValues[':startDate'] = `DATE#${startDate}`;
  } else if (endDate) {
    keyConditionExpression += ' AND #GSI1SK <= :endDate';
    expressionAttributeNames['#GSI1SK'] = 'GSI1SK';
    expressionAttributeValues[':endDate'] = `DATE#${endDate}#~`;
  }

  // Optional category/type filtering
  const filterParts = [];
  if (category && category !== 'ALL') {
    filterParts.push('#category = :category');
    expressionAttributeNames['#category'] = 'category';
    expressionAttributeValues[':category'] = category;
  }
  if (type && type !== 'ALL') {
    filterParts.push('#type = :type');
    expressionAttributeNames['#type'] = 'type';
    expressionAttributeValues[':type'] = type;
  }

  const queryParams = {
    TableName: TABLE_NAME,
    IndexName: GSI1_NAME,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ScanIndexForward: false, // Newest first
    Limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
  };

  if (filterParts.length > 0) {
    queryParams.FilterExpression = filterParts.join(' AND ');
  }

  // Handle pagination token (Base64 encoded LastEvaluatedKey)
  if (nextToken) {
    try {
      const decodedKey = JSON.parse(Buffer.from(nextToken, 'base64').toString('utf-8'));
      queryParams.ExclusiveStartKey = decodedKey;
    } catch {
      // Ignore malformed token
    }
  }

  const result = await docClient.send(new QueryCommand(queryParams));

  let responseNextToken = null;
  if (result.LastEvaluatedKey) {
    responseNextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString('base64');
  }

  return {
    items: result.Items || [],
    nextToken: responseNextToken,
  };
}

// ------------------------------------------------------------------
// BUDGETS
// ------------------------------------------------------------------

export async function dbGetBudgetsForMonth(userId, month) {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: '#PK = :userPk AND begins_with(#SK, :budgetPrefix)',
      ExpressionAttributeNames: {
        '#PK': 'PK',
        '#SK': 'SK',
      },
      ExpressionAttributeValues: {
        ':userPk': buildUserPk(userId),
        ':budgetPrefix': `BDG#${month}#`,
      },
    })
  );

  return result.Items || [];
}

export async function dbGetBudget(userId, month, category) {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildUserPk(userId),
        SK: buildBudgetSk(month, category),
      },
    })
  );

  return result.Item || null;
}

export async function dbSaveBudget(userId, budget) {
  const item = {
    ...budget,
    PK: buildUserPk(userId),
    SK: buildBudgetSk(budget.month, budget.category),
    userId,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
    })
  );

  return item;
}

export async function dbDeleteBudget(userId, month, category) {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        PK: buildUserPk(userId),
        SK: buildBudgetSk(month, category),
      },
      ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
    })
  );
}
