'use strict';

class Drone {
    static rechargingTime = 20;

    constructor(totalCapacity, consumption, timeToComplete = 0, isWorking = false, customerId = -1) {
        this.totalCapacity = totalCapacity;
        this.consumption = consumption;
        this.capacity = totalCapacity;
        this.timeToComplete = timeToComplete;
        this.isWorking = isWorking;
        this.customerId = customerId;
    }

    DronRecharge(droneCapacity) {
        let batteryProcent = ((this.totalCapacity - droneCapacity) / this.totalCapacity) * 100;
        return Math.ceil((this.rechargingTime * batteryProcent) / 100);
    }

}

exports.Drone = Drone;


