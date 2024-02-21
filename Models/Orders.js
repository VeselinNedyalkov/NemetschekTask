'use strict';
const { Products } = require('./Products');

class Orders {
    constructor(customerId, productList) {
        this.customerId = customerId;
        this.productList = new Products(productList);
    }
}
exports.Orders = Orders;
