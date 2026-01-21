import { system, world } from "@minecraft/server";
import * as game from "./game";

const INTRO_MESSAGES = [
    "Hello §a{PLAYER}§r and welcome to §6§lVillage Expansion Add-On!§r",
    "In this exiting Add-On, the villagers have decided to expand and explore the world!",
    "They have constructed new buildings and populated new biomes.",
    "They even constructed new Mining and Fishing Colonies!",
    "But beware of Evil villages! Some villages have been taken over by monsters, and they even created their own evil Iron Golems!",
    "The Village Manual will give you more details.",
    "Have fun with Village Expansion Add-On!",
    "Don't forget to rate it §a5 STARS§r on the Marketplace!"
];

const INTRO_TICK_DELAY = 80;

export async function onPlayerSpawn(event) {
    const player = event.player;

    if (player.getDynamicProperty("tcs_vlg_intro_step") == undefined)
        system.runTimeout(() => { startIntro(player); }, 100);
}

function startIntro(player) {
    player.setDynamicProperty("tcs_vlg_intro_active", true);
    player.setDynamicProperty("tcs_vlg_intro_step", 0);
    player.setDynamicProperty("tcs_vlg_intro_next_tick", system.currentTick + INTRO_TICK_DELAY);
}

function advanceIntro(player) {
    let step = player.getDynamicProperty("tcs_vlg_intro_step") || 0;

    if (step < INTRO_MESSAGES.length)
    {
        player.setDynamicProperty("tcs_vlg_intro_step", step + 1);
        player.setDynamicProperty("tcs_vlg_intro_next_tick", system.currentTick + INTRO_TICK_DELAY);

        game.playSound(player, "@s", "tcs_vlg:info");
        let msg = INTRO_MESSAGES[step].replace("{PLAYER}", player.name);
        game.runPlayerCommand(player, `tellraw @s {\"rawtext\":[{\"text\":\"${msg}\"}]}`);
    }
    else
    {
        player.setDynamicProperty("tcs_vlg_intro_active", false);
        player.setDynamicProperty("tcs_vlg_intro_next_tick", undefined);
        player.setDynamicProperty("tcs_vlg_intro_step", undefined);

        game.runPlayerCommand(player, `structure load tcs_vlg:book ~ ~ ~`);
        player.dimension.spawnEntity("tcs_vlg:celebration_fx", player.location);
    }
    
}

export async function onTick() {
    for (const player of world.getAllPlayers()) {
        if (player.getDynamicProperty("tcs_vlg_intro_active") != true) continue;
        
        let nextTick = player.getDynamicProperty("tcs_vlg_intro_next_tick") ?? 0;
        if (system.currentTick >= nextTick) 
            advanceIntro(player);
    }
}
