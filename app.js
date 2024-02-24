
'use strict';



const { Drone } = require("./Models/Drone.js");
const { ClassFactory } = require('./Services/ClassFactory');

const pathData1 = './data/data1.json'
const jsonData1 = ReadDataFromJson(pathData1);

const pathData2 = './data/data2.json';
const jsonData2 = ReadDataFromJson(pathData2);
let dronesForDelivery = null;
const workingDayMin = 600; //working day is calculate base on  10h
exports.workingDayMin = workingDayMin;
const pickingTime = 5;

const dronTypeSmall = ClassFactory('small', jsonData2.typesOfDrones[0]);
const dronTypeMed = ClassFactory('medium', jsonData2.typesOfDrones[1]);
const dronTypeBig = ClassFactory('big', jsonData2.typesOfDrones[2]);

function App() {


    try {
        // const mapCordinates = ClassFactory("cordinates", jsonData);
        // const products = ClassFactory("products", jsonData);
        const warehouses = ClassFactory("warehouses", jsonData1);
        const customers = ClassFactory("customers", jsonData1);
        const orders = ClassFactory("orders", jsonData1);
        const drones = [dronTypeSmall, dronTypeMed, dronTypeBig];

        let totalTimeMin = 0;

        for (let i = 0; i < orders.length; i++) {
            let minTimeToDeliver = MinDeliveryDistance(orders[i]);
            orders[i].minDistance = minTimeToDeliver;
            totalTimeMin += minTimeToDeliver + pickingTime;

            i !== (orders.length - 1) && (totalTimeMin += minTimeToDeliver);
        }

        //calculate delivery time in hours
        let hh = Math.floor(totalTimeMin / 60);
        //calculate the minutes
        let mm = Math.round((totalTimeMin / 60 - hh) * 60);

        const droneNeeded = CalculateDroneNeeded(orders, drones);

        //result
        console.log(`The time to deliver all orders is ${Math.round(totalTimeMin)} min,\nor ${hh} hours and ${mm} min.`);
        console.log(`Total drons needed to complete the delivery in 1 day is ${droneNeeded} drones.`);

        function MinDeliveryDistance(order) {
            try {
                let minDistance = Number.MAX_VALUE;

                let customer = customers.find(customer => order.customerId === customer.id);

                for (let i = 0; i < warehouses.length; i++) {
                    let distance = CalculateDistance(customer, warehouses[i])

                    if (distance < minDistance) {
                        minDistance = distance;
                    }
                }

                customer.distance = minDistance;
                return minDistance;
            } catch (error) {
                console.log(error);
            }
        }

        function CalculateDistance(customer, warehouse) {
            if (!ValidateTheCordinates(jsonData1, customer.cordinates) &&
                !ValidateTheCordinates(jsonData1, warehouse.cordinates)) {
                throw Error("The cordinates are outside of the our area!");
            }

            return Math.sqrt(Math.pow(customer.cordinates.x - warehouse.cordinates.x, 2) + Math.pow(customer.cordinates.y - warehouse.cordinates.y, 2));
        }



        function ValidateTheCordinates(jsonData, cordinates) {
            const mapCordinates = ClassFactory("cordinates", jsonData);

            return mapCordinates.x >= cordinates.x && 0 < cordinates.x
                && mapCordinates.y >= cordinates.y && 0 < cordinates.y;
        }

        //all drones needed for delivery 
        const dronesForOrders = [...new Array(droneNeeded)].map(() => new Drone(dronesForDelivery.capacity, dronesForDelivery.consumption));


        RealTimeApp(orders, dronesForOrders);


    } catch (error) {
        console.log(error);
    }



}

function RealTimeApp(orders, drones) {
    let hh = 8;


    for (let i = 1; i <= workingDayMin; i++) {
        let time = WhatIsTheTime(hh, i - 2);

        // DronesWorkingVeryHard(drones, orders, time);

    }
}



