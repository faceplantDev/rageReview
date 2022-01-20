mp.events.add(`job:getjob`, (player, job) => {
    player.setVariable('job', job);
});

mp.events.add(`job:getfired`, (player) => {
    player.setVariable(`job`, false);
});

mp.events.addCommand(`startjob`, (player) => {
    player.call(`startjob`);
});

mp.events.add(`route:blip`, (player, blipid) => {
    mp.blips.at(blipid).routeFor(player, 66, 0.5);   
});

mp.events.add(`addMoney`, (player, money) => {
    let oldMoney = player.getVariable(`user:money`);
    player.setVariable(`user:money`, oldMoney + money) ;
});

mp.events.add(`playerJoin`, (player) => {
    player.setVariable(`user:money`, 0);
    player.position = new mp.Vector3(455.28155517578125, -674.72412109375, 27.955692291259766);
});