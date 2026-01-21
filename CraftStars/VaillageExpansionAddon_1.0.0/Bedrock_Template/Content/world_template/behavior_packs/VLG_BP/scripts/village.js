import { world, system, ItemStack, BlockPermutation } from "@minecraft/server";
import * as game from "./game";
import * as vector3 from "./vector3";

const airBlock = BlockPermutation.resolve("air");

const data = [
		// Generic
		{ id: "pond_1",  name: "§bSmall Pond§f", range: 26 }
];

function getData(id) {
	if (id === undefined) return undefined;
	let villageIndex = data.findIndex((element) => element.id === id || element.item === id);
	if (villageIndex === -1) return undefined;
	return data[villageIndex];
}

export async function onTick() {
	try {
		let allvillages = await game.getEntities("tcs_vlg:village");
		for (let village of allvillages) 
		{
			if (village === undefined) continue;
			let villageData = getData(village.getDynamicProperty("tcs_vlg_id"));
			if (villageData === undefined) continue;

			let corner1 = vector3.copy(village.location).subtract(villageData.range);
			let corner2 = vector3.copy(village.location).add(villageData.range);
			let players = await game.getPlayersInArea(village.dimension, corner1, corner2, "xz");
			if (players === undefined || players.length == 0) continue;

			//discover(village, villageData, corner1, corner2);
		}
	} catch (error) {}
}
/*export async function discover(village, villageData, corner1, corner2) {
	let villageDiscovered = world.getDynamicProperty(`tcs_vlg_discovered_${villageData.id}`);
	let villageHinted = village.getDynamicProperty("tcs_vlg_hint") === true;
	if ((villageData.hint === undefined || villageHinted) && villageDiscovered === true)
		return;

	let areaSelector = vector3.areaToSelector(corner1.subtract(10), corner2.add(10));

	if (villageDiscovered === undefined) {
		world.setDynamicProperty(`tcs_vlg_discovered_${villageData.id}`, true);
		let villagesDiscovered = await game.advanceWorldParam( "tcs_vlg_villages_discovered");

		game.tellraw(village, `@a`, `§f[§aDiscovery§f] ${villageData.name}§f`);
		game.tellraw(village, `@a`, `§aCongratulations, you discovered ${villagesDiscovered}/${data.length} villages.§f`);
		if (villagesDiscovered < data.length) {
			game.tellraw(village, `@a`, `§aKeep exploring and find them all!§f`);
			village.runCommandAsync(`playsound tcs_vlg:hint @a ~ ~1 ~ 100`);
		} else {
			village.runCommandAsync(`playsound tcs_vlg:hint @a ~ ~1 ~ 100`);
			system.runTimeout(() => { announceDiscoveredAllvillages(); }, 140);
		}
	} else
		village.runCommandAsync(`playsound tcs_vlg:hint @a[${areaSelector}] ~ ~1 ~ 100`);

	if (villageData.hint !== undefined && !villageHinted) {
		game.tellraw(village, `@a[${areaSelector}]`, villageData.hint);
		village.setDynamicProperty("tcs_vlg_hint", true);
	}

}

export async function announceDiscoveredAllvillages() {
	await game.host.runCommandAsync("title @a subtitle §6You've discovered all the villages!!");
	await game.host.runCommandAsync("title @a title §aCONGRATULATIONS!");
	game.host.runCommandAsync(`playsound tcs_vlg:quest_finished @a ~ ~1 ~ 100`);
	game.host.runCommandAsync(`execute as @a run particle tcs_vlg:quest_floor ~ ~ ~`);
	game.host.runCommandAsync(`execute as @a run particle tcs_vlg:quest_fireworks ~ ~ ~` );
	system.runTimeout(() => { announceDiscoveredAllvillages2(); }, 140);
}
export async function announceDiscoveredAllvillages2() {
	game.tellraw(game.host, `@a`,
		`§aYour journey through every biome, village has proven your unmatched courage, curiosity, and skill.\n\nYou're not just an adventurer, you're a Master Explorer!\n\nGood job!§f`
	);
	game.host.runCommandAsync(`playsound tcs_vlg:hint @a ~ ~1 ~ 100`);
}*/

export async function onScriptEventReceive(event) {
	if (event.id === "tcs_vlg:village_load") {
		let villageData = getData(event.message.replace("tcs_vlg:", ""));
		event.sourceEntity.setDynamicProperty("tcs_vlg_id", villageData.id);
		event.sourceEntity.addTag("tcs_vlg_" + villageData.id);
		let commandBlockLocation = vector3.Down.add(event.sourceEntity.location);
		event.sourceEntity.dimension.setBlockPermutation(commandBlockLocation, airBlock);
	}
}
export async function removevillage(village) {
  	village.triggerEvent("tcs_vlg:remove");
}

/*
village LOAD COMMANDS
----------------------
These commands can be used to load villages with proper positioning.
Format: village load tcs_vlg:id ~dx ~ ~dz
Where dx = (x1-x2)/2 and dz = min(-40, z2-z1)

// Generic
Name: Small Pond
village load tcs_vlg:pond_1 ~-7 ~ ~-14
Name: Axolotl Pond
village load tcs_vlg:end_rock ~-6 ~ ~-12
*/