function DronesWorkingVeryHard(drones, orders, time) {
    let pickingOrder = 5;
    const customers = ClassFactory("customers", jsonData1);

    for (let k = 0; k < orders.length; k++) {

        let currentOrder = orders[k];

        for (let j = 0; j < drones.length; j++) {

            let curentDrone = drones[j];
            curentDrone.timeToComplete--;

            if (curentDrone.timeToComplete <= 0 && curentDrone.customerId === -1) {


                if (!currentOrder.inProgress) {

                    console.log(`${time} - the drone is picking order for ${customers[currentOrder.customerId].name} time needed ${pickingOrder} min.`);

                    currentOrder.inProgress = true;
                    curentDrone.isWorking = true;
                    curentDrone.timeToComplete = pickingOrder;
                    curentDrone.isWorking = true;
                    curentDrone.customerId = currentOrder.customerId;
                }
            }
            else if (curentDrone.isWorking && curentDrone.customerId === currentOrder.customerId) {

                console.log(`${time} - the drone is going to deliver to ${customers[currentOrder.customerId].name} in ${currentOrder.distance}`);

                if (curentDrone.capacity < (currentOrder.distance * 2)) {
                    currentOrder.distance += curentDrone.DronRecharge();
                    console.log(`The Drone need rechargin! It will take ${curentDrone.DronRecharge()}min`);
                }

                currentOrder.distance--;
            }
            else if (currentOrder.distance === 0 && currentOrder.inProgress === true) {
                console.log(`The drone delivered the products to ${customers[currentOrder.customerId].name}`);
            }
        }
    }
}

function WhatIsTheTime(hh, mm) {
    let count = 1;
    mm++;

    if (mm > 60) {
        hh++;
        mm -= 60 * count;
        count++;
    }

    if (hh < 10) hh = `0${hh}`;
    if (mm < 10) mm = `0${mm}`;

    return `${hh}:${mm}`;
}

function ReadDataFromJson(path) {
    const fs = require('fs');
    let jsonData = fs.readFileSync(path);
    let inputData = JSON.parse(jsonData);

    return inputData;
}



//calculate drones base on lower coast (looking for the smallest posible drone)
function CalculateDroneNeeded(orders, drones) {
    let capacityEnought = true;

    //check min capacity needed to complete all orders starting
    //from the lowers tiype of drones
    for (let i = 0; i < drones.length; i++) {
        capacityEnought = true;

        //check if the distance is enought for the dron capacity
        for (let j = 0; j < orders.length; j++) {

            if (drones[i].capacity > orders[j].minDistance * 2) {
                continue;
            }
            else {
                capacityEnought = false;
                break;
            }

        }

        //0 - small type , 1 - medium type / 2- large type
        if (i === 0 && capacityEnought) {
            dronesForDelivery = dronTypeSmall;
            break;
        }
        else if (i === 1 && capacityEnought) {
            dronesForDelivery = dronTypeMed;
            break;
        } else if (i === 2 && capacityEnought) {
            dronesForDelivery = dronTypeBig;
            break;
        }
    }

    let drone = dronesForDelivery;
    let timeForLoadingMin = 5;
    let totalTime = 0;
    let dronesNedded = 1;
    let totalDrones = NumberOfDrones();
    return totalDrones;

    //check how much drones needed from the type 
    function NumberOfDrones() {

        for (let j = 0; j < orders.length; j++) {
            //calculate working min per day 
            let workingDayMinPerDrone = workingDayMin * dronesNedded;


            let orderTotalDistance = (orders[j].minDistance * 2);
            let calculateCapacityForTrip = drone.capacity - orderTotalDistance;

            //if capacity for the trip si enought - add the time for traveling
            // + the time for loading
            if (calculateCapacityForTrip < orderTotalDistance) {
                totalTime += orderTotalDistance + timeForLoadingMin;
            }
            else {
                //if no - add also time for dron recharging
                totalTime += orderTotalDistance + timeForLoadingMin + drone.DronRecharge(drone.capacity);
            }


            //if total time is enought - continie
            //if not - add one more dron and start again
            if (totalTime > workingDayMinPerDrone) {
                dronesNedded++;
                totalTime = 0;
                NumberOfDrones();
                break;
            }

        }
        return dronesNedded;
    }
}


App();