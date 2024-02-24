'use strict';
const { Products } = require('./Products');

class Orders {
    constructor(customerId, productList, distance = 0, inProgress = false) {
        this.customerId = customerId;
        this.productList = new Products(productList);
        this.distance = distance;
        this.inProgress = inProgress;
    }
}
exports.Orders = Orders;
