const app = require('../app.js');
const { expect } = require('chai');

describe('request body validation test', () => {
  test('missing field test for empty body', () => {
    const validation = app.validator({});
    expect(validation.code).to.equal(1);
    expect(validation.msg).to.equal('missing fields!');
  });
  test('isNumber check for minCount and maxCount', () => {
    const validation = app.validator({
      startDate: '2016-02-02',
      endDate: '2017-12-15',
      minCount: '1000',
      maxCount: '2200',
    });
    expect(validation.code).to.equal(2);
    expect(validation.msg).to.equal(
      'minCount and maxCount fields should be number!',
    );
  });
  test('isString check for startDate and endDate', () => {
    const validation = app.validator({
      startDate: 2222,
      endDate: 222,
      minCount: 1000,
      maxCount: 2200,
    });
    expect(validation.code).to.equal(3);
    expect(validation.msg).to.equal(
      'startDate and endDate should in valid format!',
    );
  });
  test('valid date check for startDate and endDate', () => {
    const validation = app.validator({
      startDate: 'asd',
      endDate: 'dsa',
      minCount: 1000,
      maxCount: 2200,
    });
    expect(validation.code).to.equal(3);
    expect(validation.msg).to.equal(
      'startDate and endDate should in valid format!',
    );
  });
  test('endDate > startDate check', () => {
    const validation = app.validator({
      startDate: '2036-02-02',
      endDate: '2017-12-15',
      minCount: 1000,
      maxCount: 2200,
    });
    expect(validation.code).to.equal(4);
    expect(validation.msg).to.equal('startDate > endDate');
  });
  test('minCount should be <= maxCount check', () => {
    const validation = app.validator({
      startDate: '2016-02-02',
      endDate: '2017-12-15',
      minCount: 3000,
      maxCount: 2200,
    });
    expect(validation.code).to.equal(5);
    expect(validation.msg).to.equal('minCount > maxCount');
  });
  test('success check', () => {
    const validation = app.validator({
      startDate: '2016-02-02',
      endDate: '2017-12-15',
      minCount: 1000,
      maxCount: 2200,
    });
    expect(validation.code).to.equal(0);
    expect(validation.msg).to.equal('Success');
  });
});

describe('query data test', () => {
  test('query test for given input should give result with length greater than 0', async () => {
    const queryRes = await app.queryData({
      startDate: '2016-02-06',
      endDate: '2016-02-07',
      minCount: 1000,
      maxCount: 3000,
    });
    expect(queryRes.length).to.greaterThan(0)
  },30000);
});
