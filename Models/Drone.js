'use strict';

class Drone {
    static rechargingTime = 20;

    constructor(totalCapacity, consumption, status = "free", timeToComplete = 0, order = null) {
        this.totalCapacity = totalCapacity;
        this.consumption = consumption;
        this.capacity = totalCapacity;
        this.status = status;
        this.timeToComplete = timeToComplete;
        this.order = order;
    }

    //take how much % is depleted and then calculate how much time need to fill up to maximum
    DronRecharge(droneCapacity) {
        const rechargingTime = 20;
        let batteryProcent = ((this.totalCapacity - droneCapacity) / this.totalCapacity) * 100;
        return Math.ceil((rechargingTime * batteryProcent) / 100);
    }

}

exports.Drone = Drone;


