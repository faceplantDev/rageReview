let money = mp.players.local.getVariable(`user:money`);

mp.events.add(`render`, () => {
    mp.game.graphics.drawText(`${money}$`, [0.9, 0.2], {
        font: 4, 
        scale: [0.5, 0.5],
        color: [35, 200, 35, 255],
        outline: true
    });
});

mp.events.addDataHandler(`user:money`, (entity, value) => {
    if(entity == mp.players.local) return money = value;
});