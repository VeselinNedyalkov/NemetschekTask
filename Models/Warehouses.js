'use strict';
const { Cordinates } = require('./Cordinates');

class Warehouses {
    constructor(x, y, name) {
        this.name = name;
        this.cordinates = new Cordinates(x, y);
    }
}
exports.Warehouses = Warehouses;
