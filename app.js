//Author : Veselin Nedyalkov - This is  my solution for the "Drones for deliveries"
//JS is not my primary language and i did my best , base on situatin ,to do the homework
//for more questions you can write to me in discord -=Veso=- or by phone
'use strict';


//this is how VScode automaticaly requer class when i refactor it
//I have an Error msg when try to Import a class at the moment don`t have time to look for solution
const { Drone } = require("./Models/Drone.js");
const { ClassFactory } = require('./Services/ClassFactory');

const pathData1 = './data/data1.json'
const jsonData1 = ReadDataFromJson(pathData1);

const pathData2 = './data/data2.json';
const jsonData2 = ReadDataFromJson(pathData2);

let dronesForDelivery = null;
const workingDayMin = 600; //working day in minutes is calculate base on  10h
exports.workingDayMin = workingDayMin;
const pickingTime = 5;

//use Class Factory in order to create new classes
const dronTypeSmall = ClassFactory('small', jsonData2.typesOfDrones[0]);
const dronTypeMed = ClassFactory('medium', jsonData2.typesOfDrones[1]);
const dronTypeBig = ClassFactory('big', jsonData2.typesOfDrones[2]);

function App() {


    try {
        //use Class Factory in order to create new classes
        const warehouses = ClassFactory("warehouses", jsonData1);
        const customers = ClassFactory("customers", jsonData1);
        const orders = ClassFactory("orders", jsonData1);
        const drones = [dronTypeSmall, dronTypeMed, dronTypeBig];

        let totalTimeMin = 0;

        //callculate min distance from warehouse to customer
        //safe the distance in orders
        //and calculate the total time needed to deliver all orders
        for (let i = 0; i < orders.length; i++) {
            let minTimeToDeliver = Math.ceil(MinDeliveryDistance(orders[i]));
            orders[i].distance = minTimeToDeliver;
            totalTimeMin += minTimeToDeliver;

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

        //this is array of drones wich will do the delivery of orders
        const dronesForOrders = [...new Array(droneNeeded)].map(() => new Drone(dronesForDelivery.totalCapacity, dronesForDelivery.consumption));

        //simulating the drones movement/recharging/picking orders
        console.log("********************");
        RealTimeApp(orders, dronesForOrders);


    } catch (error) {
        console.log(error);
    }



}

function RealTimeApp(orders, drones) {
    for (let i = 1; i <= workingDayMin; i++) {
        //time calculation to return format HH:mm
        let time = WhatIsTheTime();


        DronesWorkingVeryHard(drones, orders, time);

    }
}

let hh = 8; // the start of the working day
let mm = 0;

function WhatIsTheTime() {
    let hour;
    let min;
    mm++;

    if (mm >= 60) {
        hh++;
        mm -= 60;
    }

    //formating the time to be - 01 or 10
    if (hh < 10) {
        hour = `0${hh}`;
    } else {
        hour = hh;
    };

    if (mm < 10) {
        min = `0${mm}`
    } else {
        min = mm;
    };

    return `${hour}:${min}`;
}

function DronesWorkingVeryHard(drones, orders, time) {
    const status = ["free", "picking order", "deliver", "return", "recharging",];
    let pickingOrder = 5;//time in min for picking client order from warehouse

    const customers = ClassFactory("customers", jsonData1);

    // check the orders min by min if the order is not in progress and there is free drone
    // he will take the order and go to complete it
    for (let k = 0; k < orders.length; k++) {

        //select current order
        let currentOrder = orders[k];


        for (let j = 0; j < drones.length; j++) {

            //select drone
            let curentDrone = drones[j];

            //if the curent order is in progress check:
            if (currentOrder.inProgress) {
                switch (curentDrone.status) {

                    //Drone is delivering
                    case status[1]:
                        //time is 0 the order is departure to deliver the order
                        if (curentDrone.timeToComplete <= 0) {

                            curentDrone.timeToComplete = curentDrone.order.distance;
                            curentDrone.status = status[2];
                            console.log(`${time} - The drone is delivery products to ${customers.find(cust => cust.id === currentOrder.customerId).name}.
                                \nThe time to delivery will be in next ${curentDrone.timeToComplete}min.`);
                            console.log("********************");

                        }
                        else {
                            //time is passing
                            curentDrone.timeToComplete--;
                        }
                        break;

                    //drone delivered the order and it`s going back to the warehouse
                    case status[2]:

                        if (curentDrone.timeToComplete <= 0) {
                            curentDrone.timeToComplete = curentDrone.order.distance;
                            curentDrone.status = status[3];
                            console.log(`${time} - Delivery completed. The drone is returning to warehouse.
                                \nTime to return ${curentDrone.timeToComplete}.`);
                            console.log("********************");
                        }
                        else {
                            //time is passing
                            curentDrone.timeToComplete--;
                            curentDrone.capacity -= curentDrone.consumption;
                        }

                        break;

                    //the drone is back to base and reset for new order
                    case status[3]:

                        if (curentDrone.timeToComplete <= 0) {
                            curentDrone.status = status[0];
                            curentDrone.order = null;
                            console.log(`${time} - Drone is back to base and ready for new order!`);
                            console.log("********************");
                        }
                        else {
                            //time is passing
                            curentDrone.timeToComplete--;
                            curentDrone.capacity -= curentDrone.consumption;
                        }
                        break;


                    //recharging completed
                    case status[4]:
                        if (curentDrone.timeToComplete <= 0) {
                            curentDrone.status = [0];
                        }
                        break;


                    default:
                        break;
                }
            }
            else if (curentDrone.order === null) {
                //check if the capacity of the drone is enought for the voyage if no recharg
                if (curentDrone.capacity < (currentOrder.distance * curentDrone.consumption)) {
                    curentDrone.status = status[4];
                    curentDrone.timeToComplete = curentDrone.DronRecharge(curentDrone.capacity);
                    continue;
                }
                else {
                    //the drone is picking up a order to deliver to a client
                    curentDrone.order = currentOrder;
                    curentDrone.timeToComplete = pickingOrder;
                    curentDrone.status = status[1];
                    currentOrder.inProgress = true;
                    console.log(`${time} - One drone is prepearing the order for a client ${customers.find(cust => cust.id === currentOrder.customerId).name}.
                        \nThe products to delivery :`);
                    console.log("********************");
                    FormatDataFromObject(currentOrder.productList.products);
                }
            }



        }
    }
}

function FormatDataFromObject(obj) {

    Object.entries(obj).forEach(([key, value]) => {
        console.log(`${key} - ${value}`);

    });
}




function ReadDataFromJson(path) {
    const fs = require('fs');
    let jsonData = fs.readFileSync(path);
    let inputData = JSON.parse(jsonData);

    return inputData;
}



//Accepting that drones need to be from the same type in order be more easy to maintan
//and base on the distance we pick the proper one/ones
function CalculateDroneNeeded(orders, drones) {
    let capacityEnought = true;

    //check min capacity needed to complete all orders starting
    //from the lowers tiype of drones
    for (let i = 0; i < drones.length; i++) {
        capacityEnought = true;

        //check if the distance is enought for the dron capacity
        for (let j = 0; j < orders.length; j++) {
            let totalConsumption = (orders[j].distance * 2) * drones[i].consumption;

            if (drones[i].capacity > totalConsumption) {
                continue;
            }
            else {
                capacityEnought = false;
                break;
            }

        }

        //0 - small type / 1 - medium type / 2- large type
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


            let orderTotalDistance = (orders[j].distance * 2);
            let calculateCapacityForTrip = drone.capacity - (orderTotalDistance * drone.consumption);

            //if capacity for the trip si enought - add the time for traveling
            // + the time for loading
            if (calculateCapacityForTrip < orderTotalDistance) {
                totalTime += orderTotalDistance + timeForLoadingMin;
                drone.capacity -= calculateCapacityForTrip;
            }
            else {
                //if no - add also time for dron recharging
                console.log(drone.DronRecharge(drone.capacity))
                totalTime += orderTotalDistance + timeForLoadingMin + drone.DronRecharge(drone.capacity);
            }


            //if total time is enought - continie
            //if not - add one more dron and start again
            if (totalTime > workingDayMinPerDrone) {
                dronesNedded++;
                totalTime = 0;
                //recursion calling the method - add one more dron and now 
                //we increase the working day base on that tha each dron can work 10 hours
                NumberOfDrones();
                break;
            }

        }
        return dronesNedded;
    }
}


App();