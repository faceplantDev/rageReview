let busDriverNums = require('../enums').busDriver || false;

let colshapes = [];

let workTimeOut = null;

let playerBus = null;

let earnings = 0;

let isWorkActive = false;

mp.isPlyaerInsideBusDriverShape = false;

rentPedCreate(busDriverNums.ped.position, busDriverNums.ped.heading);

function rentPedCreate(position, heading) {
    mp.peds.new(busDriverNums.ped.model, new mp.Vector3(position.x, position.y, position.z), heading, 0);
    colshapes.push(mp.colshapes.newSphere(position.x, position.y, position.z, 2, 0));
    mp.blips.new(408, busDriverNums.ped.position,
        {
            name: `Водитель автобуса`,
            scale: 0.85,
            shortRange: true,
            dimension: 0,
        });
};

let currentTarget = {};

function renderMarker(id) {
    let marker = busDriverNums.markers[id];

    currentTarget[`marker`] = mp.markers.new(marker.type==`road`?21:0, marker.position, 1.5,{
            color: [255, 50, 50, 100],
            dimension: 0
        }).id;
    currentTarget[`blip`] = mp.blips.new(`431`, marker.position, {
        name: `Точка маршрута`,
        scale: 0.5,
        shortRange: true,
        dimension: 0
    }).id;
    currentTarget[`shape`] = mp.colshapes.newSphere(marker.position.x, marker.position.y, marker.position.z, 5, 0).id;
    currentTarget[`type`] = marker.type;
    currentTarget[`id`] = id;

    mp.blips.at(currentTarget[`blip`]).setRoute(true);
};

mp.keys.bind(0x45, true, function() {
    if(!mp.isPlyaerInsideBusDriverShape) return;

    if(workTimeOut != null) return mp.gui.chat.push(`Нельзя так часто использовать это!`);

    workTimeOut = setTimeout(() => {
        clearTimeout(workTimeOut);
        workTimeOut = null;
    }, busDriverNums.timeout.time);

    let currentJob = mp.players.local.getVariable(`job`) || false;
    if(currentJob && currentJob != `busdriver`) return mp.gui.chat.push(`Вы уже устроены на работу ${currentJob}`);

    if(currentJob == `busdriver`) {
        isWorkActive = false;
        mp.events.callRemote(`addMoney`, earnings);
        mp.events.callRemote(`job:getfired`);
        playerBus.destroy();
        mp.gui.chat.push(`Вы уволились с работы водителя автобуса`);
        if(currentTarget) {
            mp.markers.at(currentTarget[`marker`]).destroy();
            mp.blips.at(currentTarget[`blip`]).destroy();
            mp.colshapes.at(currentTarget[`shape`]).destroy();
            currentTarget = {};
        };
        return 
    };

    mp.events.callRemote(`job:getjob`, `busdriver`);
    mp.gui.chat.push(`Вы устроились работать водителем автобуса`);
    mp.gui.chat.push(`Садитесь в автобус, напишите команду /startjob и следуйте дальнейшим подсказкам!`);

});

mp.events.add(`startjob`, () => {
    if(!mp.players.local.vehicle) return mp.gui.chat.push(`Вы не на автобусе!`) ;
    if(mp.players.local.vehicle != playerBus) return mp.gui.chat.push(`Это не ваш рабочий транспорт!`);
    
    earnings = 0;
    isWorkActive = true;

    mp.gui.chat.push(`-----------------------------------`);
    mp.gui.chat.push(`Вы начали работу водителем автобуса.`);
    mp.gui.chat.push(`Ваша задача ездить по точкам и развозить людей.`);
    mp.gui.chat.push(`Ваш текущий заработок отображается в низу экрана.`);
    mp.gui.chat.push(`Деньги будут выплачены после заврешения работы.`);
    mp.gui.chat.push(`-----------------------------------`);

    renderMarker(1);
});

mp.events.add(`playerEnterColshape`, (colshape) => {
    if(currentTarget[`shape`] != colshape.id) return;
    if(!mp.players.local.vehicle) return mp.gui.chat.push(`Вы не на машине`);
    if(mp.players.local.vehicle != playerBus) return mp.gui.chat.push(`Вы не на рабочей машине`);

    let id = currentTarget[`id`];

    mp.markers.at(currentTarget[`marker`]).destroy();
    mp.blips.at(currentTarget[`blip`]).destroy();

    if(busDriverNums.markers[id].type == `road`) {
        mp.colshapes.at(currentTarget[`shape`]).destroy();
        renderMarker(id + 1);
    };

    if(busDriverNums.markers[id].type == `station`) {
        mp.players.local.vehicle.freezePosition(true);
        mp.gui.chat.push(`Остановка. Ждите 10 секунд.`);
        setTimeout(() => {
            mp.players.local.vehicle.freezePosition(false);
            mp.colshapes.at(currentTarget[`shape`]).destroy();
            earnings = earnings + busDriverNums.finance.cost;
            renderMarker(id + 1);
        }, busDriverNums.bus.freezeTime);
    };

    if(busDriverNums.markers[id].type == `end`) {
        mp.gui.chat.push(`Поздравляем, вы завершили мрашрут!`);
        mp.gui.chat.push(`Вы можете начать новый или завершить работу и забрать деньги.`);
        mp.colshapes.at(currentTarget[`shape`]).destroy();
        renderMarker(1);
    };
});

mp.events.add("playerEnterColshape", (shape) => {
    colshapes.forEach(colshape => {
        if(colshape == shape){
            mp.game.ui.setTextComponentFormat("STRING");
            mp.game.ui.addTextComponentSubstringPlayerName("Для взаимодействия, нажмите ~INPUT_CONTEXT~");
            mp.game.ui.displayHelpTextFromStringLabel(0, false, true, -1);
            mp.isPlyaerInsideBusDriverShape = true;
        };
    });
});

mp.events.add("playerExitColshape", (shape) => {
    colshapes.forEach(colshape => {
        if(colshape == shape){
            mp.isPlyaerInsideBusDriverShape = false;
        };
    });
});


mp.events.addDataHandler(`job`, (entity, value) => {
    if(entity != mp.players.local) return;
    if(value != `busdriver`) return;

    playerBus = mp.vehicles.new(busDriverNums.bus.model, busDriverNums.bus.spawnPosition,
    {
        numberPlate: "FAKETAXI",
        color: [[255, 0, 0],[255,0,0]],
        heading: busDriverNums.bus.heading
    });
});

mp.events.add(`render`, () => {
    if(!isWorkActive) return
    mp.game.graphics.drawText(`Текущий заработок ${earnings}$`, [0.5, 0.9], { 
        font: 4, 
        color: [255, 255, 255, 255], 
        scale: [0.35, 0.35],
        centre: true
    });
});