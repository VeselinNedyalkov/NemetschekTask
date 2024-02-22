'use strict';
const { Cordinates } = require('./Cordinates');

class Customers {
    constructor(id, name, cordinates) {
        this.id = id;
        this.name = name;
        this.cordinates = new Cordinates(cordinates.x, cordinates.y);
    }
}
exports.Customers = Customers;
