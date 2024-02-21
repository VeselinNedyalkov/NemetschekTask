
'use strict';

const { Customers } = require('./Models/Customers');
const { Cordinates } = require('./Models/Cordinates');
const { Products } = require('./Models/Products');
const { Warehouses } = require('./Models/Warehouses');
const { Orders } = require('./Models/Orders');

function App() {
    let jsonData = ReadDataFromJson();

    const mapCordinates = ClassFactory("cordinates", jsonData);
    const products = ClassFactory("products", jsonData);
    const warehouses = ClassFactory("warehouses", jsonData);
    const customers = ClassFactory("customers", jsonData);
    const orders = ClassFactory("orders", jsonData);




    console.log(mapCordinates);
}

function ClassFactory(name, jsonData) {
    let className = name.toLowerCase();

    switch (className) {

        case "cordinates":
            return new Cordinates(jsonData["map-top-right-coordinate"].x, jsonData["map-top-right-coordinate"].y);

        case "products":
            return jsonData.products.map(prod => new Products(prod));

        case "warehouses": return jsonData.warehouses.map(ware => new Warehouses(ware.x, ware.y, ware.name));

        case "customers": return jsonData.customers.map(curt => new Customers(curt.id, curt.name, curt.x, curt.y));

        case "orders": return jsonData.orders.map(ord => new Orders(ord.customerId, ord.productList));

        default: throw new Error("Wrong class name!");
    }

}

function ReadDataFromJson() {
    const fs = require('fs');
    let jsonData = fs.readFileSync('./data/data.json');
    let inputData = JSON.parse(jsonData);

    return inputData;
}


App();