const serverless = require('serverless-http');
const mongoose = require('mongoose');
const express = require('express');

const app = express();
app.use(express.urlencoded({ extended: true, strict: false }));
app.use(express.json());

async function queryData(requestBody) {
  try {
    mongoose.connect(
      process && process.env && process.env.MONGO_URL
        ? process.env.MONGO_URL
        : 'mongodb+srv://challengeUser:WUMglwNBaydH8Yvu@challenge-xzwqd.mongodb.net/getir-case-study?retryWrites=true',
      { useNewUrlParser: true },
      { useUnifiedTopology: true },
    );
    let model;
    try {
      model = mongoose.model('record');
    } catch (error) {
      model = mongoose.model('record', {
        key: String,
        createdAt: Date,
        totalCount: Number,
        counts: Array,
      });
    }
    const queryRes = await model.aggregate(
      [
        {
          $match: {
            createdAt: {
              $gte: new Date(requestBody.startDate),
              $lte: new Date(requestBody.endDate),
            },
          },
        },

        {
          $project: {
            _id: 0,
            key: 1,
            createdAt: 1,
            totalCount: { $sum: '$counts' },
          },
        },
        {
          $match: {
            totalCount: {
              $gt: requestBody.minCount,
              $lt: requestBody.maxCount,
            },
          },
        },
        {
          $sort: {
            createdAt: 1,
            totalCount: -1,
          },
        },
      ],
      (error, result) => {
        error ? console.error(error) : console.log(result);
        return result || null;
      },
    );
    console.log(`queryData res:\n${JSON.stringify(queryRes, null, 2)}`);
    return queryRes;
  } catch (e) {
    console.error(`error at queryData:\n${e}`);
    return null;
  }
}

function validator(requestBody) {
  console.log(`requestBody:\n${JSON.stringify(requestBody, null, 2)}`);
  if (
    !requestBody ||
    !requestBody.startDate ||
    !requestBody.endDate ||
    !requestBody.minCount ||
    !requestBody.maxCount
  ) {
    return { code: 1, msg: 'missing fields!' };
  }
  if (
    !Number.isInteger(requestBody.minCount) ||
    !Number.isInteger(requestBody.maxCount)
  ) {
    return { code: 2, msg: 'minCount and maxCount fields should be number!' };
  }
  if (
    Object.prototype.toString.call(requestBody.startDate) !==
      '[object String]' ||
    Object.prototype.toString.call(requestBody.endDate) !== '[object String]' ||
    !(new Date(requestBody.startDate).getTime() > 0) ||
    !(new Date(requestBody.endDate).getTime() > 0)
  ) {
    return { code: 3, msg: 'startDate and endDate should in valid format!' };
  }
  if (new Date(requestBody.startDate) > new Date(requestBody.endDate)) {
    return { code: 4, msg: 'startDate > endDate' };
  }
  if (requestBody.minCount > requestBody.maxCount) {
    return { code: 5, msg: 'minCount > maxCount' };
  }
  return { code: 0, msg: 'Success' };
}

app.post('/getirMongo', (req, res) => {
  try {
    console.log(req.body);
    const validateRes = validator(req.body);
    if (validateRes.code !== 0) {
      res.status(400).json(validateRes);
    } else {
      queryData(req.body).then((data) => {
        if (!data) {
          console.error('error at app.post request');
          res.status(500).json({ code: 111, msg: 'internal server error!' });
        } else {
          validateRes.records = data;
          res.status(200).json(validateRes);
        }
      });
    }
  } catch (e) {
    console.error(`error at app.post request:\n${e}`);
    res.status(500).json({ code: 111, msg: 'internal server error!' });
  }
});

exports.handler = serverless(app);
exports.validator = validator;
exports.queryData = queryData;
