var express = require('express');
var router = express.Router();
const fs = require('fs');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/customers', function(req, res, next) {
  let rawdata = fs.readFileSync('./public/customers.json');
  let customers = JSON.parse(rawdata);
  var numberRegExp = new RegExp("^\\d+$");
  let filter = {
    gender:null,
    car_make:null,
    limit:0,
    page:1
  }
  let validSortKeys = ["first_name", "last_name"];
  let validSortValues = ["ASC", "DESC"];

  if(req.query.gender) {

    filter.gender = req.query.gender;
  }

  if(req.query.car_make) {
    
    filter.car_make = req.query.car_make;
  }

  if(req.query.limit && numberRegExp.test(req.query.limit)) {

    filter.limit = req.query.limit;

    if(req.query.page) {

      filter.page = req.query.page;
    }
  }

  customers = customers.filter(
    customer => (
      (filter.gender == null || customer.gender == req.query.gender)
      &&
      (filter.car_make == null || customer.car_make == req.query.car_make)
    )
  );

  customers = paginate(customers, filter.limit, filter.page);

  if(req.query.sort != null) {

    let splittedSort = req.query.sort.split(":");
    if(typeof splittedSort[0] !== 'undefined' && typeof splittedSort[1] !== 'undefined' && validSortKeys.includes(splittedSort[0]) && validSortValues.includes(splittedSort[1])) {

      customers = sorting(customers, splittedSort[1], splittedSort[0])
    }
  }

  res.json(customers);
});

router.get('/customers/list', function(req, res, next) {
  let rawdata = fs.readFileSync('./public/customers.json');
  let customers = JSON.parse(rawdata);

  if(req.query.filter && req.query.filter.length > 0) {
      
    customers = customers.filter(customer => (customer.first_name == req.query.filter || customer.last_name == req.query.filter));
  }
  res.json(customers);
});

function paginate(array, page_size, page_number) {
  // human-readable page numbers usually start with 1, so we reduce 1 in the first argument
  if(page_size > 0) {

    return array.slice((page_number - 1) * page_size, page_number * page_size);
  }

  return array;
}

function sorting(array, sortType, sortBy) {

  if(sortType == "ASC") {

    array.sort((a, b) => (a[sortBy] > b[sortBy]) ? 1 : -1);
  } else {

    array.sort((a, b) => (a[sortBy] > b[sortBy]) ? -1 : 1);
  }

  return array;
}

module.exports = router;
