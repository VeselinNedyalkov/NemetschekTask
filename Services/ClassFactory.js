'use strict';
const { Drone } = require('../Models/Drone');
const { Customers } = require('../Models/Customers');
const { Cordinates } = require('../Models/Cordinates');
const { Products } = require('../Models/Products');
const { Warehouses } = require('../Models/Warehouses');
const { Orders } = require('../Models/Orders');

function ClassFactory(name, jsonData) {

    switch (name.toLowerCase()) {

        case "cordinates":
            return new Cordinates(jsonData["map-top-right-coordinate"].x, jsonData["map-top-right-coordinate"].y);

        case "products":
            return jsonData.products.map(prod => new Products(prod));

        case "warehouses": return jsonData.warehouses.map(ware => new Warehouses(ware.x, ware.y, ware.name));

        case "customers": return jsonData.customers.map(curt => new Customers(curt.id, curt.name, curt.coordinates));

        case "orders": return jsonData.orders.map(ord => new Orders(ord.customerId, ord.productList));

        case "small": return new Drone(Number(`${GetDroneCapacity(jsonData)}`), Number(`${GetDronConsumption(jsonData)}`));

        case "medium": return new Drone(Number(`${GetDroneCapacity(jsonData)}`), Number(`${GetDronConsumption(jsonData)}`));

        case "big": return new Drone(Number(`${GetDroneCapacity(jsonData)}`), Number(`${GetDronConsumption(jsonData)}`));

        default: throw new Error("Wrong class name!");
    }

}

exports.ClassFactory = ClassFactory;


function GetDroneCapacity(jsonData) {
    return jsonData.capacity.includes("kW") ? jsonData.capacity.substring(0, jsonData.capacity.length - 2) * 1000 : jsonData.capacity.substring(0, jsonData.capacity.length - 1);
}
function GetDronConsumption(jsonData) {
    return jsonData.consumption.includes("kW") ? (jsonData.consumption.substring(0, jsonData.consumption.length - 2) * 1000) : jsonData.consumption.substring(0, jsonData.consumption.length - 1);
}
