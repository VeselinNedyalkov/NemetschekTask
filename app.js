
'use strict';

const { Drone } = require('./Models/Drone');
const { Customers } = require('./Models/Customers');
const { Cordinates } = require('./Models/Cordinates');
const { Products } = require('./Models/Products');
const { Warehouses } = require('./Models/Warehouses');
const { Orders } = require('./Models/Orders');

function App() {
    const pathData1 = './data/data1.json'
    const jsonData = ReadDataFromJson(pathData1);

    //not needed here
    // const mapCordinates = ClassFactory("cordinates", jsonData);
    // const products = ClassFactory("products", jsonData);

    try {
        const orders = ClassFactory("orders", jsonData);

        let totalTimeMin = 0;
        const workingDayMin = 600; //working day is calculate base on  10h
        const pickingTime = 5;

        for (let i = 0; i < orders.length; i++) {
            let minTimeToDeliver = MinDeliveryTime(orders[i], jsonData);
            totalTimeMin += minTimeToDeliver + pickingTime;

            i !== (orders.length - 1) && (totalTimeMin += minTimeToDeliver);
        }

        //calculate delivery time in hours
        let hh = Math.floor(totalTimeMin / 60);
        //calculate the minutes
        let mm = Math.round((totalTimeMin / 60 - hh) * 60);

        const droneNeeded = Math.ceil((workingDayMin / totalTimeMin) * orders.length)

        //result
        console.log(`The time to deliver all orders is ${Math.round(totalTimeMin)} min,\nor ${hh} hours and ${mm} min.`);
        console.log(`Total drons needed to complete the delivery is ${droneNeeded} .`);
    } catch (error) {
        console.log(error);
    }

}

function MinDeliveryTime(order, jsonData) {
    try {
        let minDistance = Number.MAX_VALUE;
        const warehouses = ClassFactory("warehouses", jsonData);
        const customers = ClassFactory("customers", jsonData);
        let customer = customers.find(customer => order.customerId === customer.id);

        for (let i = 0; i < warehouses.length; i++) {
            let distance = CalculateDistance(customer, warehouses[i])

            if (distance < minDistance) {
                minDistance = distance;
            }
        }
        return minDistance;
    } catch (error) {
        console.log(error);
    }
}

function CalculateDistance(customer, warehouse) {
    //TO DO check if the cordinates are on the map

    return Math.sqrt(Math.pow(customer.cordinates.x - warehouse.cordinates.x, 2) + Math.pow(customer.cordinates.y - warehouse.cordinates.y, 2));
}


function ClassFactory(name, jsonData) {
    let className = name.toLowerCase();

    switch (className) {

        case "cordinates":
            return new Cordinates(jsonData["map-top-right-coordinate"].x, jsonData["map-top-right-coordinate"].y);

        case "products":
            return jsonData.products.map(prod => new Products(prod));

        case "warehouses": return jsonData.warehouses.map(ware => new Warehouses(ware.x, ware.y, ware.name));

        case "customers": return jsonData.customers.map(curt => new Customers(curt.id, curt.name, curt.coordinates));

        case "orders": return jsonData.orders.map(ord => new Orders(ord.customerId, ord.productList));

        default: throw new Error("Wrong class name!");
    }

}


function ReadDataFromJson(path) {
    const fs = require('fs');
    let jsonData = fs.readFileSync(path);
    let inputData = JSON.parse(jsonData);

    return inputData;
}


App();