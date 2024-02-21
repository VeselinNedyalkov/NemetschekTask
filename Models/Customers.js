'use strict';
const { Cordinates } = require('./Cordinates');

class Customers {
    constructor(id, name, x, y) {
        this.customerId = id;
        this.name = name;
        this.coordinates = new Cordinates(x, y);
    }
}
exports.Customers = Customers;
